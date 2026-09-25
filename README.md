# Forum API (V2) - CI/CD & Security

Proyek submission untuk kelas **Menjadi Back-End Developer Expert / Modul CI/CD dan Security** di Dicoding Academy.

---

## 🚀 Fitur & Kriteria yang Diimplementasikan

### 1. Kriteria Wajib
- **Kriteria 1 - Continuous Integration (CI)**
  - Menjalankan pengujian otomatis (Unit, Integration, dan Functional Tests) serta linting.
  - Berjalan pada event `pull_request` ke branch `main`/`master`.
  - Menggunakan GitHub Actions dengan **PostgreSQL Service Container** (`.github/workflows/ci.yml`).
- **Kriteria 2 - Continuous Deployment (CD)**
  - Melakukan deployment otomatis ke server EC2 melalui SSH (`.github/workflows/cd.yml`).
  - Berjalan pada event `push` ke branch `main`/`master`.
- **Kriteria 3 - Limit Access (Rate Limiting 90 req/menit)**
  - Konfigurasi proteksi DDoS pada resource `/threads` dan path di dalamnya sebesar **90 request per menit**.
  - File konfigurasi [`nginx.conf`](./nginx.conf) dilampirkan pada root proyek submission.
- **Kriteria 4 - Protokol HTTPS**
  - Reverse proxy NGINX dikonfigurasi dengan SSL/TLS (HTTPS) port 443 dan otomatis redirect HTTP port 80 ke HTTPS.

### 2. Kriteria Opsional (Kriteria Bintang 5)
- **Fitur Menyukai dan Batal Menyukai Komentar (`PUT /threads/{threadId}/comments/{commentId}/likes`)**
  - Autentikasi dengan Bearer Token (JWT).
  - Mekanisme toggle: jika belum menyukai $\rightarrow$ like; jika sudah menyukai $\rightarrow$ unlike.
  - Verifikasi eksistensi thread dan komentar (404).
  - Mengembalikan `200` dengan `{ "status": "success" }`.
  - Properti `likeCount` ditampilkan di setiap komentar pada response detail thread (`GET /threads/{threadId}`).
- **Fitur Balasan Komentar (Replies)**
  - Menambahkan balasan (`POST /threads/{threadId}/comments/{commentId}/replies`).
  - Menghapus balasan secara soft delete (`DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}`).
  - Menampilkan daftar `replies` terurut ASC di setiap komentar pada detail thread.
- **100% Test Coverage & Clean Architecture**
  - Seluruh pengujian (Unit, Integration, Functional) mencapai **100% Coverage** (Statements, Branch, Functions, Lines).
  - 0 ESLint errors/warnings.

---

## 🛠️ Menjalankan Proyek Secara Lokal

### 1. Persiapan Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env` dan `.test.env`:
```bash
cp .env.example .env
```
Pastikan PostgreSQL aktif dengan database `forumapi` dan `forumapi_test`.

### 3. Database Migration
```bash
# Menjalankan migrasi pada database development/production
npm run migrate

# Menjalankan migrasi pada database testing
npm run migrate:test
```

### 4. Menjalankan Automation Test & Coverage
```bash
# Menjalankan seluruh pengujian unit, integration, dan functional
npm run test

# Menjalankan pengujian dengan laporan code coverage (100% Coverage)
npm run test:coverage
```

### 5. Menjalankan Linter
```bash
npm run lint
```

### 6. Menjalankan Server Aplikasi
```bash
# Mode production
npm run start

# Mode development (dengan nodemon)
npm run start:dev
```
Aplikasi berjalan secara default di `http://localhost:5000`.
