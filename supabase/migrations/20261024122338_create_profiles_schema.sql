-- Private schema for internal trigger functions.
create schema if not exists private;

revoke all on schema private
from public, anon, authenticated;


-- Role definitions.
create type public.app_role as enum (
    'warga',
    'admin'
);


-- User profiles.
create table public.profiles (
    id uuid primary key
        references auth.users (id)
        on delete cascade,

    full_name text not null
        check (length(btrim(full_name)) > 0),

    phone text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- User roles.
create table public.user_roles (
    user_id uuid primary key
        references auth.users (id)
        on delete cascade,

    role public.app_role not null default 'warga',

    created_at timestamptz not null default now()
);


-- Enable RLS.
alter table public.profiles
    enable row level security;

alter table public.user_roles
    enable row level security;


-- Profiles: read and update own profile only.
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);


-- Roles: users can read their own role only.
create policy "Users can read own role"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);


-- Explicit table privileges.
revoke all on table public.profiles
from anon, authenticated;

revoke all on table public.user_roles
from anon, authenticated;

grant select on table public.profiles
to authenticated;

grant update (full_name, phone)
on table public.profiles
to authenticated;

grant select on table public.user_roles
to authenticated;

grant usage on type public.app_role
to authenticated;


-- Automatically update the profile timestamp.
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();


-- Create a profile and default role after signup.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_full_name text;
begin
    v_full_name := nullif(
        btrim(new.raw_user_meta_data ->> 'full_name'),
        ''
    );

    if v_full_name is null then
        v_full_name := nullif(
            btrim(coalesce(new.raw_user_meta_data ->> 'name', '')),
            ''
        );
    end if;

    if v_full_name is null then
        v_full_name := nullif(split_part(coalesce(new.email, ''), '@', 1), '');
    end if;

    if v_full_name is null then
        v_full_name := 'Pengguna';
    end if;

    insert into public.profiles (id, full_name)
    values (new.id, v_full_name);

    insert into public.user_roles (user_id, role)
    values (new.id, 'warga'::public.app_role);

    return new;
end;
$$;

revoke all on function private.handle_new_user()
from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();