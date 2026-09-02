#!/usr/bin/env python3
"""
Server untuk MELIHAT WEBSITE DI KOMPUTER SENDIRI sebelum diunggah ke hosting.

Cara pakai — buka Terminal di folder ini, lalu ketik:

    python3 preview-lokal.py

Setelah itu buka http://localhost:4400 di browser.
Tekan Ctrl+C di Terminal untuk mematikannya.

File ini hanya alat bantu; tidak perlu diunggah ke hosting (kalaupun ikut
terunggah juga tidak apa-apa, tidak berpengaruh apa pun).

Bedanya dengan server biasa: file tidak disimpan di cache browser, jadi setiap
perubahan di config.js langsung terlihat begitu halaman dimuat ulang.
"""
import functools
import http.server
import os

PORT = 4400
FOLDER = os.path.dirname(os.path.abspath(__file__))


class Penangan(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def translate_path(self, path):
        # Meniru aturan Netlify: /p/<nama-perumahan> dilayani oleh perumahan.html
        # supaya tampilan di komputer sendiri sama persis dengan yang online.
        bersih = path.split("?", 1)[0].split("#", 1)[0]
        if bersih.startswith("/p/"):
            return os.path.join(FOLDER, "perumahan.html")
        return super().translate_path(path)

    def log_message(self, format, *args):        # tampilkan lebih ringkas
        print("  " + format % args)


if __name__ == "__main__":
    penangan = functools.partial(Penangan, directory=FOLDER)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), penangan)
    print(f"\n  Website berjalan  ->  http://localhost:{PORT}")
    print(f"  Folder            ->  {FOLDER}")
    print("  Tekan Ctrl+C untuk berhenti.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server dimatikan.\n")
