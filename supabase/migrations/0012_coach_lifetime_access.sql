-- Pembayaran Coach satu kali memberikan akses permanen.
-- Entitlement aktif Mayar yang sudah ada juga dipertahankan tanpa tanggal akhir.
update public.coach_entitlements
  set current_period_end = null,
      updated_at = timezone('utc', now())
  where provider = 'mayar'
    and status = 'active';

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
  v_period_end timestamptz := null;
begin
  select * into v_order
    from public.coach_payment_orders
    where id = p_order_id
    for update;

  if not found then
    raise exception 'Coach payment order not found' using errcode = 'P0002';
  end if;

  -- Retry webhook atau status check tidak membuat efek samping kedua kali.
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

  update public.coach_payment_orders
    set status = 'paid', paid_at = pg_catalog.now(), updated_at = pg_catalog.now()
    where id = v_order.id;

  insert into public.coach_entitlements
    (user_id, status, provider, provider_customer_id, current_period_end, updated_at)
  values
    (v_order.user_id, 'active', 'mayar', p_provider_customer_id, null, pg_catalog.now())
  on conflict (user_id) do update
    set status = 'active',
        provider = 'mayar',
        provider_customer_id = coalesce(excluded.provider_customer_id, coach_entitlements.provider_customer_id),
        current_period_end = null,
        updated_at = excluded.updated_at;

  return null;
end;
$$;

revoke all on function public.activate_coach_payment_order(uuid, text) from public, anon, authenticated;
grant execute on function public.activate_coach_payment_order(uuid, text) to service_role;

comment on function public.activate_coach_payment_order(uuid, text) is
  'Mengaktifkan akses Coach permanen setelah pembayaran Mayar terverifikasi.';
