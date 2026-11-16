# SIMRS Inovamedika

**Integrated Outpatient Hospital Management System**

SIMRS Inovamedika merupakan aplikasi Sistem Informasi Manajemen Rumah Sakit (SIMRS) yang dikembangkan untuk mendukung proses pelayanan rawat jalan secara terintegrasi, mulai dari pengelolaan data pasien, pendaftaran, antrean, pemeriksaan medis, rekam medis elektronik (EMR), farmasi, pemeriksaan laboratorium, hingga billing dan pembayaran.

Project ini dikembangkan sebagai bagian dari **Technical Assessment – Senior Programmer PT Inova Medika Solusindo**, dengan menerapkan arsitektur modular yang memisahkan frontend, backend utama, dan backend services.

---

## 🏗️ Arsitektur Sistem

Sistem terdiri dari tiga aplikasi utama yang saling terintegrasi:

| Project          | Teknologi               | Tanggung Jawab                                             |
| ---------------- | ----------------------- | ---------------------------------------------------------- |
| Frontend         | React, TypeScript, Vite | Antarmuka pengguna dan interaksi aplikasi                  |
| Main Backend     | Yii2 Advanced, PHP      | Business logic, REST API, autentikasi, dan transaksi SIMRS |
| Backend Services | Node.js, Express.js     | Integrasi laboratorium dan agregasi data dashboard         |

### Diagram Arsitektur

```text
                  USER
                    |
                    v
          +--------------------+
          |   React Frontend   |
          | TypeScript + Vite  |
          +--------------------+
                    |
             REST API / JWT
                    |
          +---------+----------+
          |                    |
          v                    v
+-------------------+  +-------------------+
|   Yii2 Backend    |  |  Node.js Services  |
|                   |  |                   |
| - Authentication  |  | - Lab Integration |
| - Master Data     |  | - Dashboard API   |
| - Registration    |  | - Reports         |
| - Medical Records |  |                   |
| - Pharmacy        |  +---------+---------+
| - Laboratory      |            |
| - Billing         |            | Axios
+---------+---------+            |
          |                      |
          v                      v
     +------------------------------+
     |          PostgreSQL          |
     |                              |
     |  Main Database (Yii2 R/W)    |
     |  Reporting Access (Node R/O) |
     +------------------------------+
```

### Pembagian Tanggung Jawab

**1. Frontend – React**

Menangani seluruh antarmuka aplikasi, navigasi, autentikasi pengguna, pembatasan tampilan berdasarkan role, serta komunikasi dengan REST API.

**2. Yii2 – Main Backend**

Menjadi pusat pengelolaan business logic dan sumber kebenaran data (Single Source of Truth). Seluruh perubahan data transaksi dilakukan melalui backend ini.

**3. Node.js – Backend Services**

Menangani kebutuhan integrasi sistem eksternal, khususnya laboratorium, serta menyediakan API agregasi dan laporan dashboard dengan akses database read-only.

---

## ⚙️ Teknologi yang Digunakan

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Router
- Axios
- Sonner

### Main Backend

- PHP
- Yii2 Advanced Template
- PostgreSQL
- PDO PostgreSQL
- Yii2 RBAC
- Custom JWT Authentication
- REST API

### Backend Services

- Node.js
- Express.js
- PostgreSQL
- pg
- Axios
- jsonwebtoken
- dotenv

---

## ✨ Fitur Utama

### Authentication & Authorization

- Login menggunakan username dan password.
- Autentikasi menggunakan JSON Web Token (JWT).
- Role-Based Access Control (RBAC).
- Pembatasan akses berdasarkan role pengguna.

### Master Data

- Pengelolaan data pasien.
- Pengelolaan dokter dan tenaga medis.
- Pengelolaan poli.
- Pengelolaan jadwal praktik dokter.
- Pengelolaan tindakan medis dan tarif.
- Pengelolaan obat dan stok.

### Pelayanan Rawat Jalan

- Pendaftaran pasien.
- Pembuatan nomor antrean otomatis.
- Pengelolaan kunjungan pasien.
- Pemeriksaan dan rekam medis elektronik.
- Pencatatan diagnosis dan tanda-tanda vital.
- Pengelolaan tindakan medis.

### Farmasi

- Pembuatan resep dokter.
- Validasi ketersediaan stok obat.
- Pengelolaan resep pending.
- Penyerahan obat.
- Pengurangan stok secara terkontrol.

### Pemeriksaan Laboratorium

- Pembuatan order pemeriksaan laboratorium.
- Pengelolaan order pending.
- Integrasi hasil pemeriksaan laboratorium.
- Penyimpanan hasil melalui backend utama Yii2.

### Billing & Pembayaran

- Pembuatan tagihan otomatis.
- Perincian biaya pelayanan.
- Pencatatan pembayaran.
- Pencegahan pembayaran ganda menggunakan Idempotency Key.
- Pembuatan invoice PDF.

### Dashboard & Laporan

- Ringkasan kunjungan pasien.
- Statistik kunjungan berdasarkan poli.
- Rekap tindakan medis.
- Rekap penggunaan obat.
- Rincian kunjungan pasien.
- Rincian tagihan dan status pembayaran.

---

## 👥 Role Pengguna

Sistem menyediakan enam role utama:

| Role                 | Hak Akses Utama                             |
| -------------------- | ------------------------------------------- |
| Administrator        | Pengelolaan seluruh modul dan master data   |
| Petugas Pendaftaran  | Pendaftaran pasien dan antrean              |
| Dokter               | Pemeriksaan, EMR, tindakan medis, dan resep |
| Petugas Farmasi      | Pengelolaan resep dan penyerahan obat       |
| Petugas Laboratorium | Pengelolaan order dan hasil laboratorium    |
| Kasir                | Pengelolaan tagihan dan pembayaran          |

---

## 🔐 Prinsip Keamanan & Integritas Data

Beberapa pendekatan yang diterapkan dalam pengembangan sistem:

1. **JWT Authentication** – Autentikasi pengguna menggunakan token.
2. **Role-Based Access Control** – Pembatasan akses berdasarkan role.
3. **Single Source of Truth** – Yii2 menjadi pusat pengelolaan transaksi utama.
4. **Read-Only Database Access** – Node.js hanya memiliki hak akses baca untuk kebutuhan dashboard.
5. **Parameterized Queries** – Mengurangi risiko SQL Injection.
6. **Unique Constraints** – Mencegah duplikasi nomor antrean.
7. **Atomic Database Operations** – Menjaga konsistensi stok obat.
8. **Idempotency Key** – Mencegah pencatatan pembayaran berulang.
9. **Price Snapshot** – Menjaga konsistensi harga transaksi yang sudah tercatat.

---

## 📂 Struktur Repository

Repository ini menggabungkan tiga project dalam satu struktur:

```text
simrs-inovamedika/
│
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── yii-backend/               # Yii2 Main Backend
│   ├── api/
│   ├── common/
│   ├── console/
│   ├── environments/
│   ├── composer.json
│   ├── .env.example
│   └── README.md
│
├── node-services/             # Node.js Backend Services
│   ├── src/
│   ├── docs/
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── README.md                  # Dokumentasi utama repository
```

---

## 📋 Persyaratan Sistem

Pastikan perangkat pengembangan telah memiliki:

- Git
- Node.js 18.x atau lebih baru
- npm
- PHP 8.0 atau lebih baru
- Composer
- PostgreSQL 12 atau lebih baru
- Ekstensi PHP `pdo_pgsql`, `mbstring`, dan `gd`

---

## 🚀 Instalasi & Menjalankan Aplikasi

Karena repository terdiri dari tiga project terpisah, masing-masing aplikasi perlu dikonfigurasi dan dijalankan secara mandiri.

### 1. Clone Repository

```bash
git clone <repository-url>
cd simrs-inovamedika
```

### 2. Setup Database

Buat database PostgreSQL untuk SIMRS:

```sql
CREATE DATABASE simrs_db;
```

Konfigurasikan koneksi database pada backend Yii2 dan Node.js.

Pastikan akun database yang digunakan Node.js memiliki hak akses read-only sesuai kebutuhan.

### 3. Menjalankan Yii2 Backend

```bash
cd yii-backend

composer install

php init
php yii migrate
php yii migrate --migrationPath=@yii/rbac/migrations
php yii rbac/init
```

Jalankan API:

```bash
cd api
php -S localhost:8080 -t web
```

Backend tersedia pada:

`http://localhost:8080`

### 4. Menjalankan Node.js Services

Buka terminal baru:

```bash
cd node-services

npm install
```

Konfigurasikan environment:

```env
PORT=3000

YII_API_URL=http://localhost:8080

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=simrs_db
DB_USER=readonly_user
DB_PASSWORD=your_database_password

JWT_SECRET=your_shared_jwt_secret
```

Jalankan service:

```bash
node index.js
```

Backend services tersedia pada:

`http://localhost:3000`

### 5. Menjalankan Frontend

Buka terminal baru:

```bash
cd frontend

npm install
```

Buat file `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Jalankan development server:

```bash
npm run dev
```

Frontend tersedia pada:

`http://localhost:5173`

---

## 🔑 Akun Demo

Akun berikut tersedia untuk kebutuhan demonstrasi dan pengujian aplikasi:

| Role                 | Username      | Password |
| -------------------- | ------------- | -------- |
| Administrator        | `admin`       | `123456` |
| Petugas Pendaftaran  | `pendaftaran` | `123456` |
| Dokter               | `dokter`      | `123456` |
| Petugas Farmasi      | `farmasi`     | `123456` |
| Petugas Laboratorium | `lab`         | `123456` |
| Kasir                | `kasir`       | `123456` |

**Catatan:** Akun tersebut hanya digunakan untuk kebutuhan demonstrasi. Gunakan data pasien dummy dan jangan menggunakan kredensial demo pada lingkungan production.

---

## 🧪 Pengujian API

Pengujian REST API dilakukan menggunakan Postman.

Koleksi pengujian tersedia pada:

```text
node-services/docs/Postman_Collection.json
```

Cakupan pengujian meliputi:

- Authentication dan JWT.
- CRUD Master Data.
- Pendaftaran dan antrean pasien.
- Pemeriksaan dan EMR.
- Tindakan medis.
- Farmasi dan resep.
- Integrasi laboratorium.
- Billing dan pembayaran.
- Dashboard dan laporan.
- Pengujian hak akses berdasarkan role.

---

## 📖 Dokumentasi Detail

Untuk informasi teknis, konfigurasi, endpoint API, dan panduan pengembangan masing-masing aplikasi, silakan merujuk ke dokumentasi berikut:

| Project          | Dokumentasi                                          |
| ---------------- | ---------------------------------------------------- |
| Frontend         | [`frontend/README.md`](frontend/README.md)           |
| Yii2 Backend     | [`yii-backend/README.md`](yii-backend/README.md)     |
| Node.js Services | [`node-services/README.md`](node-services/README.md) |

---

## 🎯 Tujuan Pengembangan

SIMRS Inovamedika dikembangkan dengan fokus pada:

- Penerapan arsitektur aplikasi yang modular.
- Pemisahan frontend, business logic, dan backend services.
- Integrasi proses pelayanan rawat jalan.
- Pengelolaan hak akses berbasis role.
- Konsistensi dan integritas transaksi database.
- Optimalisasi query untuk kebutuhan dashboard dan laporan.
- Kemudahan integrasi dengan sistem eksternal.

---

**SIMRS Inovamedika**

_Integrated Outpatient Hospital Management System_

**Technical Assessment – Senior Programmer**  
PT Inova Medika Solusindo
