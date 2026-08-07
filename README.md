# cms-midtrans

# Nova Store — Website Personal Product Store

Platform e-commerce premium (Next.js 16 + PostgreSQL/Neon + Drizzle + Midtrans) dengan storefront, dashboard admin, blog CMS, dan pembayaran Midtrans.

## Fitur Utama

- **Landing page** premium: hero, banner promo, flash sale countdown, produk unggulan/terbaru/terlaris, kategori, benefit, testimoni, FAQ, blog, newsletter, Instagram feed, contact, WhatsApp float, dark/light mode, skeleton, animasi.
- **Storefront**: katalog + filter/sort/search, detail produk (gallery, spesifikasi, review, share), cart + wishlist + kupon.
- **Checkout + Midtrans**: Snap checkout (QRIS, VA, e-wallet, kartu kredit, retail), webhook verifikasi signature, auto-update status, retry payment, halaman sukses/gagal, invoice print.
- **Auth**: login, register, forgot/reset password, email verification, remember me, role admin & customer.
- **Dashboard admin**: overview (revenue, orders, charts, top selling), produk CRUD + soft delete/restore, kategori, kupon, order management, pelanggan, banner, blog CMS, media manager, review, notifikasi, audit log, testimoni, FAQ, analytics, settings (identitas, SEO, SMTP, Midtrans, maintenance).
- **Ekstra**: PWA manifest, sitemap.xml, robots.txt, Open Graph, Schema.org, 404/500, rate limiter, audit log.

## Tech Stack

Next.js 16 (App Router, Server Actions, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Radix UI · Framer Motion · Zustand · TanStack Query · Drizzle ORM + Neon PostgreSQL · bcryptjs · Recharts · Nodemailer

## Setup

```bash
npm install
cp .env.example .env   # isi DATABASE_URL, AUTH_SECRET, MIDTRANS keys, SMTP
npm run db:migrate     # jalankan migrasi schema
npm run db:seed        # seed data + default admin
npm run dev
```

## Akun Default

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@nova.store` | `admin12345` |
| Customer | `customer@nova.store` | `customer123` |

> Segera ganti password default!

## Scripts

```bash
npm run dev            # dev server
npm run build          # production build
npm run db:generate    # generate migrasi drizzle
npm run db:migrate     # terapkan migrasi
npm run db:seed        # seed data
```

## Integrasi Midtrans

1. Daftar di [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com) dan ambil **Server Key** & **Client Key**.
2. Isi di `.env` (`MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`) **atau** di Admin → Pengaturan → Pembayaran.
3. Set `MIDTRANS_IS_PRODUCTION=false` untuk sandbox.
4. Set webhook URL Midtrans ke `https://<domain>/api/webhooks/midtrans`.
5. Untuk produksi, ganti key ke production dan `MIDTRANS_IS_PRODUCTION=true`.

## Struktur

```
app/
  (store)/        # storefront (landing, produk, cart, checkout, blog, akun)
  (auth)/         # login, register, reset, verify
  admin/          # dashboard admin
  api/            # route handlers (search, upload, webhook midtrans, dll)
components/       # UI + feature components
db/               # drizzle schema + seed
lib/              # auth, midtrans, shipping, queries, actions
store/            # zustand (cart, wishlist)
```
