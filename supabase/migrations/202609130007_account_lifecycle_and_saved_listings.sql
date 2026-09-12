-- Saved listings synchronization across devices
create table if not exists public.saved_listings(
  listing_id text not null references public.marketplace_listings(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(listing_id, owner_id)
);
alter table public.saved_listings enable row level security;
revoke all on public.saved_listings from anon, authenticated;
grant select, insert, delete on public.saved_listings to authenticated;
create policy "Own saved listing inserts" on public.saved_listings for insert to authenticated with check(owner_id = (select auth.uid()));
create policy "Own saved listing deletes" on public.saved_listings for delete to authenticated using(owner_id = (select auth.uid()));
create policy "Private saved listing reads" on public.saved_listings for select to authenticated using(owner_id = (select auth.uid()));

-- Self-serve account and data deletion RPC
create or replace function public.delete_own_account() returns void language plpgsql security definer set search_path='' as $$
declare who uuid := auth.uid();
begin
  if who is null then raise exception 'Authentication required'; end if;
  -- Delete private garden and profile
  delete from public.gardens where id = who;
  delete from public.profiles where id = who;
  delete from public.marketplace_listings where owner_id = who;
  delete from public.saved_listings where owner_id = who;
  delete from public.enquiries where sender_id = who or seller_id = who;
  delete from public.posts where owner_id = who;
  delete from public.comments where owner_id = who;
  delete from public.likes where owner_id = who;
  delete from public.bookmarks where owner_id = who;
  delete from public.crop_reports where owner_id = who;
  delete from public.alerts where owner_id = who;
  delete from public.grower_locations where owner_id = who;
  delete from public.simulated_devices where owner_id = who;
  delete from public.assessment_usage where owner_id = who;
  -- Clean up private and community storage images uploaded by this user
  delete from storage.objects where bucket_id in ('plant-images','community-images') and (storage.foldername(name))[1] = who::text;
  -- Delete user from auth
  delete from auth.users where id = who;
end;$$;
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
