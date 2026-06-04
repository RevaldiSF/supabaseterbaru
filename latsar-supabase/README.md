# Sistem Terminal — Versi Supabase

Web versi baru berbasis Supabase (PostgreSQL) + HTML statis.
Tidak butuh Google Apps Script sama sekali.

## Struktur File
```
config.js          → Konfigurasi Supabase URL & API Key 
shared.js          → CSS, sidebar, toast, helper functions
login.html         → Halaman login
dashboard.html     → Dashboard statistik & grafik
input_purbalingga.html  → Input data Terminal Purbalingga (+ Trans Jateng)
input_banjarnegara.html → Input data Terminal Banjarnegara
laporan.html       → Cetak laporan (TODO)
```

## Setup Awal

### 1. Isi tabel users di Supabase SQL Editor:
```sql
INSERT INTO users (username, password, nama_lengkap, terminal, role) VALUES
('admin', 'password123', 'Administrator', 'ADMIN', 'admin'),
('ptg_pbg', 'password123', 'Petugas Purbalingga', 'PURBALINGGA', 'petugas'),
('ptg_bnr', 'password123', 'Petugas Banjarnegara', 'BANJARNEGARA', 'petugas');
```

### 2. Isi tabel master_po sesuai data asli dari Google Sheets.

### 3. Aktifkan RLS (Row Level Security) di Supabase:
Untuk sementara development, bisa disable RLS dulu:
```sql
ALTER TABLE data_harian DISABLE ROW LEVEL SECURITY;
ALTER TABLE rekap_bulanan DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_pengunjung DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_po DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 4. Deploy ke Cloudflare Pages:
- Upload semua file HTML & JS ke Cloudflare Pages
- Atau buka langsung dari file lokal untuk testing

## Catatan
- Versi ini TERPISAH dari versi Apps Script yang masih aktif
- Keduanya bisa jalan bersamaan tanpa saling ganggu
- Laporan cetak Excel belum diimplementasi (TODO setelah aktualisasi)
