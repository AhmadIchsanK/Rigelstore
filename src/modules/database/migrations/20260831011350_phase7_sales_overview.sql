-- ============================================================
-- Fase 7 — Ringkasan analitik penjualan (jsonb). service_role only.
-- ============================================================
create or replace function public.sales_overview()
returns jsonb language sql stable security definer
set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'revenue_total', coalesce((select sum(total_idr) from public.orders where status='paid'), 0),
    'orders_paid', (select count(*) from public.orders where status='paid'),
    'orders_pending', (select count(*) from public.orders where status='pending'),
    'orders_expired', (select count(*) from public.orders where status='expired'),
    'aov', coalesce((select round(avg(total_idr)) from public.orders where status='paid'), 0),
    'telegram_orders', (select count(*) from public.orders where status='paid' and guest_email like 'tg%@telegram.rigelstore.local'),
    'web_orders', (select count(*) from public.orders where status='paid' and (guest_email is null or guest_email not like 'tg%@telegram.rigelstore.local')),
    'revenue_7d', coalesce((select jsonb_agg(row_to_json(t)) from (
        select to_char(d::date, 'YYYY-MM-DD') as day, coalesce(sum(o.total_idr), 0) as revenue
        from generate_series(current_date - 6, current_date, interval '1 day') d
        left join public.orders o on o.status='paid' and o.paid_at::date = d::date
        group by d order by d) t), '[]'::jsonb),
    'top_products', coalesce((select jsonb_agg(row_to_json(t)) from (
        select oi.title_snapshot as title, sum(oi.line_total_idr) as revenue, count(*) as qty
        from public.order_items oi join public.orders o on o.id = oi.order_id and o.status='paid'
        group by oi.title_snapshot order by revenue desc limit 5) t), '[]'::jsonb)
  );
$$;
revoke all on function public.sales_overview() from public, anon, authenticated;
grant execute on function public.sales_overview() to service_role;
