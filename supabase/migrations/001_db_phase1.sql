create table if not exists public.game_metrics (
  slug text primary key,
  view_count bigint not null default 0,
  vote_count bigint not null default 0,
  choice_a_count bigint not null default 0,
  choice_b_count bigint not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_daily_visits (
  visit_date date primary key,
  visit_count bigint not null default 0
);

create table if not exists public.site_counters (
  key text primary key,
  total_visits bigint not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_counters (key, total_visits)
values ('visits', 0)
on conflict (key) do nothing;

alter table public.game_metrics enable row level security;
alter table public.site_daily_visits enable row level security;
alter table public.site_counters enable row level security;

create or replace function public.record_game_view(p_slug text)
returns table (
  slug text,
  view_count bigint,
  vote_count bigint,
  choice_a_count bigint,
  choice_b_count bigint,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.game_metrics as gm (slug, view_count, vote_count, choice_a_count, choice_b_count)
  values (p_slug, 1, 0, 0, 0)
  on conflict (slug) do update
    set view_count = gm.view_count + 1,
        updated_at = timezone('utc', now());

  return query
  select gm.slug, gm.view_count, gm.vote_count, gm.choice_a_count, gm.choice_b_count, gm.updated_at
  from public.game_metrics gm
  where gm.slug = p_slug;
end;
$$;

create or replace function public.record_game_vote(p_slug text, p_choice text)
returns table (
  slug text,
  view_count bigint,
  vote_count bigint,
  choice_a_count bigint,
  choice_b_count bigint,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.game_metrics as gm (slug, view_count, vote_count, choice_a_count, choice_b_count)
  values (
    p_slug,
    0,
    1,
    case when p_choice = 'a' then 1 else 0 end,
    case when p_choice = 'b' then 1 else 0 end
  )
  on conflict (slug) do update
    set vote_count = gm.vote_count + 1,
        choice_a_count = gm.choice_a_count + case when p_choice = 'a' then 1 else 0 end,
        choice_b_count = gm.choice_b_count + case when p_choice = 'b' then 1 else 0 end,
        updated_at = timezone('utc', now());

  return query
  select gm.slug, gm.view_count, gm.vote_count, gm.choice_a_count, gm.choice_b_count, gm.updated_at
  from public.game_metrics gm
  where gm.slug = p_slug;
end;
$$;

create or replace function public.get_site_visit_stats()
returns table (
  today bigint,
  total bigint,
  date text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  today_key date := timezone('Asia/Seoul', now())::date;
begin
  return query
  select
    coalesce((select visit_count from public.site_daily_visits where visit_date = today_key), 0) as today,
    coalesce((select total_visits from public.site_counters where key = 'visits'), 0) as total,
    to_char(today_key, 'YYYY-MM-DD') as date;
end;
$$;

create or replace function public.register_site_visit()
returns table (
  today bigint,
  total bigint,
  date text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  today_key date := timezone('Asia/Seoul', now())::date;
begin
  insert into public.site_daily_visits as sdv (visit_date, visit_count)
  values (today_key, 1)
  on conflict (visit_date) do update
    set visit_count = sdv.visit_count + 1;

  insert into public.site_counters as sc (key, total_visits)
  values ('visits', 1)
  on conflict (key) do update
    set total_visits = sc.total_visits + 1,
        updated_at = timezone('utc', now());

  return query
  select
    coalesce((select visit_count from public.site_daily_visits where visit_date = today_key), 0) as today,
    coalesce((select total_visits from public.site_counters where key = 'visits'), 0) as total,
    to_char(today_key, 'YYYY-MM-DD') as date;
end;
$$;
