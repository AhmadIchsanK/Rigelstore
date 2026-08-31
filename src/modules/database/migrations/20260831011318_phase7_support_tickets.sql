-- ============================================================
-- Fase 7 — Support tickets (pelanggan login).
-- ============================================================
create type public.ticket_status as enum ('open', 'answered', 'closed');

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text,
  subject text not null,
  status public.ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_support_tickets_user on public.support_tickets(user_id);
create index idx_support_tickets_status on public.support_tickets(status);
create trigger trg_support_tickets_updated_at
  before update on public.support_tickets for each row execute function public.set_updated_at();

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author text not null check (author in ('customer', 'admin')),
  author_id uuid references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_support_messages_ticket on public.support_messages(ticket_id);

alter table public.support_tickets  enable row level security;
alter table public.support_messages enable row level security;

create policy support_tickets_read on public.support_tickets
  for select to authenticated using (user_id = auth.uid() or public.has_permission('support.manage'));
create policy support_tickets_insert on public.support_tickets
  for insert to authenticated with check (user_id = auth.uid());
create policy support_tickets_update on public.support_tickets
  for update to authenticated using (public.has_permission('support.manage')) with check (public.has_permission('support.manage'));
create policy support_messages_read on public.support_messages
  for select to authenticated using (exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id and (t.user_id = auth.uid() or public.has_permission('support.manage'))));
