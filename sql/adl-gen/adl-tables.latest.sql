-- Schema auto-generated from adl modules: protoapp.db
--
-- column comments show original ADL types

create table app_user(
  id text not null,                    -- String
  fullname text not null,              -- StringNE
  email text not null,                 -- StringNE
  is_admin boolean not null,           -- Bool
  hashed_password text not null,       -- StringNE
  primary key(id)
);

create table message(
  id text not null,                    -- String
  posted_at timestamp with time zone not null, -- Instant
  posted_by text not null,             -- AppUserId
  message text not null,               -- StringML
  primary key(id)
);

create table test(
  uuid_4 text not null,                -- StringNE
  pascal_case_name text not null,      -- StringNE
  snake_case_name_3 text not null,     -- StringNE
  mixed_case_name_watcha_gonna_do text not null, -- StringNE
  aaaahh_i_m_capital_i_zed_weirdl_yyy text not null -- StringNE
);

create index app_user_1_idx on app_user(email);
alter table app_user add constraint app_user_1_con unique (email);
alter table message add constraint message_posted_by_fk foreign key (posted_by) references app_user(id);
create index message_1_idx on message(posted_at);
