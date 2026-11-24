-- RAIHAN RQR PORTFOLIO
-- Public can read portfolio content.
-- Only user IDs listed in public.admins can manage projects, settings and media.
-- Safe to run repeatedly. Does not delete existing project data.

create extension if not exists pgcrypto;

-- Keep the portfolio's existing column structure.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default 'General',
  client text,
  description text,
  url text,
  media_url text,
  media_type text,
  created_at timestamptz default now()
);

create table if not exists public.settings (
  key text primary key,
  value text
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Enable RLS.
alter table public.projects enable row level security;
alter table public.settings enable row level security;
alter table public.admins enable row level security;

-- Remove old / permissive policies from earlier setup scripts.
drop policy if exists "read projects" on public.projects;
drop policy if exists "admin projects" on public.projects;
drop policy if exists "Everyone can view projects" on public.projects;
drop policy if exists "Public can view projects" on public.projects;
drop policy if exists "Authenticated users can insert projects" on public.projects;
drop policy if exists "Only admins can insert projects" on public.projects;
drop policy if exists "Only admins can update projects" on public.projects;
drop policy if exists "Only admins can delete projects" on public.projects;

drop policy if exists "read settings" on public.settings;
drop policy if exists "admin settings" on public.settings;
drop policy if exists "Public can view settings" on public.settings;
drop policy if exists "Admins can manage settings" on public.settings;

drop policy if exists "Admins can view their own role" on public.admins;

-- Public portfolio: anyone can read projects and settings.
create policy "Everyone can view projects"
on public.projects for select
to anon, authenticated
using (true);

create policy "Everyone can view settings"
on public.settings for select
to anon, authenticated
using (true);

-- An authenticated user can only read their own admin row.
create policy "Admins can view their own role"
on public.admins for select
to authenticated
using (user_id = (select auth.uid()));

-- Only listed admins can add projects.
create policy "Only admins can insert projects"
on public.projects for insert
to authenticated
with check (
  exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid())
  )
);

-- Only listed admins can edit projects.
create policy "Only admins can update projects"
on public.projects for update
to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid())
  )
);

-- Only listed admins can delete projects.
create policy "Only admins can delete projects"
on public.projects for delete
to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid())
  )
);

-- Only listed admins can create/update/delete website settings.
create policy "Admins can insert settings"
on public.settings for insert
to authenticated
with check (
  exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

create policy "Admins can update settings"
on public.settings for update
to authenticated
using (
  exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

create policy "Admins can delete settings"
on public.settings for delete
to authenticated
using (
  exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

-- Table privileges (RLS policies still decide which rows can be changed).
grant usage on schema public to anon, authenticated;
grant select on public.projects, public.settings to anon, authenticated;
grant insert, update, delete on public.projects, public.settings to authenticated;
grant select on public.admins to authenticated;

-- Public media bucket: files can be viewed publicly, but only admins can manage them.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "read media" on storage.objects;
drop policy if exists "admin media" on storage.objects;
drop policy if exists "Public can view portfolio media" on storage.objects;
drop policy if exists "Admins can upload portfolio media" on storage.objects;
drop policy if exists "Admins can update portfolio media" on storage.objects;
drop policy if exists "Admins can delete portfolio media" on storage.objects;

create policy "Public can view portfolio media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'media');

create policy "Admins can upload portfolio media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'media'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

create policy "Admins can update portfolio media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'media'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
)
with check (
  bucket_id = 'media'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

create policy "Admins can delete portfolio media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'media'
  and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

-- Add your admin account separately after creating it in Authentication > Users:
-- insert into public.admins (user_id)
-- values ('YOUR-AUTH-USER-UUID');

-- Verify admins:
select a.user_id, u.email
from public.admins a
join auth.users u on u.id = a.user_id;

