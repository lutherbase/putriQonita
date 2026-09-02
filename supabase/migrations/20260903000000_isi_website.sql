-- ---------------------------------------------------------------------------
-- Tempat menyimpan seluruh isi website (satu baris, satu dokumen JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.site_config (
  id          integer primary key default 1,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  updated_by  text,
  constraint hanya_satu_baris check (id = 1)
);

alter table public.site_config enable row level security;

-- Pengunjung website boleh MEMBACA isinya (memang untuk ditampilkan)
drop policy if exists "isi website boleh dibaca siapa saja" on public.site_config;
create policy "isi website boleh dibaca siapa saja"
  on public.site_config for select
  using (true);

-- Hanya yang sudah login yang boleh MENGUBAH
drop policy if exists "hanya yang login boleh mengubah" on public.site_config;
create policy "hanya yang login boleh mengubah"
  on public.site_config for update
  to authenticated
  using (true) with check (true);

-- Catat siapa dan kapan terakhir mengubah
create or replace function public.catat_perubahan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.jwt() ->> 'email', 'tidak diketahui');
  return new;
end $$;

drop trigger if exists trg_catat_perubahan on public.site_config;
create trigger trg_catat_perubahan
  before update on public.site_config
  for each row execute function public.catat_perubahan();

-- ---------------------------------------------------------------------------
-- Tempat menyimpan foto yang diunggah lewat menu admin
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "foto boleh dilihat siapa saja" on storage.objects;
create policy "foto boleh dilihat siapa saja"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "hanya yang login boleh mengunggah" on storage.objects;
create policy "hanya yang login boleh mengunggah"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "hanya yang login boleh menimpa" on storage.objects;
create policy "hanya yang login boleh menimpa"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "hanya yang login boleh menghapus" on storage.objects;
create policy "hanya yang login boleh menghapus"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
