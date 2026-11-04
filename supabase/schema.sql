-- 구독 해지 도우미 DB 스키마
-- Supabase SQL Editor에서 이 파일 전체를 실행한 뒤, seed.sql을 실행하세요.

-- 1) 해지 가이드 (읽기 전용 시드 데이터)
create table if not exists public.services (
  id            text primary key,
  name          text not null,
  channels      jsonb not null default '[]'::jsonb,
  cancel        jsonb not null default '{}'::jsonb,
  after_cancel  text,
  refund        text,
  warnings      jsonb not null default '[]'::jsonb,
  notes         text,
  contact       text,
  sources       jsonb not null default '[]'::jsonb,
  verification  text not null
                check (verification in ('page_read', 'official_search', 'partial', 'blog_only')),
  last_verified date not null
);

-- 2) 사용자 구독
create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  service_id        text references public.services (id) on delete set null,
  name              text not null check (char_length(name) between 1 and 100),
  amount            numeric(12, 2) not null check (amount >= 0),
  currency          text not null default 'KRW' check (currency in ('KRW', 'USD')),
  billing_cycle    text not null check (billing_cycle in ('monthly', 'yearly')),
  next_billing_date date,
  payment_channel   text not null default 'unknown'
                    check (payment_channel in ('direct', 'apple', 'google_play', 'carrier', 'unknown')),
  payment_method    text not null default 'unknown'
                    check (payment_method in ('card', 'bank', 'simple_pay', 'mobile', 'points', 'other', 'unknown')),
  status            text not null default 'active' check (status in ('active', 'cancelled')),
  memo              text check (memo is null or char_length(memo) <= 500),
  created_at        timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- 3) 신고 문구 (P1)
create table if not exists public.complaint_drafts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists complaint_drafts_user_id_idx on public.complaint_drafts (user_id);

-- 4) Row Level Security
alter table public.services         enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.complaint_drafts enable row level security;

-- services: 누구나 읽기만 가능 (쓰기 정책 없음 = 불가)
drop policy if exists "services are readable by everyone" on public.services;
create policy "services are readable by everyone"
  on public.services for select
  to anon, authenticated
  using (true);

-- subscriptions: 본인 데이터만 CRUD
drop policy if exists "own subscriptions select" on public.subscriptions;
create policy "own subscriptions select"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "own subscriptions insert" on public.subscriptions;
create policy "own subscriptions insert"
  on public.subscriptions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "own subscriptions update" on public.subscriptions;
create policy "own subscriptions update"
  on public.subscriptions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own subscriptions delete" on public.subscriptions;
create policy "own subscriptions delete"
  on public.subscriptions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- complaint_drafts: 본인 데이터만 CRUD
drop policy if exists "own drafts select" on public.complaint_drafts;
create policy "own drafts select"
  on public.complaint_drafts for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "own drafts insert" on public.complaint_drafts;
create policy "own drafts insert"
  on public.complaint_drafts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "own drafts delete" on public.complaint_drafts;
create policy "own drafts delete"
  on public.complaint_drafts for delete
  to authenticated
  using ((select auth.uid()) = user_id);
