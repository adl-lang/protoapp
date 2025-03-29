use std::marker::PhantomData;

use sea_query::{Alias, ColumnRef, DynIden, Expr, IntoColumnRef, IntoIden, SimpleExpr};
use sqlx::postgres::PgRow;
use sqlx::Row;

pub trait DbConversions {
    type DbType;

    fn to_db(&self) -> Self::DbType;
    fn from_db(dbv: Self::DbType) -> Self;
}

pub struct ColumnSpec<T> {
    pub table: &'static str,
    pub column: &'static str,
    pub phantom: PhantomData<T>,
}

impl<T, D> ColumnSpec<T>
where
    T: DbConversions<DbType = D>,
    D: Into<SimpleExpr>,
    D: sqlx::Type<sqlx::Postgres>,
{
    pub fn new(table: &'static str, column: &'static str) -> ColumnSpec<T> {
        ColumnSpec {
            table,
            column,
            phantom: PhantomData,
        }
    }

    pub fn iden(&self) -> DynIden {
        Alias::new(self.column).into_iden()
    }

    pub fn cref(&self) -> ColumnRef {
        (
            Alias::new(self.table).into_iden(),
            Alias::new(self.column).into_iden(),
        )
            .into_column_ref()
    }

    pub fn expr(&self) -> Expr {
        Expr::col(self.cref())
    }

    pub fn value_expr(&self, value: &T) -> SimpleExpr {
        return value.to_db().into();
    }

    pub fn eq_value(&self, value: &T) -> SimpleExpr {
        self.expr().eq(self.value_expr(value))
    }

    pub fn from_db<'r>(&self, dbv: D) -> T {
        T::from_db(dbv)
    }

    pub fn to_db<'r>(&self, v: &T) -> D {
        T::to_db(v)
    }

    pub fn from_row<'r>(&self, row: &'r PgRow) -> T
    where
        D: sqlx::Decode<'r, sqlx::Postgres>,
    {
        let alias = self.alias();
        T::from_db(row.get(alias.as_str()))
    }

    // Useful for getting column values that are optional as the
    // the result of a left join
    pub fn from_row_optional<'r>(&self, row: &'r PgRow) -> Option<T>
    where
        D: sqlx::Decode<'r, sqlx::Postgres>,
    {
        let alias = self.alias();
        let odbv: Option<D> = row.get(alias.as_str());
        odbv.map(|dbv| T::from_db(dbv))
    }

    pub fn alias(&self) -> String {
        format!("{}_{}", self.table, self.column)
    }
}

pub struct InsertRow {
    pub columns: Vec<DynIden>,
    pub values: Vec<SimpleExpr>,
}

impl InsertRow {
    pub fn new() -> Self {
        InsertRow {
            columns: Vec::new(),
            values: Vec::new(),
        }
    }

    pub fn build(self) -> (Vec<DynIden>, Vec<SimpleExpr>) {
        (self.columns, self.values)
    }

    pub fn field<T, D>(mut self, col: ColumnSpec<T>, v: &T) -> Self
    where
        T: DbConversions<DbType = D>,
        D: Into<SimpleExpr>,
        D: sqlx::Type<sqlx::Postgres>,
    {
        let expr: SimpleExpr = col.to_db(v).into();
        self.columns.push(col.iden());
        self.values.push(expr);
        self
    }
}

pub trait SelectStatementExt<T> {
    fn scolumn(&mut self, col: ColumnSpec<T>) -> &mut Self;
}

impl<T, D> SelectStatementExt<T> for sea_query::SelectStatement
where
    T: DbConversions<DbType = D>,
    D: Into<SimpleExpr>,
    D: sqlx::Type<sqlx::Postgres>,
{
    fn scolumn(&mut self, col: ColumnSpec<T>) -> &mut Self {
        let alias = col.alias();
        self.expr_as(col.expr(), Alias::new(&alias))
    }
}

pub trait UpdateStatementExt<T> {
    fn svalue(&mut self, col: ColumnSpec<T>, value: &T) -> &mut Self;
}

impl<T, D> UpdateStatementExt<T> for sea_query::UpdateStatement
where
    T: DbConversions<DbType = D>,
    D: Into<SimpleExpr>,
    D: sqlx::Type<sqlx::Postgres>,
{
    fn svalue(&mut self, col: ColumnSpec<T>, value: &T) -> &mut Self {
        self.value(col.iden(), col.value_expr(value))
    }
}
