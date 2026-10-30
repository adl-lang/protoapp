use adl::gen::common::http::Unit;
use adl::gen::protoapp::apis;
use adl::gen::protoapp::apis::ui::{
    LoginReq, LoginTokens, Message, PageReq, Paginated, RefreshReq, UserDetails,
};

use crate::server::tests::helpers::{
    admin_path, client, create_test_user, login_user, rejected_with, server_req,
    test_server_config, web_client, DbTestEnv,
};
use crate::server::{AppState, OServer};

mod helpers;

#[tokio::test]
async fn schema_setup() {
    let mut db = DbTestEnv::new().await;
    db.cleanup().await;
}

#[tokio::test]
async fn server_login() {
    let mut db = DbTestEnv::new().await;
    let oserver = OServer::spawn(AppState::new(test_server_config(), db.pool.clone()));

    let u1 = create_test_user_joe(&mut db).await;
    let web = web_client();

    let tokens = {
        // Check that we can login as joe
        let resp = web.login(&u1).await.unwrap();
        assert!(is_valid_login(&resp));
        get_login_tokens(resp).unwrap()
    };

    {
        // Check that we can refresh using the refresh token
        let resp = web
            .refresh(&RefreshReq {
                refresh_token: Some(tokens.refresh_jwt),
            })
            .await
            .unwrap();
        assert!(is_valid_refresh(&resp));
    }

    {
        // Check that we can't refresh using the access token
        let resp = web
            .refresh(&RefreshReq {
                refresh_token: Some(tokens.access_jwt),
            })
            .await
            .unwrap();
        assert!(!is_valid_refresh(&resp));
    }

    {
        // Check that we can logout
        web.logout(&Unit {}).await.unwrap();
    }

    {
        // Check that we can't login with the wrong password
        let resp = web
            .login(&LoginReq {
                email: "joe@test.com".to_owned(),
                password: "xxxxxx".to_owned(),
            })
            .await
            .unwrap();
        assert!(!is_valid_login(&resp));
    }

    {
        // Check that we can't login with an invalid email
        let resp = web
            .login(&LoginReq {
                email: "mike@test.com".to_owned(),
                password: "abcde".to_owned(),
            })
            .await
            .unwrap();
        assert!(!is_valid_login(&resp));
    }

    oserver.shutdown().await.unwrap();
    db.cleanup().await;
}

#[tokio::test]
async fn server_user_profile() {
    let mut db = DbTestEnv::new().await;
    let oserver = OServer::spawn(AppState::new(test_server_config(), db.pool.clone()));

    let u1 = create_test_user_joe(&mut db).await;
    let u1_jwt = login_user(&u1).await;

    let resp = client().who_am_i(&u1_jwt, &()).await.unwrap();
    assert_eq!(resp.value.fullname, "Joe");
    assert_eq!(resp.value.email, "joe@test.com");
    assert!(!resp.value.is_admin);

    oserver.shutdown().await.unwrap();
    db.cleanup().await;
}

#[tokio::test]
async fn server_messages() {
    let mut db = DbTestEnv::new().await;
    let oserver = OServer::spawn(AppState::new(test_server_config(), db.pool.clone()));

    let u1 = create_test_user_joe(&mut db).await;
    let u2 = create_test_user_sarah(&mut db).await;

    let u1_jwt = login_user(&u1).await;
    let u2_jwt = login_user(&u2).await;

    send_message(&u1_jwt, "A first message").await;
    send_message(&u1_jwt, "Another message").await;
    send_message(&u1_jwt, "Still going").await;

    // Check page 1
    let m = recent_messages(&u2_jwt, 0, 2).await;
    assert_eq!(m.current_offset, 0);
    assert_eq!(m.total_count, 3);
    assert_eq!(m.items.len(), 2);
    assert_eq!(m.items.first().unwrap().message, "Still going");
    assert_eq!(m.items.first().unwrap().user_fullname, "Joe");
    assert_eq!(m.items.get(1).unwrap().message, "Another message");

    // Check page 2
    let m = recent_messages(&u2_jwt, 2, 2).await;
    assert_eq!(m.current_offset, 2);
    assert_eq!(m.total_count, 3);
    assert_eq!(m.items.len(), 1);
    assert_eq!(m.items.first().unwrap().message, "A first message");

    oserver.shutdown().await.unwrap();
    db.cleanup().await;
}

#[tokio::test]
async fn server_user_crud() {
    let mut db = DbTestEnv::new().await;
    let oserver = OServer::spawn(AppState::new(test_server_config(), db.pool.clone()));

    let u1 = create_test_user_joe(&mut db).await;
    let u2 = create_test_user_sarah(&mut db).await;

    let u1_jwt = get_login_tokens(web_client().login(&u1).await.unwrap())
        .unwrap()
        .access_jwt;
    let u2_jwt = get_login_tokens(web_client().login(&u2).await.unwrap())
        .unwrap()
        .access_jwt;

    // u1 is not an admin, so shouldn't be allowed to create new users
    {
        let err = rejected_with(
            client()
                .admin()
                .create_user(&u1_jwt, &new_user_austin())
                .await,
        );
        assert_eq!(err, 403);
    }

    // u2 is an admin, so can create new users
    {
        client()
            .admin()
            .create_user(&u2_jwt, &new_user_austin())
            .await
            .unwrap();
    }

    // and can query existing users
    {
        let resp = client()
            .admin()
            .query_users(
                &u2_jwt,
                &apis::ui::QueryUsersReq {
                    page: PageReq {
                        offset: 0,
                        limit: 100,
                    },
                },
            )
            .await
            .unwrap();
        assert_eq!(resp.items.len(), 3);
    }

    oserver.shutdown().await.unwrap();
    db.cleanup().await;
}

#[tokio::test]
async fn server_security_policy() {
    let mut db = DbTestEnv::new().await;
    let oserver = OServer::spawn(AppState::new(test_server_config(), db.pool.clone()));

    let u1 = create_test_user_joe(&mut db).await;

    // Several of these send what the generated client cannot express: a
    // credential to an endpoint the ADL declares `public`, or none to one
    // that requires it. Both are exactly what the client's types rule out, so
    // they go through `server_req` instead. The rest go through the client,
    // which is also what makes them worth having: the server's answer should
    // be the same either way.

    {
        // A public endpoint works with no credentials at all
        client().healthy(&()).await.unwrap();
    }

    {
        // An unusable token must not fail a public endpoint: it is ignored,
        // rather than rejected, so a stale token can't lock a client out.
        let resp = server_req(
            apis::ui::Api::PATH_HEALTHY,
            apis::ui::Api::METHOD_HEALTHY,
            Some("garbage"),
            &(),
        )
        .await;
        assert_eq!(resp.status(), 200);
    }

    {
        // ... in particular, login still works while carrying a stale token
        let resp = server_req(
            apis::ui::WebApi::PATH_LOGIN,
            apis::ui::WebApi::METHOD_LOGIN,
            Some("garbage"),
            &u1,
        )
        .await;
        assert_eq!(resp.status(), 200);
    }

    {
        // A valid token on a public endpoint is still accepted. It is not
        // looked at: a public endpoint's handler takes no identity, so the
        // credential is ignored whether it is good or bad.
        let jwt = login_user(&u1).await;
        let resp = server_req(
            apis::ui::Api::PATH_HEALTHY,
            apis::ui::Api::METHOD_HEALTHY,
            Some(&jwt),
            &(),
        )
        .await;
        assert_eq!(resp.status(), 200);
    }

    {
        // A token endpoint rejects a request with no credentials
        let resp = server_req(
            apis::ui::Api::PATH_WHO_AM_I,
            apis::ui::Api::METHOD_WHO_AM_I,
            None,
            &(),
        )
        .await;
        assert_eq!(resp.status(), 401);
    }

    {
        // A role restricted endpoint rejects absent credentials as 401, not 403
        let resp = server_req(
            &admin_path(apis::ui::AdminApi::PATH_QUERY_USERS),
            apis::ui::AdminApi::METHOD_QUERY_USERS,
            None,
            &apis::ui::QueryUsersReq {
                page: PageReq {
                    offset: 0,
                    limit: 10,
                },
            },
        )
        .await;
        assert_eq!(resp.status(), 401);
    }

    {
        // ... and one with an unusable token
        let err = rejected_with(client().who_am_i("garbage", &()).await);
        assert_eq!(err, 401);
    }

    {
        // ... but accepts a valid one
        let jwt = login_user(&u1).await;
        client().who_am_i(&jwt, &()).await.unwrap();
    }

    {
        // Valid credentials carrying the wrong role are a 403, distinct from
        // the 401s above for absent or unusable credentials.
        let jwt = login_user(&u1).await;
        let err = rejected_with(client().admin().create_user(&jwt, &new_user_austin()).await);
        assert_eq!(err, 403);
    }

    oserver.shutdown().await.unwrap();
    db.cleanup().await;
}

async fn send_message(jwt: &str, message: &str) {
    client()
        .new_message(
            jwt,
            &apis::ui::NewMessageReq {
                message: message.to_owned(),
            },
        )
        .await
        .unwrap();
}

async fn recent_messages(jwt: &str, offset: u64, limit: u64) -> Paginated<Message> {
    client()
        .recent_messages(
            jwt,
            &apis::ui::RecentMessagesReq {
                page: PageReq { offset, limit },
            },
        )
        .await
        .unwrap()
}

fn new_user_austin() -> UserDetails {
    UserDetails {
        fullname: "Austin".to_owned(),
        email: "austin@mycompany.org".to_owned(),
        is_admin: false,
        password: "sukpepolup".to_owned(),
    }
}

fn is_valid_login(resp: &apis::ui::LoginResp) -> bool {
    match resp {
        apis::ui::LoginResp::Tokens(_) => true,
        apis::ui::LoginResp::InvalidCredentials => false,
    }
}

fn is_valid_refresh(resp: &apis::ui::RefreshResp) -> bool {
    matches!(resp, apis::ui::RefreshResp::AccessToken(_))
}

fn get_login_tokens(resp: apis::ui::LoginResp) -> Option<LoginTokens> {
    match resp {
        apis::ui::LoginResp::Tokens(tokens) => Some(tokens),
        apis::ui::LoginResp::InvalidCredentials => None,
    }
}

async fn create_test_user_joe(db: &mut DbTestEnv) -> LoginReq {
    create_test_user(db, "U-1", "Joe", "joe@test.com", "abcde", false).await
}

async fn create_test_user_sarah(db: &mut DbTestEnv) -> LoginReq {
    create_test_user(db, "U-2", "Sarah", "sarah@test.com", "uvwxyz", true).await
}
