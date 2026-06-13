-- ============================================================
-- Igikubo Marketplace — Schéma de base (MVP)
-- À coller dans Supabase > SQL Editor > New query > Run.
-- Idempotent autant que possible. Postgres / Supabase.
-- ============================================================

-- ---------- 1. PROFILES ----------
-- Un profil par utilisateur Supabase Auth.
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  role                text not null default 'player' check (role in ('player','creator')),
  is_admin            boolean not null default false,   -- mis à true manuellement pour Alexis
  is_creator_approved boolean not null default false,
  display_name        text,
  avatar_url          text,
  bio                 text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Crée automatiquement un profil à l'inscription, en reprenant le rôle choisi.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'player'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper : l'utilisateur courant est-il admin ?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- 2. THEMES ----------
create table if not exists public.themes (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  name  text not null,
  color text not null default '#cccccc'
);

insert into public.themes (slug, name, color) values
  ('mathematiques', 'Mathématiques', '#ff8fab'),
  ('histoire',      'Histoire',      '#ffb86b'),
  ('langues',       'Langues',       '#8ad7ff'),
  ('anthropologie', 'Anthropologie', '#c08bff'),
  ('biologie',      'Biologie',      '#8be88b'),
  ('informatique',  'Informatique',  '#7c9cff'),
  ('strategie',     'Stratégie',     '#ffd166')
on conflict (slug) do nothing;

-- ---------- 3. DISCS ----------
create table if not exists public.discs (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  slug             text unique not null,
  description      text,
  theme_id         uuid references public.themes(id),
  age_min          int,
  players_min      int,
  players_max      int,
  duration_min     int,
  price_cents      int not null default 0,
  status           text not null default 'draft'
                     check (status in ('draft','pending','published','rejected')),
  cover_url        text,           -- visuel public (bucket disc-images)
  file_path        text,           -- chemin du PDF dans le bucket privé disc-files
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists discs_creator_idx on public.discs(creator_id);
create index if not exists discs_status_idx  on public.discs(status);

create table if not exists public.disc_images (
  id       uuid primary key default gen_random_uuid(),
  disc_id  uuid not null references public.discs(id) on delete cascade,
  url      text not null,
  position int not null default 0
);

-- ---------- 4. ORDERS ----------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  buyer_id          uuid not null references public.profiles(id) on delete cascade,
  disc_id           uuid not null references public.discs(id) on delete restrict,
  amount_cents      int not null,
  stripe_session_id text unique,
  status            text not null default 'pending'
                      check (status in ('pending','paid','refunded')),
  created_at        timestamptz not null default now()
);
create index if not exists orders_buyer_idx on public.orders(buyer_id);

-- ---------- 5. REVIEWS ----------
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  disc_id    uuid not null references public.discs(id) on delete cascade,
  buyer_id   uuid not null references public.profiles(id) on delete cascade,
  rating     int not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  unique (disc_id, buyer_id)
);

-- ---------- 6. FAVORITES ----------
create table if not exists public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  disc_id    uuid not null references public.discs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, disc_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles    enable row level security;
alter table public.themes      enable row level security;
alter table public.discs       enable row level security;
alter table public.disc_images enable row level security;
alter table public.orders      enable row level security;
alter table public.reviews     enable row level security;
alter table public.favorites   enable row level security;

-- PROFILES : lisibles par tous (profils publics), modifiables par soi-même.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- THEMES : lecture publique, écriture admin uniquement.
drop policy if exists themes_select on public.themes;
create policy themes_select on public.themes for select using (true);
drop policy if exists themes_admin_write on public.themes;
create policy themes_admin_write on public.themes for all
  using (public.is_admin()) with check (public.is_admin());

-- DISCS : visibles si publiés, ou au créateur, ou à l'admin.
drop policy if exists discs_select on public.discs;
create policy discs_select on public.discs for select
  using (status = 'published' or creator_id = auth.uid() or public.is_admin());
drop policy if exists discs_insert_own on public.discs;
create policy discs_insert_own on public.discs for insert
  with check (creator_id = auth.uid());
drop policy if exists discs_update_own on public.discs;
create policy discs_update_own on public.discs for update
  using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());
drop policy if exists discs_delete_own on public.discs;
create policy discs_delete_own on public.discs for delete
  using (creator_id = auth.uid() or public.is_admin());

-- DISC_IMAGES : suit la visibilité du disque parent.
drop policy if exists disc_images_select on public.disc_images;
create policy disc_images_select on public.disc_images for select
  using (exists (
    select 1 from public.discs d
    where d.id = disc_id
      and (d.status = 'published' or d.creator_id = auth.uid() or public.is_admin())
  ));
drop policy if exists disc_images_write on public.disc_images;
create policy disc_images_write on public.disc_images for all
  using (exists (select 1 from public.discs d where d.id = disc_id and d.creator_id = auth.uid()))
  with check (exists (select 1 from public.discs d where d.id = disc_id and d.creator_id = auth.uid()));

-- ORDERS : l'acheteur voit ses commandes ; l'admin voit tout.
-- L'INSERT/UPDATE des commandes se fait côté serveur (webhook Stripe) via la service role key,
-- qui contourne la RLS. Aucune policy d'insertion côté client.
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders for select
  using (buyer_id = auth.uid() or public.is_admin());

-- REVIEWS : lecture publique ; un avis exige un achat payé du disque.
drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews for select using (true);
drop policy if exists reviews_insert_if_purchased on public.reviews;
create policy reviews_insert_if_purchased on public.reviews for insert
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.buyer_id = auth.uid() and o.disc_id = reviews.disc_id and o.status = 'paid'
    )
  );
drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews for update
  using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());

-- FAVORITES : chacun gère les siens.
drop policy if exists favorites_all_own on public.favorites;
create policy favorites_all_own on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- STORAGE (à exécuter après avoir créé les buckets, voir guide)
--   bucket "disc-images" : PUBLIC  (couvertures + galerie)
--   bucket "disc-files"   : PRIVÉ   (PDF du jeu, URL signée après achat)
-- ============================================================
-- Lecture publique des images.
drop policy if exists disc_images_public_read on storage.objects;
create policy disc_images_public_read on storage.objects for select
  using (bucket_id = 'disc-images');

-- Un créateur dépose/maj ses images dans un dossier à son id : disc-images/<uid>/...
drop policy if exists disc_images_creator_write on storage.objects;
create policy disc_images_creator_write on storage.objects for all
  using (bucket_id = 'disc-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'disc-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- Un créateur dépose ses PDF dans disc-files/<uid>/... (bucket privé).
-- La lecture/téléchargement par les acheteurs se fait via URL signée générée côté serveur.
drop policy if exists disc_files_creator_write on storage.objects;
create policy disc_files_creator_write on storage.objects for all
  using (bucket_id = 'disc-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'disc-files' and (storage.foldername(name))[1] = auth.uid()::text);
