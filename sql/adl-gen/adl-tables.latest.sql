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

create index app_user_1_idx on app_user(email);
alter table app_user add constraint app_user_1_con unique (email);
alter table message add constraint message_posted_by_fk foreign key (posted_by) references app_user(id);
create index message_1_idx on message(posted_at);
