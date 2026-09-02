# Website Marketing Perumahan

Website satu halaman (landing page) siap pakai untuk pemasaran perumahan.
HTML/CSS/JS murni — **tanpa** framework, tanpa build tool, tanpa database.
Cukup upload foldernya ke hosting mana pun dan langsung jalan.

```
site/
├─ index.html                 struktur halaman
├─ assets/css/style.css       tampilan
├─ data/site.json        ← SEMUA DATA ADA DI SINI (yang perlu Anda ubah)
├─ assets/js/main.js          logika: render, filter, kalkulator, WhatsApp
└─ assets/img/                gambar (saat ini masih placeholder)
```

---

## 1. Yang WAJIB diubah lebih dulu

Buka `data/site.json`, ubah baris berikut:

```js
whatsapp: "6281234567890",
```

Format nomor: **kode negara tanpa tanda `+` dan tanpa angka `0` di depan.**

| Nomor Anda      | Ditulis jadi     |
|-----------------|------------------|
| 0812-3456-7890  | `6281234567890`  |
| 0857 1111 2222  | `6285711112222`  |

Kalau salah format, semua tombol WhatsApp tidak akan terbuka.
Setelah itu ubah juga `namaAgen`, `brand.nama`, `alamat`, dan `email` di file yang sama.

---

## 2. Cara kerja tombol WhatsApp

Semua tombol memakai API resmi klik-untuk-chat WhatsApp:

```
https://wa.me/6281234567890?text=pesan%20otomatis
```

Pelanggan **tidak perlu menyimpan nomor Anda** — begitu diklik, aplikasi WhatsApp
langsung terbuka dengan pesan yang sudah terisi. Ada 8 titik masuk ke WhatsApp:

1. Tombol di menu atas
2. Tombol utama di hero
3. Tombol "Tanya Unit Ini" di setiap kartu unit
4. Tombol di dalam popup detail unit — otomatis menyebut nama & harga unit
5. Tombol "Jadwalkan Survei" di bagian lokasi
6. Tombol "Kirim Simulasi Ini" di kalkulator KPR — mengirim hasil hitungan lengkap
7. Form kontak — menyusun pesan rapi berisi nama, nomor, unit, dan rencana pembayaran
8. Tombol melayang + bar bawah khusus layar HP

Teks pesannya bisa Anda ubah di `pesanWa` dalam `data/site.json`.
Tanda `{unit}`, `{harga}`, `{dp}`, `{tenor}`, `{angsuran}` akan diganti otomatis oleh sistem.

---

## 3. Memasang video YouTube

Salin **link videonya apa adanya**, tempel ke `data/site.json`:

```js
youtube: [
  { link: "https://www.youtube.com/watch?v=AbCdEfGhIjK", judul: "House Tour Tipe Tulip", durasi: "8:24" },
],
```

Semua bentuk link diterima — `youtube.com/watch?v=...`, `youtu.be/...`,
`youtube.com/shorts/...`, link dari HP yang ada embel-embel `&t=30s`, semuanya
otomatis dibaca. `judul` dan `durasi` Anda tulis sendiri.

Thumbnail diambil otomatis dari YouTube, dan videonya baru dimuat saat diklik —
supaya halaman tetap ringan dibuka lewat kuota.

## 4. Memasang video TikTok

```js
tiktok: [
  {
    link:   "https://www.tiktok.com/@putrirz_i/video/7666504449346522375",
    judul:  "Cicilan 1 jutaan, rumah 2 lantai",
    sampul: "assets/img/tiktok-1.jpg"
  },
],
```

**Wajib pakai link PANJANG** — yang memuat `/video/` atau `/photo/`.

Link pendek (`vt.tiktok.com/ZSxxxx`) tidak bisa diputar di dalam halaman.
Sebabnya: untuk membacanya, halaman harus bertanya dulu ke server TikTok, dan
TikTok sering menolak pertanyaan dari website lain (aturan keamanan browser
bernama CORS). Kalau link pendek tetap dipakai, kartunya masih tampil rapi tapi
hanya bisa diklik untuk membuka aplikasi TikTok.

Cara mendapat link panjang: buka TikTok di browser laptop, klik videonya, salin
alamat di kolom atas. Atau tempel link pendek ke browser, buka, lalu salin
alamat yang muncul.

### Sampul kartu

`sampul` menunjuk ke file gambar di `assets/img/`. Sampul untuk empat video yang
ada sekarang sudah diunduh dari TikTok dan disimpan lokal — supaya tampil cepat,
tidak bergantung pada izin TikTok, dan tidak pernah kedaluwarsa. (Link sampul
langsung dari TikTok hanya berlaku sekitar dua hari.)

Untuk video baru, ada dua pilihan:

1. **Kirim linknya ke Claude** — sampulnya akan diunduhkan dan dipasang.
2. **Pakai gambar sendiri** — simpan di `assets/img/`, lalu tulis namanya di
   `sampul`. Ukuran ideal tegak 9:16, lebar sekitar 640 piksel.

Kalau `sampul` dikosongkan, halaman akan mencoba mengambilnya otomatis dari
TikTok. Cara ini kadang berhasil kadang tidak (tergantung TikTok mengizinkan
atau tidak), jadi jangan diandalkan untuk video penting.

Syarat lain: video harus **publik**. Video Duet dan Stitch sering ditolak.

### Kembali ke sampul setelah menonton

Supaya penonton tidak terlanjur ditawari video orang lain oleh TikTok, kartu
bisa dikembalikan ke sampulnya lewat empat cara:

1. Menekan tombol **✕** di pojok kanan atas video
2. Menekan tombol **Esc** di keyboard
3. Memutar kartu lain — kartu sebelumnya otomatis kembali ke sampul
4. Menggulir sampai kartunya keluar layar — otomatis kembali juga

Video dibuka **besar di tengah layar**, bukan di dalam kartu. Sebabnya pemutar
TikTok minta lebar minimal ± 325px sedangkan kartu di barisan hanya ± 277px —
di ruang sesempit itu videonya pasti terpotong.

Menutupnya: tombol **✕**, tombol **Esc**, atau klik area gelap di sekitarnya.
Kartunya sendiri tidak pernah diubah, jadi begitu ditutup sampulnya sudah ada
di tempatnya.

### Dua batasan pemutar TikTok

Selama memakai pemutar resmi TikTok, dua hal ini tidak bisa diubah dari sini:

1. **Harus dua kali klik** — sekali di kartu, sekali lagi di tombol play milik
   TikTok. Itu cara TikTok menghitung penonton.
2. **Tidak bisa kembali sendiri saat video habis** — TikTok tidak memberi tahu
   website luar kapan videonya selesai.

### Cara menghilangkan kedua batasan itu: pakai file video sendiri

Kalau suatu saat ingin mencobanya: buat folder `assets/video/`, simpan file
videonya di situ, lalu sebut namanya di config:

```js
{
  link:   "https://www.tiktok.com/@putrirz_i/video/7666504449346522375",
  judul:  "Cicilan 1 jutaan, rumah 2 lantai",
  sampul: "assets/img/tiktok-1.jpg",
  video:  "assets/video/tiktok-1.mp4"
}
```

Begitu `video` diisi, halaman memutar sendiri filenya:

- **sekali klik langsung jalan**, tanpa tombol play kedua
- **habis videonya, otomatis kembali ke sampul**
- tidak ada tawaran video orang lain sama sekali
- tetap ada tautan "Tonton di TikTok" di bawah video, supaya penonton bisa
  mampir ke akun Anda untuk like dan follow

Cara mendapat filenya: buka video Anda di aplikasi TikTok, tekan **Bagikan →
Simpan video**. Sebaiknya file dikecilkan dulu (idealnya di bawah 5 MB per
video) supaya pengunjung berkuota tipis tidak keberatan.

## 5. Peta lokasi

Google Maps → cari lokasi → **Bagikan** → tab **Sematkan peta** → salin URL di dalam
`src="..."`, lalu tempel ke `lokasi.embedMaps` di `data/site.json`.

---

## 6. Mengganti foto

Ganti file di `assets/img/` dengan foto asli (boleh `.jpg` / `.webp`), lalu sesuaikan
nama filenya di `data/site.json`:

| Ganti dengan                          | Ukuran ideal    | Dipakai di          |
|---------------------------------------|-----------------|---------------------|
| `hero.jpg`                            | 1200 × 1000 px  | Gambar utama atas   |
| `unit-1.jpg` … `unit-6.jpg`           | 1200 × 825 px   | Kartu tipe unit     |
| `agen.jpg`                            | 400 × 400 px    | Foto Anda           |

Kompres dulu di [squoosh.app](https://squoosh.app) sampai di bawah ~300 KB per foto
supaya website tetap cepat dibuka lewat kuota internet.

---

## 7. Menambah atau menghapus tipe unit

Salin satu blok di dalam `unit: [ ... ]`, lalu ubah isinya. Tombol filter
("Subsidi / Komersil / Premium / Ruko") dibuat **otomatis** dari isi `kategori`,
jadi kategori baru langsung muncul sendiri sebagai tombol filter.

---

## 8. Cara mengunggah ke internet

**Paling gampang — Netlify (gratis, 2 menit):**
1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. Seret folder `site` ke halaman itu
3. Selesai — situs langsung online. Domain sendiri bisa dipasang di menu *Domain settings*.

**Hosting biasa (cPanel):** upload seluruh isi folder `site` ke `public_html`.

**Cek dulu di komputer sendiri:** jalankan perintah ini di dalam folder `site`,
lalu buka `http://localhost:4399`

```bash
python3 -m http.server 4399
```

> Membuka `index.html` dengan klik dua kali juga bisa, tapi embed TikTok kadang
> tidak muncul karena aturan keamanan browser. Pakai cara di atas untuk hasil akurat.

---

## 9. Sudah termasuk di dalamnya

- Tampilan responsif — rapi di HP, tablet, dan desktop
- Bar aksi cepat di bawah layar HP (Tipe Unit · Simulasi · WhatsApp)
- Kalkulator KPR metode anuitas, hasilnya bisa langsung dikirim ke WhatsApp
- Katalog unit dengan filter kategori dan popup detail spesifikasi
- Galeri YouTube & TikTok dengan pemuatan tunda (halaman tetap ringan)
- Bagian keunggulan, lokasi, testimoni, promo, dan FAQ
- SEO: judul, deskripsi, Open Graph untuk pratinjau saat dibagikan di WhatsApp,
  serta data terstruktur `RealEstateAgent` supaya harga unit bisa tampil di Google
- Bisa diakses keyboard, mendukung *reduced motion*, tanpa pelacak pihak ketiga

## 10. Saran lanjutan (opsional)

- Pasang **Meta Pixel** atau **Google Analytics** untuk melacak berapa orang menekan
  tombol WhatsApp — berguna kalau nanti beriklan di Facebook/Instagram Ads.
- Siapkan **brosur PDF** dan taruh di `assets/`, lalu tambahkan tombol unduh.
- Kalau nanti butuh banyak halaman (satu halaman per klaster), struktur ini
  gampang digandakan: salin `index.html`, ubah bagian yang perlu.

---

# Mengubah isi lewat Menu Admin

Setelah website dipasang di Netlify, Anda tidak perlu lagi menyentuh file.
Buka `alamat-website-anda/admin`, login, ubah isinya lewat formulir, tekan
**Publish** — website langsung ter-update sendiri.

Menu admin memuat seluruh isi website: identitas, kontak, pesan otomatis
WhatsApp, tampilan atas, keunggulan, tipe unit, video YouTube & TikTok, lokasi,
kalkulator KPR, testimoni, tanya jawab, dan promo.

## Cara memasangnya (sekali saja)

Butuh dua akun gratis: **GitHub** dan **Netlify**.

### 1. Naikkan ke GitHub

Buat repositori baru di github.com (boleh private), lalu di Terminal dari
folder ini jalankan perintah yang ditunjukkan GitHub, kira-kira:

```
git remote add origin https://github.com/NAMA-ANDA/NAMA-REPO.git
git push -u origin main
```

### 2. Sambungkan ke Netlify

1. Masuk ke netlify.com, pilih **Add new site → Import an existing project**
2. Pilih GitHub, lalu pilih repositori tadi
3. Bagian build biarkan kosong, publish directory diisi titik: `.`
4. Tekan **Deploy**

### 3. Nyalakan pintu login

Di dashboard Netlify, pada situs tersebut:

1. **Site configuration → Identity → Enable Identity**
2. Masih di Identity: **Registration → Invite only**
   (wajib, supaya orang lain tidak bisa mendaftar sendiri)
3. **Services → Git Gateway → Enable Git Gateway**
4. Tab **Identity → Invite users**, masukkan email Anda

Cek email undangannya, buat kata sandi, dan Anda akan langsung diarahkan ke
menu admin.

## Catatan penting

**Isi website sekarang ada di `data/site.json`**, bukan lagi di file
JavaScript. File itu tetap boleh diubah manual dengan editor teks, tapi kalau
sudah pakai menu admin sebaiknya lewat menu saja supaya tidak bentrok.

**Halaman ini harus dibuka lewat alamat http://**, tidak bisa dengan klik ganda
`index.html` dari Finder — karena isinya diambil dari file JSON terpisah. Untuk
melihat di komputer sendiri, jalankan `python3 preview-lokal.py`.

**Jangan hapus folder `admin/`** saat mengunggah ke hosting. Isinya hanya dua
file kecil dan tidak berisi kata sandi apa pun — pengamanannya ada di Netlify,
bukan di file.
