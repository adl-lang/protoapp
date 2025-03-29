use clap::{Args, Parser, Subcommand};

use shared::adl::gen::protoapp::db::AppUser;

use protoapp::server::{db, passwords::hash_password};
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    let res = match &cli.command {
        Commands::CreateUser(args) => create_user(args).await,
    };
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

#[derive(Parser)]

struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    CreateUser(CreateUserArgs),
}

#[derive(Args)]
struct CreateUserArgs {
    #[arg(long, default_value_t = false)]
    pub is_admin: bool,

    pub email: String,
    pub full_name: String,
    pub password: String,
}

async fn create_user(args: &CreateUserArgs) -> anyhow::Result<()> {
    let db_connection_url =
        std::env::var("DB_CONNECTION_URL").expect("DB_CONNECTION_URL environment variable");

    let hashed_password = hash_password(&args.password).expect("password can be hashed");
    let user = AppUser {
        fullname: args.full_name.clone(),
        email: args.email.clone(),
        is_admin: args.is_admin,
        hashed_password,
    };

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_connection_url)
        .await
        .expect("db connection to succeed");
    let id = db::create_user(&pool, &user).await?;
    println!("user created with id {}", id.0);
    Ok(())
}
