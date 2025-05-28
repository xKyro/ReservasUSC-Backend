-- USUARIOS
drop table if exists public.users_tfa cascade;
drop table if exists public.users_activation cascade;
drop table if exists public.users cascade;
drop type if exists user_role;

create type user_role as enum ('user', 'admin');

create table if not exists public.users (
	user_id varchar(18) primary key,
	first_name varchar(64) not null,
	last_name varchar(64) not null,
	role user_role not null default 'user',
	phone bigint,
	email varchar(128) not null,
	password text not null,
	last_login timestamp with time zone not null,
	created_at timestamp with time zone not null,
	tfa boolean default true,
	active boolean default true
);

create table if not exists public.users_activation (
	user_id varchar(18) primary key references public.users(user_id) on delete cascade,
	token text not null
);

create table if not exists public.users_tfa (
	user_id varchar(18) primary key references public.users(user_id) on delete cascade,
	code text not null,
	expires_at timestamp not null
);

-- AUDITORIOS
drop table if exists public.auditoriums cascade;

create table if not exists public.auditoriums (
	auditorium_id varchar(18) primary key,
	name varchar(128) not null,
	description text not null,
	location varchar(128) not null,
	capacity integer not null,
	price integer not null,
	facilities varchar(128)[] default '{}'
);

-- RESERVAS
-- drop table if exists public.reservations_feedback cascade;
drop table if exists public.reservations cascade;
drop type if exists reservation_state;

create type reservation_state as enum ('pending', 'approved', 'rejected', 'checked');

create table if not exists public.reservations (
	reservation_id varchar(18) primary key,
	state reservation_state not null default 'pending',
	title text not null,
	reason text not null,
	assistants integer not null default 1,
	purpose text not null,
	start_at timestamp not null,
	end_at timestamp not null,
	requires_tech boolean not null,
	auditorium_id varchar(18) not null references public.auditoriums(auditorium_id) on delete cascade,
	requested_by varchar(18) not null references public.users(user_id) on delete cascade
);

-- AUDITORIOS REGISTRO
delete from auditoriums;
insert into auditoriums ("auditorium_id", "name", description, "location", capacity, facilities, price)
values
  ('AMX', 'Aula Máxima', 'Espacio amplio ideal para conferencias, ceremonias de grado y eventos institucionales. Cuenta con sistema de sonido profesional y proyección multimedia.', 'Bloque 3 (Los trabajadores), Piso 4', 900, ARRAY['Sonido', 'Proyector', 'Aire Acondicionado', 'Wifi', 'Acceso para movilidad reducida'], 120000),
  ('AAX', 'Aula Auxiliar', 'Sala de conferencias con capacidad media, perfecta para seminarios, presentaciones y reuniones académicas.', 'Bloque 3 (Los trabajadores), Piso 4', 250, ARRAY['Proyector', 'Aire Acondicionado', 'Wifi', 'Pizarra digital'], 100000),
  ('TUC', 'Teatro Usaca', 'Teatro moderno con excelente acústica, escenario amplio y camerinos. Ideal para obras teatrales, conciertos y eventos culturales.', 'Bloque 4 (Laboratorio), Piso 4', 90, ARRAY['Iluminación profesional', 'Sistema de sonido', 'Camerinos', 'Aire Acondicionado', 'Wifi'], 98000),
  ('AUC', 'Arena Usc', 'Espacio amplio ideal para conferencias, ceremonias de grado y eventos institucionales. Cuenta con sistema de sonido profesional y proyección multimedia.', 'Bloque 8 (Posgrado)', 2200, ARRAY['Ilumicación profesional', 'Sistema de sonido', 'Wifi', 'Aire Acondicionado', 'Megafonía'], 145000),
  ('PEL', 'Pedro Elías', 'Sala de reuniones ejecutiva equipada con tecnología audiovisual de última generación. Perfecta para consejos directivos y reuniones importantes.', 'Bloque 4 (Laboratorio), Piso 3', 300, ARRAY['Videoconferencia', 'Proyector 4K', 'Aire Acondicionado', 'Wifi', 'Sistema de audio'], 125500);


select * from users;
select * from reservations;
select * from auditoriums;

update users set role = 'admin' where first_name = 'Andres';