# SIMRS Inovamedika – Frontend

Aplikasi frontend **Sistem Informasi Manajemen Rumah Sakit (SIMRS)** untuk mendukung proses pelayanan rawat jalan secara terintegrasi, mulai dari pendaftaran pasien hingga pemeriksaan, farmasi, laboratorium, dan pembayaran.

Frontend dikembangkan menggunakan React, TypeScript, dan Vite dengan antarmuka modern, responsif, serta terintegrasi dengan REST API berbasis Yii2.

## 🚀 Teknologi

- **React** – Library untuk membangun antarmuka pengguna.
- **TypeScript** – Menambahkan type safety pada JavaScript.
- **Vite** – Build tool dan development server.
- **Tailwind CSS** – Styling antarmuka.
- **shadcn/ui** – Komponen UI yang dapat dikustomisasi.
- **Lucide React** – Ikon antarmuka.
- **React Router** – Routing dan navigasi aplikasi.
- **Axios** – Komunikasi HTTP dengan REST API.
- **Sonner** – Notifikasi aplikasi.

## ✨ Fitur

- **Authentication**
  - Login menggunakan username dan password.
  - Autentikasi berbasis JWT.
  - Penyimpanan sesi pengguna.
  - Logout.

- **Role-Based Access Control (RBAC)**
  - Administrator.
  - Petugas Pendaftaran.
  - Dokter.
  - Petugas Farmasi.
  - Petugas Laboratorium.
  - Kasir.
  - Pembatasan akses menu berdasarkan role pengguna.

- **Master Data**
  - Data pasien.
  - Data dokter dan tenaga medis.
  - Data poli.
  - Jadwal praktik dokter.
  - Data tindakan medis dan tarif.
  - Data obat dan stok.

- **Pelayanan Rawat Jalan**
  - Pendaftaran pasien.
  - Pengelolaan kunjungan.
  - Pemeriksaan pasien.
  - Pelayanan farmasi.
  - Pelayanan laboratorium.
  - Pengelolaan pembayaran.

## 📋 Persyaratan

Pastikan perangkat sudah memiliki:

- Node.js (versi LTS direkomendasikan).
- npm.
- Git.

## ⚙️ Instalasi

Clone repository:

```bash
git clone <repository-url>
```

Masuk ke direktori frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

## 🔧 Konfigurasi Environment

Buat file `.env` di direktori utama frontend:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Sesuaikan URL dengan alamat REST API Yii2 yang digunakan.

Pastikan konfigurasi Axios membaca environment variable tersebut.

## ▶️ Menjalankan Aplikasi

Jalankan development server:

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```text
http://localhost:5173
```

## 🏗️ Build Production

Untuk membuat build aplikasi:

```bash
npm run build
```

Hasil build akan disimpan di direktori:

```text
dist/
```

Untuk menjalankan preview hasil build:

```bash
npm run preview
```

## 🧹 Linting

Jalankan ESLint untuk memeriksa kualitas kode:

```bash
npm run lint
```

## 🔐 Akun Demo

Aplikasi menyediakan akun demo untuk mempermudah proses pengujian setiap role.

| Role                 | Username      | Password |
| -------------------- | ------------- | -------- |
| Administrator        | `admin`       | `123456` |
| Petugas Pendaftaran  | `pendaftaran` | `123456` |
| Dokter               | `dokter`      | `123456` |
| Petugas Farmasi      | `farmasi`     | `123456` |
| Petugas Laboratorium | `lab`         | `123456` |
| Kasir                | `kasir`       | `123456` |

**Catatan:** Akun tersebut disediakan khusus untuk kebutuhan demonstrasi dan technical assessment. Gunakan data pasien dummy selama pengujian.

## 🔗 Backend API

Frontend ini menggunakan REST API yang dikembangkan menggunakan:

- Yii2 Framework.
- JWT Authentication.
- Yii2 RBAC.
- Database MySQL/MariaDB.

Pastikan backend API sudah berjalan dan konfigurasi URL API pada file `.env` sudah sesuai sebelum menjalankan frontend.

## 📌 Catatan Pengembangan

Proyek ini dikembangkan sebagai bagian dari technical assessment **Senior Programmer PT Inova Medika Solusindo**, dengan fokus pada pengembangan sistem pelayanan rawat jalan yang terintegrasi, pengelolaan master data, autentikasi, dan pembatasan hak akses berdasarkan role pengguna.

---

**SIMRS Inovamedika**  
Frontend Application – React + TypeScript + Vite
