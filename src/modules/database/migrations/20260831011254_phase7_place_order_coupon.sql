-- ============================================================
-- Fase 7 — place_order dengan kupon + confirm_order_paid menghitung pemakaian.
-- (Isi lengkap sama dengan yang diterapkan; lihat phase3 untuk versi dasar.)
-- ============================================================
drop function if exists public.place_order(uuid, text, jsonb, int);

create or replace function public.place_order(
  p_user uuid, p_guest_email text, p_items jsonb, p_minutes int default 15, p_coupon text default null
)
returns table (order_id uuid, order_number text, total_idr bigint)
language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_number   text := 'RGL-' || upper(substr(md5(v_order_id::text), 1, 8));
  v_subtotal bigint := 0; v_discount bigint := 0; v_coupon text := null;
  v_elem jsonb; v_product public.products%rowtype; v_qty int; v_item uuid; i int; v_ok boolean;
begin
  if p_user is null and (p_guest_email is null or length(trim(p_guest_email)) = 0) then raise exception 'BUYER_REQUIRED'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'EMPTY_CART'; end if;

  insert into public.orders (id, order_number, user_id, guest_email, status, reservation_minutes, expires_at)
  values (v_order_id, v_number, p_user, nullif(trim(coalesce(p_guest_email,'')),''), 'pending', p_minutes, now() + make_interval(mins => p_minutes));

  for v_elem in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_elem->>'product_id')::uuid;
    if not found then raise exception 'PRODUCT_NOT_FOUND:%', v_elem->>'product_id'; end if;
    if v_product.status <> 'published' then raise exception 'PRODUCT_NOT_AVAILABLE:%', v_product.id; end if;
    v_qty := greatest(1, coalesce((v_elem->>'quantity')::int, 1));
    if v_product.type = 'unique_credential' then
      for i in 1..v_qty loop
        v_item := public.reserve_inventory_item(v_product.id, v_order_id, p_minutes);
        if v_item is null then raise exception 'OUT_OF_STOCK:%', v_product.id; end if;
        insert into public.order_items (order_id, product_id, inventory_item_id, title_snapshot, unit_price_idr, quantity, line_total_idr)
        values (v_order_id, v_product.id, v_item, v_product.title, v_product.price_idr, 1, v_product.price_idr);
        v_subtotal := v_subtotal + v_product.price_idr;
      end loop;
    else
      insert into public.order_items (order_id, product_id, inventory_item_id, title_snapshot, unit_price_idr, quantity, line_total_idr)
      values (v_order_id, v_product.id, null, v_product.title, v_product.price_idr, v_qty, v_product.price_idr * v_qty);
      v_subtotal := v_subtotal + v_product.price_idr * v_qty;
    end if;
  end loop;

  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select valid, discount into v_ok, v_discount from public.compute_coupon_discount(p_coupon, v_subtotal);
    if coalesce(v_ok, false) then v_coupon := upper(trim(p_coupon)); else v_discount := 0; end if;
  end if;

  update public.orders set subtotal_idr = v_subtotal, discount_idr = v_discount,
    total_idr = greatest(0, v_subtotal - v_discount), coupon_code = v_coupon where id = v_order_id;
  return query select v_order_id, v_number, greatest(0, v_subtotal - v_discount);
end; $$;

revoke all on function public.place_order(uuid, text, jsonb, int, text) from public, anon, authenticated;
grant execute on function public.place_order(uuid, text, jsonb, int, text) to service_role;

-- confirm_order_paid: tambah penghitungan pemakaian kupon saat lunas.
create or replace function public.confirm_order_paid(
  p_provider text, p_event_id text, p_signature_ok boolean,
  p_provider_ref text, p_amount_idr bigint, p_order uuid, p_payload jsonb
)
returns text language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_order public.orders%rowtype; v_it record;
begin
  insert into public.webhook_events (provider, event_id, signature_ok, order_id, payload)
  values (p_provider, p_event_id, coalesce(p_signature_ok,false), p_order, coalesce(p_payload,'{}'::jsonb))
  on conflict (provider, event_id) do nothing;
  if not found then return 'duplicate'; end if;
  if not coalesce(p_signature_ok, false) then return 'invalid_signature'; end if;
  select * into v_order from public.orders where id = p_order for update;
  if not found then return 'order_not_found'; end if;
  if v_order.status = 'paid' then return 'already_paid'; end if;
  if v_order.status <> 'pending' then return 'order_' || v_order.status; end if;
  if p_amount_idr is not null and p_amount_idr <> v_order.total_idr then return 'amount_mismatch'; end if;

  update public.orders set status='paid', paid_at=now() where id = p_order;
  update public.payments set status='paid', paid_at=now(), provider_ref = coalesce(provider_ref, p_provider_ref) where order_id = p_order;
  if v_order.coupon_code is not null then
    update public.coupons set redeemed_count = redeemed_count + 1 where code = v_order.coupon_code;
  end if;
  for v_it in select * from public.order_items where order_id = p_order loop
    if v_it.inventory_item_id is not null then perform public.mark_inventory_sold(v_it.inventory_item_id, p_order); end if;
    insert into public.entitlements (order_id, user_id, guest_email, product_id, inventory_item_id, status)
    values (p_order, v_order.user_id, v_order.guest_email, v_it.product_id, v_it.inventory_item_id, 'active');
  end loop;
  return 'ok';
end; $$;
revoke all on function public.confirm_order_paid(text, text, boolean, text, bigint, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_order_paid(text, text, boolean, text, bigint, uuid, jsonb) to service_role;
