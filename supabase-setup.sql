-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- User settings table
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text default '',
  language text default 'en',
  currency text default 'USD',
  monthly_savings_goal numeric default 0,
  is_new_user boolean default true,
  created_at timestamptz default now()
);

-- Transactions table
create table if not exists transactions (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  label text not null,
  amount numeric not null,
  category text,
  date text,
  note text,
  created_at timestamptz default now()
);

-- Subscriptions table
create table if not exists subscriptions (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  amount numeric not null,
  cycle text default 'monthly',
  color text,
  active boolean default true,
  next_date text,
  created_at timestamptz default now()
);

-- Savings goals table
create table if not exists savings (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  target numeric not null,
  saved numeric default 0,
  icon text,
  color text,
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table user_settings enable row level security;
alter table transactions enable row level security;
alter table subscriptions enable row level security;
alter table savings enable row level security;

-- RLS Policies: users can only see and edit their own data
create policy "users_own_settings" on user_settings for all using (auth.uid() = user_id);
create policy "users_own_transactions" on transactions for all using (auth.uid() = user_id);
create policy "users_own_subscriptions" on subscriptions for all using (auth.uid() = user_id);
create policy "users_own_savings" on savings for all using (auth.uid() = user_id);
