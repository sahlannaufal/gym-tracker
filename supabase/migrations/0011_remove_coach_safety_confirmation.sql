-- Konfirmasi keselamatan tidak lagi menjadi bagian dari onboarding Coach.
-- Entitlement dan autentikasi tetap diperiksa sebelum program diterapkan.
create or replace function public.apply_coach_program_version(
  p_profile jsonb,
  p_recommendation jsonb
)
returns table (
  id uuid,
  version integer,
  source text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_entitlement_status text;
  v_period_end timestamptz;
  v_next_version integer;
  v_source text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_profile is null or pg_catalog.jsonb_typeof(p_profile) <> 'object'
     or p_recommendation is null or pg_catalog.jsonb_typeof(p_recommendation) <> 'object' then
    raise exception 'Invalid Coach program payload' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_recommendation -> 'programs') is distinct from 'array' then
    raise exception 'Invalid Coach recommendation' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_array_length(p_recommendation -> 'programs') = 0 then
    raise exception 'Invalid Coach recommendation' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('coach_program_version:' || v_user_id::text, 0)
  );

  select entitlement.status, entitlement.current_period_end
    into v_entitlement_status, v_period_end
    from public.coach_entitlements as entitlement
    where entitlement.user_id = v_user_id;

  if v_entitlement_status is distinct from 'active'
     or (v_period_end is not null and v_period_end <= pg_catalog.now()) then
    raise exception 'Active Coach entitlement required' using errcode = '42501';
  end if;

  update public.coach_program_versions
    set status = 'superseded'
    where coach_program_versions.user_id = v_user_id
      and coach_program_versions.status = 'active';

  select coalesce(pg_catalog.max(existing.version), 0) + 1
    into v_next_version
    from public.coach_program_versions as existing
    where existing.user_id = v_user_id;

  v_source := case when v_next_version = 1 then 'initial' else 'user_edit' end;

  return query
    insert into public.coach_program_versions
      (user_id, version, source, profile, recommendation, status)
    values
      (v_user_id, v_next_version, v_source, p_profile, p_recommendation, 'active')
    returning coach_program_versions.id,
      coach_program_versions.version,
      coach_program_versions.source,
      coach_program_versions.status,
      coach_program_versions.created_at;
end;
$$;

revoke all on function public.apply_coach_program_version(jsonb, jsonb) from public, anon;
grant execute on function public.apply_coach_program_version(jsonb, jsonb) to authenticated;
