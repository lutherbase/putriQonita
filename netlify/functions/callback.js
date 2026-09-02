/* Langkah 2 dari login admin: menerima balasan GitHub, menukarnya jadi kunci
   akses, lalu menyerahkannya ke menu admin yang membuka jendela ini. */
export async function handler(event) {
  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const kode         = (event.queryStringParameters || {}).code;
  const state        = (event.queryStringParameters || {}).state;

  if (!clientId || !clientSecret) return balas(false, "Pengaturan GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET belum lengkap di Netlify.");
  if (!kode) return balas(false, "GitHub tidak mengirim kode izin. Coba login ulang.");

  // pastikan balasan ini memang dari proses login yang kita mulai sendiri
  const cookie = event.headers.cookie || "";
  const cocok  = /(?:^|;\s*)oauth_state=([^;]+)/.exec(cookie);
  if (!cocok || !state || cocok[1] !== state) {
    return balas(false, "Sesi login tidak cocok. Tutup jendela ini lalu coba lagi.");
  }

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code: kode })
    });
    const data = await r.json();
    if (data.error || !data.access_token) {
      return balas(false, "GitHub menolak: " + (data.error_description || data.error || "tidak diketahui"));
    }
    return balas(true, null, data.access_token);
  } catch (e) {
    return balas(false, "Gagal menghubungi GitHub: " + e.message);
  }
}

/* Menu admin menunggu pesan dengan format khusus di bawah ini. */
function balas(sukses, pesanGagal, token) {
  const isi = sukses
    ? JSON.stringify({ token, provider: "github" })
    : JSON.stringify({ error: pesanGagal });
  const status = sukses ? "success" : "error";

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
               "Set-Cookie": "oauth_state=; Path=/; Max-Age=0" },
    body: `<!doctype html><meta charset="utf-8">
<body style="font-family:system-ui;padding:40px;line-height:1.6">
  <p>${sukses ? "Berhasil masuk. Jendela ini akan menutup sendiri…" : "Gagal masuk: " + pesanGagal}</p>
  <script>
    (function () {
      var isi = 'authorization:github:${status}:' + ${JSON.stringify(isi)};
      function terima(e) {
        window.opener.postMessage(isi, e.origin);
        window.removeEventListener('message', terima, false);
        ${sukses ? "setTimeout(function(){ window.close(); }, 800);" : ""}
      }
      window.addEventListener('message', terima, false);
      if (window.opener) window.opener.postMessage('authorizing:github', '*');
      else document.body.insertAdjacentHTML('beforeend', '<p>Buka menu admin lewat tombol Login, jangan alamat ini langsung.</p>');
    })();
  </script>
</body>`
  };
}
