-- ============================================================
-- Fase 3 — Mesin order deterministik (ZONA BAHAYA)
-- Semua uang & kepemilikan diputuskan di sini. Bukan AI. service_role only.
-- ============================================================

-- place_order: buat order + reservasi stok ATOMIK. Stok habis -> exception ->
-- rollback (tidak ada reservasi setengah jadi).
create or replace function public.place_order(
  p_user uuid, p_guest_email text, p_items jsonb, p_minutes int default 15
)
returns table (order_id uuid, order_number text, total_idr bigint)
language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_number   text := 'RGL-' || upper(substr(md5(v_order_id::text), 1, 8));
  v_subtotal bigint := 0;
  v_elem     jsonb;
  v_product  public.products%rowtype;
  v_qty      int;
  v_item     uuid;
  i          int;
begin
  if p_user is null and (p_guest_email is null or length(trim(p_guest_email)) = 0) then
    raise exception 'BUYER_REQUIRED';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  insert into public.orders (id, order_number, user_id, guest_email, status,
                             reservation_minutes, expires_at)
  values (v_order_id, v_number, p_user, nullif(trim(coalesce(p_guest_email,'')),''),
          'pending', p_minutes, now() + make_interval(mins => p_minutes));

  for v_elem in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_elem->>'product_id')::uuid;
    if not found then raise exception 'PRODUCT_NOT_FOUND:%', v_elem->>'product_id'; end if;
    if v_product.status <> 'published' then raise exception 'PRODUCT_NOT_AVAILABLE:%', v_product.id; end if;

    v_qty := greatest(1, coalesce((v_elem->>'quantity')::int, 1));

    if v_product.type = 'unique_credential' then
      for i in 1..v_qty loop
        v_item := public.reserve_inventory_item(v_product.id, v_order_id, p_minutes);
        if v_item is null then raise exception 'OUT_OF_STOCK:%', v_product.id; end if;
        insert into public.order_items (order_id, product_id, inventory_item_id,
          title_snapshot, unit_price_idr, quantity, line_total_idr)
        values (v_order_id, v_product.id, v_item, v_product.title, v_product.price_idr, 1, v_product.price_idr);
        v_subtotal := v_subtotal + v_product.price_idr;
      end loop;
    else
      insert into public.order_items (order_id, product_id, inventory_item_id,
        title_snapshot, unit_price_idr, quantity, line_total_idr)
      values (v_order_id, v_product.id, null, v_product.title, v_product.price_idr, v_qty, v_product.price_idr * v_qty);
      v_subtotal := v_subtotal + v_product.price_idr * v_qty;
    end if;
  end loop;

  update public.orders set subtotal_idr = v_subtotal, total_idr = v_subtotal where id = v_order_id;
  return query select v_order_id, v_number, v_subtotal;
end; $$;

-- confirm_order_paid: konfirmasi dari WEBHOOK. IDEMPOTEN & aman replay.
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
  update public.payments set status='paid', paid_at=now(),
         provider_ref = coalesce(provider_ref, p_provider_ref) where order_id = p_order;

  for v_it in select * from public.order_items where order_id = p_order loop
    if v_it.inventory_item_id is not null then
      perform public.mark_inventory_sold(v_it.inventory_item_id, p_order);
    end if;
    insert into public.entitlements (order_id, user_id, guest_email, product_id, inventory_item_id, status)
    values (p_order, v_order.user_id, v_order.guest_email, v_it.product_id, v_it.inventory_item_id, 'active');
  end loop;

  return 'ok';
end; $$;

-- expire_due_orders: kadaluwarsakan order pending lewat waktu, lepas stoknya.
create or replace function public.expire_due_orders()
returns int language plpgsql security definer
set search_path = public, pg_temp as $$
declare v_order record; v_count int := 0;
begin
  for v_order in
    select id from public.orders
    where status='pending' and expires_at is not null and expires_at <= now()
    for update skip locked
  loop
    update public.inventory_items
    set status='AVAILABLE', reserved_by_order=null, reserved_at=null, reservation_expires_at=null
    where reserved_by_order = v_order.id and status='RESERVED';
    update public.orders set status='expired' where id = v_order.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end; $$;

revoke all on function public.place_order(uuid, text, jsonb, int) from public, anon, authenticated;
revoke all on function public.confirm_order_paid(text, text, boolean, text, bigint, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.expire_due_orders() from public, anon, authenticated;
grant execute on function public.place_order(uuid, text, jsonb, int) to service_role;
grant execute on function public.confirm_order_paid(text, text, boolean, text, bigint, uuid, jsonb) to service_role;
grant execute on function public.expire_due_orders() to service_role;
