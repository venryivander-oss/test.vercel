# Sistem Manajemen Toko (POS & Inventory)

Aplikasi ini dibangun menggunakan **Node.js, Express, SQLite** untuk backend, dan **React, Vite, Tailwind CSS** untuk frontend.

## Persyaratan
- Node.js (v16 atau lebih baru) terinstal di sistem Anda.

## Cara Menjalankan Aplikasi

Aplikasi ini terbagi menjadi dua bagian: **backend** dan **frontend**. Anda perlu menjalankan keduanya di dua terminal yang berbeda.

### 1. Menjalankan Backend
Buka terminal baru, lalu arahkan ke folder backend:
\`\`\`bash
cd "C:\\Users\\Windows 10\\.gemini\\antigravity\\scratch\\pos-system\\backend"
npm install
npm run dev
\`\`\`
*(Backend akan berjalan di http://localhost:5000)*. Pada saat pertama kali dijalankan, backend akan otomatis membuat file \`database.sqlite\` yang berisi seluruh tabel skema database.

### 2. Menjalankan Frontend
Buka terminal baru lainnya, lalu arahkan ke folder frontend:
\`\`\`bash
cd "C:\\Users\\Windows 10\\.gemini\\antigravity\\scratch\\pos-system\\frontend"
npm install
npm run dev
\`\`\`
*(Frontend akan berjalan di http://localhost:5173)*.

## Fitur-Fitur
1. **Master Supplier**: Tambah, edit, hapus supplier.
2. **Master Barang**: Manajemen inventaris, barcode, kategori, dan indikator peringatan stok menipis.
3. **Pembelian (Restock)**: Menambah stok barang secara otomatis dari supplier.
4. **Kasir (POS)**: Mendukung alat pemindai (barcode scanner). Tekan enter/scan barcode maka barang langsung masuk keranjang. Fitur diskon dan kalkulasi otomatis. Menjual barang akan otomatis mengurangi stok.
5. **Stock Opname**: Penyesuaian stok sistem dengan stok fisik gudang.
6. **Dashboard**: Ringkasan penjualan, restock, barang menipis, serta mutasi pergerakan barang masuk/keluar.

## Catatan Barcode Scanner
Untuk menggunakan barcode scanner fisik di halaman **POS (Kasir)**:
- Halaman POS secara otomatis akan mem-fokuskan kursor ke kolom input "Scan Barcode".
- Cukup arahkan scanner ke barcode barang, scanner biasanya akan otomatis mengirim tombol "Enter" setelah memindai, dan barang akan langsung masuk keranjang jika ditemukan.
- Jika stok kurang dari jumlah pembelian, sistem akan menolak dan memberikan peringatan (Error handling).
