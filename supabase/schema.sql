-- ============================================================
-- Skema "Kantong Uang" — personal finance ledger
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. accounts  (kantong uang: Bank BCA, Cash, RDPU, dst)
-- ------------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'wallet',     -- nama icon (dipetakan di frontend)
  sort_order int not null default 0,
  archived boolean not null default false, -- arsip, bukan hapus (riwayat tetap aman)
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. categories  (Gaji, Kos, BPJS, Makan, dst)
-- ------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'tag',
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. transactions  (income / expense)
-- ------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  account_id uuid not null references accounts(id) on delete restrict,
  category_id uuid references categories(id) on delete set null,
  note text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on transactions (user_id, transaction_date desc);
create index if not exists transactions_account_idx on transactions (account_id);
create index if not exists transactions_category_idx on transactions (category_id);

-- ------------------------------------------------------------
-- 4. transfers  (antar kantong, tidak masuk hitungan income/expense)
-- ------------------------------------------------------------
create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references accounts(id) on delete restrict,
  to_account_id uuid not null references accounts(id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  note text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint different_accounts check (from_account_id <> to_account_id)
);

create index if not exists transfers_user_date_idx
  on transfers (user_id, transaction_date desc);

-- ------------------------------------------------------------
-- 5. view: saldo tiap akun dihitung on the fly dari ledger
--    (bukan kolom balance yang di-mutate -> tidak akan pernah "nyleneh"
--     / out of sync, karena selalu dihitung ulang dari sumber kebenaran)
-- ------------------------------------------------------------
create or replace view account_balances as
select
  a.id as account_id,
  a.user_id,
  a.name,
  a.icon,
  a.sort_order,
  a.archived,
  coalesce(inc.total, 0)
    - coalesce(exp.total, 0)
    - coalesce(tout.total, 0)
    + coalesce(tin.total, 0) as balance
from accounts a
left join (
  select account_id, sum(amount) as total
  from transactions where type = 'income'
  group by account_id
) inc on inc.account_id = a.id
left join (
  select account_id, sum(amount) as total
  from transactions where type = 'expense'
  group by account_id
) exp on exp.account_id = a.id
left join (
  select from_account_id, sum(amount) as total
  from transfers group by from_account_id
) tout on tout.from_account_id = a.id
left join (
  select to_account_id, sum(amount) as total
  from transfers group by to_account_id
) tin on tin.to_account_id = a.id;

-- ------------------------------------------------------------
-- 6. Row Level Security — tiap user cuma bisa lihat & ubah datanya sendiri
-- ------------------------------------------------------------
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table transfers enable row level security;

create policy "accounts_owner" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_owner" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_owner" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transfers_owner" on transfers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- account_balances adalah view biasa, otomatis ikut RLS dari tabel accounts
-- karena postgres mengevaluasi security_invoker. Pastikan opsi ini aktif:
alter view account_balances set (security_invoker = on);

-- ------------------------------------------------------------
-- 7. Data awal (opsional) — sesuaikan / hapus sesuai kebutuhan
--    Ganti 'PASTE-USER-ID-DI-SINI' dengan UUID user kamu
--    (lihat di Authentication > Users setelah membuat akun login)
-- ------------------------------------------------------------
-- insert into accounts (user_id, name, icon, sort_order) values
--   ('PASTE-USER-ID-DI-SINI', 'Bank BCA', 'bank', 1),
--   ('PASTE-USER-ID-DI-SINI', 'Cash', 'cash', 2),
--   ('PASTE-USER-ID-DI-SINI', 'RDPU', 'piggy', 3),
--   ('PASTE-USER-ID-DI-SINI', 'Tabungan Ajaib', 'savings', 4);
--
-- insert into categories (user_id, name, type, sort_order) values
--   ('PASTE-USER-ID-DI-SINI', 'Gaji', 'income', 1),
--   ('PASTE-USER-ID-DI-SINI', 'Kos', 'expense', 1),
--   ('PASTE-USER-ID-DI-SINI', 'BPJS', 'expense', 2),
--   ('PASTE-USER-ID-DI-SINI', 'Ortu', 'expense', 3),
--   ('PASTE-USER-ID-DI-SINI', 'Makan', 'expense', 4),
--   ('PASTE-USER-ID-DI-SINI', 'Nongkrong', 'expense', 5),
--   ('PASTE-USER-ID-DI-SINI', 'Transport', 'expense', 6);
