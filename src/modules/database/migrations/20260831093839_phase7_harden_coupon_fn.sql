-- Fase 7 — Pengerasan: compute_coupon_discount hanya untuk server (service_role).
revoke all on function public.compute_coupon_discount(text, bigint) from public, anon, authenticated;
grant execute on function public.compute_coupon_discount(text, bigint) to service_role;
