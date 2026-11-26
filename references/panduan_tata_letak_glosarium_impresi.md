# Panduan Tata Letak Website Penjelasan Impresi

## 1. Tujuan Halaman

Halaman ini merupakan **glosarium impresi** untuk penelitian *Survey Impresi Lukisan Budaya Indonesia*. Pengunjung dapat melihat seluruh impresi yang digunakan dalam penelitian, lalu memilih impresi tertentu untuk membaca makna kuratorial, kata kunci atau asosiasi visual, serta perbedaannya dengan kata yang serupa.

Tampilan menggunakan gaya visual yang konsisten dengan halaman survei, terutama tombol impresi berbentuk **glass button**.

## 2. Alur Tampilan Halaman

Halaman memiliki dua keadaan utama:

1. **Belum ada impresi dipilih:** hanya tampilkan daftar seluruh impresi penelitian.
2. **Satu impresi dipilih:** tampilkan panel detail impresi dengan struktur seperti gambar referensi. Daftar impresi tetap dapat digunakan untuk memilih impresi lain.

### Keadaan A — belum ada impresi dipilih

Saat halaman pertama kali dibuka, jangan tampilkan panel detail atau kotak informasi impresi. Bagian yang terlihat hanya satu area berjudul **“Impresi pada penelitian ini”**, yang berisi semua impresi dalam bentuk glass button.

```text
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Impresi pada penelitian ini                                  │
│                                                               │
│  [ Tenang ] [ Bahagia ] [ Sedih ] [ ... ]                     │
│  [ ... ]    [ ... ]     [ ... ]                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Diagram hanya menggambarkan susunan elemen. Contoh nama impresi di atas bukan daftar lengkap atau sumber data final.

**Ketentuan tampilan:**

- Judul bagian harus persis **“Impresi pada penelitian ini”**, bukan “Pencarian populer”.
- Tampilkan keseluruhan impresi yang digunakan dalam penelitian.
- Setiap impresi ditampilkan sebagai tombol/chip dengan gaya glass seperti tombol impresi pada *survey page*.
- Tombol memiliki jarak yang konsisten dan membungkus ke baris berikutnya sesuai lebar layar.
- Jangan tampilkan panel detail, makna kuratorial, kata kunci, atau perbedaan kata pada keadaan awal.
- Gunakan daftar impresi yang sama dengan sumber data yang dipakai oleh survey page agar nama dan jumlah impresi konsisten.

## 3. Keadaan B — impresi dipilih

Saat pengunjung mengeklik salah satu tombol impresi, tampilkan area informasi untuk impresi tersebut. Gunakan struktur visual dari gambar referensi berikut.

```text
┌───────────────────────────────────────────────────────────────┐
│  [ Ketenangan & Batin ]                       IMPRESI #1       │
│                                                               │
│  Tenang                                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ MAKNA KURATORIAL:                                       │  │
│  │ Memberi kesan damai, tenteram, stabil, dan tidak       │  │
│  │ tergesa-gesa.                                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ◇ KATA KUNCI & ASOSIASI VISUAL:                              │
│  [#damai] [#tenteram] [#stabil] [#hening] [#teduh]             │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ✧ Perbedaan dengan Kata Serupa:                         │  │
│  │                                                         │  │
│  │ Tenang vs. Sabar                                        │  │
│  │ • Tenang: ...                                           │  │
│  │ • Sabar: ...                                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

Konten di dalam diagram merupakan contoh dari gambar referensi. Untuk impresi lain, semua isi harus mengikuti data dan penjelasan yang sesuai dengan impresi yang dipilih.

### 3.1. Header detail

- Letakkan panel kategori impresi di kiri atas, misalnya **“Ketenangan & Batin”**.
- Letakkan nomor impresi di kanan atas, misalnya **“IMPRESI #1”**.
- Tampilkan nama impresi sebagai judul utama berukuran besar, misalnya **“Tenang”**.
- Gunakan jarak yang cukup antara header dan kartu makna kuratorial.
- Kategori dan nomor impresi merupakan informasi pendukung, sehingga ukurannya lebih kecil daripada nama impresi.

### 3.2. Kartu makna kuratorial

- Tampilkan dalam panel berwarna netral yang lembut, dengan sudut membulat dan garis tepi tipis.
- Label **“MAKNA KURATORIAL:”** menggunakan huruf tebal dan warna abu-abu.
- Makna impresi ditampilkan di bawah label dengan ukuran teks yang nyaman dibaca.
- Teks dapat membungkus otomatis menjadi beberapa baris.
- Isi kartu berubah sesuai impresi yang dipilih.

### 3.3. Kata kunci dan asosiasi visual

- Letakkan bagian ini setelah kartu makna kuratorial.
- Gunakan ikon tag di samping label **“KATA KUNCI & ASOSIASI VISUAL:”**.
- Kata kunci ditampilkan sebagai chip kecil dengan latar putih atau transparan, garis tepi tipis, sudut membulat, dan teks abu-abu.
- Beri jarak konsisten di antara chip.
- Chip berisi kata atau asosiasi yang relevan dengan impresi terpilih, misalnya `#damai`, `#tenteram`, `#stabil`, `#hening`, dan `#teduh`.
- Jika jumlah kata kunci banyak, biarkan chip pindah ke baris berikutnya.

### 3.4. Kartu perbedaan dengan kata serupa

- Pada **layar desktop atau layar yang masih cukup lebar**, letakkan kartu ini **di samping konten utama detail impresi**, bukan selalu di bawahnya. Gunakan tata letak dua kolom: kolom utama berisi makna kuratorial dan kata kunci/asosiasi visual, sedangkan kolom samping berisi perbedaan dengan kata serupa.
- Pada layar sempit atau ponsel, pindahkan kartu ini ke bawah konten utama agar setiap bagian tetap cukup lebar dan mudah dibaca.
- Gunakan latar krem atau kuning sangat pucat dan garis tepi kuning-oranye tipis.
- Sudut panel membulat.
- Di bagian atas, tampilkan ikon dekoratif kecil dan judul **“Perbedaan dengan Kata Serupa:”**.
- Tampilkan pasangan kata sebagai subjudul tebal, misalnya **“Tenang vs. Sabar”**.
- Jelaskan masing-masing kata secara terpisah dalam bentuk poin.
- Tebalkan nama kata sebelum penjelasannya agar perbandingan mudah dipindai.
- Isi perbandingan harus spesifik untuk impresi yang dipilih. Jangan selalu menggunakan pasangan “Tenang vs. Sabar” untuk semua impresi.
- Pastikan dua kolom tidak menjadi terlalu sempit. Jika ruang tidak cukup, gunakan susunan satu kolom.

## 4. Hubungan Antara Daftar Impresi dan Panel Detail

Daftar impresi merupakan navigasi utama glosarium.

- Ketika halaman dibuka, tidak ada impresi yang dipilih secara otomatis.
- Klik tombol impresi akan memilih impresi tersebut dan menampilkan detailnya.
- Detail yang ditampilkan harus sesuai dengan tombol yang dipilih, termasuk nama, nomor, kategori, makna kuratorial, kata kunci, dan perbedaan dengan kata serupa.
- Pengunjung dapat memilih tombol lain untuk mengganti detail yang sedang ditampilkan.
- Gunakan penanda visual yang konsisten pada tombol impresi yang sedang dipilih.
- Jangan mengubah nama impresi atau membuat data penjelasan baru hanya untuk keperluan tampilan.

**Urutan bagian setelah impresi dipilih:**

1. Panel detail impresi berada di bagian atas halaman.
2. Bagian **“Impresi pada penelitian ini”** beserta seluruh glass button berada di bawah panel detail.

Dengan urutan ini, pengunjung langsung melihat penjelasan impresi yang dipilih, tetapi tetap dapat menemukan dan memilih impresi lain pada bagian bawah halaman.

## 5. Gaya Visual

| Elemen | Arahan tampilan |
|---|---|
| Latar halaman | Putih atau warna netral yang sangat terang |
| Panel utama | Putih, dengan garis tepi abu-abu lembut |
| Tombol impresi | Glass button, mengikuti desain survey page |
| Label kategori | Chip dengan latar warna lembut |
| Nomor impresi | Abu-abu, huruf tebal, bergaya label kecil |
| Judul nama impresi | Besar, dominan, menggunakan serif seperti referensi |
| Kartu makna | Latar netral pucat dan sudut membulat |
| Label bagian | Abu-abu, huruf tebal, dapat menggunakan huruf kapital |
| Chip kata kunci | Latar putih/transparan dan garis tepi tipis |
| Kartu perbedaan | Latar krem pucat dan garis tepi kuning-oranye |
| Teks isi | Gelap dengan kontras yang mudah dibaca |

Jaga agar tampilan tidak terlalu ramai. Hierarki yang paling menonjol adalah **nama impresi**, diikuti makna kuratorial, kata kunci, lalu perbedaan dengan kata serupa.

## 6. Perilaku Responsif

- Pada layar lebar, gunakan dua kolom di dalam panel detail: konten utama di satu sisi dan kartu “Perbedaan dengan Kata Serupa” di sisi lainnya.
- Letakkan bagian “Impresi pada penelitian ini” di bawah panel detail saat sebuah impresi telah dipilih.
- Jika lebar layar tidak cukup untuk dua kolom yang nyaman, susun kartu perbedaan di bawah konten utama.
- Pada layar kecil, kurangi padding tanpa membuat teks menempel pada tepi.
- Header kategori dan nomor impresi harus tetap terbaca; jika ruang sempit, izinkan keduanya berpindah baris.
- Nama impresi dan penjelasan harus membungkus otomatis.
- Chip impresi dan kata kunci harus dapat membungkus ke beberapa baris.
- Kartu perbedaan harus mengikuti lebar kontainer dan tidak menyebabkan *horizontal overflow*.
- Pertahankan jarak antarbagian yang konsisten di desktop maupun perangkat seluler.

## 7. Ringkasan Spesifikasi

1. **Keadaan awal:** hanya tampilkan bagian “Impresi pada penelitian ini” beserta seluruh impresi sebagai glass button.
2. **Setelah tombol dipilih:** tampilkan panel detail di atas bagian “Impresi pada penelitian ini”.
3. **Tata letak detail:** pada desktop/layar lebar, letakkan “Perbedaan dengan Kata Serupa” di samping konten utama; pada layar sempit, letakkan di bawahnya.
4. **Navigasi:** pengunjung dapat memilih impresi lain dari daftar yang sama.
5. **Konsistensi:** gaya tombol mengikuti survey page dan data impresi menggunakan sumber data yang sama.
6. **Responsif:** semua panel dan kumpulan chip menyesuaikan lebar layar.

Dokumen ini berfokus pada tata letak dan perilaku tampilan yang diminta. Detail teknis implementasi, sumber data aktual, serta isi glosarium lengkap ditentukan oleh implementasi website dan data impresi yang tersedia.
