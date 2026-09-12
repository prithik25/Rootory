-- Apply after 001. Real account-owned records, revision-checked atomic saves.
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, data jsonb not null default '{}');
create table public.plants (owner_id uuid not null references auth.users(id) on delete cascade, id text not null, data jsonb not null, primary key(owner_id,id));
create table public.plant_updates (owner_id uuid not null, id text not null, plant_id text not null, data jsonb not null, primary key(owner_id,id), foreign key(owner_id,plant_id) references public.plants(owner_id,id) on delete cascade);
create table public.reminders (owner_id uuid not null, id text not null, plant_id text not null, data jsonb not null, primary key(owner_id,id), foreign key(owner_id,plant_id) references public.plants(owner_id,id) on delete cascade);
create table public.health_observations (owner_id uuid not null, id text not null, plant_id text not null, data jsonb not null, primary key(owner_id,id), foreign key(owner_id,plant_id) references public.plants(owner_id,id) on delete cascade);
alter table public.profiles enable row level security;
create policy "Own profile" on public.profiles for select to authenticated using (id=(select auth.uid()));
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
do $$ declare t text; begin
foreach t in array array['plants','plant_updates','reminders','health_observations'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('create policy "Read own records" on public.%I for select to authenticated using(owner_id=(select auth.uid()))',t);
end loop;end $$;
-- The existing save_garden function enforces authentication + expected revision.
-- Mirror its validated snapshot within the same database transaction.
create function public.materialize_garden() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,data) values(new.owner_id,new.document->'profile') on conflict(id) do update set data=excluded.data;
 delete from public.plants where owner_id=new.owner_id; -- cascades dependent records, transaction is atomic
 insert into public.plants(owner_id,id,data) select new.owner_id,p->>'id',p from jsonb_array_elements(new.document->'plants') p;
 insert into public.plant_updates(owner_id,id,plant_id,data) select new.owner_id,p->>'id',p->>'plantId',p from jsonb_array_elements(new.document->'entries') p;
 insert into public.reminders(owner_id,id,plant_id,data) select new.owner_id,p->>'id',p->>'plantId',p from jsonb_array_elements(new.document->'tasks') p;
 insert into public.health_observations(owner_id,id,plant_id,data) select new.owner_id,p->>'id',p->>'plantId',p from jsonb_array_elements(new.document->'entries') p where p->>'kind'='Observation';
 return new;
end;$$;
revoke all on function public.materialize_garden() from public,anon,authenticated;
create trigger materialize_garden after insert or update of document on public.gardens for each row execute function public.materialize_garden();
-- Backfill existing backups through the trigger, without changing their revision.
update public.gardens set document=document;
create table public.assessment_usage(owner_id uuid not null references auth.users(id) on delete cascade, hour timestamptz not null, requests integer not null, primary key(owner_id,hour));
alter table public.assessment_usage enable row level security;
revoke all on public.assessment_usage from anon,authenticated;
create function public.claim_plant_assessment() returns boolean language plpgsql security definer set search_path='' as $$
declare n integer; who uuid:=auth.uid();begin
 if who is null then raise exception 'Authentication required';end if;
 insert into public.assessment_usage(owner_id,hour,requests) values(who,date_trunc('hour',now()),1)
 on conflict(owner_id,hour) do update set requests=public.assessment_usage.requests+1
 where public.assessment_usage.requests<10 returning requests into n;
 return n is not null;
end;$$;
revoke all on function public.claim_plant_assessment() from public,anon;
grant execute on function public.claim_plant_assessment() to authenticated;
