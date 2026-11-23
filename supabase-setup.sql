-- Supabase Dashboard → SQL Editor → New query → পেস্ট করে Run
create table if not exists projects(
  id uuid primary key default gen_random_uuid(),
  title text not null, category text default 'General', client text,
  description text, url text, media_url text, media_type text,
  created_at timestamptz default now());
create table if not exists settings(key text primary key, value text);

alter table projects enable row level security;
alter table settings enable row level security;
create policy "read projects" on projects for select using (true);
create policy "admin projects" on projects for all to authenticated using (true) with check (true);
create policy "read settings" on settings for select using (true);
create policy "admin settings" on settings for all to authenticated using (true) with check (true);

insert into storage.buckets(id,name,public) values('media','media',true) on conflict (id) do nothing;
create policy "read media" on storage.objects for select using (bucket_id='media');
create policy "admin media" on storage.objects for all to authenticated using (bucket_id='media') with check (bucket_id='media');
