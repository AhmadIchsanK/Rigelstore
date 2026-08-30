-- ============================================================
-- Fase 3 — Jadwalkan pelepasan stok kadaluwarsa via pg_cron (tiap menit).
-- ============================================================

create extension if not exists pg_cron;

select cron.unschedule('rigelstore_expire_due_orders')
where exists (select 1 from cron.job where jobname = 'rigelstore_expire_due_orders');

select cron.schedule(
  'rigelstore_expire_due_orders',
  '* * * * *',
  $$select public.expire_due_orders();$$
);
