create table if not exists "counter" (
  id integer primary key,
  name text not null,
  count integer not null
);

insert into "counter" (id, name, count) values (1, 'counter', 0);