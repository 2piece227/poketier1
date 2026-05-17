-- Supabase SQL Editor에서 한 번 실행하세요.
-- 닉네임 중복 방지·프로필 URL 저장용
--
-- 이미 예전에 만든 public.profiles 가 있으면 CREATE TABLE 이 스킵되어
-- nickname 컬럼이 없을 수 있음 → 아래 ALTER 로 컬럼을 반드시 맞춤.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

alter table public.profiles
  add column if not exists nickname text;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists updated_at timestamptz;

-- 기존 행용 기본값
update public.profiles
set updated_at = coalesce(updated_at, now())
where updated_at is null;

alter table public.profiles
  alter column updated_at set default now();

alter table public.profiles
  alter column updated_at set not null;

drop index if exists public.profiles_nickname_lower_key;

create unique index profiles_nickname_lower_key
  on public.profiles (lower(nickname))
  where nickname is not null and length(trim(nickname)) > 0;

create or replace function public.is_nickname_available(p_nickname text)
returns boolean
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if p_nickname is null or length(trim(p_nickname)) < 2 then
    return false;
  end if;
  return not exists (
    select 1
    from public.profiles p
    where lower(trim(p.nickname)) = lower(trim(p_nickname))
      and p.id <> auth.uid()
  );
end;
$$;

grant execute on function public.is_nickname_available(text) to authenticated;

alter table public.profiles enable row level security;

-- 재실행 시 정책 이름 충돌 방지 (테이블 삭제해도 정책이 남을 수 있음)
drop policy if exists "프로필 읽기(닉네임 중복 확인)" on public.profiles;
drop policy if exists "본인 프로필 수정" on public.profiles;
drop policy if exists "본인 프로필 업데이트" on public.profiles;

create policy "프로필 읽기(닉네임 중복 확인)"
  on public.profiles for select
  using (true);

create policy "본인 프로필 수정"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "본인 프로필 업데이트"
  on public.profiles for update
  using (auth.uid() = id);

-- ========== Storage: 프로필 사진 (버킷 이름은 코드의 AVATAR_BUCKET 과 동일: avatars) ==========
-- 프론트 업로드 경로: {로그인한 user 의 uuid}/avatar.{확장자}
-- 예: 9b1f.../avatar.jpg  →  첫 번째 폴더명이 auth.uid() 와 같아야 업로드 허용

insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 2097152)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "avatars_select_public" on storage.objects;
drop policy if exists "avatars_insert_authenticated_own" on storage.objects;
drop policy if exists "avatars_update_authenticated_own" on storage.objects;
drop policy if exists "avatars_delete_authenticated_own" on storage.objects;

-- 공개 버킷: 누구나 이미지 URL로 조회 가능 (프로필 미리보기용)
create policy "avatars_select_public"
on storage.objects for select
using (bucket_id = 'avatars');

-- 본인 폴더에만 업로드 (인증 필수)
create policy "avatars_insert_authenticated_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "avatars_update_authenticated_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "avatars_delete_authenticated_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);
