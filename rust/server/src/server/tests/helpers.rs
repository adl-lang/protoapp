use rand::Rng;
use reqwest::header::{HeaderMap, HeaderValue};
use serde::de::DeserializeOwned;
use serde::Serialize;
use sqlx::postgres::PgPoolOptions;
use sqlx::Executor;

use shared::adl::gen::common::http::{HttpMethod, HttpReq};
use shared::adl::gen::protoapp::apis;
use shared::adl::gen::protoapp::apis::ui::LoginReq;
use shared::adl::gen::protoapp::config::server::{DbConnectionConfig, ServerConfig};

use crate::server::passwords::hash_password;

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

pub async fn server_public_req<I: Serialize, O: DeserializeOwned>(
    endpoint: HttpReq<I, O>,
    req: &I,
) -> O {
    let resp = server_req(endpoint, None, req).await;
    assert_eq!(resp.status(), 200);
    resp.json().await.unwrap()
}

pub async fn server_auth_req<I: Serialize, O: DeserializeOwned>(
    endpoint: HttpReq<I, O>,
    jwt: &str,
    req: &I,
) -> O {
    let resp = server_req(endpoint, Some(jwt), req).await;
    assert_eq!(resp.status(), 200);
    resp.json().await.unwrap()
}

pub async fn server_req<I: Serialize, O: DeserializeOwned>(
    endpoint: HttpReq<I, O>,
    jwt: Option<&str>,
    req: &I,
) -> reqwest::Response {
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    if let Some(jwt) = jwt {
        headers.insert(
            "Authorization",
            HeaderValue::from_str(&format!("Bearer {}", jwt)).unwrap(),
        );
    }
    let resp = match endpoint.method {
        HttpMethod::Get => client
            .get(format!(
                "http://localhost:8181{}{}",
                endpoint.path,
                encode_query_string(req)
            ))
            .headers(headers)
            .send()
            .await
            .unwrap(),
        HttpMethod::Post => client
            .post(format!("http://localhost:8181{}", endpoint.path))
            .json(req)
            .headers(headers)
            .send()
            .await
            .unwrap(),
    };
    resp
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
    let resp = server_public_req(apis::ui::ApiRequests::def_login(), login_req).await;
    match resp {
        apis::ui::LoginResp::Tokens(tokens) => tokens.access_jwt,
        apis::ui::LoginResp::InvalidCredentials => panic!("invalid credentials"),
    }
}
