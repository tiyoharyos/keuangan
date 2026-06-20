# Arsitektur "Kantong" — Penjelasan Detail

Dokumen ini menjelaskan bagaimana project ini disusun dan kenapa setiap bagian dibuat seperti itu,
supaya kamu bisa terus mengembangkannya sendiri tanpa harus menebak-nebak.

## 1. Gambaran besar

Stack-nya tiga lapis: **Next.js (App Router)** sebagai frontend sekaligus tempat logic server
berjalan, **Supabase** sebagai database + auth (jadi tidak perlu bikin backend Express/NestJS
terpisah), dan **Tailwind v4** untuk styling. Tidak ada REST API custom yang kamu tulis sendiri —
semua mutasi data (insert transaksi, transfer, dst) jalan lewat **Server Actions** Next.js, yang
fungsinya mirip endpoint API tapi ditulis sebagai fungsi `async` biasa dengan `"use server"` di
baris pertama, dipanggil langsung dari `<form action={...}>` tanpa kamu perlu bikin route handler
manual atau fetch dari client.

Kenapa begitu? Karena untuk aplikasi pribadi seperti ini, REST API terpisah cuma menambah lapisan
boilerplate (serialize JSON, fetch, parse response, error handling dua kali) tanpa manfaat nyata —
toh yang konsumsi API cuma app ini sendiri, bukan pihak ketiga.

## 2. Skema database & kenapa begitu

Empat tabel inti, persis seperti rencana awalmu: `accounts` (kantong: Bank BCA, Cash, dst),
`categories` (Gaji, Kos, Makan, dst — punya kolom `type` income/expense), `transactions` (baris
pemasukan/pengeluaran, terikat ke satu `account_id` + satu `category_id`), dan `transfers`
(pemindahan dana antar `from_account_id` → `to_account_id`, terpisah dari transactions karena
transfer bukan income maupun expense — kalau digabung ke transactions, dia akan kehitung ganda di
laporan pengeluaran).

Yang berbeda dari rencana awalmu: saldo tiap kantong **tidak disimpan sebagai kolom** yang
di-update manual tiap kali ada transaksi (`Bank -= 50000`). Itu aku ganti dengan **view SQL**
bernama `account_balances`, yang menghitung saldo on-the-fly dengan rumus
`income - expense - transfer_out + transfer_in` setiap kali di-query. Konsekuensinya: query jadi
sedikit lebih berat (harus jumlahkan baris), tapi sebagai gantinya saldo **tidak akan pernah salah
atau nyleneh** — karena dia bukan angka yang disimpan dan bisa ke-skip update-nya kalau ada bug,
melainkan selalu dihitung ulang dari sumber kebenaran (ledger transaksi itu sendiri). Untuk volume
data personal finance pribadi (ratusan-ribuan baris), bebannya tidak terasa.

Tiap baris di keempat tabel itu punya `user_id`, dan **Row Level Security (RLS)** di Postgres
memastikan query selalu otomatis difilter `WHERE user_id = auth.uid()` di level database — bukan
di level kode aplikasi. Artinya walau suatu saat ada bug di kodemu yang lupa filter user, Supabase
tetap menolak akses ke data user lain. Ini kenapa app ini aman dipakai walau di-deploy publik di
Vercel: pertahanannya dua lapis (auth + RLS), bukan cuma "untungnya nggak ada yang tahu URL-nya".

Penghapusan akun/kategori juga sengaja **soft-delete** (kolom `archived`, bukan benar-benar
`DELETE`), karena transaksi lama masih mereferensikan `account_id`/`category_id` tersebut —
kalau dihapus permanen, riwayat lama jadi rusak (foreign key constraint-nya pakai
`on delete restrict` untuk mencegah ini terjadi tanpa sengaja).

## 3. Alur autentikasi

`middleware.ts` di root project jalan di **setiap request** (kecuali file statis), memanggil
`updateSession()` di `src/lib/supabase/middleware.ts`. Fungsi ini melakukan dua hal: pertama,
me-refresh token Supabase kalau sudah mau expired (supaya kamu tidak ke-logout sendiri di
tengah-tengah pemakaian), kedua, mengecek apakah user sudah login — kalau belum dan dia coba akses
halaman selain `/login`, langsung di-redirect ke `/login`.

Karena Server Components (seperti halaman Dashboard) jalan di server, dia butuh cara untuk baca
cookie sesi tanpa bisa menulis cookie baru (keterbatasan Next.js: Server Component memang
read-only soal cookie). Makanya ada dua client Supabase berbeda: `src/lib/supabase/server.ts`
dipakai di Server Component & Server Action (boleh baca+tulis cookie), dan
`src/lib/supabase/client.ts` dipakai kalau suatu saat kamu butuh Supabase di Client Component
(browser). Saat ini app belum pakai yang versi browser sama sekali — semua fetch data lewat Server
Component supaya lebih cepat (data sudah siap saat HTML dikirim, tidak perlu loading spinner nunggu
fetch di browser).

Login sendiri pakai `signInWithPassword` biasa (email + password), tidak ada flow signup publik
sama sekali di UI — user dibuat manual lewat Supabase Dashboard, persis seperti yang barusan kamu
lakukan. Logout lewat `POST /auth/logout` (route handler di `src/app/auth/logout/route.ts`) yang
manggil `supabase.auth.signOut()` lalu redirect balik ke `/login`.

## 4. Struktur folder

```
src/
  app/
    login/                  -- halaman + server action login (di luar grup (app), tanpa nav)
    auth/logout/route.ts    -- handler logout
    (app)/                  -- "route group": semua halaman yang butuh login
      layout.tsx            -- cek auth, render NavBar + shell halaman
      page.tsx               -- Dashboard ("/")
      transaksi/
        baru/page.tsx        -- form tambah transaksi
        actions.ts           -- server action: createTransaction, createTransfer
      riwayat/
        page.tsx
        actions.ts           -- server action: deleteTransaction, deleteTransfer
      pengaturan/
        page.tsx
        actions.ts           -- server action: createAccount, createCategory, archive
  components/                -- semua Client Component (form, kartu, nav)
  lib/
    supabase/                -- tiga varian client Supabase (server/browser/middleware)
    data.ts                  -- semua query baca data, dipanggil dari Server Component
    types.ts                 -- tipe TypeScript yang mencerminkan skema database
    utils.ts                 -- format Rupiah, format tanggal, dll
supabase/schema.sql           -- skema database lengkap, dijalankan manual di SQL Editor
```

Tanda kurung di `(app)` itu disebut **route group** — folder ini tidak muncul di URL (jadi
`(app)/page.tsx` tetap jadi `/`, bukan `/(app)`), fungsinya cuma untuk mengelompokkan halaman yang
berbagi `layout.tsx` yang sama (cek-login + tampilkan NavBar), terpisah dari `/login` yang
layout-nya beda (tanpa nav, halaman penuh).

## 5. Pola: Server Component baca data, Server Action tulis data

Setiap halaman (`page.tsx`) adalah **Server Component async** — fungsinya langsung `await` query ke
Supabase di server, tanpa `useEffect` atau loading state di client. Misalnya Dashboard
(`(app)/page.tsx`) memanggil `getAccountBalances()`, `getMonthlyExpenseByCategory()`, dan
`getMonthlyIncomeTotal()` dari `lib/data.ts` secara paralel pakai `Promise.all`, baru render hasilnya
jadi HTML. Browser menerima halaman yang sudah terisi data, bukan halaman kosong yang baru nge-fetch
setelah JS jalan.

Untuk form (Tambah Transaksi, tambah akun/kategori), polanya: Client Component (karena perlu
interaktivitas — tab switching, format input angka real-time) memanggil **Server Action** lewat
`useActionState` (hook React 19). Contoh konkret di `TransactionForm.tsx`: tiap tab (Pengeluaran/
Pemasukan/Transfer) punya `<form action={...}>` sendiri yang terikat ke `createTransaction` atau
`createTransfer` dari `transaksi/actions.ts`. Saat form di-submit, fungsi itu jalan **di server**
(bukan kirim JSON ke API lalu parse balik), validasi input, insert ke Supabase, lalu panggil
`revalidatePath("/")` supaya Dashboard yang sudah pernah di-render ulang otomatis ter-refresh
datanya begitu kamu balik ke situ — tanpa perlu reload manual.

Untuk aksi cepat seperti archive akun atau hapus transaksi (tidak perlu form, cukup klik tombol),
polanya sedikit beda: Client Component manggil server action langsung sebagai fungsi biasa di dalam
`startTransition()` (lihat `LedgerRow.tsx` atau `AccountManager.tsx`), bukan lewat `<form>`. Ini
valid karena Next.js mengizinkan Server Action dipanggil seperti fungsi async biasa dari Client
Component, asal sudah di-import dari file yang ber-`"use server"`.

## 6. Alur tiap halaman

**Dashboard (`/`)** menjumlahkan seluruh saldo akun jadi "Total Aset", menampilkan kartu per kantong
(scroll horizontal di mobile, grid 2 kolom di desktop), lalu daftar pengeluaran bulan berjalan yang
dikelompokkan per kategori dengan bar proporsional (lebar bar = `total kategori / kategori
terbesar`). Tidak pakai library chart — cukup `<div>` dengan `width` dinamis, supaya ringan dan
gampang di-custom.

**Tambah Transaksi (`/transaksi/baru`)** adalah satu halaman dengan tiga tab yang masing-masing
form-nya independen (state tab disimpan di `useState` lokal, bukan URL), supaya pindah tab tidak
kehilangan data yang sudah diketik di tab lain... sebenarnya tetap hilang karena tiap tab punya form
terpisah dari awal — ini trade-off yang sengaja diambil supaya struktur form tetap simpel
(tipe income/expense/transfer punya field yang agak beda, jadi dipisah daripada satu form raksasa
dengan banyak `if`).

**Riwayat (`/riwayat`)** menggabungkan dua tabel berbeda (`transactions` dan `transfers`) jadi satu
timeline, diurutkan berdasarkan tanggal lalu `created_at`. Penggabungan ini terjadi di
`getLedgerHistory()` (`lib/data.ts`): dua query dijalankan paralel, hasilnya dipetakan ke satu tipe
gabungan `LedgerEntry` (lihat `lib/types.ts`, pakai *discriminated union* dengan field `kind:
"transaction" | "transfer"` supaya TypeScript tahu field mana yang tersedia di tiap kasus), baru
di-`sort` dan dipotong sesuai limit.

**Pengaturan (`/pengaturan`)** mengelola `accounts` dan `categories` lewat dua komponen terpisah
(`AccountManager`, `CategoryManager`) yang pola-nya sama: form tambah di atas (pakai
`useActionState`), daftar item aktif di bawah, dan item yang diarsipkan disembunyikan dalam
`<details>` (accordion native HTML, tidak perlu JS tambahan) supaya halaman tidak penuh sesak kalau
kamu sudah punya banyak kategori lama yang tidak terpakai lagi.

## 7. Sistem desain

Temanya gelap, terinspirasi tampilan **buku tabungan/ledger fisik** — bukan dashboard fintech
generik. Token warnanya didefinisikan sebagai CSS variable di `globals.css`: `--jade` untuk
pemasukan/saldo positif, `--amber` untuk pengeluaran, `--denim` untuk transfer, dan `--rose` untuk
aksi hapus/peringatan. Angka uang selalu dirender pakai font monospace (`IBM Plex Mono`) supaya
digit-digitnya rata sejajar seperti hasil cetakan mesin passbook lama, sementara judul pakai
`Sora` (lebih tegas/geometris) dan teks biasa pakai `Inter`.

Semua warna dipetakan lewat `@theme inline` di `globals.css` (fitur Tailwind v4) jadi class macam
`bg-jade-soft`, `text-amber`, `border-ink-700` langsung bisa dipakai di mana saja tanpa perlu
`tailwind.config.js` terpisah — kalau suatu saat kamu mau ganti palet warna, cukup ubah nilai
variable di satu tempat itu, seluruh app ikut berubah.

## 8. Hal lain yang perlu kamu tahu saat lanjut develop

Setiap kali kamu menambah kolom baru di database, ingat untuk update juga `lib/types.ts` (tipe
TypeScript-nya tidak otomatis sinkron dengan skema — ini trade-off karena project tidak pakai
Supabase CLI untuk generate types otomatis, supaya setup tetap sesimpel mungkin tanpa CLI
tambahan).

Validasi input saat ini cukup dasar (cek field wajib + angka > 0) dan dilakukan di server action,
bukan di client. Ini sengaja: validasi di server tidak bisa dilewati (beda dengan validasi
JavaScript di browser yang bisa di-bypass), tapi konsekuensinya pesan error baru muncul setelah
submit (round-trip ke server), bukan instan saat mengetik.
