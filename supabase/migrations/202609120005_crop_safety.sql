-- Administrator membership is provisioned ONLY in SQL/dashboard, never by the app.
create table public.admin_members(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from anon,authenticated;
grant select on public.admin_members to authenticated;
create policy "Read own admin membership" on public.admin_members for select to authenticated using(user_id=(select auth.uid()));
create function public.is_rootory_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.admin_members where user_id=auth.uid())$$;
revoke all on function public.is_rootory_admin() from public,anon;
grant execute on function public.is_rootory_admin() to authenticated;
create table public.grower_locations(owner_id uuid primary key references auth.users(id) on delete cascade,latitude numeric not null check(latitude between -90 and 90),longitude numeric not null check(longitude between -180 and 180),locality text not null check(length(locality) between 1 and 150));
alter table public.grower_locations enable row level security;
revoke all on public.grower_locations from anon,authenticated;
grant select,insert,update on public.grower_locations to authenticated;
create policy "Own location" on public.grower_locations for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create table public.crop_reports(id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid() references auth.users(id),crop text not null check(length(crop) between 1 and 100),body text not null check(length(body) between 1 and 2000),latitude numeric not null,longitude numeric not null,locality text not null,status text not null default 'Pending' check(status in ('Pending','Reviewed','Dismissed')),created_at timestamptz not null default now(),reviewed_at timestamptz);
alter table public.crop_reports enable row level security;
revoke all on public.crop_reports from anon,authenticated;
grant select,insert on public.crop_reports to authenticated;
create policy "Report reads" on public.crop_reports for select to authenticated using(owner_id=(select auth.uid()) or public.is_rootory_admin());
create policy "Report inserts" on public.crop_reports for insert to authenticated with check(owner_id=(select auth.uid()) and status='Pending');
create function public.locate_report() returns trigger language plpgsql security definer set search_path='' as $$begin
 select latitude,longitude,locality into new.latitude,new.longitude,new.locality from public.grower_locations where owner_id=auth.uid();
 if new.latitude is null then raise exception 'Save your alert area first';end if;
 new.created_at=now();new.reviewed_at=null;return new;end;$$;
revoke all on function public.locate_report() from public,anon,authenticated;
create trigger locate_report before insert on public.crop_reports for each row execute function public.locate_report();
create table public.alerts(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),report_id uuid not null references public.crop_reports(id),crop text not null,body text not null,locality text not null,created_at timestamptz not null default now(),read boolean not null default false,unique(owner_id,report_id));
alter table public.alerts enable row level security;
revoke all on public.alerts from anon,authenticated;
grant select on public.alerts to authenticated;
grant update(read) on public.alerts to authenticated;
create policy "Own alerts" on public.alerts for select to authenticated using(owner_id=(select auth.uid()));
create policy "Mark own alerts" on public.alerts for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create function public.review_crop_report(report uuid,approve boolean) returns integer language plpgsql security definer set search_path='' as $$
declare r public.crop_reports;delivered integer:=0;begin
 if not public.is_rootory_admin() then raise exception 'Admin required';end if;
 select * into r from public.crop_reports where id=report for update;
 if not found or r.status<>'Pending' then raise exception 'Report already reviewed or unavailable';end if;
 if r.created_at<now()-interval '7 days' then raise exception 'Report too old; request a fresh observation';end if;
 update public.crop_reports set status=case when approve then 'Reviewed' else 'Dismissed' end,reviewed_at=now() where id=report;
 if approve then
 insert into public.alerts(owner_id,report_id,crop,body,locality)
 select distinct l.owner_id,r.id,r.crop,'A reviewed observation of '||r.crop||' symptoms was reported nearby. Inspect your plants; this is not a confirmed diagnosis. '||r.body,r.locality
 from public.grower_locations l join public.plants p on p.owner_id=l.owner_id
 where l.owner_id<>r.owner_id and lower(trim(p.data->>'crop'))=lower(trim(r.crop))
 and 6371*2*asin(sqrt(least(1.0,power(sin(radians((l.latitude-r.latitude)::double precision)/2),2)+cos(radians(r.latitude::double precision))*cos(radians(l.latitude::double precision))*power(sin(radians((l.longitude-r.longitude)::double precision)/2),2))))<=10
 on conflict(owner_id,report_id) do nothing;
 get diagnostics delivered=row_count;
 end if;return delivered;end;$$;
revoke all on function public.review_crop_report(uuid,boolean) from public,anon;
grant execute on function public.review_crop_report(uuid,boolean) to authenticated;
-- Basic owner-independent moderation, restricted to actual admins.
create function public.moderate_content(content_type text,content_id text) returns void language plpgsql security definer set search_path='' as $$begin
 if not public.is_rootory_admin() then raise exception 'Admin required';end if;
 if content_type='post' then delete from public.posts where id=content_id;
 elsif content_type='listing' then update public.marketplace_listings set data=jsonb_set(data,'{available}','false'::jsonb) where id=content_id;
 else raise exception 'Unknown content type';end if;end;$$;
revoke all on function public.moderate_content(text,text) from public,anon;
grant execute on function public.moderate_content(text,text) to authenticated;
-- Do NOT make the publicly shared judge account an administrator.
-- Provision a private admin manually, replacing EMAIL:
-- insert into public.admin_members(user_id) select id from auth.users where email='EMAIL';
