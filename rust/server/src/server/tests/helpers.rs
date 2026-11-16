use rand::Rng;
use serde::de::DeserializeOwned;
use serde::Serialize;
use sqlx::postgres::PgPoolOptions;
use sqlx::Executor;

use adl::gen::common::http::HttpMethod;
use adl::gen::protoapp::apis::ui::{Api, ApiClient, LoginReq, WebApiClient};
use adl::gen::protoapp::config::server::{DbConnectionConfig, ServerConfig};
use adl::http_api::Invoke;

use crate::server::passwords::hash_password;

/// Where the test server listens.
const BASE_URL: &str = "http://localhost:8181";

/// The full path of an endpoint of the nested `AdminApi` API.
///
/// Only [`server_req`] needs this: the generated client composes the prefix
/// itself, which is the point of its `admin()` accessor. Its own `PATH_`
/// constants are relative to where it is mounted, which is the `admin` field
/// of `Api`, so the two compose.
pub fn admin_path(path: &str) -> String {
    format!("{}{}", Api::PATH_ADMIN, path)
}

/// A transport for the generated clients, over reqwest.
///
/// Its `Error` is just the status, which is all the tests assert on; a
/// transport level failure panics, as the raw helper below also does, because
/// a test server that cannot be reached is a broken test rather than a case
/// to handle.
pub struct ReqwestTransport {
    client: reqwest::Client,
    base_url: String,
}

impl ReqwestTransport {
    pub fn new(base_url: &str) -> Self {
        ReqwestTransport {
            client: reqwest::Client::new(),
            base_url: base_url.to_owned(),
        }
    }

    async fn send<I: Serialize, O: DeserializeOwned>(
        &self,
        path: &str,
        method: HttpMethod,
        jwt: Option<&str>,
        req: &I,
    ) -> Result<O, reqwest::StatusCode> {
        let url = format!("{}{}", self.base_url, path);
        let builder = match method {
            HttpMethod::Get => self
                .client
                .get(format!("{}{}", url, encode_query_string(req))),
            HttpMethod::Post => self.client.post(url).json(req),
        };
        let builder = match jwt {
            Some(jwt) => builder.bearer_auth(jwt),
            None => builder,
        };
        let resp = builder.send().await.expect("the test server to respond");
        let status = resp.status();
        if !status.is_success() {
            return Err(status);
        }
        Ok(resp.json().await.expect("a decodable response body"))
    }
}

impl Invoke for ReqwestTransport {
    type Error = reqwest::StatusCode;

    /// A bearer token, unsized so that a call site passes `&jwt` rather than
    /// cloning one per request.
    type Identity = str;

    async fn invoke_public<I, O>(
        &self,
        path: &str,
        method: HttpMethod,
        req: &I,
    ) -> Result<O, Self::Error>
    where
        I: Serialize + Send + Sync,
        O: DeserializeOwned + Send,
    {
        self.send(path, method, None, req).await
    }

    async fn invoke_secured<I, O>(
        &self,
        path: &str,
        method: HttpMethod,
        identity: &str,
        req: &I,
    ) -> Result<O, Self::Error>
    where
        I: Serialize + Send + Sync,
        O: DeserializeOwned + Send,
    {
        self.send(path, method, Some(identity), req).await
    }
}

/// The status a rejected client call failed with.
///
/// A free function rather than `Result::unwrap_err`, which would want `Debug`
/// on every response type; the ADL types do not derive it.
pub fn rejected_with<O>(result: Result<O, reqwest::StatusCode>) -> reqwest::StatusCode {
    result.err().expect("the request to be rejected")
}

/// A client for the main API against the test server.
pub fn client() -> ApiClient<ReqwestTransport> {
    ApiClient::new(ReqwestTransport::new(BASE_URL))
}

/// A client for the cookie endpoints against the test server.
///
/// The cookies themselves are not followed: these tests read the tokens out
/// of the response body, which is what a non-browser client does.
pub fn web_client() -> WebApiClient<ReqwestTransport> {
    WebApiClient::new(ReqwestTransport::new(BASE_URL))
}

pub struct DbTestEnv {
    pub pool: sqlx::PgPool,
    pub schema: String,
}

impl DbTestEnv {
    pub async fn new() -> Self {
        let db_connection_url =
            std::env::var("DB_CONNECTION_URL").expect("DB_CONNECTION_URL environment variable");
        let pool0 = PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_connection_url)
            .await
            .expect("db connection to succeed");

        let mut rng = rand::thread_rng();
        let schema = format!("test_{}", rng.gen::<u64>());

        sqlx::query(&format!("DROP SCHEMA IF EXISTS {} CASCADE", schema))
            .execute(&pool0)
            .await
            .expect("new test db schema to be dropped if present");

        sqlx::query(&format!("CREATE SCHEMA {}", schema))
            .execute(&pool0)
            .await
            .expect("new test db schema to be created");

        // Create a db pool where connections go to the new schema
        let pool = {
            let schema = schema.clone();
            PgPoolOptions::new()
                .max_connections(5)
                .after_connect(move |conn, _meta| {
                    let schema = schema.clone();
                    Box::pin(async move {
                        conn.execute(format!("SET search_path = '{}';", schema).as_ref())
                            .await
                            .expect("new test db schema to be created");
                        Ok(())
                    })
                })
                .connect(&db_connection_url)
                .await
                .expect("db connection to succeed")
        };

        // Run all the migrations
        sqlx::migrate!()
            .run(&pool)
            .await
            .expect("migrations should run correctly");

        DbTestEnv { pool, schema }
    }

    pub async fn execute(&mut self, sql: &str) {
        sqlx::query(sql)
            .execute(&self.pool)
            .await
            .expect("execute sql to succeed");
    }

    pub async fn cleanup(&mut self) {
        sqlx::query(&format!("DROP SCHEMA {} CASCADE", self.schema))
            .execute(&self.pool)
            .await
            .expect("test db schema to be dropped");
    }
}

/// Issue one request against the running test server, bypassing the generated
/// client.
///
/// Only for requests the client's types rule out: a credential on an endpoint
/// the ADL declares `public`, or none on an endpoint that requires one.
/// Those cases exist to check what the *server* does with a non-conforming
/// client, so they cannot go through a conforming one.
///
/// Returns the response rather than a decoded body, because every such test
/// is asserting on the status.
pub async fn server_req<I: Serialize>(
    path: &str,
    method: HttpMethod,
    jwt: Option<&str>,
    req: &I,
) -> reqwest::Response {
    let client = reqwest::Client::new();
    let builder = match method {
        HttpMethod::Get => client.get(format!("{}{}{}", BASE_URL, path, encode_query_string(req))),
        HttpMethod::Post => client.post(format!("{}{}", BASE_URL, path)).json(req),
    };
    let builder = match jwt {
        Some(jwt) => builder.bearer_auth(jwt),
        None => builder,
    };
    builder.send().await.expect("the test server to respond")
}

pub fn encode_query_string<I: Serialize>(i: &I) -> String {
    let jv = serde_json::to_value(i).unwrap();
    match jv {
        serde_json::Value::Null => "".to_owned(),
        _ => format!("?input={}", urlencoding::encode(&jv.to_string())),
    }
}

pub fn test_server_config() -> ServerConfig {
    ServerConfig {
        db: DbConnectionConfig {
            host: "localhost".to_owned(),
            dbname: "postgres".to_owned(),
            port: 5432,
            user: "postgres".to_owned(),
            password: "xyzzy".to_owned(),
        },
        db_connection_pool_size: ServerConfig::def_db_connection_pool_size(),
        jwt_issuer: "adl-protoapp.link".to_owned(),
        jwt_access_secret: "treyweyetry".to_owned(),
        jwt_access_expiry_secs: 300,
        jwt_refresh_secret: "treyweyetryxx".to_owned(),
        jwt_refresh_expiry_secs: 300,
        http_bind_addr: "0.0.0.0:8181".to_owned(),
    }
}

pub async fn create_test_user(
    db: &mut DbTestEnv,
    key: &str,
    fullname: &str,
    email: &str,
    password: &str,
    is_admin: bool,
) -> LoginReq {
    let hashed_password = hash_password(password).expect("password hash to success");

    db.execute(
        &format!("INSERT INTO app_user(id,fullname,email,is_admin,hashed_password) VALUES ('{}', '{}', '{}', {}, '{}');",
            key,
            fullname,
            email,
            is_admin,
            hashed_password,
            )
    ).await;
    LoginReq {
        email: email.to_owned(),
        password: password.to_owned(),
    }
}

pub async fn login_user(login_req: &LoginReq) -> String {
    use adl::gen::protoapp::apis::ui::LoginResp;

    match web_client().login(login_req).await.unwrap() {
        LoginResp::Tokens(tokens) => tokens.access_jwt,
        LoginResp::InvalidCredentials => panic!("invalid credentials"),
    }
}
