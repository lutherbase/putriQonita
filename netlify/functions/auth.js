/* Langkah 1 dari login admin: mengantar Anda ke halaman izin GitHub.
   Tidak ada kata sandi yang disimpan di sini — GitHub yang memverifikasi. */
export async function handler(event) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return pesanGagal("GITHUB_CLIENT_ID belum diisi di pengaturan Netlify (Environment variables).");
  }

  const host  = event.headers["x-forwarded-host"] || event.headers.host;
  const asal  = `https://${host}`;
  const acak  = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const tujuan = new URL("https://github.com/login/oauth/authorize");
  tujuan.searchParams.set("client_id", clientId);
  tujuan.searchParams.set("redirect_uri", `${asal}/api/callback`);
  tujuan.searchParams.set("scope", "repo");          // izin menulis ke repositori website
  tujuan.searchParams.set("state", acak);

  return {
    statusCode: 302,
    headers: {
      Location: tujuan.toString(),
      "Cache-Control": "no-store",
      "Set-Cookie": `oauth_state=${acak}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    },
    body: ""
  };
}

function pesanGagal(teks) {
  return {
    statusCode: 500,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:40px;line-height:1.6">
      <h2>Login belum bisa dipakai</h2><p>${teks}</p></body>`
  };
}
