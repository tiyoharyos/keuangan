# Kantong — Catatan Keuangan Pribadi

Next.js (App Router) + Supabase + Tailwind. Mencatat pemasukan, pengeluaran, dan transfer antar
"kantong uang" (Bank, Cash, RDPU, Tabungan, dst). Saldo tiap kantong **dihitung otomatis** dari
riwayat transaksi (bukan kolom yang di-update manual), jadi tidak akan pernah nyleneh/out of sync.

## 1. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project. Catat **Project URL** dan **anon public key**
   (Project Settings → API).
2. Buka **SQL Editor** di dashboard Supabase, copy-paste seluruh isi file `supabase/schema.sql`
   dari project ini, lalu **Run**. Ini akan membuat tabel `accounts`, `categories`, `transactions`,
   `transfers`, view `account_balances`, dan Row Level Security supaya datamu privat.
3. Buat akun login kamu sendiri: **Authentication → Users → Add user** (isi email + password).
   Tidak ada halaman signup publik di app ini — sengaja, karena ini aplikasi pribadi.
4. (Opsional) Salin **User UID** dari user yang baru dibuat, lalu buka kembali bagian paling bawah
   `supabase/schema.sql` (bagian "Data awal") untuk insert akun & kategori default
   (Bank BCA, Cash, RDPU, Tabungan Ajaib, dst) — ganti `PASTE-USER-ID-DI-SINI` dengan UID tadi,
   lalu jalankan query insert-nya. Kalau dilewati, kamu bisa tambah manual lewat halaman Pengaturan.

## 2. Jalankan secara lokal

```bash
npm install
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), login dengan akun yang dibuat di langkah 1.3.

## 3. Deploy (supaya bisa diakses dari HP & PC kantor)

Termudah: deploy ke [Vercel](https://vercel.com).

1. Push folder ini ke repo GitHub.
2. Import repo di Vercel.
3. Tambahkan environment variables `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   di Vercel project settings (nilai sama seperti `.env.local`).
4. Deploy. URL hasil deploy bisa dibuka dari HP maupun PC, datamu tetap aman karena dilindungi
   login + Row Level Security.

## Struktur halaman

- `/` — Dashboard: total aset, saldo per kantong, ringkasan pengeluaran bulan berjalan per kategori.
- `/transaksi/baru` — Tambah transaksi, dengan tab Pengeluaran / Pemasukan / Transfer.
- `/riwayat` — Riwayat gabungan transaksi + transfer, dikelompokkan per tanggal, bisa dihapus.
- `/pengaturan` — Kelola kantong (akun) dan kategori. Hapus = arsip (riwayat lama tetap aman),
  bukan hapus permanen — karena ada referensi dari transaksi lama.

## Struktur data

```
accounts      -- kantong uang: Bank BCA, Cash, RDPU, Tabungan Ajaib, dst
categories    -- Gaji, Kos, BPJS, Makan, Nongkrong, dst (type: income | expense)
transactions  -- baris income / expense, terikat ke 1 account + 1 category
transfers     -- pemindahan antar account (tidak dihitung sebagai income/expense)
account_balances -- VIEW: saldo tiap akun = income - expense - transfer_out + transfer_in
```

## Stack

- Next.js 16 (App Router, Server Actions, React 19)
- Supabase (Postgres + Auth + Row Level Security)
- Tailwind CSS v4

## Catatan desain

Tema visual terinspirasi dari buku tabungan/ledger fisik: kartu kantong bergaya "passbook" dengan
angka monospace (IBM Plex Mono), warna jade untuk pemasukan, amber untuk pengeluaran, dan denim
untuk transfer.
