-- Catat invoice Coach dan aktifkan entitlement hanya dari backend tepercaya.
create table if not exists public.coach_payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'mayar' check (provider = 'mayar'),
  provider_invoice_id text unique,
  provider_transaction_id text unique,
  checkout_url text,
  amount_idr integer not null check (amount_idr > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists coach_payment_orders_user_created_idx
  on public.coach_payment_orders (user_id, created_at desc);
create unique index if not exists coach_payment_orders_one_pending_per_user_idx
  on public.coach_payment_orders (user_id) where status = 'pending';

alter table public.coach_payment_orders enable row level security;
drop policy if exists "Users read own coach payment orders" on public.coach_payment_orders;
create policy "Users read own coach payment orders" on public.coach_payment_orders
  for select using (auth.uid() = user_id);
revoke insert, update, delete on public.coach_payment_orders from public, anon, authenticated;
grant select on public.coach_payment_orders to authenticated;
grant all on public.coach_payment_orders to service_role;

create or replace function public.activate_coach_payment_order(
  p_order_id uuid,
  p_provider_customer_id text default null
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.coach_payment_orders%rowtype;
  v_entitlement public.coach_entitlements%rowtype;
  v_start_at timestamptz;
  v_period_end timestamptz;
begin
  select * into v_order
    from public.coach_payment_orders
    where id = p_order_id
    for update;

  if not found then
    raise exception 'Coach payment order not found' using errcode = 'P0002';
  end if;

  -- Webhook provider dapat mengirim ulang event. Pembayaran yang sudah diproses
  -- tidak boleh menambah masa aktif dua kali.
  if v_order.status = 'paid' then
    select current_period_end into v_period_end
      from public.coach_entitlements where user_id = v_order.user_id;
    return v_period_end;
  end if;

  if v_order.status <> 'pending' then
    raise exception 'Coach payment order is not pending' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('coach_payment_user:' || v_order.user_id::text, 0)
  );

  select * into v_entitlement
    from public.coach_entitlements
    where user_id = v_order.user_id
    for update;

  v_start_at := case
    when v_entitlement.status = 'active'
      and v_entitlement.current_period_end > pg_catalog.now()
      then v_entitlement.current_period_end
    else pg_catalog.now()
  end;
  v_period_end := v_start_at + interval '30 days';

  update public.coach_payment_orders
    set status = 'paid', paid_at = pg_catalog.now(), updated_at = pg_catalog.now()
    where id = v_order.id;

  insert into public.coach_entitlements
    (user_id, status, provider, provider_customer_id, current_period_end, updated_at)
  values
    (v_order.user_id, 'active', 'mayar', p_provider_customer_id, v_period_end, pg_catalog.now())
  on conflict (user_id) do update
    set status = 'active',
        provider = 'mayar',
        provider_customer_id = coalesce(excluded.provider_customer_id, coach_entitlements.provider_customer_id),
        current_period_end = excluded.current_period_end,
        updated_at = excluded.updated_at;

  return v_period_end;
end;
$$;

revoke all on function public.activate_coach_payment_order(uuid, text) from public, anon, authenticated;
grant execute on function public.activate_coach_payment_order(uuid, text) to service_role;

comment on table public.coach_payment_orders is
  'Ledger pembayaran sekali bayar Coach. Penulisan hanya dari server setelah invoice Mayar diverifikasi.';
