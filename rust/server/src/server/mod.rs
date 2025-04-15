use poem::listener::TcpListener;
use routing::build_routes;
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::sync::Arc;
use tokio::{sync::oneshot, task::JoinHandle};

use adl::gen::protoapp::config::server::ServerConfig;

pub mod db;
mod handlers;
mod jwt;
pub mod passwords;
mod poem_adl_interop;
mod routing;

#[cfg(test)]
pub mod tests;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<ServerConfig>,
    pub db_pool: Arc<PgPool>,
}

impl AppState {
    pub fn new(config: ServerConfig, db_pool: PgPool) -> Self {
        AppState {
            config: Arc::new(config),
            db_pool: Arc::new(db_pool),
        }
    }
}
pub async fn run(config: ServerConfig) -> Result<(), std::io::Error> {
    let db = &config.db;

    let db_connection_url = format!(
        "postgres://{}:{}@{}:{}/{}",
        db.user, db.password, db.host, db.port, db.dbname
    );
    let db_pool: PgPool = PgPoolOptions::new()
        .max_connections(config.db_connection_pool_size)
        .connect(&db_connection_url)
        .await
        .expect("db connection should work");

    // Run any migrations
    log::info!("Running sqlx migrations...");
    sqlx::migrate!()
        .run(&db_pool)
        .await
        .expect("migrations should run correctly");
    log::info!("sqlx migrations completed");

    let app_state = AppState::new(config, db_pool);
    let ep = build_routes(app_state.clone());
    let addr = &app_state.config.http_bind_addr;
    let server = poem::Server::new(TcpListener::bind(addr)).run(ep);
    log::info!("Listening on http://{}", addr);
    server.await
}

/**
 * A server wrapper supporting clean shutdown via an
 * async channel. Useful for automated testined
 */
pub struct OServer {
    shutdown: oneshot::Sender<()>,
    joinhandle: JoinHandle<()>,
}

impl OServer {
    pub fn spawn(app_state: AppState) -> Self {
        let (shutdown, shutdown_notify) = oneshot::channel::<()>();
        let joinhandle = tokio::spawn(Self::start(app_state, shutdown_notify));
        OServer {
            shutdown,
            joinhandle,
        }
    }

    pub async fn shutdown(self) -> Result<(), ()> {
        self.shutdown.send(())?;
        self.joinhandle.await.map_err(|_| ())?;
        Ok(())
    }

    async fn start(app_state: AppState, shutdown: oneshot::Receiver<()>) {
        let ep = build_routes(app_state.clone());
        let addr = &app_state.config.http_bind_addr;

        let server = poem::Server::new(TcpListener::bind(addr)).run_with_graceful_shutdown(
            ep,
            Self::await_receiver(shutdown),
            None,
        );
        log::info!("Listening on http://{}", addr);
        let _ = server.await;
    }

    async fn await_receiver(shutdown: oneshot::Receiver<()>) {
        let _ = shutdown.await;
    }
}
