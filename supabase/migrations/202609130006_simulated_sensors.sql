-- Demo devices are write-only, plant-scoped, revocable and expire after 24 hours.
-- No FK to plants: the prototype rebuilds that table on each private garden save.
create table public.sensor_devices (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 plant_id text not null, token_hash text not null, expires_at timestamptz not null,
 last_reading_at timestamptz, unique(owner_id,plant_id)
);
create table public.sensor_readings (
 id uuid primary key default gen_random_uuid(), device_id uuid not null references public.sensor_devices(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade, plant_id text not null,
 moisture_percent integer not null check(moisture_percent between 0 and 100),
 source text not null default 'simulation' check(source='simulation'), recorded_at timestamptz not null default now()
);
create index sensor_readings_latest on public.sensor_readings(owner_id,plant_id,recorded_at desc);
alter table public.sensor_devices enable row level security;
alter table public.sensor_readings enable row level security;
revoke all on public.sensor_devices,public.sensor_readings from anon,authenticated;
grant select(id,owner_id,plant_id,expires_at,last_reading_at) on public.sensor_devices to authenticated;
grant select on public.sensor_readings to authenticated;
create policy "Own devices" on public.sensor_devices for select to authenticated using(owner_id=(select auth.uid()));
create policy "Own readings" on public.sensor_readings for select to authenticated using(owner_id=(select auth.uid()));
create function public.create_sensor_device(plant text) returns jsonb language plpgsql security definer set search_path='' as $$
declare who uuid:=auth.uid(); secret text; d public.sensor_devices; begin
 if who is null or not exists(select 1 from public.plants where owner_id=who and id=plant) then raise exception 'Save this plant to your account first';end if;
 -- Serialize provisioning per account; one device per plant and at most ten per account.
 perform pg_advisory_xact_lock(hashtextextended(who::text,0));
 if not exists(select 1 from public.sensor_devices where owner_id=who and plant_id=plant) and (select count(*) from public.sensor_devices where owner_id=who)>=10 then raise exception 'Device limit reached';end if;
 secret:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into public.sensor_devices(owner_id,plant_id,token_hash,expires_at) values(who,plant,encode(sha256(convert_to(secret,'UTF8')),'hex'),now()+interval '24 hours')
 on conflict(owner_id,plant_id) do update set token_hash=excluded.token_hash,expires_at=excluded.expires_at returning * into d;
 return jsonb_build_object('deviceId',d.id,'deviceKey',secret,'expiresAt',d.expires_at);
end;$$;
create function public.revoke_sensor_device(device uuid) returns void language plpgsql security definer set search_path='' as $$begin
 update public.sensor_devices set expires_at=now() where id=device and owner_id=auth.uid();
end;$$;
create function public.ingest_sensor_reading(device uuid,secret text,moisture integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.sensor_devices; stamp timestamptz:=clock_timestamp();begin
 if secret is null or length(secret)<>64 or moisture is null or moisture<0 or moisture>100 then return jsonb_build_object('status',400);end if;
 select * into d from public.sensor_devices where id=device for update;
 if not found or d.expires_at<=stamp or d.token_hash<>encode(sha256(convert_to(secret,'UTF8')),'hex') then return jsonb_build_object('status',401);end if;
 if not exists(select 1 from public.plants where owner_id=d.owner_id and id=d.plant_id) then return jsonb_build_object('status',410);end if;
 if d.last_reading_at>stamp-interval '5 seconds' then return jsonb_build_object('status',429);end if;
 insert into public.sensor_readings(device_id,owner_id,plant_id,moisture_percent,recorded_at) values(d.id,d.owner_id,d.plant_id,moisture,stamp);
 update public.sensor_devices set last_reading_at=stamp where id=d.id;
 delete from public.sensor_readings where device_id=d.id and id in (select id from public.sensor_readings where device_id=d.id order by recorded_at desc offset 100);
 return jsonb_build_object('status',201,'recordedAt',stamp);
end;$$;
revoke all on function public.create_sensor_device(text),public.revoke_sensor_device(uuid),public.ingest_sensor_reading(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.create_sensor_device(text),public.revoke_sensor_device(uuid) to authenticated;
-- Device secret is the credential here, never a database admin key.
grant execute on function public.ingest_sensor_reading(uuid,text,integer) to anon,authenticated;
