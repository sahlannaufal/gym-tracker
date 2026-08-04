"use client";

export default function OfflinePage() {
  return (
    <section className="space-y-4 py-10 text-center">
      <h1 className="text-2xl font-bold">Kamu sedang offline</h1>
      <p className="text-gray-400">
        Latihan yang sudah kamu catat tetap aman tersimpan di perangkatmu.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
      >
        Coba Lagi
      </button>
    </section>
  );
}
