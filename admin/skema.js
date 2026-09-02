/* =========================================================================
   DAFTAR KOLOM MENU ADMIN
   File ini menentukan formulir apa saja yang muncul di menu admin dan
   bagaimana tampilannya. Kalau nanti ada data baru di website, tambahkan
   keterangannya di sini — formulirnya akan muncul dengan sendirinya.

   Jenis kolom: teks | panjang | angka | gambar | daftarTeks | daftar | grup
   ========================================================================= */
window.SKEMA = [
  {
    kunci: "brand", label: "Identitas Perumahan", ikon: "🏡", jenis: "grup",
    isi: [
      { kunci: "nama",          label: "Nama Perumahan",       jenis: "teks" },
      { kunci: "tagline",       label: "Slogan",               jenis: "teks" },
      { kunci: "developer",     label: "Nama Developer",       jenis: "teks" },
      { kunci: "logoTeks",      label: "Inisial Logo",         jenis: "teks", bantuan: "2 huruf, mis. GH" },
      { kunci: "lokasiSingkat", label: "Kota",                 jenis: "teks", bantuan: "Tampil di bar paling atas" }
    ]
  },
  {
    kunci: "kontak", label: "Kontak & WhatsApp", ikon: "💬", jenis: "grup",
    isi: [
      { kunci: "whatsapp",  label: "Nomor WhatsApp", jenis: "teks", wajib: true,
        bantuan: "Diawali 62, tanpa tanda + dan tanpa 0. Contoh: 62895634938872",
        pola: "^62[0-9]{8,15}$", pesanSalah: "Harus diawali 62 lalu angka saja, tanpa spasi atau strip." },
      { kunci: "namaAgen",      label: "Nama Anda",        jenis: "teks", wajib: true },
      { kunci: "jabatan",       label: "Jabatan",          jenis: "teks" },
      { kunci: "fotoAgen",      label: "Foto Anda",        jenis: "gambar" },
      { kunci: "telepon",       label: "Nomor Ditampilkan", jenis: "teks", bantuan: "Boleh pakai strip, mis. 0895-6349-38872" },
      { kunci: "email",         label: "Email",            jenis: "teks" },
      { kunci: "alamat",        label: "Alamat Kantor",    jenis: "panjang" },
      { kunci: "jamKerja",      label: "Jam Kerja",        jenis: "teks" },
      { kunci: "instagram",     label: "Link Instagram",   jenis: "teks" },
      { kunci: "tiktokProfil",  label: "Link Profil TikTok", jenis: "teks" },
      { kunci: "youtubeProfil", label: "Link Channel YouTube", jenis: "teks" }
    ]
  },
  {
    kunci: "pesanWa", label: "Pesan Otomatis WhatsApp", ikon: "✉️", jenis: "grup",
    catatan: "Pesan yang sudah terisi otomatis saat calon pembeli menekan tombol WhatsApp.",
    isi: [
      { kunci: "umum",   label: "Tombol umum",        jenis: "panjang" },
      { kunci: "unit",   label: "Tombol di kartu unit", jenis: "panjang", bantuan: "{unit} dan {harga} otomatis diganti" },
      { kunci: "survei", label: "Tombol survei",      jenis: "panjang" },
      { kunci: "kpr",    label: "Hasil simulasi KPR", jenis: "panjang" }
    ]
  },
  {
    kunci: "hero", label: "Tampilan Paling Atas", ikon: "⭐", jenis: "grup",
    isi: [
      { kunci: "label",     label: "Label kecil",         jenis: "teks" },
      { kunci: "judul1",    label: "Judul baris 1",       jenis: "teks" },
      { kunci: "judul2",    label: "Judul baris 2 (miring)", jenis: "teks" },
      { kunci: "deskripsi", label: "Paragraf pembuka",    jenis: "panjang" },
      { kunci: "gambar",    label: "Gambar utama",        jenis: "gambar" },
      { kunci: "statistik", label: "Angka Statistik",     jenis: "daftar", ringkas: "label",
        isi: [
          { kunci: "angka",   label: "Angka",      jenis: "angka" },
          { kunci: "akhiran", label: "Satuan",     jenis: "teks", bantuan: "mis. Ha, +, %" },
          { kunci: "label",   label: "Keterangan", jenis: "teks" }
        ] }
    ]
  },
  { kunci: "trustBadges", label: "Baris Kepercayaan", ikon: "✅", jenis: "daftarTeks",
    catatan: "Tulisan pendek yang berjajar di bawah tombol utama." },
  {
    kunci: "keunggulan", label: "Keunggulan", ikon: "💎", jenis: "daftar", ringkas: "judul",
    isi: [
      { kunci: "ikon",  label: "Ikon", jenis: "pilihan",
        pilihan: ["shield","road","leaf","lock","wallet","building","home","clock","pin","check"] },
      { kunci: "judul", label: "Judul",      jenis: "teks" },
      { kunci: "teks",  label: "Penjelasan", jenis: "panjang" }
    ]
  },
  {
    kunci: "unit", label: "Tipe Unit & Harga", ikon: "🏘️", jenis: "daftar", ringkas: "nama",
    isi: [
      { kunci: "nama",      label: "Nama Tipe", jenis: "teks", wajib: true },
      { kunci: "kategori",  label: "Kategori",  jenis: "pilihan", pilihan: ["Subsidi","Komersil","Premium","Ruko"] },
      { kunci: "status",    label: "Status",    jenis: "teks", bantuan: "mis. Ready Stock, Indent 8 Bulan" },
      { kunci: "harga",     label: "Harga (angka)", jenis: "angka", wajib: true,
        bantuan: "Angka saja tanpa titik. Dipakai kalkulator KPR. Contoh: 285000000" },
      { kunci: "hargaTeks", label: "Harga (tulisan)", jenis: "teks", bantuan: "Contoh: Rp 285 Juta" },
      { kunci: "cicilan",   label: "Cicilan (tulisan)", jenis: "teks" },
      { kunci: "lb",        label: "Luas Bangunan (m²)", jenis: "angka" },
      { kunci: "lt",        label: "Luas Tanah (m²)",    jenis: "angka" },
      { kunci: "kt",        label: "Kamar Tidur",  jenis: "angka" },
      { kunci: "km",        label: "Kamar Mandi",  jenis: "angka" },
      { kunci: "lantai",    label: "Jumlah Lantai", jenis: "angka" },
      { kunci: "carport",   label: "Carport",      jenis: "angka" },
      { kunci: "gambar",    label: "Foto Unit",    jenis: "gambar" },
      { kunci: "badge",     label: "Label Sudut",  jenis: "teks", bantuan: "mis. TERLARIS. Kosongkan kalau tidak perlu" },
      { kunci: "unggulan",  label: "Poin Unggulan", jenis: "daftarTeks" },
      { kunci: "spek",      label: "Spesifikasi Bangunan", jenis: "daftarTeks" }
    ]
  },
  {
    kunci: "youtube", label: "Video YouTube", ikon: "▶️", jenis: "daftar", ringkas: "judul",
    isi: [
      { kunci: "link",   label: "Link Video", jenis: "teks", bantuan: "Tempel link apa adanya, mis. https://youtu.be/xxxx" },
      { kunci: "judul",  label: "Judul Kartu", jenis: "teks" },
      { kunci: "durasi", label: "Durasi", jenis: "teks", bantuan: "mis. 8:24" }
    ]
  },
  {
    kunci: "tiktok", label: "Video TikTok", ikon: "🎵", jenis: "daftar", ringkas: "judul",
    catatan: "Pakai link panjang yang memuat /video/ atau /photo/. Link pendek vt.tiktok.com tidak bisa diputar di halaman.",
    isi: [
      { kunci: "link",   label: "Link Video", jenis: "teks" },
      { kunci: "judul",  label: "Judul Kartu", jenis: "teks" },
      { kunci: "sampul", label: "Gambar Sampul", jenis: "gambar" }
    ]
  },
  {
    kunci: "lokasi", label: "Lokasi & Peta", ikon: "📍", jenis: "grup",
    isi: [
      { kunci: "embedMaps", label: "Alamat Peta", jenis: "panjang",
        bantuan: "Google Maps → Share → Embed a map → salin isi src" },
      { kunci: "linkMaps",  label: "Link Tombol Buka Maps", jenis: "teks" },
      { kunci: "sekitar",   label: "Akses & Fasilitas Sekitar", jenis: "daftar", ringkas: "tempat",
        isi: [
          { kunci: "menit",  label: "Jarak Waktu", jenis: "teks", bantuan: "mis. 10 mnt" },
          { kunci: "tempat", label: "Nama Tempat", jenis: "teks" }
        ] }
    ]
  },
  {
    kunci: "kpr", label: "Kalkulator KPR", ikon: "🧮", jenis: "grup",
    catatan: "Nilai awal yang tampil sebelum pengunjung menggeser sendiri.",
    isi: [
      { kunci: "dpPersen",    label: "DP (%)",            jenis: "angka" },
      { kunci: "tenorTahun",  label: "Tenor (tahun)",     jenis: "angka" },
      { kunci: "bungaPersen", label: "Bunga per tahun (%)", jenis: "angka" }
    ]
  },
  {
    kunci: "testimoni", label: "Testimoni", ikon: "💬", jenis: "daftar", ringkas: "nama",
    isi: [
      { kunci: "nama", label: "Nama",       jenis: "teks" },
      { kunci: "info", label: "Keterangan", jenis: "teks", bantuan: "mis. Pembeli Tipe Melati" },
      { kunci: "teks", label: "Isi Testimoni", jenis: "panjang" }
    ]
  },
  {
    kunci: "faq", label: "Tanya Jawab", ikon: "❓", jenis: "daftar", ringkas: "t",
    isi: [
      { kunci: "t", label: "Pertanyaan", jenis: "teks" },
      { kunci: "j", label: "Jawaban",    jenis: "panjang" }
    ]
  },
  {
    kunci: "promo", label: "Promo", ikon: "🎁", jenis: "grup",
    isi: [
      { kunci: "judul",   label: "Judul Promo",   jenis: "teks" },
      { kunci: "daftar",  label: "Daftar Promo",  jenis: "daftarTeks" },
      { kunci: "catatan", label: "Catatan Kecil", jenis: "teks" }
    ]
  }
];
