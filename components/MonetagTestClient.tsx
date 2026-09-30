"use client";

export default function MonetagTestClient() {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      <div>
        <h1 className="text-2xl font-bold">Monetag Test</h1>
        <p className="mt-2 text-sm text-gray-400">
          Halaman ini dipakai untuk verifikasi Monetag dan tidak memicu iklan.
          Iklan hanya dipicu setelah workout tersimpan atau tombol mulai istirahat ditekan.
        </p>
      </div>
      <p className="text-sm text-gray-300">
        Jika Monetag meminta pengecekan, gunakan halaman ini sebagai URL uji.
      </p>
    </section>
  );
}
