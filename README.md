# TaskMaster - Aplikasi To-Do List

TaskMaster adalah aplikasi web untuk pengelolaan tugas (to-do list) yang dilengkapi dengan berbagai fitur seperti prioritas tugas, tenggat waktu, pencarian, dan filter. Aplikasi ini dibangun menggunakan HTML, CSS, JavaScript, dan PHP dengan database MySQL.

## 🌟 Fitur Utama

- ✅ Membuat, melihat, mengedit, dan menghapus tugas (CRUD)
- 📊 Pengaturan prioritas tugas (Rendah, Sedang, Tinggi)
- 📅 Pengelolaan tenggat waktu
- 🔍 Pencarian dan filter tugas berdasarkan status dan prioritas
- 📱 Antarmuka responsif untuk akses di berbagai perangkat

## 🛠️ Teknologi yang Digunakan

- **Front-end**: HTML5, CSS3, JavaScript (Vanilla)
- **Back-end**: PHP, MySQL
- **Library**: Font Awesome untuk ikon

## 🚀 Instalasi

### Persyaratan

- PHP 7.4 atau lebih tinggi
- MySQL 5.7 atau lebih tinggi
- Web server (Apache, Nginx, etc.)

### Langkah-langkah Instalasi

1. Clone repositori ini ke komputer lokal atau server web Anda:
   ```bash
   git clone https://github.com/username/taskmaster.git
   ```

2. Buat database MySQL baru:
   ```sql
   CREATE DATABASE taskmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Import struktur database dari file `database.sql`:
   ```bash
   mysql -u username -p taskmaster < database.sql
   ```

4. Konfigurasi koneksi database di file `api/tasks.php`:
   ```php
   $host = 'localhost';
   $db = 'taskmaster';
   $user = 'username';
   $pass = 'password';
   ```

5. Pastikan direktori proyek dapat diakses oleh web server Anda.

6. Buka aplikasi di browser dengan mengakses URL dimana proyek di-host.

## 📂 Struktur Folder

```
todo/
├── api/
│   └── tasks.php       # API CRUD untuk tugas
├── database
│   └── todo.sql        # Struktur database
├── html
│   └── index.html      # Halaman utama aplikasi
│   └── style.css       # Stylesheet aplikasi
│   └── script.js       # JavaScript untuk logika aplikasi
└── README.md           # Dokumentasi proyek
```

## 📝 Dokumentasi API

Aplikasi ini menggunakan RESTful API yang dibuat dengan PHP untuk pengelolaan data.

### Endpoint

1. **GET /api/tasks.php**
   - Deskripsi: Mengambil semua tugas
   - Contoh Response:
     ```json
     {
       "success": true,
       "tasks": [
         {
           "id": 1,
           "title": "Menyelesaikan proyek TaskMaster",
           "description": "Implementasikan fitur CRUD",
           "priority": "high",
           "due_date": "2023-12-31",
           "completed": 0
         }
       ]
     }
     ```

2. **GET /api/tasks.php?id={task_id}**
   - Deskripsi: Mengambil tugas berdasarkan ID
   - Parameter: `id` (ID tugas)
   - Contoh Response:
     ```json
     {
       "success": true,
       "task": {
         "id": 1,
         "title": "Menyelesaikan proyek TaskMaster",
         "description": "Implementasikan fitur CRUD",
         "priority": "high",
         "due_date": "2023-12-31",
         "completed": 0
       }
     }
     ```

3. **POST /api/tasks.php**
   - Deskripsi: Membuat tugas baru
   - Body:
     ```json
     {
       "title": "Tugas baru",
       "description": "Deskripsi tugas",
       "priority": "medium",
       "due_date": "2023-12-31"
     }
     ```
   - Contoh Response:
     ```json
     {
       "success": true,
       "message": "Tugas berhasil ditambahkan",
       "task_id": 2
     }
     ```

4. **PUT /api/tasks.php**
   - Deskripsi: Mengedit tugas yang ada
   - Body:
     ```json
     {
       "id": 1,
       "title": "Judul tugas yang diedit",
       "description": "Deskripsi yang diperbarui",
       "priority": "high",
       "due_date": "2024-01-15"
     }
     ```
   - Contoh Response:
     ```json
     {
       "success": true,
       "message": "Tugas berhasil diperbarui"
     }
     ```

5. **PATCH /api/tasks.php**
   - Deskripsi: Memperbarui status tugas (selesai/belum)
   - Body:
     ```json
     {
       "id": 1,
       "completed": true
     }
     ```
   - Contoh Response:
     ```json
     {
       "success": true,
       "message": "Status tugas berhasil diperbarui"
     }
     ```

6. **DELETE /api/tasks.php?id={task_id}**
   - Deskripsi: Menghapus tugas
   - Parameter: `id` (ID tugas)
   - Contoh Response:
     ```json
     {
       "success": true,
       "message": "Tugas berhasil dihapus"
     }
     ```

## 🧑‍💻 Cara Penggunaan

### Menambahkan Tugas
1. Isi judul tugas di kolom "Judul tugas..."
2. (Opsional) Isi deskripsi tugas
3. Pilih prioritas tugas (Rendah, Sedang, Tinggi)
4. (Opsional) Atur tenggat waktu
5. Klik tombol "Tambah Tugas"

### Mengedit Tugas
1. Klik tombol edit (ikon pensil) di sebelah kanan tugas
2. Ubah informasi yang diinginkan di modal yang muncul
3. Klik "Simpan Perubahan"

### Menghapus Tugas
1. Klik tombol hapus (ikon tempat sampah) di sebelah kanan tugas
2. Konfirmasi penghapusan pada dialog yang muncul

### Menandai Tugas Selesai
- Klik checkbox di sebelah kiri tugas

### Pencarian dan Filter
- Gunakan kotak pencarian untuk mencari tugas berdasarkan judul atau deskripsi
- Gunakan dropdown filter untuk menyaring tugas berdasarkan status (Semua, Aktif, Selesai)
- Gunakan dropdown prioritas untuk menyaring tugas berdasarkan prioritas (Semua, Rendah, Sedang, Tinggi)

## 📱 Responsif

Aplikasi ini didesain untuk tampil dengan baik di berbagai perangkat:
- Desktop (1024px dan lebih besar)
- Tablet (768px - 1023px)
- Mobile (hingga 767px)

## 🔨 Pengembangan Lanjutan

Beberapa fitur yang dapat ditambahkan untuk pengembangan selanjutnya:

- Sistem autentikasi pengguna (login/register)
- Kategori/label untuk tugas
- Notifikasi pengingat tenggat waktu
- Ekspor data tugas (PDF, CSV)
- Tema gelap (dark mode)
- Sinkronisasi tugas dengan layanan kalender
- Fitur subtask (tugas bersarang)

## 📄 Lisensi

[MIT License](LICENSE)

## 👨‍💻 Kredit

Dikembangkan oleh Firdausnova

---

© 2025 TaskMaster. Seluruh hak cipta dilindungi undang-undang.
