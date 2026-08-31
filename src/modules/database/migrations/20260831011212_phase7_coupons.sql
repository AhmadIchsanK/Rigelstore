-- ============================================================
-- Fase 7 — Kupon (diskon deterministik).
-- ============================================================
create type public.coupon_type as enum ('percent', 'fixed');

create table public.coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  type           public.coupon_type not null,
  value          bigint not null check (value >= 0),
  min_subtotal   bigint not null default 0,
  max_redemptions int,
  redeemed_count int not null default 0,
  active         boolean not null default true,
  starts_at      timestamptz,
  expires_at     timestamptz,
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_coupons_code on public.coupons(code);
create trigger trg_coupons_updated_at
  before update on public.coupons for each row execute function public.set_updated_at();

alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists discount_idr bigint not null default 0;

alter table public.coupons enable row level security;
create policy coupons_read on public.coupons
  for select to anon, authenticated using (active = true or public.has_permission('coupons.manage'));
create policy coupons_write on public.coupons
  for all to authenticated
  using (public.has_permission('coupons.manage'))
  with check (public.has_permission('coupons.manage'));

create or replace function public.compute_coupon_discount(p_code text, p_subtotal bigint)
returns table (valid boolean, discount bigint, reason text)
language plpgsql stable security definer
set search_path = public, pg_temp as $$
declare c public.coupons%rowtype; d bigint;
begin
  if p_code is null or length(trim(p_code)) = 0 then return query select false, 0::bigint, 'no_code'; return; end if;
  select * into c from public.coupons where code = upper(trim(p_code));
  if not found then return query select false, 0::bigint, 'not_found'; return; end if;
  if not c.active then return query select false, 0::bigint, 'inactive'; return; end if;
  if c.starts_at is not null and c.starts_at > now() then return query select false, 0::bigint, 'not_started'; return; end if;
  if c.expires_at is not null and c.expires_at <= now() then return query select false, 0::bigint, 'expired'; return; end if;
  if c.max_redemptions is not null and c.redeemed_count >= c.max_redemptions then return query select false, 0::bigint, 'limit_reached'; return; end if;
  if p_subtotal < c.min_subtotal then return query select false, 0::bigint, 'min_subtotal'; return; end if;
  if c.type = 'percent' then d := (p_subtotal * least(c.value, 100)) / 100; else d := least(c.value, p_subtotal); end if;
  return query select true, d, 'ok';
end; $$;

-- (Grant diperketat di migrasi phase7_harden_coupon_fn: service_role saja.)
revoke all on function public.compute_coupon_discount(text, bigint) from public, anon, authenticated;
grant execute on function public.compute_coupon_discount(text, bigint) to service_role;
