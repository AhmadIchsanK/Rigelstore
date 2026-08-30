-- ============================================================
-- Fase 2 — Mesin inventory deterministik (anti double-sell)
-- Transisi kepemilikan HANYA lewat fungsi ini (service_role). Bukan AI.
-- ============================================================

create or replace function public.reserve_inventory_item(
  p_product uuid, p_order uuid, p_minutes int default 15
) returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  select id into v_id from public.inventory_items
  where product_id = p_product and status = 'AVAILABLE'
  order by created_at
  for update skip locked
  limit 1;
  if v_id is null then return null; end if;
  update public.inventory_items
  set status='RESERVED', reserved_by_order=p_order, reserved_at=now(),
      reservation_expires_at = now() + make_interval(mins => p_minutes)
  where id = v_id;
  return v_id;
end; $$;

create or replace function public.release_expired_reservations()
returns int language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_count int;
begin
  with freed as (
    update public.inventory_items
    set status='AVAILABLE', reserved_by_order=null, reserved_at=null, reservation_expires_at=null
    where status='RESERVED' and reservation_expires_at is not null
      and reservation_expires_at <= now()
    returning 1
  ) select count(*) into v_count from freed;
  return v_count;
end; $$;

create or replace function public.mark_inventory_sold(p_item uuid, p_order uuid)
returns boolean language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_status public.inventory_status; v_order uuid;
begin
  select status, reserved_by_order into v_status, v_order
  from public.inventory_items where id = p_item for update;
  if not found then return false; end if;
  if v_status='SOLD' and v_order is not distinct from p_order then return true; end if;
  if v_status='RESERVED' and v_order is not distinct from p_order then
    update public.inventory_items set status='SOLD', sold_at=now() where id=p_item;
    return true;
  end if;
  return false;
end; $$;

create or replace function public.mark_inventory_delivered(p_item uuid)
returns boolean language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_status public.inventory_status;
begin
  select status into v_status from public.inventory_items where id=p_item for update;
  if not found then return false; end if;
  if v_status='DELIVERED' then return true; end if;
  if v_status='SOLD' then
    update public.inventory_items set status='DELIVERED', delivered_at=now() where id=p_item;
    return true;
  end if;
  return false;
end; $$;

create or replace function public.revoke_inventory_item(p_item uuid)
returns boolean language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_status public.inventory_status;
begin
  select status into v_status from public.inventory_items where id=p_item for update;
  if not found then return false; end if;
  if v_status in ('AVAILABLE','RESERVED') then
    update public.inventory_items
    set status='REVOKED', reserved_by_order=null, reserved_at=null, reservation_expires_at=null
    where id=p_item;
    return true;
  end if;
  return false;
end; $$;

revoke all on function public.reserve_inventory_item(uuid, uuid, int) from public, anon, authenticated;
revoke all on function public.release_expired_reservations()          from public, anon, authenticated;
revoke all on function public.mark_inventory_sold(uuid, uuid)         from public, anon, authenticated;
revoke all on function public.mark_inventory_delivered(uuid)          from public, anon, authenticated;
revoke all on function public.revoke_inventory_item(uuid)             from public, anon, authenticated;
grant execute on function public.reserve_inventory_item(uuid, uuid, int) to service_role;
grant execute on function public.release_expired_reservations()          to service_role;
grant execute on function public.mark_inventory_sold(uuid, uuid)         to service_role;
grant execute on function public.mark_inventory_delivered(uuid)          to service_role;
grant execute on function public.revoke_inventory_item(uuid)             to service_role;
