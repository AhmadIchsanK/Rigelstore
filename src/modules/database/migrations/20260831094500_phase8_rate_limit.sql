-- ============================================================
-- Fase 8 — Rate limiting berbasis DB (fixed window) + purge cron.
-- ============================================================
create table public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        int not null default 0
);
alter table public.rate_limits enable row level security; -- service_role saja

create or replace function public.rate_limit_hit(p_key text, p_max int, p_window_seconds int)
returns boolean language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_count int;
begin
  insert into public.rate_limits (key, window_start, count) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
      then now() else public.rate_limits.window_start end,
    count = case when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
      then 1 else public.rate_limits.count + 1 end
  returning count into v_count;
  return v_count <= p_max;
end; $$;
revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

create or replace function public.purge_old_rate_limits()
returns int language sql security definer set search_path = public, pg_temp as $$
  with d as (delete from public.rate_limits where window_start < now() - interval '1 day' returning 1)
  select count(*)::int from d;
$$;
revoke all on function public.purge_old_rate_limits() from public, anon, authenticated;
grant execute on function public.purge_old_rate_limits() to service_role;

select cron.schedule('rigelstore_purge_rate_limits', '17 * * * *', $$select public.purge_old_rate_limits();$$)
where not exists (select 1 from cron.job where jobname = 'rigelstore_purge_rate_limits');
