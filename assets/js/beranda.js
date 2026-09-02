/* =====================================================================
   BERANDA.JS — halaman depan: daftar semua perumahan yang dipasarkan.
   Datanya sama dengan halaman perumahan, dari database dengan cadangan
   data/site.json.
   ===================================================================== */
(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const aset = (v) => {
    const t = String(v == null ? "" : v).trim();
    if (!t || /^(https?:|data:|\/)/.test(t)) return t;
    return "/" + t.replace(/^\.?\//, "");
  };

  let DATA = null;

  /* ---------------- mengambil data ---------------- */
  async function ambilDariDatabase() {
    const k = window.KONEKSI;
    if (!k || !k.url || !k.kunci) return null;
    const batal = new AbortController();
    const jam = setTimeout(() => batal.abort(), 6000);
    try {
      const r = await fetch(k.url + "/rest/v1/site_config?select=data&id=eq.1", {
        headers: { apikey: k.kunci, Accept: "application/json" }, signal: batal.signal
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const baris = await r.json();
      return (baris && baris[0] && baris[0].data) || null;
    } catch (e) {
      console.warn("[DATA] Database tidak terbaca (" + e.message + "), memakai salinan cadangan.");
      return null;
    } finally { clearTimeout(jam); }
  }

  async function ambilCadangan() {
    const r = await fetch("/data/site.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  /* ---------------- WhatsApp ---------------- */
  const nomorWa = () => String((DATA.kontak && DATA.kontak.whatsapp) || "").replace(/[^0-9]/g, "");
  const linkWa  = (pesan) => "https://wa.me/" + nomorWa() + "?text=" + encodeURIComponent(pesan || "");

  /* ---------------- perhitungan ringkas ---------------- */
  function hargaTermurah(p) {
    const angka = (p.unit || []).map((u) => Number(u.harga)).filter((n) => n > 0);
    if (!angka.length) return null;
    const min = Math.min.apply(null, angka);
    if (min >= 1e9) return "Rp " + (min / 1e9).toFixed(min % 1e9 === 0 ? 0 : 1).replace(".", ",") + " M";
    return "Rp " + Math.round(min / 1e6) + " Jt";
  }

  function adaReady(p) {
    return (p.unit || []).some((u) => /ready/i.test(String(u.status || "")));
  }

  /* ---------------- menggambar ---------------- */
  function gambar() {
    const daftar = DATA.perumahan || [];
    const k = DATA.kontak || {};
    const dev = (DATA.developer && DATA.developer.nama) || "";

    document.title = daftar.length === 1
      ? daftar[0].nama + " — Dipasarkan oleh " + (k.namaAgen || dev)
      : daftar.length + " Perumahan Pilihan — " + (k.namaAgen || dev);

    const set = (key, val, attr) => $$('[data-i="' + key + '"]').forEach((el) => {
      if (attr) el.setAttribute(attr, val); else el.textContent = val;
    });

    set("logo", (DATA.developer && DATA.developer.logoTeks) || "PQ");
    set("devNama", dev || (k.namaAgen || ""));
    set("devNama2", dev || (k.namaAgen || ""));
    set("jam", "🕗 " + (k.jamKerja || ""));
    set("telp", "💬 " + (k.telepon || ""));
    set("agenNama", k.namaAgen || "");
    set("agenJabatan", k.jabatan || "");
    set("email2", k.email || "");
    $$('[data-i="telp"]').forEach((el) => { el.href = linkWa(pesanUmum()); el.target = "_blank"; el.rel = "noopener"; });
    $$('[data-i="ig"]').forEach((el) => { el.href = k.instagram || "#"; });
    $$('[data-i="email2"]').forEach((el) => { el.href = "mailto:" + (k.email || ""); });
    $$('[data-i="agenFoto"]').forEach((el) => { el.style.backgroundImage = "url('" + aset(k.fotoAgen) + "')"; });
    $("#tahun").textContent = new Date().getFullYear();

    $("#jumlahLabel").textContent = daftar.length + " Perumahan Tersedia";
    $("#beranda-teks").textContent = daftar.length === 1
      ? "Kami membantu Anda menemukan hunian yang tepat — dari survei lokasi sampai akad KPR."
      : "Pilih perumahan yang paling sesuai kebutuhan dan anggaran Anda. Setiap unit bisa disimulasikan cicilannya sebelum Anda memutuskan.";

    $$('[data-wa]').forEach((el) => { el.href = linkWa(pesanUmum()); el.target = "_blank"; el.rel = "noopener"; });

    $("#pgrid").innerHTML = daftar.map((p) => {
      const harga = hargaTermurah(p);
      const jumlahTipe = (p.unit || []).length;
      const gambarUtama = aset((p.hero && p.hero.gambar) || "");
      return `
      <article class="pcard">
        <a class="pcard__gbr" href="/${encodeURIComponent(p.slug)}">
          ${gambarUtama ? `<img src="${esc(gambarUtama)}" alt="${esc(p.nama)}" loading="lazy">` : ""}
          ${adaReady(p) ? '<span class="badge badge--ready pcard__badge">Ready Stock</span>' : ""}
        </a>
        <div class="pcard__isi">
          <span class="pcard__lokasi">📍 ${esc(p.lokasiSingkat || "")}</span>
          <h3><a href="/${encodeURIComponent(p.slug)}">${esc(p.nama)}</a></h3>
          <p>${esc(p.tagline || "")}</p>
          <div class="pcard__data">
            ${harga ? `<div><small>Mulai dari</small><strong>${esc(harga)}</strong></div>` : ""}
            <div><small>Pilihan tipe</small><strong>${jumlahTipe} tipe</strong></div>
          </div>
          <div class="pcard__aksi">
            <a class="btn btn--primary btn--sm" href="/${encodeURIComponent(p.slug)}">Lihat Detail</a>
            <a class="btn btn--wa btn--sm" target="_blank" rel="noopener"
               href="${esc(linkWa(pesanPerumahan(p)))}">
              <svg class="ic" aria-hidden="true"><use href="#i-wa"></use></svg> Tanya
            </a>
          </div>
        </div>
      </article>`;
    }).join("") || '<p class="pkosong">Belum ada perumahan yang diisi. Tambahkan lewat menu admin.</p>';

    siapkanNav();
  }

  function pesanUmum() {
    return (DATA.pesanWa && DATA.pesanWa.umum) || "Halo Kak, saya ingin tanya-tanya soal perumahan.";
  }
  function pesanPerumahan(p) {
    return "Halo Kak, saya tertarik dengan *" + p.nama + "*" +
           (p.lokasiSingkat ? " di " + p.lokasiSingkat : "") + ". Boleh minta info lengkapnya?";
  }

  function siapkanNav() {
    const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
    const geser = () => nav.classList.toggle("is-scroll", window.scrollY > 10);
    geser(); window.addEventListener("scroll", geser, { passive: true });
    if (burger) burger.addEventListener("click", () => {
      const buka = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", buka ? "true" : "false");
    });
  }

  function gagalMuat(sebab) {
    console.error("[DATA] gagal:", sebab);
    $("#pgrid").innerHTML = '<p class="pkosong">Data tidak bisa dimuat. Coba muat ulang halaman.</p>';
  }

  (async function mulai() {
    try {
      DATA = await ambilDariDatabase();
      if (!DATA) DATA = await ambilCadangan();
      gambar();
    } catch (e) { gagalMuat(e.message); }
  })();
})();
