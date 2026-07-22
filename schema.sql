-- Apex Neon Esports - Supabase schema
-- Run this whole file in a fresh Supabase project SQL editor.

create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  whatsapp text,
  free_fire_uid text,
  role text not null default 'player' check (role in ('admin', 'captain', 'player')),
  profile_image text,
  created_at timestamptz not null default now()
);

-- Migrate older installations that used the old user/admin role names.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.users'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.users drop constraint %I', constraint_name);
  end loop;

  update public.users set role = 'player' where role = 'user';
end $$;

alter table public.users
  add constraint users_role_check check (role in ('admin', 'captain', 'player'));

-- Create the public profile from Auth automatically, including when email
-- confirmation is enabled and the browser has no authenticated session yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_username text;
  safe_username text;
begin
  requested_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))));
  safe_username := requested_username;

  if exists (select 1 from public.users where username = safe_username and id <> new.id) then
    safe_username := left(requested_username, 35) || '_' || left(replace(new.id::text, '-', ''), 8);
  end if;

  insert into public.users (id, full_name, username, whatsapp, free_fire_uid, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Player'),
    safe_username,
    coalesce(new.raw_user_meta_data ->> 'whatsapp', ''),
    coalesce(new.raw_user_meta_data ->> 'free_fire_uid', ''),
    'player'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    whatsapp = excluded.whatsapp,
    free_fire_uid = excluded.free_fire_uid;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'SQUAD' check (type in ('SOLO', 'DUO', 'SQUAD')),
  fee_type text not null default 'PAID' check (fee_type in ('FREE', 'PAID')),
  image text,
  entry_fee numeric not null default 0,
  prize_money numeric not null default 0,
  max_participants integer not null default 100,
  registration_start text,
  registration_deadline text,
  start_date text,
  start_time text,
  status text not null default 'OPEN REGISTRATION' check (status in ('UPCOMING', 'OPEN REGISTRATION', 'CLOSED REGISTRATION', 'LIVE / PLAYING', 'FINISHED')),
  rules text,
  winners_count integer not null default 3,
  region text,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_name text not null,
  captain_id uuid not null references public.users(id) on delete cascade,
  team_code text not null unique,
  team_type text not null default 'SQUAD' check (team_type in ('DUO', 'SQUAD')),
  status text not null default 'PENDING' check (status in ('PENDING', 'COMPLETE')),
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  game_name text not null,
  free_fire_uid text,
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table if not exists public.registrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  game_name text not null,
  free_fire_uid text not null,
  whatsapp text not null,
  player_image text,
  payment_screenshot text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now(),
  unique (user_id, tournament_id)
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  amount numeric not null default 0,
  payment_method text not null default 'EVC Plus / Mobile',
  screenshot_url text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_number integer not null default 1,
  player_or_team1_id text,
  player_or_team2_id text,
  player_or_team1_name text,
  player_or_team2_name text,
  winner_id text,
  eliminated_id text,
  is_bye boolean not null default false,
  status text not null default 'PENDING' check (status in ('PENDING', 'LIVE', 'FINISHED')),
  score1 integer not null default 0,
  score2 integer not null default 0,
  scheduled_time text,
  created_at timestamptz not null default now()
);

create table if not exists public.winners (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_or_team_id text,
  player_or_team_name text not null,
  position integer not null,
  prize_amount numeric not null default 0,
  winner_image text,
  payment_status text not null default 'PAID' check (payment_status in ('PAID', 'PENDING')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  is_active boolean not null default true,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_broadcasts (
  id uuid primary key default uuid_generate_v4(),
  platform text not null default 'YouTube' check (platform in ('YouTube', 'TikTok', 'Facebook')),
  url text not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id uuid primary key default uuid_generate_v4(),
  whatsapp_number text default '+252617624424',
  tiktok_url text default 'https://www.tiktok.com/@apexneonesports',
  payment_number text default '+252617624424',
  rules_text text,
  updated_at timestamptz not null default now()
);

create index if not exists registrations_user_idx on public.registrations(user_id);
create index if not exists registrations_tournament_idx on public.registrations(tournament_id);
create index if not exists payments_registration_idx on public.payments(registration_id);
create index if not exists payments_user_idx on public.payments(user_id);
create index if not exists teams_tournament_idx on public.teams(tournament_id);
create index if not exists team_members_team_idx on public.team_members(team_id);
create index if not exists notifications_user_idx on public.notifications(user_id);
create index if not exists announcements_active_idx on public.announcements(is_active, created_at desc);

alter table public.users enable row level security;
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;
alter table public.matches enable row level security;
alter table public.winners enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.live_broadcasts enable row level security;
alter table public.app_settings enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.users where id = auth.uid() and role = 'admin'); $$;

create or replace function public.is_captain_of(target_team uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.teams where id = target_team and captain_id = auth.uid()); $$;

-- Make this script safe to rerun after a partial or previous setup.
drop policy if exists "public read tournaments" on public.tournaments;
drop policy if exists "admin manage tournaments" on public.tournaments;
drop policy if exists "self or admin read users" on public.users;
drop policy if exists "self insert users" on public.users;
drop policy if exists "self update users" on public.users;
drop policy if exists "admin update users" on public.users;
drop policy if exists "admin delete users" on public.users;
drop policy if exists "public read winners" on public.winners;
drop policy if exists "admin manage winners" on public.winners;
drop policy if exists "public read live broadcasts" on public.live_broadcasts;
drop policy if exists "admin manage live broadcasts" on public.live_broadcasts;
drop policy if exists "public read settings" on public.app_settings;
drop policy if exists "admin manage settings" on public.app_settings;
drop policy if exists "public read matches" on public.matches;
drop policy if exists "admin manage matches" on public.matches;
drop policy if exists "public read announcements" on public.announcements;
drop policy if exists "admin manage announcements" on public.announcements;
drop policy if exists "own or admin read registrations" on public.registrations;
drop policy if exists "own insert registrations" on public.registrations;
drop policy if exists "admin manage registrations" on public.registrations;
drop policy if exists "own or admin read payments" on public.payments;
drop policy if exists "own insert payments" on public.payments;
drop policy if exists "admin manage payments" on public.payments;
drop policy if exists "members or admin read teams" on public.teams;
drop policy if exists "captain or admin manage teams" on public.teams;
drop policy if exists "members or admin read team members" on public.team_members;
drop policy if exists "self join team" on public.team_members;
drop policy if exists "captain or admin manage team members" on public.team_members;
drop policy if exists "captain or admin delete team members" on public.team_members;
drop policy if exists "own or admin read notifications" on public.notifications;
drop policy if exists "admin or own insert notifications" on public.notifications;
drop policy if exists "own update notifications" on public.notifications;
drop policy if exists "admin delete notifications" on public.notifications;
drop policy if exists "public read app files" on storage.objects;
drop policy if exists "authenticated upload app files" on storage.objects;
drop policy if exists "owner update app files" on storage.objects;
drop policy if exists "owner delete app files" on storage.objects;

create policy "public read tournaments" on public.tournaments for select using (true);
create policy "admin manage tournaments" on public.tournaments for all using (public.is_admin()) with check (public.is_admin());
create policy "self or admin read users" on public.users for select using (id = auth.uid() or public.is_admin());
create policy "self insert users" on public.users for insert with check (id = auth.uid() and role = 'player');
create policy "self update users" on public.users for update using (id = auth.uid()) with check (id = auth.uid() and role in ('player', 'captain'));
create policy "admin update users" on public.users for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete users" on public.users for delete using (public.is_admin());
create policy "public read winners" on public.winners for select using (true);
create policy "admin manage winners" on public.winners for all using (public.is_admin()) with check (public.is_admin());
create policy "public read live broadcasts" on public.live_broadcasts for select using (true);
create policy "admin manage live broadcasts" on public.live_broadcasts for all using (public.is_admin()) with check (public.is_admin());
create policy "public read settings" on public.app_settings for select using (true);
create policy "admin manage settings" on public.app_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "public read matches" on public.matches for select using (true);
create policy "admin manage matches" on public.matches for all using (public.is_admin()) with check (public.is_admin());
create policy "public read announcements" on public.announcements for select using (is_active = true or public.is_admin());
create policy "admin manage announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "own or admin read registrations" on public.registrations for select using (user_id = auth.uid() or public.is_admin());
create policy "own insert registrations" on public.registrations for insert with check (user_id = auth.uid());
create policy "admin manage registrations" on public.registrations for all using (public.is_admin()) with check (public.is_admin());
create policy "own or admin read payments" on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy "own insert payments" on public.payments for insert with check (user_id = auth.uid());
create policy "admin manage payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "members or admin read teams" on public.teams for select using (public.is_admin() or captain_id = auth.uid() or exists (select 1 from public.team_members where team_id = teams.id and user_id = auth.uid()));
create policy "captain or admin manage teams" on public.teams for all using (public.is_admin() or captain_id = auth.uid()) with check (public.is_admin() or captain_id = auth.uid());
create policy "members or admin read team members" on public.team_members for select using (public.is_admin() or user_id = auth.uid() or public.is_captain_of(team_id));
create policy "self join team" on public.team_members for insert with check (user_id = auth.uid());
create policy "captain or admin manage team members" on public.team_members for update using (public.is_admin() or public.is_captain_of(team_id)) with check (public.is_admin() or public.is_captain_of(team_id));
create policy "captain or admin delete team members" on public.team_members for delete using (public.is_admin() or public.is_captain_of(team_id));
create policy "own or admin read notifications" on public.notifications for select using (user_id = auth.uid()::text or (user_id in ('all', 'admin') and public.is_admin()));
create policy "admin or own insert notifications" on public.notifications for insert with check (public.is_admin() or user_id = auth.uid()::text);
create policy "own update notifications" on public.notifications for update using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy "admin delete notifications" on public.notifications for delete using (public.is_admin());

do $$ begin
  alter publication supabase_realtime add table public.users;
  alter publication supabase_realtime add table public.tournaments;
  alter publication supabase_realtime add table public.teams;
  alter publication supabase_realtime add table public.team_members;
  alter publication supabase_realtime add table public.registrations;
  alter publication supabase_realtime add table public.payments;
  alter publication supabase_realtime add table public.notifications;
  alter publication supabase_realtime add table public.announcements;
  alter publication supabase_realtime add table public.app_settings;
exception when duplicate_object then null;
end $$;

insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true), ('payments', 'payments', true), ('tournaments', 'tournaments', true)
on conflict (id) do update set public = excluded.public;

create policy "public read app files" on storage.objects for select using (bucket_id in ('avatars', 'payments', 'tournaments'));
create policy "authenticated upload app files" on storage.objects for insert to authenticated with check (bucket_id in ('avatars', 'payments', 'tournaments'));
create policy "owner update app files" on storage.objects for update to authenticated using (owner_id = auth.uid()::text or public.is_admin());
create policy "owner delete app files" on storage.objects for delete to authenticated using (owner_id = auth.uid()::text or public.is_admin());
