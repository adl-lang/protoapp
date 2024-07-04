-- Connection role for postgrest
create role authenticator noinherit login password 'pgxyzzy';

-- Access without a jwt 
create role web_anon nologin;
grant web_anon to authenticator;

-- Access with a non admin jwt
create role normal_user nologin;
grant normal_user to authenticator;
grant usage on schema public to normal_user;


-- Access with a admin jwt
create role admin_user nologin;
grant admin_user to authenticator;
grant usage on schema public to admin_user;
