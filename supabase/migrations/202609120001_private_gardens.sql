-- Private cloud backup. Community/marketplace are deliberately not published here.
create table public.gardens (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  check (octet_length(document::text) <= 2097152),
  check (jsonb_typeof(document) = 'object')
);
alter table public.gardens enable row level security;
revoke all on public.gardens from anon, authenticated;
grant select on public.gardens to authenticated;
create policy "Read own garden" on public.gardens for select to authenticated using (owner_id = (select auth.uid()));

create function public.save_garden(document jsonb, expected_revision integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare result integer; who uuid := auth.uid();
begin
  if who is null then raise exception 'Authentication required'; end if;
  if expected_revision is null or expected_revision < 0 then raise exception 'Invalid revision'; end if;
  if document is null or jsonb_typeof(document) is distinct from 'object'
    or (document->>'version') is distinct from '1'
    or jsonb_typeof(document->'plants') is distinct from 'array'
    or jsonb_typeof(document->'entries') is distinct from 'array'
    or jsonb_typeof(document->'tasks') is distinct from 'array'
    or jsonb_typeof(document->'profile') is distinct from 'object'
    or octet_length(document::text) > 2097152 then raise exception 'Invalid garden'; end if;
  if jsonb_array_length(document->'plants') > 500 or jsonb_array_length(document->'entries') > 3000 or jsonb_array_length(document->'tasks') > 3000 then raise exception 'Garden limit exceeded'; end if;
  if expected_revision = 0 then
    insert into public.gardens(owner_id, document) values (who, document)
    on conflict do nothing returning revision into result;
  else
    update public.gardens g set document = save_garden.document,
      revision = g.revision + 1, updated_at = now()
      where g.owner_id = who and g.revision = expected_revision
      returning g.revision into result;
  end if;
  if result is null then raise exception 'GARDEN_CONFLICT'; end if;
  return result;
end;
$$;
revoke all on function public.save_garden(jsonb,integer) from public, anon;
grant execute on function public.save_garden(jsonb,integer) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('garden-photos','garden-photos',false,2097152,array['image/jpeg']);
create policy "Read own garden photos" on storage.objects for select to authenticated
using (bucket_id = 'garden-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Upload own garden photos" on storage.objects for insert to authenticated
with check (bucket_id = 'garden-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
