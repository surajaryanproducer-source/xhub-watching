-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  is_admin boolean default false,
  updated_at timestamp with time zone,
  constraint username_length check (char_length(username) >= 3)
);

-- Create categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create videos table
create table videos (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration integer default 0,
  views integer default 0,
  category_id uuid references categories(id) on delete set null,
  profile_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  video_id uuid references videos(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create featured_videos table
create table featured_videos (
  id uuid default uuid_generate_v4() primary key,
  video_id uuid references videos(id) on delete cascade not null unique,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table categories enable row level security;
alter table videos enable row level security;
alter table comments enable row level security;
alter table featured_videos enable row level security;

-- RLS Policies

-- Profiles: Public read, self update
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Categories: Public read, admin write (for now allow authenticated users to insert for demo purposes, or just manual insert)
create policy "Categories are viewable by everyone." on categories for select using (true);
create policy "Authenticated users can insert categories." on categories for insert to authenticated with check (true);

-- Videos: Public read, authenticated upload
create policy "Videos are viewable by everyone." on videos for select using (true);
create policy "Authenticated users can insert videos." on videos for insert to authenticated with check (auth.uid() = profile_id);
create policy "Users can update own videos." on videos for update using (auth.uid() = profile_id);
create policy "Users can delete own videos." on videos for delete using (auth.uid() = profile_id);

-- Comments: Public read, authenticated insert
create policy "Comments are viewable by everyone." on comments for select using (true);
create policy "Authenticated users can insert comments." on comments for insert to authenticated with check (auth.uid() = user_id);

-- Featured Videos: Public read
create policy "Featured videos are viewable by everyone." on featured_videos for select using (true);

-- Functions and Triggers

-- Handle new user signup (auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed initial categories
insert into categories (name, slug) values
  ('Action', 'action'),
  ('Comedy', 'comedy'),
  ('Drama', 'drama'),
  ('Gaming', 'gaming'),
  ('Music', 'music'),
  ('Tech', 'tech')
on conflict (name) do nothing;

-- Storage Buckets Setup (You need to create these manually in Supabase Dashboard > Storage)
-- 1. 'videos' (Public)
-- 2. 'thumbnails' (Public)
-- 3. 'avatars' (Public)
