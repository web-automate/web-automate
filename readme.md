# Web Automation Monorepo

Proyek monorepo berbasis **pnpm Workspaces** dan **Turborepo** untuk otomatisasi pembangunan website menggunakan Next.js, Express, dan RabbitMQ. Proyek ini dirancang secara modular untuk memisahkan logika antarmuka pengguna, pemrosesan antrean, dan akses database.

## 🏗️ Struktur Proyek

```text
.
├── apps/
│   ├── client/       # Next.js (Dashboard & Auth menggunakan Better Auth)
│   └── builder/      # Express (Worker untuk memproses antrean RabbitMQ)
├── packages/
│   └── database/     # Prisma Client & Schema (Shared database layer)
├── turbo.json        # Konfigurasi Turborepo (Task pipeline & caching)
├── pnpm-workspace.yaml
└── package.json      # Root configuration

```

## 🚀 Teknologi Utama

* **Framework**: Next.js 15+ & Express.js.
* **Database**: PostgreSQL dengan Prisma ORM.
* **Antrean Pesan**: RabbitMQ (`amqplib`).
* **Autentikasi**: Better Auth.
* **UI Library**: Mantine & Tabler Icons.
* **Monorepo Tooling**: pnpm & Turborepo.

## 🛠️ Persiapan Mandiri

Pastikan Anda telah menginstal:

* [Node.js](https://nodejs.org/) (versi LTS)
* [pnpm](https://pnpm.io/)
* [RabbitMQ](https://www.rabbitmq.com/) (berjalan secara lokal atau via Docker)
* [PostgreSQL](https://www.postgresql.org/)

## 🏃 Cara Menjalankan

### 1. Instalasi Dependensi

Jalankan perintah ini di root folder:

```bash
pnpm install

```

### 2. Konfigurasi Environment

Salin `.env.example` menjadi `.env` di folder berikut dan sesuaikan kredensialnya:

* `packages/database/.env`
* `apps/client/.env`
* `apps/builder/.env`

### 3. Generate Database Client

Gabungkan schema prisma dan buat Prisma Client:

```bash
pnpm db:gen

```

### 4. Menjalankan Aplikasi

Pilih mode yang ingin dijalankan dari root folder:

* **Menjalankan Semua (Client & Builder):**
```bash
pnpm dev

```


* **Menjalankan Client Saja:**
```bash
pnpm dev:client

```


* **Menjalankan Builder Saja:**
```bash
pnpm dev:builder

```



## 📦 Skrip Penting

| Perintah | Deskripsi |
| --- | --- |
| `pnpm db:gen` | Menggabungkan schema prisma dan generate client di `@repo/database`. |
| `pnpm build` | Membangun semua aplikasi untuk produksi menggunakan Turbo. |
| `pnpm clean` | Menghapus `node_modules` dan file lock untuk reset monorepo. |

## 🏗️ Alur Kerja Builder

Builder bekerja secara modular dengan alur sebagai berikut:

1. **Client** mengirimkan `websiteId` ke antrean `build_website` di RabbitMQ.
2. **Builder Worker** mengambil pesan dari antrean.
3. **Builder Service** menarik data lengkap dari database menggunakan shared prisma layer.
4. **Builder** menghasilkan file `.json` dan Markdown (format Hugo) di direktori `/root/hazart/web-builder/`.