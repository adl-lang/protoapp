use clap::Parser;
use std::path::PathBuf;

use shared::adl::gen::protoapp::config::server::ServerConfig;

use protoapp::server;

#[tokio::main]
async fn main() {
    env_logger::init();

    let res = run().await;

    match res {
        Err(e) => {
            eprintln!("Error: {e}");
            std::process::exit(1);
        }
        Ok(_) => {
            std::process::exit(0);
        }
    }
}

async fn run() -> anyhow::Result<()> {
    let cli = Cli::parse();

    let config_str: String = match &cli.config {
        Some(path) => std::fs::read_to_string(path)
            .map_err(|_| anyhow::anyhow!("unable to read config file from {}", path.display()))?,
        None => std::env::var(CONFIG_VAR)
            .map_err(|_| anyhow::anyhow!("unable to read config from env var {}", CONFIG_VAR))?,
    };
    let mut config: ServerConfig = serde_json::from_str(&config_str)
        .map_err(|e| anyhow::anyhow!("unable to parse config file: {}", e))?;

    inject_secrets(&mut config)?;
    server::run(config).await;
    Ok(())
}

// Inject secrets from environment variables if required
fn inject_secrets(config: &mut ServerConfig) -> anyhow::Result<()> {
    inject_secret(&mut config.db.user)?;
    inject_secret(&mut config.db.password)?;
    inject_secret(&mut config.jwt_access_secret)?;
    inject_secret(&mut config.jwt_refresh_secret)?;
    Ok(())
}

fn inject_secret(secret: &mut String) -> anyhow::Result<()> {
    if let Some(env_var_name) = secret.strip_prefix(ENV_SECRET_PREFIX) {
        let v = std::env::var(env_var_name)
            .map_err(|_| anyhow::anyhow!("unable to read secret from env var {}", env_var_name))?;
        *secret = v;
    }
    Ok(())
}

const ENV_SECRET_PREFIX: &str = "ENV_SECRET:";

const CONFIG_VAR: &str = "PROTOAPP_SERVER_CONFIG";

#[derive(Parser)]
struct Cli {
    /// The path of the configuration file
    #[arg(long, value_name = "FILE")]
    config: Option<PathBuf>,
}
