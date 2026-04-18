-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generations
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  style text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);
alter table public.generations enable row level security;
create policy "gen_select_own" on public.generations for select using (auth.uid() = user_id);
create policy "gen_insert_own" on public.generations for insert with check (auth.uid() = user_id);
create policy "gen_delete_own" on public.generations for delete using (auth.uid() = user_id);
create index generations_user_created_idx on public.generations (user_id, created_at desc);

-- Storage bucket for illustrations
insert into storage.buckets (id, name, public) values ('illustrations', 'illustrations', true);

create policy "illustrations_public_read" on storage.objects for select
  using (bucket_id = 'illustrations');
create policy "illustrations_user_insert" on storage.objects for insert
  with check (bucket_id = 'illustrations' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "illustrations_user_delete" on storage.objects for delete
  using (bucket_id = 'illustrations' and auth.uid()::text = (storage.foldername(name))[1]);