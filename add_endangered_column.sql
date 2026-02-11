alter table public.species
add column if not exists endangered boolean not null default false;
