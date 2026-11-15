# Yii2 Backend – SIMRS Inovamedika

Yii2 Backend merupakan backend utama untuk aplikasi **SIMRS Rawat Jalan Inovamedika** yang dibangun menggunakan Yii2 Advanced Template.

Backend ini bertanggung jawab atas seluruh proses bisnis utama rumah sakit, mulai dari pengelolaan master data, pendaftaran pasien, antrean, rekam medis elektronik (EMR), tindakan medis, farmasi, pemeriksaan laboratorium, hingga billing dan pembayaran.

Aplikasi menggunakan arsitektur REST API sehingga dapat diintegrasikan dengan React sebagai frontend utama dan Node.js sebagai backend services pendukung.

---

## 🏗️ Arsitektur & Pembagian Tanggung Jawab

Sistem menggunakan pemisahan tanggung jawab antara Yii2 sebagai backend utama dan Node.js sebagai backend services.

| Aspek            | Yii2 (Backend Utama)                            | Node.js (Backend Services)              |
| ---------------- | ----------------------------------------------- | --------------------------------------- |
| Domain           | Master Data, Pendaftaran, EMR, Farmasi, Billing | Integrasi Lab, Agregasi Dashboard       |
| Akses Database   | Read & Write (Full CRUD)                        | Read-Only (SELECT)                      |
| Sumber Kebenaran | Single Source of Truth                          | Hanya membaca data                      |
| Autentikasi      | Custom JWT + RBAC                               | JWT Middleware (Shared Secret)          |
| Komunikasi       | Menyediakan REST API untuk React dan Node.js    | Memanggil API Yii2 dan membaca database |

### Prinsip Arsitektur

- **Single Source of Truth:** Yii2 menjadi sumber kebenaran seluruh data transaksi SIMRS.
- **Separation of Concerns:** Setiap backend memiliki tanggung jawab domain yang berbeda.
- **Role-Based Access Control:** Hak akses pengguna dibatasi berdasarkan peran masing-masing.
- **Data Integrity:** Seluruh perubahan data transaksi dilakukan melalui backend Yii2.

**Catatan penting:** Node.js tidak diperbolehkan melakukan operasi `INSERT`, `UPDATE`, maupun `DELETE` secara langsung terhadap tabel transaksi utama seperti `visits`, `bills`, dan `prescriptions`. Untuk integrasi hasil laboratorium, Node.js meneruskan data melalui REST API Yii2.

---

## ⚙️ Teknologi yang Digunakan

| Teknologi              | Fungsi                     |
| ---------------------- | -------------------------- |
| PHP                    | Bahasa pemrograman backend |
| Yii2 Advanced Template | Backend framework          |
| PostgreSQL             | Database Management System |
| Composer               | Dependency Manager         |
| JWT                    | Autentikasi API            |
| Yii2 RBAC              | Manajemen hak akses        |
| PDO PostgreSQL         | Koneksi database           |
| REST API               | Komunikasi antar aplikasi  |

## 📋 Prasyarat

Pastikan perangkat pengembangan telah memiliki:

- PHP versi 8.0 atau lebih baru (direkomendasikan PHP 8.1 atau 8.2).
- PostgreSQL versi 12 atau lebih baru.
- Composer.
- Ekstensi PHP:
  - `pdo_pgsql`
  - `mbstring`
  - `gd` (untuk kebutuhan PDF Invoice)

---

## 🛠️ Instalasi & Konfigurasi

### 1. Install Dependencies

Masuk ke direktori backend:

```bash
cd yii-backend
```

Install seluruh dependency menggunakan Composer:

```bash
composer install
```

### 2. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`, kemudian sesuaikan konfigurasi berikut:

```env
# Application
YII_ENV=dev
YII_DEBUG=true

# Database PostgreSQL
DB_DSN=pgsql:host=127.0.0.1;port=5432;dbname=simrs_db
DB_USERNAME=postgres
DB_PASSWORD=password_postgres_anda

# JWT Secret
JWT_SECRET=your_shared_jwt_secret
```

**Catatan:**

- Sesuaikan konfigurasi database dengan environment PostgreSQL.
- `JWT_SECRET` harus sama dengan secret key yang digunakan oleh Node.js untuk memvalidasi JWT.
- Jangan menyimpan kredensial asli dalam repository.
- Untuk production, nonaktifkan `YII_DEBUG` dan gunakan konfigurasi environment yang aman.

### 3. Inisialisasi Aplikasi

Jalankan perintah:

```bash
php init
```

Pilih environment:

```text
[0] Development
```

Kemudian konfirmasi dengan mengetik:

```text
yes
```

### 4. Migrasi Database

Jalankan migrasi untuk membuat seluruh tabel utama SIMRS:

```bash
php yii migrate
```

Selanjutnya, jalankan migrasi tabel RBAC bawaan Yii2:

```bash
php yii migrate --migrationPath=@yii/rbac/migrations
```

Migrasi ini mencakup tabel yang diperlukan untuk pengelolaan pengguna, data SIMRS, serta sistem hak akses.

### 5. Seed Role & User Dummy

Jalankan perintah berikut untuk membuat enam role dan enam akun pengguna dummy:

```bash
php yii rbac/init
```

Role yang disediakan:

1. Administrator
2. Petugas Pendaftaran
3. Dokter
4. Petugas Farmasi
5. Petugas Laboratorium
6. Kasir

### 6. Menjalankan Server API

Backend menggunakan direktori `api` sebagai entry point REST API karena antarmuka pengguna ditangani oleh React.

Masuk ke direktori API:

```bash
cd api
```

Jalankan development server:

```bash
php -S localhost:8080 -t web
```

Backend Yii2 dapat diakses melalui:

```text
http://localhost:8080
```

---

## 📡 Dokumentasi Endpoint REST API

**Base URL**

```text
http://localhost:8080
```

Seluruh endpoint memerlukan autentikasi JWT, kecuali endpoint login.

Header autentikasi:

```http
Authorization: Bearer <JWT_TOKEN>
```

### 1. Autentikasi (JWT)

Digunakan untuk melakukan login dan mendapatkan token autentikasi.

| Method | Endpoint             | Deskripsi                       |
| ------ | -------------------- | ------------------------------- |
| POST   | `/api/v1/auth/login` | Login dan mendapatkan JWT Token |

**Contoh Request:**

```http
POST /api/v1/auth/login
Content-Type: application/json
```

Request Body:

```json
{
  "username": "admin",
  "password": "123456"
}
```

Response berisi token JWT yang digunakan untuk mengakses endpoint terproteksi.

### 2. Master Data

RBAC: Administrator.

Modul master data menggunakan Dynamic Controller untuk mengelola enam entitas utama.

| Method | Endpoint                     | Deskripsi                          |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/api/v1/master/:entity`     | Daftar data, pencarian, dan filter |
| POST   | `/api/v1/master/:entity`     | Menambahkan data                   |
| GET    | `/api/v1/master/:entity/:id` | Detail data                        |
| PUT    | `/api/v1/master/:entity/:id` | Memperbarui data                   |
| DELETE | `/api/v1/master/:entity/:id` | Menghapus data                     |

Entitas yang tersedia:

- `patients` – Data pasien.
- `polyclinics` – Data poli.
- `doctors` – Data dokter.
- `schedules` – Jadwal praktik dokter.
- `actions` – Data tindakan medis dan tarif.
- `medicines` – Data obat dan stok.

Fitur tambahan:

- Search menggunakan parameter `?q=`.
- Filter data berdasarkan parameter yang tersedia.
- Detail data berdasarkan ID.

### 3. Pendaftaran & Antrean

RBAC: Petugas Pendaftaran, Administrator.

| Method | Endpoint                             | Deskripsi                                              |
| ------ | ------------------------------------ | ------------------------------------------------------ |
| POST   | `/api/v1/visits/register`            | Mendaftarkan pasien dan membuat nomor antrean otomatis |
| GET    | `/api/v1/visits/queue`               | Melihat antrean hari ini                               |
| GET    | `/api/v1/visits/history/:patient_id` | Melihat riwayat kunjungan pasien beserta hasil lab     |
| PUT    | `/api/v1/visits/update-status/:id`   | Mengubah status kunjungan                              |

Filter antrean dapat menggunakan parameter:

```text
?polyclinic_id=1
```

### 4. Pemeriksaan & Rekam Medis Elektronik (EMR)

RBAC: Dokter, Administrator.

| Method | Endpoint                            | Deskripsi                               |
| ------ | ----------------------------------- | --------------------------------------- |
| GET    | `/api/v1/medical-records/waiting`   | Daftar pasien yang menunggu pemeriksaan |
| POST   | `/api/v1/medical-records/:visit_id` | Menyimpan rekam medis                   |
| PUT    | `/api/v1/medical-records/:visit_id` | Memperbarui rekam medis                 |
| GET    | `/api/v1/medical-records/:visit_id` | Melihat detail rekam medis              |

Data rekam medis meliputi:

- Anamnesis.
- Diagnosis.
- Tanda-tanda vital (Vital Signs).

### 5. Tindakan Medis

RBAC: Dokter, Administrator.

| Method | Endpoint                          | Deskripsi                              |
| ------ | --------------------------------- | -------------------------------------- |
| GET    | `/api/v1/visit-actions/:visit_id` | Melihat daftar tindakan pada kunjungan |
| POST   | `/api/v1/visit-actions/:visit_id` | Menambahkan tindakan medis             |
| DELETE | `/api/v1/visit-actions/:id`       | Menghapus tindakan medis               |

Setiap tindakan menggunakan snapshot harga agar perubahan tarif pada master data tidak mengubah tagihan transaksi yang sudah tercatat.

### 6. Farmasi & Resep

RBAC: Dokter, Petugas Farmasi, Administrator.

| Method | Endpoint                             | Deskripsi                                    |
| ------ | ------------------------------------ | -------------------------------------------- |
| POST   | `/api/v1/prescriptions/:visit_id`    | Dokter membuat resep dengan validasi stok    |
| GET    | `/api/v1/prescriptions/pending`      | Farmasi melihat daftar resep pending         |
| POST   | `/api/v1/prescriptions/:id/dispense` | Farmasi menyerahkan obat dan mengurangi stok |
| DELETE | `/api/v1/prescriptions/:id`          | Membatalkan resep yang masih pending         |

Proses farmasi memperhatikan ketersediaan stok untuk menjaga konsistensi data persediaan obat.

### 7. Pemeriksaan Penunjang / Laboratorium

RBAC: Dokter, Petugas Laboratorium, Administrator.

| Method | Endpoint                            | Deskripsi                                     |
| ------ | ----------------------------------- | --------------------------------------------- |
| POST   | `/api/v1/lab/orders/:visit_id`      | Dokter membuat order pemeriksaan laboratorium |
| GET    | `/api/v1/lab/orders/pending`        | Petugas laboratorium melihat order pending    |
| POST   | `/api/v1/lab/orders/:id/cancel`     | Membatalkan order laboratorium                |
| POST   | `/api/v1/lab/results/:lab_order_id` | Menerima dan menyimpan hasil laboratorium     |
| GET    | `/api/v1/lab/results/:visit_id`     | Dokter melihat hasil laboratorium             |

Endpoint penerimaan hasil laboratorium juga digunakan oleh Node.js melalui mekanisme integrasi REST API.

### 8. Billing & Pembayaran

RBAC: Kasir, Administrator, Dokter.

| Method | Endpoint                           | Deskripsi                                      |
| ------ | ---------------------------------- | ---------------------------------------------- |
| POST   | `/api/v1/bills/generate/:visit_id` | Membuat tagihan otomatis berdasarkan pelayanan |
| GET    | `/api/v1/bills/:visit_id`          | Melihat detail tagihan dan rincian biaya       |
| POST   | `/api/v1/bills/:bill_id/pay`       | Mencatat pembayaran dengan Idempotency Key     |
| GET    | `/api/v1/bills/:visit_id/invoice`  | Menghasilkan Invoice PDF                       |

Billing menggabungkan biaya pelayanan yang berasal dari tindakan medis, farmasi, dan komponen pelayanan lainnya sesuai implementasi sistem.

### 9. Laporan Detail

RBAC: Administrator, Kasir.

| Method | Endpoint                    | Deskripsi                                      |
| ------ | --------------------------- | ---------------------------------------------- |
| GET    | `/api/v1/reports/visits`    | Rincian kunjungan berdasarkan periode          |
| GET    | `/api/v1/reports/bills`     | Rincian tagihan berdasarkan periode dan status |
| GET    | `/api/v1/reports/medicines` | Rekap penggunaan obat                          |

---

## 🔐 Keamanan (JWT & RBAC)

### 1. JSON Web Token (JWT)

Sistem menggunakan implementasi Custom JWT berbasis `hash_hmac` untuk melakukan signing dan validasi token tanpa bergantung pada library JWT tambahan.

Token memuat informasi:

| Field      | Keterangan              |
| ---------- | ----------------------- |
| `sub`      | ID pengguna             |
| `username` | Username pengguna       |
| `iat`      | Waktu token dibuat      |
| `exp`      | Waktu kedaluwarsa token |

Masa berlaku token adalah 24 jam.

File implementasi:

- `common/components/JwtAuth.php`
- `common/models/User.php` – Method `getJwtToken()`.

Token yang dihasilkan Yii2 juga digunakan oleh Node.js melalui shared secret untuk proses autentikasi antarservice.

### 2. Role-Based Access Control (RBAC)

Sistem menggunakan `yii\rbac\DbManager` untuk mengelola hak akses berdasarkan peran pengguna.

Enam role yang tersedia:

| Role                 | Tanggung Jawab                                  |
| -------------------- | ----------------------------------------------- |
| Administrator        | Mengelola seluruh modul dan master data         |
| Petugas Pendaftaran  | Mengelola pendaftaran dan antrean               |
| Dokter               | Mengelola pemeriksaan, EMR, tindakan, dan resep |
| Petugas Farmasi      | Mengelola resep dan penyerahan obat             |
| Petugas Laboratorium | Mengelola order dan hasil laboratorium          |
| Kasir                | Mengelola billing dan pembayaran                |

**RoleFilter**

File: `common/components/RoleFilter.php`

Middleware kustom ini digunakan untuk membatasi akses endpoint berdasarkan role yang telah ditentukan pada controller.

Request dari pengguna yang tidak memiliki izin akan ditolak oleh sistem.

---

## 🧪 Penanganan Skenario Teknis (Sesuai Soal D)

Backend dirancang untuk menangani beberapa skenario penting yang sering terjadi dalam sistem pelayanan rumah sakit.

### 1. Pencegahan Duplikasi Pendaftaran

Menggunakan Unique Constraint pada tabel `visits` dengan kombinasi:

```text
polyclinic_id
visit_date
queue_number
```

Jika terjadi konflik data akibat request bersamaan, sistem menangani `IntegrityException` sehingga nomor antrean tidak tercatat ganda.

### 2. Pencegahan Stok Obat Minus

Menggunakan Atomic Update melalui `Medicine::updateAllCounters` dengan kondisi stok yang mencukupi:

```text
stock >= quantity
```

Pendekatan ini membantu mencegah stok menjadi negatif akibat transaksi bersamaan.

### 3. Pencegahan Pembayaran Ganda

Menerapkan Idempotency Key pada tabel `payments` dengan Unique Constraint.

Jika request pembayaran dengan key yang sama dikirim ulang, sistem mengembalikan hasil transaksi sebelumnya tanpa mencatat pembayaran baru.

### 4. Snapshot Harga Transaksi

Menggunakan snapshot harga pada `bill_items` dan `visit_actions`.

Dengan demikian, perubahan harga pada master data tidak memengaruhi transaksi dan tagihan yang telah dibuat sebelumnya.

### 5. Penanganan Gangguan Integrasi

Komunikasi dengan layanan Node.js menggunakan REST API.

Jika terjadi kegagalan komunikasi, mekanisme error handling dan retry pada sisi service integrasi membantu menangani request yang gagal.

### 6. Optimasi Performa Database

Beberapa pendekatan optimasi yang digunakan:

- Indexing pada kolom `visit_date`.
- Indexing pada kolom `full_name`.
- Indexing pada kolom `nik`.
- Eager Loading menggunakan `with()` untuk mengurangi masalah N+1 Query.

---

## 📂 Struktur Folder Utama

```text
yii-backend/
│
├── api/
│   ├── config/             # Konfigurasi REST API dan CORS
│   ├── modules/
│   │   └── v1/             # Controller API versi 1
│   └── views/
│       └── billing/        # Template Invoice PDF
│
├── common/
│   ├── components/         # JwtAuth, RoleFilter
│   └── models/             # ActiveRecord Models
│
├── console/
│   └── controllers/        # Console Controller dan RBAC Seeder
│
├── environments/           # Konfigurasi environment
├── vendor/                 # Composer dependencies
├── .env.example            # Contoh environment configuration
└── README.md               # Dokumentasi backend
```

---

## 🧪 Pengujian API dengan Postman

Pengujian REST API dilakukan menggunakan Postman.

Koleksi pengujian tersedia pada:

```text
docs/Postman_Collection.json
```

Beberapa skenario pengujian meliputi:

1. Login dan autentikasi JWT.
2. CRUD Master Data.
3. Pendaftaran pasien dan pengelolaan antrean.
4. Pemeriksaan dan penyimpanan EMR.
5. Pengelolaan tindakan medis.
6. Pembuatan resep dan pengeluaran obat.
7. Order dan hasil pemeriksaan laboratorium.
8. Pembuatan tagihan dan pembayaran.
9. Pembuatan Invoice PDF.
10. Pengujian hak akses berdasarkan role pengguna.

---

## 🎯 Kesimpulan

Yii2 Backend merupakan pusat pengelolaan proses bisnis SIMRS Inovamedika yang memastikan seluruh transaksi dan data utama rumah sakit dikelola secara terpusat.

Dengan dukungan JWT untuk autentikasi, RBAC untuk pembatasan hak akses, serta mekanisme integritas transaksi seperti Atomic Update, Unique Constraint, dan Idempotency Key, backend dirancang untuk menjaga keamanan dan konsistensi data.

Integrasi dengan React sebagai frontend dan Node.js sebagai backend services melengkapi arsitektur sistem agar lebih modular, terstruktur, dan mudah dikembangkan.

---

**SIMRS Inovamedika**

_Yii2 Backend – Main Business Logic & REST API_
