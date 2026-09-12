create table public.posts(id text primary key,owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,data jsonb not null,created_at timestamptz not null default now(),check(octet_length(data::text)<100000));
create table public.comments(id text primary key,post_id text not null references public.posts(id) on delete cascade,owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,body text not null check(length(body) between 1 and 3000),author text not null,created_at timestamptz not null default now());
create table public.likes(post_id text not null references public.posts(id) on delete cascade,owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,primary key(post_id,owner_id));
create table public.bookmarks(post_id text not null references public.posts(id) on delete cascade,owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,primary key(post_id,owner_id));
do $$ declare t text;begin foreach t in array array['posts','comments','likes','bookmarks'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 execute format('create policy "Own inserts" on public.%I for insert to authenticated with check(owner_id=(select auth.uid()))',t);
 execute format('create policy "Own updates" on public.%I for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()))',t);
 execute format('create policy "Own deletes" on public.%I for delete to authenticated using(owner_id=(select auth.uid()))',t);
 if t='bookmarks' then execute format('create policy "Private reads" on public.%I for select to authenticated using(owner_id=(select auth.uid()))',t);
 else execute format('create policy "Member reads" on public.%I for select to authenticated using(true)',t);end if;
end loop;end $$;
-- Display names come from the account profile, not a client-supplied identity.
create function public.community_author() returns trigger language plpgsql security definer set search_path='' as $$
declare display_name text;begin
 select coalesce(data->>'name','Grower') into display_name from public.profiles where id=new.owner_id;
 if TG_TABLE_NAME='posts' then new.data=jsonb_set(new.data,'{author}',to_jsonb(coalesce(display_name,'Grower')));
 else new.author=coalesce(display_name,'Grower');end if;return new;
end;$$;
revoke all on function public.community_author() from public,anon,authenticated;
create trigger post_author before insert or update on public.posts for each row execute function public.community_author();
create trigger comment_author before insert or update on public.comments for each row execute function public.community_author();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('community-images','community-images',true,2097152,array['image/jpeg']);
create policy "Community image uploads" on storage.objects for insert to authenticated with check(bucket_id='community-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own community image metadata" on storage.objects for select to authenticated using(bucket_id='community-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
