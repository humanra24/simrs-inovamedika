# Node.js Backend Services – SIMRS Inovamedika

Node.js Backend Services merupakan backend pendukung untuk aplikasi **SIMRS Rawat Jalan Inovamedika**.

Sesuai instruksi _Real Case Test_ (Poin C), service ini menangani dua domain utama:

1. **Integrasi Pemeriksaan Penunjang (Lab)** – Menjembatani komunikasi antara SIMRS (Yii2) dengan sistem laboratorium eksternal.
2. **Dashboard & Laporan** – Menyediakan REST API untuk agregasi data operasional SIMRS dengan akses database read-only.

Service ini dikembangkan untuk memisahkan kebutuhan integrasi eksternal dan query agregasi dashboard dari backend utama Yii2, sehingga sistem lebih modular dan mudah dikembangkan.

---

## 🏗️ Arsitektur & Pembagian Tanggung Jawab

Untuk menerapkan prinsip _Separation of Concerns_ dan menghindari duplikasi _business logic_, pembagian tanggung jawab antara Yii2 dan Node.js adalah sebagai berikut:

| Aspek            | Yii2 (Backend Utama)                            | Node.js (Backend Services)              |
| ---------------- | ----------------------------------------------- | --------------------------------------- |
| Domain           | Master Data, Pendaftaran, EMR, Farmasi, Billing | Integrasi Lab, Agregasi Dashboard       |
| Akses Database   | Read & Write (Full CRUD)                        | Read-Only (SELECT)                      |
| Sumber Kebenaran | Single Source of Truth                          | Membaca data dari database utama        |
| Validasi         | Business Logic (stok, jadwal, duplikasi)        | JWT dan validasi format request         |
| Komunikasi       | Menyediakan REST API untuk React                | Memanggil API Yii2 dan membaca database |

### Alur Komunikasi Sistem

**1. Lab Integration**

Sistem Laboratorium Eksternal → Node.js → Axios → REST API Yii2 → Database SIMRS.

Node.js menerima data hasil pemeriksaan laboratorium, kemudian meneruskannya ke backend Yii2 untuk divalidasi dan disimpan ke database utama.

**2. Dashboard & Laporan**

React Frontend → Node.js REST API → PostgreSQL → JSON Response.

Node.js menjalankan query agregasi secara langsung ke database menggunakan hak akses read-only. Pendekatan ini bertujuan mengurangi beban query laporan pada backend utama Yii2.

---

## ⚙️ Teknologi yang Digunakan

- **Node.js** – JavaScript Runtime.
- **Express.js** – Framework REST API.
- **PostgreSQL** – Database Management System.
- **pg** – PostgreSQL Client.
- **Axios** – HTTP Client untuk komunikasi dengan Yii2.
- **jsonwebtoken** – Validasi JSON Web Token.
- **dotenv** – Pengelolaan environment variables.

## 📋 Prasyarat

Pastikan lingkungan pengembangan telah memenuhi kebutuhan berikut:

- Node.js versi 18.x atau lebih baru.
- npm.
- PostgreSQL.
- Backend Yii2 SIMRS berjalan pada `http://localhost:8080`.

---

## 🛠️ Instalasi & Konfigurasi

### 1. Install Dependencies

Masuk ke direktori project:

```bash
cd node-services
```

Install seluruh dependencies:

```bash
npm install
```

### 2. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`, kemudian sesuaikan konfigurasi berikut:

```env
# Application
PORT=3000

# Yii2 Backend
YII_API_URL=http://localhost:8080

# Database (Read-Only)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=simrs_db
DB_USER=postgres
DB_PASSWORD=password_postgres_anda

# JWT Secret (Harus sama dengan Yii2)
JWT_SECRET=your_shared_jwt_secret
```

**Catatan konfigurasi:**

- Sesuaikan konfigurasi database dengan PostgreSQL yang digunakan oleh Yii2.
- `JWT_SECRET` harus sesuai dengan secret key yang digunakan Yii2 untuk melakukan signing token.
- Gunakan akun database khusus dengan hak akses read-only untuk Node.js.
- Jangan memasukkan file `.env` ke dalam repository.

### 3. Menjalankan Service

Jalankan aplikasi:

```bash
node index.js
```

Jika berhasil, service dapat diakses melalui:

```text
http://localhost:3000
```

---

## 📡 Dokumentasi Endpoint API

**Base URL**

```text
http://localhost:3000
```

### Autentikasi

Seluruh endpoint memerlukan autentikasi JWT, kecuali endpoint yang secara eksplisit dikecualikan.

Header autentikasi:

```http
Authorization: Bearer <JWT_TOKEN>
```

Token diperoleh melalui endpoint login pada backend Yii2:

```http
POST http://localhost:8080/api/v1/auth/login
```

### BAGIAN 1 – Integrasi Laboratorium

Modul ini bertanggung jawab untuk mendapatkan daftar order laboratorium yang menunggu pemeriksaan dan mengirimkan hasil pemeriksaan dari sistem eksternal ke backend utama Yii2.

| Method | Endpoint                             | Deskripsi                                                   | Auth  |
| ------ | ------------------------------------ | ----------------------------------------------------------- | ----- |
| GET    | `/api/lab/pending`                   | Mendapatkan daftar order laboratorium dengan status pending | Tidak |
| POST   | `/api/lab/integration/send/:orderId` | Mengirim hasil laboratorium ke Yii2                         | Ya    |

**Contoh Request – Kirim Hasil Laboratorium**

```http
POST /api/lab/integration/send/1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Request Body:

```json
{
  "result_data": "Hb: 14 g/dL, WBC: 7000",
  "notes": "Normal"
}
```

Node.js meneruskan hasil pemeriksaan ke endpoint Yii2:

```http
POST /api/v1/lab/results/:id
```

Yii2 bertanggung jawab melakukan validasi business logic dan menyimpan hasil pemeriksaan ke database utama.

### BAGIAN 2 – Dashboard & Laporan

Modul Dashboard menyediakan data statistik dan laporan operasional SIMRS berdasarkan periode tanggal tertentu.

| Method | Endpoint                              | Query Parameters                          | Deskripsi                                                    |
| ------ | ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| GET    | `/api/dashboard/summary`              | `start_date`, `end_date`                  | Ringkasan total kunjungan, pendapatan, dan status pembayaran |
| GET    | `/api/dashboard/visits-by-polyclinic` | `start_date`, `end_date`                  | Jumlah kunjungan berdasarkan poli                            |
| GET    | `/api/dashboard/actions`              | `start_date`, `end_date`                  | Jumlah tindakan medis                                        |
| GET    | `/api/dashboard/medicines`            | `start_date`, `end_date`                  | Rekap penggunaan obat                                        |
| GET    | `/api/dashboard/visits-detail`        | `start_date`, `end_date`, `polyclinic_id` | Rincian kunjungan pasien (Drill-down)                        |
| GET    | `/api/dashboard/bills-detail`         | `start_date`, `end_date`, `status`        | Rincian tagihan (Drill-down)                                 |

**Contoh Request – Dashboard Summary**

```http
GET /api/dashboard/summary?start_date=2024-01-01&end_date=2026-12-31
Authorization: Bearer <JWT_TOKEN>
```

Format parameter tanggal:

```text
YYYY-MM-DD
```

---

## 🛡️ Middleware & Error Handling

### 1. Autentikasi JWT

File: `src/middlewares/authMiddleware.js`

Middleware autentikasi digunakan untuk memvalidasi JWT yang dikirimkan oleh client melalui Authorization Header.

Proses autentikasi meliputi:

- Mengambil token dari Authorization Header.
- Memvalidasi signature token menggunakan `jsonwebtoken`.
- Memastikan token menggunakan secret key yang sesuai dengan Yii2.
- Menolak request apabila token tidak valid atau kedaluwarsa.

Jika autentikasi gagal, server mengembalikan HTTP `401 Unauthorized`.

### 2. Global Error Handler

File: `index.js`

Global Error Handler digunakan untuk menangani kesalahan secara terpusat, termasuk error internal server dan endpoint yang tidak ditemukan (404 Route Not Found).

Contoh response:

```json
{
  "status": "error",
  "message": "Terjadi kesalahan internal pada server."
}
```

### 3. Format Response Konsisten

Seluruh endpoint menggunakan struktur response JSON yang konsisten.

**Success Response:**

```json
{
  "status": "success",
  "message": "Data berhasil diambil",
  "data": {
    "total_visits": 150
  },
  "errors": null
}
```

**Error Response:**

```json
{
  "status": "error",
  "message": "Terjadi kesalahan",
  "data": null,
  "errors": {
    "detail": "Invalid request"
  }
}
```

Standarisasi ini mempermudah frontend dalam menangani response API, baik ketika request berhasil maupun ketika terjadi kesalahan.

---

## 🧪 Pengujian API dengan Postman

Pengujian endpoint dilakukan menggunakan Postman.

Koleksi Postman tersedia pada:

```text
docs/Postman_Collection.json
```

Pembagian folder pengujian:

| Folder Postman              | Keterangan                                   |
| --------------------------- | -------------------------------------------- |
| `01. Auth`                  | Login untuk mendapatkan JWT Token            |
| `06. Farmasi & Resep`       | Pengujian terkait modul farmasi              |
| `07. Pemeriksaan Penunjang` | Pengujian integrasi pemeriksaan laboratorium |
| `09. Node.js Dashboard API` | Pengujian endpoint Dashboard dan laporan     |

**Langkah Pengujian:**

1. Jalankan backend Yii2 dan Node.js.
2. Pastikan koneksi PostgreSQL berjalan.
3. Import koleksi Postman.
4. Lakukan login melalui folder `01. Auth`.
5. Gunakan JWT Token yang diperoleh untuk endpoint yang membutuhkan autentikasi.
6. Jalankan pengujian sesuai folder dan endpoint yang tersedia.

---

## 🔒 Keamanan & Integritas Data

Beberapa pendekatan keamanan yang diterapkan dalam service ini:

1. Autentikasi API menggunakan JSON Web Token (JWT).
2. Validasi request sebelum data diproses.
3. Penyimpanan konfigurasi sensitif menggunakan environment variables.
4. Pembatasan akses database Node.js menjadi read-only.
5. Penggunaan parameterized queries untuk mengurangi risiko SQL Injection.
6. Pemisahan business logic utama pada Yii2 untuk menjaga konsistensi data.

## 🎯 Kesimpulan

Node.js Backend Services merupakan bagian pendukung dari SIMRS Inovamedika yang berfokus pada integrasi pemeriksaan laboratorium dan penyediaan data agregasi Dashboard.

Dengan Yii2 sebagai backend utama dan _Single Source of Truth_, Node.js menangani kebutuhan integrasi eksternal serta pelaporan tanpa mengambil alih tanggung jawab business logic utama SIMRS.

Pemisahan ini membantu menciptakan arsitektur aplikasi yang modular, menjaga integritas data, mengurangi beban query pada backend utama, dan mempermudah pengembangan sistem di masa mendatang.

---

**SIMRS Inovamedika**

_Node.js Backend Services – Laboratory Integration & Dashboard API_
