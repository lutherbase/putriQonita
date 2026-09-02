/* =====================================================================
   MAIN.JS — merender seluruh isi halaman dari database Supabase,
   dengan salinan cadangan di data/site.json
   Tidak ada library eksternal. Aman dijalankan tanpa build tool.

   CATATAN: karena datanya diambil lewat jaringan, halaman ini harus dibuka
   lewat alamat http:// (hosting, atau python3 preview-lokal.py) — bukan
   dengan klik ganda index.html langsung dari Finder.
   ===================================================================== */
(function () {
  "use strict";

  let SITE = null;                     // diisi dari data/site.json sebelum init()

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const rupiah = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
  const rupiahRingkas = (n) => {
    if (n >= 1e9) return "Rp " + (n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
    if (n >= 1e6) return "Rp " + Math.round(n / 1e6).toLocaleString("id-ID") + " Jt";
    return rupiah(n);
  };

  /* ------------------------------------------------------------------
     WHATSAPP — inti dari seluruh konversi situs ini
     Menghasilkan URL https://wa.me/<nomor>?text=<pesan ter-encode>
     ------------------------------------------------------------------ */
  function nomorWa() {
    return String(SITE.kontak.whatsapp || "").replace(/[^0-9]/g, "");
  }
  function linkWa(pesan) {
    return "https://wa.me/" + nomorWa() + "?text=" + encodeURIComponent(pesan || "");
  }
  function isiTemplate(tpl, data) {
    return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (data && data[k] != null ? data[k] : m));
  }
  // Semua elemen ber-atribut data-wa="umum|survei|..." otomatis dapat link WA
  function pasangLinkWa(scope) {
    $$("[data-wa]", scope || document).forEach((el) => {
      const kunci = el.getAttribute("data-wa");
      el.href = linkWa(SITE.pesanWa[kunci] || SITE.pesanWa.umum);
      el.target = "_blank";
      el.rel = "noopener";
    });
  }

  /* ------------------------------------------------------------------
     PEMBACA LINK VIDEO
     Cukup tempel link apa adanya di data/site.json — kode video diambil otomatis.
     Kalau linknya tidak bisa dibaca (mis. link pendek vt.tiktok.com),
     kartunya tetap tampil dan membuka video di aplikasi/situs aslinya.
     ------------------------------------------------------------------ */
  function kodeYoutube(v) {
    const s = String((v && (v.link || v.url || v.id)) || "").trim();
    const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;   // kalau yang diisi memang kode saja
    return null;
  }
  function kodeTiktok(v) {
    const s = String((v && (v.link || v.url || v.id)) || "").trim();
    const m = s.match(/\/(?:video|photo)\/(\d{6,})/);
    if (m) return m[1];
    if (/^\d{6,}$/.test(s)) return s;
    return null;
  }
  function alamatVideo(v) {
    return String((v && (v.link || v.url)) || "").trim();
  }
  function peringatanLink(jenis, v) {
    console.warn("[SETUP] Link " + jenis + " belum bisa dibaca: " + (alamatVideo(v) || "(kosong)") +
      "\nPakai link panjang yang memuat kode videonya. Lihat panduan di README.md bagian 3 & 4.");
  }

  /* ------------------------------------------------------------------
     TEKS STATIS DARI CONFIG
     ------------------------------------------------------------------ */
  function isiTeks() {
    const k = SITE.kontak, b = SITE.brand, h = SITE.hero;
    const set = (key, val, attr) => {
      $$('[data-i="' + key + '"]').forEach((el) => {
        if (attr) el.setAttribute(attr, val); else el.textContent = val;
      });
    };
    const setHref = (key, val) => $$('[data-i="' + key + '"]').forEach((el) => (el.href = val));

    document.title = b.nama + " — " + b.tagline + " | " + b.lokasiSingkat;

    set("lokasi", "📍 " + b.lokasiSingkat);
    set("jam", "🕗 " + k.jamKerja);
    set("jam2", k.jamKerja); set("jam3", k.jamKerja);
    /* ikon 💬 (bukan 📞) karena tautan ini membuka WhatsApp, bukan panggilan telepon */
    set("telp", "💬 " + k.telepon); set("telp2", k.telepon);
    set("agenTelp", k.telepon);
    setHref("telp", linkWa(SITE.pesanWa.umum));
    $$('[data-i="telp"]').forEach((el) => { el.target = "_blank"; el.rel = "noopener"; });
    set("email", k.email); set("email2", k.email);
    setHref("email2", "mailto:" + k.email);
    set("alamat", k.alamat); set("alamat2", k.alamat);
    setHref("ig", k.instagram); setHref("ig2", k.instagram);
    setHref("ttProfil", k.tiktokProfil); setHref("ttProfil2", k.tiktokProfil);
    setHref("ytProfil", k.youtubeProfil); setHref("ytProfil2", k.youtubeProfil);

    set("logo", b.logoTeks); set("logo2", b.logoTeks);
    set("brandNama", b.nama); set("brandNama2", b.nama); set("brandNama3", b.nama);
    set("brandTag", b.tagline);
    set("developer", "Dikembangkan oleh " + b.developer + ". Kantor pemasaran buka setiap hari — silakan datang atau hubungi kami lebih dulu via WhatsApp.");

    set("heroLabel", h.label); set("heroJudul1", h.judul1); set("heroJudul2", h.judul2);
    set("heroDesc", h.deskripsi);
    set("heroImg", h.gambar, "src");

    set("agenNama", k.namaAgen); set("agenNama2", k.namaAgen);
    set("agenJabatan", k.jabatan); set("agenJabatan2", k.jabatan);
    $$('[data-i="agenFoto"],[data-i="agenFoto2"]').forEach((el) => {
      el.style.backgroundImage = "url('" + k.fotoAgen + "')";
    });

    set("promoJudul", SITE.promo.judul);
    set("promoNote", SITE.promo.catatan);
    $("#year").textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------
     HERO — statistik dengan animasi hitung
     ------------------------------------------------------------------ */
  function isiStatistik() {
    $("#stats").innerHTML = SITE.hero.statistik
      .map((s) => `<li><b data-angka="${s.angka}" data-akhiran="${esc(s.akhiran || "")}">0</b><span>${esc(s.label)}</span></li>`)
      .join("");

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const target = parseFloat(e.target.dataset.angka);
        const akhiran = e.target.dataset.akhiran || "";
        const durasi = 1400; const mulai = performance.now();
        (function step(now) {
          const p = Math.min((now - mulai) / durasi, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          e.target.textContent = Math.round(target * eased).toLocaleString("id-ID") + akhiran;
          if (p < 1) requestAnimationFrame(step);
        })(mulai);
      });
    }, { threshold: 0.4 });
    $$("#stats b").forEach((el) => io.observe(el));
  }

  function isiTrust() {
    const satu = SITE.trustBadges
      .map((t) => `<span class="trust__item"><svg viewBox="0 0 24 24"><use href="#i-check"></use></svg>${esc(t)}</span>`)
      .join("");
    $("#trust").innerHTML = satu + satu; // digandakan agar animasi geser terlihat mulus
  }

  function isiKeunggulan() {
    $("#keunggulan-grid").innerHTML = SITE.keunggulan.map((f, i) => `
      <article class="feat reveal" style="transition-delay:${i * 70}ms">
        <div class="feat__ic"><svg viewBox="0 0 24 24"><use href="#i-${esc(f.ikon)}"></use></svg></div>
        <h3>${esc(f.judul)}</h3><p>${esc(f.teks)}</p>
      </article>`).join("");
  }

  /* ------------------------------------------------------------------
     KATALOG UNIT + FILTER + MODAL
     ------------------------------------------------------------------ */
  function kartuSpek(u) {
    return `
      <ul class="specs">
        <li><svg viewBox="0 0 24 24"><use href="#i-area"></use></svg>LB ${u.lb} / LT ${u.lt} m²</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-bed"></use></svg>${u.kt} KT</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-bath"></use></svg>${u.km} KM</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-car"></use></svg>${u.carport} Carport</li>
      </ul>`;
  }

  function isiUnit(filter) {
    const daftar = SITE.unit
      .map((u, i) => ({ u, i }))
      .filter(({ u }) => !filter || filter === "Semua" || u.kategori === filter);

    $("#unit-grid").innerHTML = daftar.map(({ u, i }) => `
      <article class="card reveal" data-idx="${i}" style="transition-delay:${(i % 3) * 70}ms" tabindex="0">
        <div class="card__media">
          <img src="${esc(u.gambar)}" alt="${esc(u.nama)}" loading="lazy">
          <div class="card__tags">
            ${u.badge ? `<span class="badge badge--gold">${esc(u.badge)}</span>` : ""}
            <span class="badge ${/ready/i.test(u.status) ? "badge--ready" : ""}">${esc(u.status)}</span>
          </div>
        </div>
        <div class="card__body">
          <span class="card__cat">${esc(u.kategori)}</span>
          <h3>${esc(u.nama)}</h3>
          <div class="card__price"><strong>${esc(u.hargaTeks)}</strong><span>${esc(u.cicilan)}</span></div>
          ${kartuSpek(u)}
          <div class="card__foot">
            <a class="btn btn--wa btn--sm" href="${esc(linkUnit(u))}" target="_blank" rel="noopener" data-stop>
              <svg class="ic"><use href="#i-wa"></use></svg> Tanya Unit Ini
            </a>
            <button class="card__more" aria-label="Detail ${esc(u.nama)}">&rsaquo;</button>
          </div>
        </div>
      </article>`).join("");

    pantauReveal();
  }

  function linkUnit(u) {
    return linkWa(isiTemplate(SITE.pesanWa.unit, { unit: u.nama, harga: u.hargaTeks }));
  }

  function isiFilter() {
    const kategori = ["Semua"].concat([...new Set(SITE.unit.map((u) => u.kategori))]);
    $("#filters").innerHTML = kategori
      .map((k, i) => `<button class="chip${i === 0 ? " is-on" : ""}" data-f="${esc(k)}">${esc(k)}</button>`).join("");

    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      $$("#filters .chip").forEach((c) => c.classList.remove("is-on"));
      b.classList.add("is-on");
      isiUnit(b.dataset.f);
    });
  }

  function siapkanModal() {
    const modal = $("#modal");
    let pemicu = null;

    const buka = (idx) => {
      const u = SITE.unit[idx]; if (!u) return;
      $("#m-img").src = u.gambar; $("#m-img").alt = u.nama;
      $("#m-status").textContent = u.status;
      $("#m-nama").textContent = u.nama;
      $("#m-harga").textContent = u.hargaTeks;
      $("#m-cicilan").textContent = u.cicilan;
      $("#m-specs").innerHTML = `
        <li><svg viewBox="0 0 24 24"><use href="#i-area"></use></svg>LB ${u.lb} m²</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-area"></use></svg>LT ${u.lt} m²</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-bed"></use></svg>${u.kt} Kamar Tidur</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-bath"></use></svg>${u.km} Kamar Mandi</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-home"></use></svg>${u.lantai} Lantai</li>
        <li><svg viewBox="0 0 24 24"><use href="#i-car"></use></svg>${u.carport} Carport</li>`;
      $("#m-list").innerHTML = (u.unggulan || []).concat(u.spek || [])
        .map((s) => `<li>${esc(s)}</li>`).join("");
      const wa = $("#m-wa"); wa.href = linkUnit(u); wa.target = "_blank"; wa.rel = "noopener";

      modal.hidden = false; document.body.classList.add("is-locked");
      $(".modal__x").focus();
    };
    const tutup = () => {
      modal.hidden = true; document.body.classList.remove("is-locked");
      if (pemicu) pemicu.focus();
    };

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-stop]")) return;      // tombol WA di kartu: biarkan lewat
      const card = e.target.closest(".card");
      if (card) { pemicu = card; buka(+card.dataset.idx); return; }
      if (e.target.closest("[data-close]")) tutup();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) tutup();
      const card = e.target.closest && e.target.closest(".card");
      if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pemicu = card; buka(+card.dataset.idx); }
    });
  }

  /* ------------------------------------------------------------------
     YOUTUBE — pakai "facade": thumbnail dulu, iframe baru dimuat saat diklik.
     Halaman jadi ringan & skor PageSpeed tetap tinggi.
     ------------------------------------------------------------------ */
  function isiYoutube() {
    $("#yt-grid").innerHTML = SITE.youtube.map((v) => {
      const kode = kodeYoutube(v);
      if (!kode) peringatanLink("YouTube", v);
      const gambar = kode
        ? `<img src="https://i.ytimg.com/vi/${esc(kode)}/hqdefault.jpg" alt="${esc(v.judul)}" loading="lazy">`
        : `<div class="yt__kosong"></div>`;
      return `
      <div class="yt reveal"${kode ? ` data-yt="${esc(kode)}"` : ` data-buka="${esc(alamatVideo(v))}"`}>
        ${gambar}
        <div class="yt__ov" role="button" tabindex="0" aria-label="Putar ${esc(v.judul)}">
          <span class="yt__play"><svg viewBox="0 0 24 24"><use href="#i-play"></use></svg></span>
          <span class="yt__title">${esc(v.judul)}</span>
          <span class="yt__dur">${esc(kode ? (v.durasi || "") : "Buka di YouTube")}</span>
        </div>
      </div>`;
    }).join("");

    const putar = (box) => {
      if (box.dataset.buka) { window.open(box.dataset.buka, "_blank", "noopener"); return; }
      box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.yt)}?autoplay=1&rel=0&modestbranding=1"
        title="Video YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    };
    $("#yt-grid").addEventListener("click", (e) => {
      const box = e.target.closest(".yt"); if (box) putar(box);
    });
    $("#yt-grid").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const box = e.target.closest(".yt"); if (box) { e.preventDefault(); putar(box); }
    });
  }

  /* ------------------------------------------------------------------
     TIKTOK — juga facade, memakai embed resmi TikTok (v2)
     ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     DATA VIDEO TIKTOK (oEmbed resmi TikTok)
     Satu panggilan memberi tiga hal sekaligus: sampul asli, judul asli, dan
     kode video. Karena kode videonya ikut didapat, LINK PENDEK dari tombol
     "Salin tautan" di HP pun bisa diputar langsung di halaman.
     Link sampul dari TikTok berlaku singkat (± 2 hari), jadi selalu diambil
     segar saat halaman dibuka — tidak pernah disimpan di config.
     ------------------------------------------------------------------ */
  const gudangTiktok = new Map();
  function metaTiktok(alamat) {
    if (!alamat) return Promise.resolve(null);
    if (gudangTiktok.has(alamat)) return gudangTiktok.get(alamat);
    const janji = fetch("https://www.tiktok.com/oembed?url=" + encodeURIComponent(alamat))
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j ? {
        kode:   j.embed_product_id || (/data-video-id="(\d+)"/.exec(j.html || "") || [])[1] || null,
        sampul: j.thumbnail_url || null,
        judul:  j.title || ""
      } : null))
      .catch(() => null);
    gudangTiktok.set(alamat, janji);
    return janji;
  }

  function siapkanTiktok(box) {
    if (box.dataset.siap) return;
    box.dataset.siap = "1";

    const pasangGambar = (src) => {
      const im = new Image();
      im.alt = ""; im.loading = "lazy";
      im.onload = () => { box.classList.add("tt--bersampul"); box.prepend(im); };
      im.src = src;
    };

    metaTiktok(box.dataset.url).then((m) => {
      if (!m) { peringatanLink("TikTok", { link: box.dataset.url }); return; }

      if (!box.dataset.sampul && m.sampul) pasangGambar(m.sampul);

      if (!box.dataset.tt && m.kode) {                                 // link pendek dinaikkan jadi bisa diputar
        box.dataset.tt = m.kode;
        delete box.dataset.buka;
        const tag = box.querySelector(".tt__tag");
        if (tag) tag.textContent = "Ketuk untuk memutar";
      }

      const judul = box.querySelector(".tt__title");                   // judul kosong = pakai keterangan asli TikTok
      if (judul && !judul.textContent.trim() && m.judul) judul.textContent = m.judul;
    });
  }

  function isiTiktok() {
    $("#tt-grid").innerHTML = SITE.tiktok.map((v) => {
      const kode = kodeTiktok(v);
      const alamat = alamatVideo(v);
      const data = [
        kode ? `data-tt="${esc(kode)}"` : (alamat ? `data-buka="${esc(alamat)}"` : ""),
        alamat ? `data-url="${esc(alamat)}"` : "",
        v.sampul ? `data-sampul="${esc(v.sampul)}"` : "",
        v.video ? `data-video="${esc(v.video)}"` : ""
      ].filter(Boolean).join(" ");
      if (!kode && !alamat) peringatanLink("TikTok", v);
      const gambar = v.sampul
        ? `<img src="${esc(v.sampul)}" alt="" loading="lazy" decoding="async">`
        : "";
      return `
      <div class="tt reveal${v.sampul ? " tt--bersampul" : ""}" ${data}>
        ${gambar}
        <div class="tt__ov" role="button" tabindex="0" aria-label="Putar video TikTok">
          <span class="tt__play"><svg viewBox="0 0 24 24"><use href="#i-play"></use></svg></span>
          <span class="tt__title">${esc(v.judul || "")}</span>
          <span class="tt__tag">${kode ? "Ketuk untuk memutar" : "Memuat…"}</span>
        </div>
      </div>`;
    }).join("");

    /* Kartu yang sampulnya sudah disiapkan lokal tidak perlu apa-apa lagi —
       gambarnya sudah tertulis di atas dan dimuat hemat oleh browser sendiri.
       Sisanya dicoba diambilkan otomatis dari TikTok saat mendekati layar.
       (Cara otomatis ini tidak selalu berhasil: TikTok kerap menolak permintaan
       dari website lain. Karena itu sampul lokal tetap cara yang dianjurkan.) */
    const kartu = $$("#tt-grid .tt:not(.tt--bersampul)");
    if (kartu.length && "IntersectionObserver" in window) {
      const pengintai = new IntersectionObserver((entri, diri) => {
        entri.forEach((e) => {
          if (!e.isIntersecting) return;
          siapkanTiktok(e.target);
          diri.unobserve(e.target);
        });
      }, { rootMargin: "400px" });
      kartu.forEach((k) => pengintai.observe(k));
    } else {
      kartu.forEach(siapkanTiktok);
    }

    /* Video dibuka BESAR di tengah layar, bukan di dalam kartu.

       Alasannya: pemutar TikTok minta lebar minimal ± 325px, sedangkan kartu
       di dalam barisan hanya ± 277px — di ruang sesempit itu videonya pasti
       terpotong. Dengan dibuka di tengah layar, videonya terlihat utuh.

       Menutupnya sekaligus menjawab "kembali ke sampul": kartunya sendiri tidak
       pernah diubah, jadi begitu ditutup, sampulnya sudah ada di tempatnya. */
    let kartuTerakhir = null;

    const layar = document.createElement("div");
    layar.className = "lb";
    layar.hidden = true;
    layar.innerHTML = `
      <div class="lb__tirai" data-tutup></div>
      <div class="lb__kotak" role="dialog" aria-modal="true" aria-label="Video TikTok">
        <button class="lb__tutup" type="button" aria-label="Tutup video" data-tutup>&times;</button>
        <div class="lb__isi"></div>
      </div>`;
    document.body.appendChild(layar);
    const isiLayar = layar.querySelector(".lb__isi");

    function bukaVideo(box) {
      kartuTerakhir = box;

      if (box.dataset.video) {
        /* Video milik sendiri: sekali klik langsung jalan (klik tadi sudah
           dihitung sebagai izin oleh browser), dan begitu habis kartunya
           kembali ke sampul dengan sendirinya. */
        isiLayar.innerHTML = `
          <video class="lb__video" src="${esc(box.dataset.video)}"
                 ${box.dataset.sampul ? `poster="${esc(box.dataset.sampul)}"` : ""}
                 controls autoplay playsinline preload="metadata"></video>
          ${box.dataset.url ? `<a class="lb__tt" href="${esc(box.dataset.url)}" target="_blank" rel="noopener">Tonton di TikTok</a>` : ""}`;
        const vid = isiLayar.querySelector("video");
        vid.addEventListener("ended", tutupVideo);
        vid.play().catch(() => {});          // kalau ditolak browser, tombol play bawaan tetap ada
      } else {
        /* Belum ada file video: pakai pemutar resmi TikTok. Pemutar ini selalu
           meminta satu klik lagi pada tombol play-nya — itu aturan TikTok untuk
           menghitung penonton, tidak bisa dilewati dari luar. */
        isiLayar.innerHTML = `<iframe src="https://www.tiktok.com/embed/v2/${encodeURIComponent(box.dataset.tt)}"
          title="Video TikTok" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      }
      layar.hidden = false;
      document.documentElement.classList.add("terkunci");
      requestAnimationFrame(() => layar.classList.add("is-in"));
      layar.querySelector(".lb__tutup").focus();
    }

    function tutupVideo() {
      if (layar.hidden) return;
      layar.classList.remove("is-in");
      isiLayar.innerHTML = "";                    // menghentikan videonya
      layar.hidden = true;
      document.documentElement.classList.remove("terkunci");
      if (kartuTerakhir) { kartuTerakhir.focus?.(); kartuTerakhir = null; }
    }

    layar.addEventListener("click", (e) => { if (e.target.closest("[data-tutup]")) tutupVideo(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") tutupVideo(); });

    const putar = (box) => {
      if (box.dataset.video || box.dataset.tt) { bukaVideo(box); return; }
      if (box.dataset.buka) window.open(box.dataset.buka, "_blank", "noopener");
    };

    $("#tt-grid").addEventListener("click", (e) => {
      const box = e.target.closest(".tt"); if (box) putar(box);
    });
    $("#tt-grid").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const box = e.target.closest(".tt"); if (box) { e.preventDefault(); putar(box); }
    });
  }

  /* ------------------------------------------------------------------
     LOKASI
     ------------------------------------------------------------------ */
  function isiLokasi() {
    $("#map").innerHTML = `<iframe src="${esc(SITE.lokasi.embedMaps)}" title="Peta lokasi ${esc(SITE.brand.nama)}"
      loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    $("#sekitar").innerHTML = SITE.lokasi.sekitar
      .map((s) => `<li><b>${esc(s.menit)}</b><span>${esc(s.tempat)}</span></li>`).join("");
    $$('[data-i="linkMaps"]').forEach((el) => (el.href = SITE.lokasi.linkMaps));
  }

  /* ------------------------------------------------------------------
     SIMULASI KPR (metode anuitas)
     angsuran = P * i / (1 - (1+i)^-n)
     ------------------------------------------------------------------ */
  function siapkanKpr() {
    const sel = $("#c-unit"), harga = $("#c-harga"), dp = $("#c-dp"), tenor = $("#c-tenor"), bunga = $("#c-bunga");

    sel.innerHTML = SITE.unit.map((u, i) => `<option value="${i}">${esc(u.nama)} — ${esc(u.hargaTeks)}</option>`).join("");
    dp.value = SITE.kpr.dpPersen; tenor.value = SITE.kpr.tenorTahun; bunga.value = SITE.kpr.bungaPersen;
    harga.value = SITE.unit[0].harga.toLocaleString("id-ID");

    const angkaHarga = () => Number(String(harga.value).replace(/[^0-9]/g, "")) || 0;

    function hitung() {
      const H = angkaHarga();
      const persenDp = +dp.value, thn = +tenor.value, bungaThn = +bunga.value;
      const nilaiDp = H * persenDp / 100;
      const pokok = H - nilaiDp;
      const i = bungaThn / 100 / 12, n = thn * 12;
      const angsuran = i === 0 ? pokok / n : (pokok * i) / (1 - Math.pow(1 + i, -n));
      const total = angsuran * n;

      $("#c-dp-val").textContent = persenDp + "%";
      $("#c-tenor-val").textContent = thn + " tahun";
      $("#c-bunga-val").textContent = bungaThn.toLocaleString("id-ID") + "%";
      $("#c-dp-rp").textContent = "Setara " + rupiah(nilaiDp);
      $("#c-angsuran").textContent = rupiah(angsuran || 0);
      $("#c-o-dp").textContent = rupiah(nilaiDp);
      $("#c-o-pokok").textContent = rupiah(pokok);
      $("#c-o-bunga").textContent = rupiah(Math.max(total - pokok, 0));
      $("#c-o-total").textContent = rupiah(nilaiDp + total);

      $("#c-wa").href = linkWa(isiTemplate(SITE.pesanWa.kpr, {
        unit: sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text.split(" — ")[0] : "-",
        harga: rupiahRingkas(H), dp: persenDp + "% (" + rupiah(nilaiDp) + ")",
        tenor: thn + " tahun", angsuran: rupiah(angsuran || 0)
      }));
      $("#c-wa").target = "_blank"; $("#c-wa").rel = "noopener";

      // isi ulang gradasi slider
      [dp, tenor, bunga].forEach((r) => {
        const p = ((r.value - r.min) / (r.max - r.min)) * 100;
        r.style.background = `linear-gradient(90deg,var(--gold) ${p}%,var(--cream-2) ${p}%)`;
      });
    }

    sel.addEventListener("change", () => {
      harga.value = SITE.unit[+sel.value].harga.toLocaleString("id-ID"); hitung();
    });
    harga.addEventListener("input", () => {
      const n = angkaHarga(); harga.value = n ? n.toLocaleString("id-ID") : ""; hitung();
    });
    [dp, tenor, bunga].forEach((el) => el.addEventListener("input", hitung));
    hitung();
  }

  /* ------------------------------------------------------------------
     TESTIMONI, PROMO, FAQ
     ------------------------------------------------------------------ */
  function isiTestimoni() {
    $("#testi-grid").innerHTML = SITE.testimoni.map((t, i) => {
      const inisial = t.nama.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      return `<article class="testi reveal" style="transition-delay:${(i % 2) * 80}ms">
        <svg class="testi__q" viewBox="0 0 24 24"><use href="#i-quote"></use></svg>
        <p>“${esc(t.teks)}”</p>
        <div class="testi__who">
          <span class="testi__ini">${esc(inisial)}</span>
          <div><strong>${esc(t.nama)}</strong><span>${esc(t.info)}</span></div>
          <span class="stars" aria-label="Nilai 5 dari 5">★★★★★</span>
        </div></article>`;
    }).join("");
  }

  function isiPromo() {
    $("#promo-list").innerHTML = SITE.promo.daftar
      .map((p) => `<li><svg viewBox="0 0 24 24"><use href="#i-check"></use></svg>${esc(p)}</li>`).join("");
  }

  function isiFaq() {
    $("#faq-list").innerHTML = SITE.faq.map((f, i) => `
      <div class="faq__item reveal">
        <button class="faq__q" aria-expanded="false" aria-controls="faq-a-${i}">${esc(f.t)}</button>
        <div class="faq__a" id="faq-a-${i}"><p>${esc(f.j)}</p></div>
      </div>`).join("");

    $("#faq-list").addEventListener("click", (e) => {
      const q = e.target.closest(".faq__q"); if (!q) return;
      const item = q.parentElement, panel = q.nextElementSibling, terbuka = item.classList.contains("is-open");
      $$("#faq-list .faq__item").forEach((it) => {
        it.classList.remove("is-open");
        $(".faq__a", it).style.maxHeight = null;
        $(".faq__q", it).setAttribute("aria-expanded", "false");
      });
      if (!terbuka) {
        item.classList.add("is-open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ------------------------------------------------------------------
     FORM → WHATSAPP
     ------------------------------------------------------------------ */
  function siapkanForm() {
    const f = $("#form-wa");
    $("#f-unit").innerHTML =
      `<option>Belum menentukan</option>` +
      SITE.unit.map((u) => `<option>${esc(u.nama)}</option>`).join("");

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = $("#f-nama"), hp = $("#f-hp");
      let valid = true;
      [nama, hp].forEach((el) => {
        const kosong = !el.value.trim();
        el.classList.toggle("is-bad", kosong);
        if (kosong) valid = false;
      });
      if (!valid) { nama.value.trim() ? hp.focus() : nama.focus(); return; }

      const pesan =
        "Halo " + SITE.kontak.namaAgen + ", saya ingin bertanya tentang " + SITE.brand.nama + ".\n\n" +
        "• Nama: " + nama.value.trim() + "\n" +
        "• No. WhatsApp: " + hp.value.trim() + "\n" +
        "• Unit diminati: " + $("#f-unit").value + "\n" +
        "• Rencana pembayaran: " + $("#f-bayar").value +
        ($("#f-pesan").value.trim() ? "\n• Pesan: " + $("#f-pesan").value.trim() : "") +
        "\n\nMohon informasinya ya. Terima kasih.";

      window.open(linkWa(pesan), "_blank", "noopener");
    });

    f.addEventListener("input", (e) => e.target.classList.remove("is-bad"));
  }

  /* ------------------------------------------------------------------
     NAVIGASI, SCROLL, ANIMASI
     ------------------------------------------------------------------ */
  let ioReveal;

  /* Tampilkan paksa semua elemen yang masih tersembunyi.
     JARING PENGAMAN: isi halaman ini awalnya transparan (opacity 0) dan baru
     dimunculkan saat tergulir. Kalau mekanisme pemantauannya tidak berjalan —
     browser lawas, atau browser di dalam aplikasi TikTok/Instagram yang kadang
     berperilaku lain — halaman bisa tampak KOSONG PUTIH. Karena itu isinya
     selalu dimunculkan setelah beberapa saat, apa pun yang terjadi. */
  function munculkanSemua() {
    $$(".reveal:not(.is-in)").forEach((el) => el.classList.add("is-in"));
  }

  function pantauReveal() {
    if (!("IntersectionObserver" in window)) { munculkanSemua(); return; }
    if (!ioReveal) {
      ioReveal = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-in"); ioReveal.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -60px" });
    }
    $$(".reveal:not(.is-in)").forEach((el) => ioReveal.observe(el));
    /* Kalau setelah 2,5 detik tidak ada SATU pun yang muncul, berarti
       pemantauannya memang tidak jalan — tampilkan semuanya. Di browser yang
       normal pengaman ini tidak pernah aktif, jadi animasinya tetap utuh. */
    clearTimeout(pantauReveal.jaga);
    pantauReveal.jaga = setTimeout(() => {
      if (!document.querySelector(".reveal.is-in")) munculkanSemua();
    }, 2500);
  }

  function siapkanNav() {
    const nav = $("#nav"), burger = $("#burger"), menu = $("#menu"), totop = $("#totop");

    // posisi panel menu selalu tepat di bawah header, berapa pun tingginya
    const setTinggiNav = () =>
      document.documentElement.style.setProperty("--nav-bottom", nav.getBoundingClientRect().bottom + "px");
    setTinggiNav();
    window.addEventListener("resize", setTinggiNav);

    burger.addEventListener("click", () => {
      setTinggiNav();
      const buka = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(buka));
      document.body.classList.toggle("is-locked", buka);
    });
    menu.addEventListener("click", (e) => {
      if (!e.target.closest("a")) return;
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
    });

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-stuck", y > 12);
      totop.classList.toggle("is-on", y > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    totop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // sorot menu sesuai posisi gulir
    const seksi = $$("main section[id]");
    const ioNav = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$('.nav__menu a[href^="#"]').forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    seksi.forEach((s) => ioNav.observe(s));
  }

  /* ------------------------------------------------------------------
     SEO — data terstruktur untuk Google (rich result)
     ------------------------------------------------------------------ */
  function tanamJsonLd() {
    const data = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: SITE.brand.nama,
      description: SITE.hero.deskripsi,
      telephone: "+" + nomorWa(),
      email: SITE.kontak.email,
      address: { "@type": "PostalAddress", streetAddress: SITE.kontak.alamat, addressCountry: "ID" },
      openingHours: SITE.kontak.jamKerja,
      makesOffer: SITE.unit.map((u) => ({
        "@type": "Offer",
        priceCurrency: "IDR", price: u.harga, availability: /ready/i.test(u.status) ? "InStock" : "PreOrder",
        itemOffered: {
          "@type": "SingleFamilyResidence", name: u.nama,
          numberOfRooms: u.kt, numberOfBathroomsTotal: u.km,
          floorSize: { "@type": "QuantitativeValue", value: u.lb, unitCode: "MTK" }
        }
      }))
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------
     JALANKAN
     ------------------------------------------------------------------ */
  function init() {
    isiTeks();
    isiStatistik();
    isiTrust();
    isiKeunggulan();
    isiFilter();
    isiUnit(null);
    siapkanModal();
    isiYoutube();
    isiTiktok();
    isiLokasi();
    siapkanKpr();
    isiTestimoni();
    isiPromo();
    isiFaq();
    siapkanForm();
    siapkanNav();
    pasangLinkWa();
    pantauReveal();
    tanamJsonLd();

    if (!nomorWa() || nomorWa() === "6281234567890") {
      console.warn("[SETUP] Nomor WhatsApp masih contoh. Ubah kontak.whatsapp di data/site.json");
    }
  }

  /* Ambil data situs lebih dulu, baru halaman dirender.
     Kalau gagal (file hilang / dibuka langsung dari Finder tanpa server),
     tampilkan pesan yang jelas alih-alih halaman kosong tanpa penjelasan. */
  function gagalMuat(sebab) {
    console.error("[DATA] Gagal memuat data/site.json —", sebab);
    const wadah = document.querySelector("main") || document.body;
    wadah.insertAdjacentHTML("afterbegin",
      '<div style="max-width:640px;margin:60px auto;padding:24px;border:1px solid #e2e2e2;' +
      'border-radius:14px;font-family:system-ui,sans-serif;line-height:1.6">' +
      '<h2 style="margin:0 0 10px">Data situs tidak bisa dimuat</h2>' +
      '<p style="margin:0 0 10px">Halaman ini mengambil isinya dari <code>data/site.json</code>.</p>' +
      '<p style="margin:0">Kalau Anda membukanya langsung dari Finder, jalankan dulu ' +
      '<code>python3 preview-lokal.py</code> lalu buka <code>http://localhost:4400</code>.</p></div>');
  }

  /* Isi website diambil dari database (yang diubah lewat menu admin).
     Kalau database sedang tidak bisa dihubungi, dipakai salinan cadangan
     data/site.json — jadi website tetap tampil, tidak pernah kosong. */
  async function ambilDariDatabase() {
    const k = window.KONEKSI;
    if (!k || !k.url || !k.kunci) return null;

    const batal = new AbortController();
    const jam = setTimeout(() => batal.abort(), 6000);   // jangan menggantung terlalu lama
    try {
      const r = await fetch(k.url + "/rest/v1/site_config?select=data&id=eq.1", {
        headers: { apikey: k.kunci, Accept: "application/json" },
        signal: batal.signal
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const baris = await r.json();
      return (baris && baris[0] && baris[0].data) || null;
    } catch (e) {
      console.warn("[DATA] Database tidak terbaca (" + e.message + "), memakai salinan cadangan.");
      return null;
    } finally {
      clearTimeout(jam);
    }
  }

  async function ambilCadangan() {
    const r = await fetch("data/site.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  async function mulai() {
    try {
      SITE = await ambilDariDatabase();
      if (!SITE) SITE = await ambilCadangan();
    } catch (e) {
      gagalMuat(e.message);
      return;
    }
    init();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", mulai)
    : mulai();
})();
