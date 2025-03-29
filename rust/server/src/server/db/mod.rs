use sea_query::{Expr, Func, Order, PostgresQueryBuilder, Query};
use sea_query_binder::SqlxBinder;
use sqlx::Row;
use std::time::SystemTime;

use shared::adl::{
    custom::common::{db::DbKey, time::Instant},
    db::{
        schema,
        types::{InsertRow, SelectStatementExt, UpdateStatementExt},
    },
    gen::protoapp::{
        apis,
        db::{AppUser, AppUserId, MessageId},
    },
};

type DbPool = sqlx::PgPool;

pub async fn get_user_with_email(
    pool: &DbPool,
    email: &str,
) -> sqlx::Result<Option<(AppUserId, AppUser)>> {
    get_user(pool, schema::AppUser::email().eq_value(&email.to_owned())).await
}

pub async fn get_user_with_id(
    pool: &DbPool,
    user_id: &AppUserId,
) -> sqlx::Result<Option<(AppUserId, AppUser)>> {
    get_user(pool, schema::AppUser::id().eq_value(user_id)).await
}

async fn get_user(
    pool: &DbPool,
    where_expr: sea_query::SimpleExpr,
) -> sqlx::Result<Option<(AppUserId, AppUser)>> {
    type T = schema::AppUser;
    let (sql, values) = Query::select()
        .from(T::table())
        .scolumn(T::id())
        .scolumn(T::fullname())
        .scolumn(T::email())
        .scolumn(T::is_admin())
        .scolumn(T::hashed_password())
        .and_where(where_expr)
        .build_sqlx(PostgresQueryBuilder);

    let v = sqlx::query_with(&sql, values)
        .map(|r| {
            (
                T::id().from_row(&r),
                AppUser {
                    fullname: T::fullname().from_row(&r),
                    email: T::email().from_row(&r),
                    is_admin: T::is_admin().from_row(&r),
                    hashed_password: T::hashed_password().from_row(&r),
                },
            )
        })
        .fetch_optional(pool)
        .await?;

    Ok(v)
}

pub async fn create_user(pool: &DbPool, user: &AppUser) -> sqlx::Result<AppUserId> {
    type T = schema::AppUser;
    let id: AppUserId = DbKey::new(T::id_prefix());

    let (icolumns, ivalues) = InsertRow::new()
        .field(T::id(), &id)
        .field(T::email(), &user.email)
        .field(T::fullname(), &user.fullname)
        .field(T::is_admin(), &user.is_admin)
        .field(T::hashed_password(), &user.hashed_password)
        .build();

    let (sql, values) = Query::insert()
        .into_table(T::table())
        .columns(icolumns)
        .values_panic(ivalues)
        .build_sqlx(PostgresQueryBuilder);
    sqlx::query_with(&sql, values).execute(pool).await?;
    Ok(id)
}

pub async fn update_user(pool: &DbPool, user_id: &AppUserId, user: &AppUser) -> sqlx::Result<()> {
    type T = schema::AppUser;
    let (sql, values) = Query::update()
        .table(T::table())
        .svalue(T::email(), &user.email)
        .svalue(T::fullname(), &user.fullname)
        .svalue(T::is_admin(), &user.is_admin)
        .svalue(T::hashed_password(), &user.hashed_password)
        .and_where(T::id().eq_value(user_id))
        .build_sqlx(PostgresQueryBuilder);
    sqlx::query_with(&sql, values).execute(pool).await?;
    Ok(())
}

pub async fn query_users(
    pool: &DbPool,
    offset: u64,
    limit: u64,
) -> sqlx::Result<Vec<apis::ui::UserWithId>> {
    type T = schema::AppUser;
    let (sql, values) = Query::select()
        .from(T::table())
        .scolumn(T::id())
        .scolumn(T::fullname())
        .scolumn(T::email())
        .scolumn(T::is_admin())
        .offset(offset)
        .limit(limit)
        .build_sqlx(PostgresQueryBuilder);
    let users = sqlx::query_with(&sql, values)
        .map(|r| apis::ui::UserWithId {
            id: T::id().from_row(&r),
            value: apis::ui::User {
                fullname: T::fullname().from_row(&r),
                email: T::email().from_row(&r),
                is_admin: T::is_admin().from_row(&r),
            },
        })
        .fetch_all(pool)
        .await?;
    Ok(users)
}

pub async fn user_count(pool: &DbPool) -> sqlx::Result<u64> {
    type M = schema::AppUser;

    let (sql, values) = Query::select()
        .from(M::table())
        .expr(Func::count(Expr::asterisk()))
        .build_sqlx(PostgresQueryBuilder);

    let count: i64 = sqlx::query_with(&sql, values)
        .map(|r| r.get(0))
        .fetch_one(pool)
        .await?;
    Ok(count as u64)
}

pub async fn new_message(
    pool: &DbPool,
    user_id: &AppUserId,
    message: &String,
) -> sqlx::Result<MessageId> {
    type T = schema::Message;

    let id: MessageId = DbKey::new(T::id_prefix());
    let posted_at = instant_now();

    let (icolumns, ivalues) = InsertRow::new()
        .field(T::id(), &id)
        .field(T::posted_at(), &posted_at)
        .field(T::posted_by(), user_id)
        .field(T::message(), message)
        .build();

    let (sql, values) = Query::insert()
        .into_table(schema::Message::table())
        .columns(icolumns)
        .values_panic(ivalues)
        .build_sqlx(PostgresQueryBuilder);
    sqlx::query_with(&sql, values).execute(pool).await?;
    Ok(id)
}

pub async fn recent_messages(
    pool: &DbPool,
    offset: u64,
    limit: u64,
) -> sqlx::Result<Vec<apis::ui::Message>> {
    type U = schema::AppUser;
    type M = schema::Message;
    let (sql, values) = Query::select()
        .scolumn(M::id())
        .scolumn(M::posted_at())
        .scolumn(M::message())
        .scolumn(U::fullname())
        .from(M::table())
        .inner_join(U::table(), U::id().expr().eq(M::posted_by().expr()))
        .order_by(schema::Message::posted_at().iden(), Order::Desc)
        .offset(offset)
        .limit(limit)
        .build_sqlx(PostgresQueryBuilder);

    let messages = sqlx::query_with(&sql, values.clone())
        .map(|r| apis::ui::Message {
            id: M::id().from_row(&r),
            posted_at: M::posted_at().from_row(&r),
            message: M::message().from_row(&r),
            user_fullname: U::fullname().from_row(&r),
        })
        .fetch_all(pool)
        .await?;
    Ok(messages)
}

pub async fn message_count(pool: &DbPool) -> sqlx::Result<u64> {
    type M = schema::Message;

    let (sql, values) = Query::select()
        .from(M::table())
        .expr(Func::count(Expr::asterisk()))
        .build_sqlx(PostgresQueryBuilder);

    let count: i64 = sqlx::query_with(&sql, values)
        .map(|r| r.get(0))
        .fetch_one(pool)
        .await?;
    Ok(count as u64)
}

fn instant_now() -> Instant {
    Instant(SystemTime::now())
}
