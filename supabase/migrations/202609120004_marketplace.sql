create table public.marketplace_listings(id text primary key,owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,data jsonb not null,created_at timestamptz not null default now(),check(octet_length(data::text)<100000),check(jsonb_typeof(data->'price')='number' and (data->>'price')::numeric>=0));
alter table public.marketplace_listings enable row level security;
revoke all on public.marketplace_listings from anon,authenticated;
grant select on public.marketplace_listings to anon,authenticated;
grant insert,update,delete on public.marketplace_listings to authenticated;
create policy "Public listing reads" on public.marketplace_listings for select using(true);
create policy "Own listing inserts" on public.marketplace_listings for insert to authenticated with check(owner_id=(select auth.uid()));
create policy "Own listing updates" on public.marketplace_listings for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "Own listing deletes" on public.marketplace_listings for delete to authenticated using(owner_id=(select auth.uid()));
create table public.enquiries(id text primary key,listing_id text not null references public.marketplace_listings(id) on delete cascade,sender_id uuid not null default auth.uid() references auth.users(id),seller_id uuid not null references auth.users(id),body text not null check(length(body) between 1 and 3000),sender_name text not null default 'Grower',created_at timestamptz not null default now());
alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon,authenticated;
grant select,insert on public.enquiries to authenticated;
create policy "Participant enquiry reads" on public.enquiries for select to authenticated using((select auth.uid()) in (sender_id,seller_id));
create policy "Sender enquiry inserts" on public.enquiries for insert to authenticated with check(sender_id=(select auth.uid()));
create function public.route_enquiry() returns trigger language plpgsql security definer set search_path='' as $$
declare available boolean;begin
 select owner_id,coalesce((data->>'available')::boolean,false) into new.seller_id,available from public.marketplace_listings where id=new.listing_id;
 if new.seller_id is null or not available then raise exception 'Listing is unavailable';end if;
 if new.sender_id<>auth.uid() then raise exception 'Invalid sender';end if;
 select coalesce(data->>'name','Grower') into new.sender_name from public.profiles where id=new.sender_id;
 new.sender_name=coalesce(new.sender_name,'Grower');return new;
end;$$;
revoke all on function public.route_enquiry() from public,anon,authenticated;
create trigger route_enquiry before insert on public.enquiries for each row execute function public.route_enquiry();
-- Public listing images use the existing public community-images bucket and owner-folder rules.
