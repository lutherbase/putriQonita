/* =========================================================================
   MENU ADMIN
   Membaca dan menyimpan isi website ke Supabase. Formulirnya dibangun
   otomatis dari admin/skema.js, jadi menambah kolom baru cukup di sana.
   ========================================================================= */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const db = window.supabase.createClient(window.KONEKSI.url, window.KONEKSI.kunci);

  /* Sistem penyimpanan menuntut alamat email, sedangkan yang diketik cukup
     nama pengguna. Jadi nama pengguna dilengkapi sendiri dengan akhiran di
     bawah ini. Akhiran ini tidak pernah dikirimi surat dan tidak perlu
     diketahui pemakai — dia cukup mengetik "putri". */
  const AKHIRAN = "@akun.local";

  /* Terima dua-duanya: "putri" maupun "putri@akun.local" ditulis lengkap.
     Sering terjadi orang menyalin alamat lengkapnya dari panduan. */
  function keEmail(ketikan) {
    const t = String(ketikan || "").trim().toLowerCase();
    return t.includes("@") ? t : t + AKHIRAN;
  }
  const kePengguna = (email) => String(email || "").replace(AKHIRAN, "");

  let data = null;          // isi website yang sedang diedit
  let asli = "";            // salinan awal, untuk tahu ada perubahan atau tidak
  let aktif = 0;            // kelompok yang sedang dibuka
  let sesi = null;

  /* ------------------------------------------------------------------ */
  /* Pemberitahuan singkat                                               */
  /* ------------------------------------------------------------------ */
  let jamKabar;
  function kabar(teks, salah) {
    const el = $("#kabar");
    el.textContent = teks;
    el.classList.toggle("salah", !!salah);
    el.hidden = false;
    clearTimeout(jamKabar);
    jamKabar = setTimeout(() => { el.hidden = true; }, salah ? 6000 : 3000);
  }

  /* ------------------------------------------------------------------ */
  /* Masuk & keluar                                                      */
  /* ------------------------------------------------------------------ */
  $("#formMasuk").addEventListener("submit", async (e) => {
    e.preventDefault();
    const tbl = $("#tblMasuk"), galat = $("#masukGalat");
    galat.hidden = true;
    tbl.disabled = true; tbl.textContent = "Sedang masuk…";

    const { data: hasil, error } = await db.auth.signInWithPassword({
      email: keEmail($("#pengguna").value),
      password: $("#sandi").value
    });

    tbl.disabled = false; tbl.textContent = "Masuk";
    if (error) {
      galat.textContent = /invalid login/i.test(error.message)
        ? "Nama pengguna atau kata sandi salah. Coba periksa lagi."
        : "Gagal masuk: " + error.message;
      galat.hidden = false;
      return;
    }
    sesi = hasil.session;
    try {
      await mulaiAplikasi();
    } catch (e) {
      tunjukkanGagal("Berhasil masuk, tetapi isi website gagal dimuat: " + (e && e.message ? e.message : e));
    }
  });

  /* Tampilkan kegagalan DI LAYAR MASUK dan biarkan menetap — pemberitahuan
     yang hilang sendiri membuat orang mengira tidak terjadi apa-apa. */
  function tunjukkanGagal(teks) {
    const galat = $("#masukGalat");
    galat.textContent = teks;
    galat.hidden = false;
    $("#layarMasuk").hidden = false;
    $("#aplikasi").hidden = true;
  }

  $("#tblKeluar").addEventListener("click", async () => {
    if (adaPerubahan() && !confirm("Ada perubahan yang belum disimpan. Tetap keluar?")) return;
    await db.auth.signOut();
    location.reload();
  });

  /* ------------------------------------------------------------------ */
  /* Memuat data lalu membangun tampilan                                 */
  /* ------------------------------------------------------------------ */
  async function mulaiAplikasi() {
    const { data: baris, error } = await db.from("site_config").select("data, updated_at, updated_by").eq("id", 1).single();
    if (error) {
      tunjukkanGagal("Berhasil masuk, tetapi isi website gagal dibaca dari server: " +
        error.message + (error.hint ? " (" + error.hint + ")" : "") +
        ". Coba matikan pemblokir iklan lalu muat ulang halaman.");
      return;
    }
    if (!baris || !baris.data) {
      tunjukkanGagal("Berhasil masuk, tetapi datanya kosong di server. Hubungi pengelola website.");
      return;
    }

    data = baris.data;
    asli = JSON.stringify(data);

    $("#layarMasuk").hidden = true;
    $("#aplikasi").hidden = false;

    const inisial = (data.brand && data.brand.logoTeks) || "AD";
    $("#atasLogo").textContent = inisial;
    $("#atasNama").textContent = (data.brand && data.brand.nama) || "Menu Admin";
    $("#atasInfo").textContent = sesi && sesi.user ? kePengguna(sesi.user.email) : "";

    if (baris.updated_at) {
      const t = new Date(baris.updated_at);
      $("#simpanInfo").textContent = "Terakhir diubah " + t.toLocaleString("id-ID",
        { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    }

    bangunMenu();
    bukaKelompok(0);
  }

  function bangunMenu() {
    const sisi = $("#sisi");
    sisi.innerHTML = "";
    window.SKEMA.forEach((k, i) => {
      const b = document.createElement("button");
      b.innerHTML = '<span class="ikon">' + (k.ikon || "•") + "</span><span>" + k.label + "</span>";
      b.addEventListener("click", () => bukaKelompok(i));
      sisi.appendChild(b);
    });
  }

  function bukaKelompok(i) {
    aktif = i;
    Array.from($("#sisi").children).forEach((b, n) => b.classList.toggle("aktif", n === i));
    gambarIsi();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------------------------------------------------ */
  /* Membangun formulir dari skema                                       */
  /* ------------------------------------------------------------------ */
  function gambarIsi() {
    const k = window.SKEMA[aktif];
    const isi = $("#isi");
    isi.innerHTML = "<h2>" + k.label + "</h2>" + (k.catatan ? '<p class="catatan">' + k.catatan + "</p>" : "");

    if (k.jenis === "grup")           isi.appendChild(gambarGrup(k.isi, data[k.kunci]));
    else if (k.jenis === "daftarTeks") isi.appendChild(gambarDaftarTeks(data, k.kunci));
    else if (k.jenis === "daftar")     isi.appendChild(gambarDaftar(k, data[k.kunci]));
  }

  function gambarGrup(kolom, objek) {
    const wadah = document.createElement("div");
    kolom.forEach((kol) => {
      if (kol.jenis === "daftar")          wadah.appendChild(bungkus(kol, gambarDaftar(kol, objek[kol.kunci])));
      else if (kol.jenis === "daftarTeks") wadah.appendChild(bungkus(kol, gambarDaftarTeks(objek, kol.kunci)));
      else                                 wadah.appendChild(gambarKolom(kol, objek));
    });
    return wadah;
  }

  function bungkus(kol, isi) {
    const d = document.createElement("div");
    d.className = "kol";
    d.innerHTML = "<span>" + kol.label + "</span>";
    if (kol.bantuan) d.insertAdjacentHTML("beforeend", '<small class="bantuan">' + kol.bantuan + "</small>");
    d.appendChild(isi);
    return d;
  }

  /* satu kolom biasa: teks / panjang / angka / gambar / pilihan */
  function gambarKolom(kol, objek) {
    const bungkusan = document.createElement("label");
    bungkusan.className = "kol";
    bungkusan.innerHTML = "<span>" + kol.label + (kol.wajib ? " *" : "") + "</span>";

    let masukan;
    if (kol.jenis === "panjang") {
      masukan = document.createElement("textarea");
    } else if (kol.jenis === "pilihan") {
      masukan = document.createElement("select");
      kol.pilihan.forEach((p) => {
        const o = document.createElement("option");
        o.value = p; o.textContent = p;
        masukan.appendChild(o);
      });
    } else if (kol.jenis === "gambar") {
      return gambarKolomGambar(kol, objek);
    } else {
      masukan = document.createElement("input");
      masukan.type = kol.jenis === "angka" ? "number" : "text";
      if (kol.jenis === "angka") masukan.step = "any";
    }

    masukan.value = objek[kol.kunci] == null ? "" : objek[kol.kunci];
    masukan.addEventListener("input", () => {
      let nilai = masukan.value;
      if (kol.jenis === "angka") nilai = nilai === "" ? null : Number(nilai);
      objek[kol.kunci] = nilai;

      const sah = !kol.pola || !nilai || new RegExp(kol.pola).test(String(nilai));
      bungkusan.classList.toggle("is-salah", !sah);
      tandaiBerubah();
    });

    bungkusan.appendChild(masukan);
    if (kol.bantuan)   bungkusan.insertAdjacentHTML("beforeend", '<small class="bantuan">' + kol.bantuan + "</small>");
    if (kol.pesanSalah) bungkusan.insertAdjacentHTML("beforeend", '<small class="salah">' + kol.pesanSalah + "</small>");
    return bungkusan;
  }

  /* kolom gambar: bisa ketik alamat, bisa unggah dari HP/laptop */
  function gambarKolomGambar(kol, objek) {
    const d = document.createElement("div");
    d.className = "kol";
    d.innerHTML = "<span>" + kol.label + "</span>";

    const baris = document.createElement("div");
    baris.className = "gambar-kol";

    const pratinjau = document.createElement("img");
    pratinjau.className = "gambar-pratinjau";
    pratinjau.alt = "";
    const alamatGambar = (v) => (!v ? "" : /^https?:|^data:/.test(v) ? v : "../" + v);
    pratinjau.src = alamatGambar(objek[kol.kunci]);

    const kanan = document.createElement("div");
    kanan.className = "gambar-kanan";

    const teks = document.createElement("input");
    teks.type = "text";
    teks.value = objek[kol.kunci] || "";
    teks.style.width = "100%";
    teks.style.padding = "10px 12px";
    teks.style.border = "1px solid var(--garis)";
    teks.style.borderRadius = "9px";
    teks.addEventListener("input", () => {
      objek[kol.kunci] = teks.value;
      pratinjau.src = alamatGambar(teks.value);
      tandaiBerubah();
    });

    const berkas = document.createElement("input");
    berkas.type = "file";
    berkas.accept = "image/*";
    berkas.hidden = true;

    const tblUnggah = document.createElement("button");
    tblUnggah.type = "button";
    tblUnggah.className = "tbl tbl--kecil";
    tblUnggah.textContent = "Unggah gambar";
    tblUnggah.style.marginTop = "8px";
    tblUnggah.addEventListener("click", () => berkas.click());

    berkas.addEventListener("change", async () => {
      const f = berkas.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { kabar("Gambar terlalu besar. Maksimal 5 MB.", true); return; }

      tblUnggah.disabled = true; tblUnggah.textContent = "Mengunggah…";
      const nama = Date.now() + "-" + f.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
      const { error } = await db.storage.from("media").upload(nama, f, { upsert: false });
      tblUnggah.disabled = false; tblUnggah.textContent = "Unggah gambar";

      if (error) { kabar("Gagal mengunggah: " + error.message, true); return; }
      const { data: pub } = db.storage.from("media").getPublicUrl(nama);
      teks.value = pub.publicUrl;
      objek[kol.kunci] = pub.publicUrl;
      pratinjau.src = pub.publicUrl;
      tandaiBerubah();
      kabar("Gambar terunggah");
    });

    kanan.appendChild(teks);
    kanan.appendChild(tblUnggah);
    kanan.appendChild(berkas);
    baris.appendChild(pratinjau);
    baris.appendChild(kanan);
    d.appendChild(baris);
    if (kol.bantuan) d.insertAdjacentHTML("beforeend", '<small class="bantuan">' + kol.bantuan + "</small>");
    return d;
  }

  /* daftar tulisan sederhana (mis. poin unggulan) */
  function gambarDaftarTeks(induk, kunci) {
    const wadah = document.createElement("div");

    function gambar() {
      const arr = induk[kunci] || (induk[kunci] = []);
      wadah.innerHTML = "";
      if (!arr.length) wadah.insertAdjacentHTML("beforeend", '<div class="kosong">Belum ada isi.</div>');

      arr.forEach((nilai, i) => {
        const baris = document.createElement("div");
        baris.className = "baris-teks";
        const inp = document.createElement("input");
        inp.type = "text"; inp.value = nilai;
        inp.addEventListener("input", () => { arr[i] = inp.value; tandaiBerubah(); });
        const hapus = document.createElement("button");
        hapus.type = "button"; hapus.className = "tbl tbl--kecil tbl--bahaya"; hapus.textContent = "Hapus";
        hapus.addEventListener("click", () => { arr.splice(i, 1); gambar(); tandaiBerubah(); });
        baris.appendChild(inp); baris.appendChild(hapus);
        wadah.appendChild(baris);
      });

      const tambah = document.createElement("button");
      tambah.type = "button"; tambah.className = "tbl tbl--kecil tambah"; tambah.textContent = "+ Tambah";
      tambah.addEventListener("click", () => { arr.push(""); gambar(); tandaiBerubah(); });
      wadah.appendChild(tambah);
    }

    gambar();
    return wadah;
  }

  /* daftar berisi kartu (mis. tipe unit, video, testimoni) */
  function gambarDaftar(k, arr) {
    const wadah = document.createElement("div");

    function gambar() {
      wadah.innerHTML = "";
      if (!arr.length) wadah.insertAdjacentHTML("beforeend", '<div class="kosong">Belum ada isi. Tekan tombol di bawah untuk menambah.</div>');

      arr.forEach((item, i) => {
        const kartu = document.createElement("div");
        kartu.className = "kartu tutup";

        const judul = String(item[k.ringkas] || "(tanpa judul)").slice(0, 60);
        const kepala = document.createElement("div");
        kepala.className = "kartu__kepala";
        kepala.innerHTML = '<span class="kartu__nomor">' + (i + 1) + "</span>" +
                           '<span class="kartu__judul"></span><span class="kartu__panah">▼</span>';
        kepala.querySelector(".kartu__judul").textContent = judul;

        const aksi = document.createElement("div");
        aksi.className = "kartu__aksi";
        aksi.appendChild(tombolKecil("↑", "Naikkan", (e) => { e.stopPropagation(); if (i > 0) { tukar(arr, i, i - 1); gambar(); tandaiBerubah(); } }));
        aksi.appendChild(tombolKecil("↓", "Turunkan", (e) => { e.stopPropagation(); if (i < arr.length - 1) { tukar(arr, i, i + 1); gambar(); tandaiBerubah(); } }));
        aksi.appendChild(tombolKecil("Hapus", "Hapus", (e) => {
          e.stopPropagation();
          if (!confirm('Hapus "' + judul + '"? Tindakan ini tidak bisa dibatalkan.')) return;
          arr.splice(i, 1); gambar(); tandaiBerubah();
        }, true));
        kepala.insertBefore(aksi, kepala.lastElementChild);

        kepala.addEventListener("click", () => kartu.classList.toggle("tutup"));

        const isi = document.createElement("div");
        isi.className = "kartu__isi";
        isi.appendChild(gambarGrup(k.isi, item));

        kartu.appendChild(kepala);
        kartu.appendChild(isi);
        wadah.appendChild(kartu);
      });

      const tambah = document.createElement("button");
      tambah.type = "button"; tambah.className = "tbl tambah"; tambah.textContent = "+ Tambah " + k.label;
      tambah.addEventListener("click", () => {
        const baru = {};
        k.isi.forEach((kol) => {
          baru[kol.kunci] = kol.jenis === "daftarTeks" ? [] : kol.jenis === "angka" ? 0 : "";
        });
        arr.push(baru); gambar(); tandaiBerubah();
        wadah.lastElementChild.previousElementSibling.classList.remove("tutup");
      });
      wadah.appendChild(tambah);
    }

    gambar();
    return wadah;
  }

  function tombolKecil(teks, judul, saatKlik, bahaya) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tbl tbl--kecil" + (bahaya ? " tbl--bahaya" : "");
    b.textContent = teks; b.title = judul;
    b.addEventListener("click", saatKlik);
    return b;
  }

  function tukar(arr, a, b) { const t = arr[a]; arr[a] = arr[b]; arr[b] = t; }

  /* ------------------------------------------------------------------ */
  /* Menyimpan                                                           */
  /* ------------------------------------------------------------------ */
  function adaPerubahan() { return data && JSON.stringify(data) !== asli; }

  function tandaiBerubah() {
    $("#tblSimpan").disabled = !adaPerubahan();
    $("#simpanInfo").textContent = adaPerubahan() ? "Ada perubahan yang belum disimpan" : "";
  }

  $("#tblSimpan").addEventListener("click", async () => {
    const nomor = data.kontak && data.kontak.whatsapp;
    if (!/^62[0-9]{8,15}$/.test(String(nomor || ""))) {
      kabar("Nomor WhatsApp belum benar. Harus diawali 62, tanpa + dan tanpa 0.", true);
      return;
    }

    const tbl = $("#tblSimpan");
    tbl.disabled = true; tbl.textContent = "Menyimpan…";

    const { error } = await db.from("site_config").update({ data: data }).eq("id", 1);

    tbl.textContent = "Simpan Perubahan";
    if (error) {
      kabar("Gagal menyimpan: " + error.message, true);
      tbl.disabled = false;
      return;
    }
    asli = JSON.stringify(data);
    tandaiBerubah();
    $("#simpanInfo").textContent = "Tersimpan barusan";
    kabar("Perubahan tersimpan. Buka website untuk melihat hasilnya.");
  });

  window.addEventListener("beforeunload", (e) => {
    if (adaPerubahan()) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ------------------------------------------------------------------ */
  /* Kalau sudah pernah masuk, langsung buka                             */
  /* ------------------------------------------------------------------ */
  db.auth.getSession().then(({ data: d }) => {
    if (!d.session) return;
    sesi = d.session;
    mulaiAplikasi().catch((e) => {
      tunjukkanGagal("Sesi lama ditemukan, tetapi isi website gagal dimuat: " + (e && e.message ? e.message : e));
    });
  });
})();
