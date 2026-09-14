import type { Metadata } from "next";
import Link from "next/link";
import { APP_ORIGIN, MARKETING_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Abadikan Gym",
  description: "Ketentuan penggunaan Abadikan Gym, penyimpanan data, dan informasi privasi pengguna.",
};

const sections = [
  {
    title: "1. Tentang layanan",
    text: "Abadikan Gym membantu Anda mencatat latihan, menyusun program, melihat progres, dan mencatat pengukuran tubuh. Gunakan layanan sesuai ketentuan ini dan hukum yang berlaku. Anda dapat berhenti menggunakan aplikasi kapan saja.",
  },
  {
    title: "2. Akun dan penggunaan yang bertanggung jawab",
    text: "Gunakan akun yang berhak Anda akses dan jaga kerahasiaan kredensial login. Jangan mencoba mengakses data orang lain, mengganggu layanan, atau menyalahgunakan sistem. Pada perangkat bersama, keluar dari akun setelah selesai dan perhatikan bahwa salinan data dapat tetap tersimpan di browser.",
  },
  {
    title: "3. Informasi latihan dan kesehatan",
    text: "Tutorial gerakan, grafik, dan perhitungan komposisi tubuh merupakan informasi umum untuk membantu pencatatan, bukan diagnosis atau saran medis pribadi. Aplikasi tidak menjamin hasil latihan tertentu. Sesuaikan latihan dengan kemampuan Anda; mintalah bantuan pelatih untuk teknik gerakan dan tenaga kesehatan untuk kondisi medis.",
  },
  {
    title: "4. Data lokal dan sinkronisasi",
    text: "Catatan latihan, program, jadwal, dan pengukuran tubuh disimpan di browser perangkat Anda dan disinkronkan ke Supabase saat Anda login serta koneksi tersedia. Preferensi timer juga tersimpan di browser. Menghapus data browser atau kehilangan perangkat dapat menghilangkan data yang belum tersinkron. Perubahan antarperangkat memakai waktu pembaruan terakhir dan dapat saling menimpa. Periksa status sinkronisasi di Profil sebelum berpindah perangkat.",
  },
  {
    title: "5. Akun, privasi, dan layanan pihak ketiga",
    text: "Supabase memproses autentikasi dan penyimpanan cloud. Jika menggunakan login Google, autentikasi juga melibatkan Google. Aplikasi memproses identitas akun, email, catatan latihan, program, jadwal, dan pengukuran yang Anda masukkan untuk menyediakan fitur tersebut. Animasi tutorial dimuat dari CDN ExerciseDB saat tutorial dibuka; penyedia menerima permintaan jaringan dari perangkat Anda. Masing-masing penyedia juga memiliki kebijakan privasi sendiri.",
  },
  {
    title: "6. Analitik penggunaan",
    text: "Versi production menggunakan Google Analytics untuk mencatat kunjungan halaman, termasuk alamat halaman dan parameter URL. Mixpanel, jika diaktifkan, mencatat aktivitas fitur, autentikasi, instalasi, dan sinkronisasi untuk memahami penggunaan aplikasi. Profil Mixpanel dihubungkan dengan ID akun dan email; nama serta peran dapat disertakan jika tersedia. Layanan analitik menggunakan penyimpanan browser dan dapat memproses informasi perangkat serta jaringan. Karena itu, penggunaan aplikasi tidak sepenuhnya anonim.",
  },
  {
    title: "7. Menghapus data dan berhenti menggunakan layanan",
    text: "Anda dapat menghapus entri latihan, program, dan pengukuran melalui fitur yang tersedia. Penghapusan data cloud membutuhkan koneksi dan sinkronisasi yang berhasil. Keluar dari akun atau menghapus data browser tidak menghapus akun maupun seluruh salinan cloud dan analitik. Saat ini belum tersedia tombol penghapusan akun, ekspor seluruh data, atau penghapusan profil analitik mandiri dalam aplikasi.",
  },
  {
    title: "8. Ketersediaan dan perubahan layanan",
    text: "Layanan dapat mengalami gangguan, kesalahan, atau perubahan fitur. Penyimpanan dan sinkronisasi tidak menjamin data selalu dapat dipulihkan. Simpan salinan terpisah untuk catatan yang penting bagi Anda. Ketentuan ini tidak dimaksudkan untuk menghapus hak pengguna atau kewajiban pengelola yang diberikan oleh hukum yang berlaku.",
  },
  {
    title: "9. Pembaruan ketentuan",
    text: "Perubahan ketentuan akan ditampilkan pada halaman ini beserta tanggal pembaruannya. Periksa kembali halaman ini untuk memahami ketentuan terbaru. Pemberitahuan ini bukan pengganti persetujuan terpisah apabila persetujuan tersebut diwajibkan untuk suatu pemrosesan data.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
      <Link href={`${APP_ORIGIN}/account`} className="text-sm text-lime-400 hover:underline">Kembali ke Profil</Link>
      <header className="mt-6 space-y-3">
        <p className="text-sm font-semibold text-lime-400">Abadikan Gym</p>
        <h1 className="text-3xl font-bold">Syarat &amp; Ketentuan</h1>
        <p className="text-sm text-gray-400">Terakhir diperbarui: 12 September 2026</p>
        <p className="leading-relaxed text-gray-300">Kenali cara kerja layanan dan pengelolaan data Anda sebelum mulai mencatat latihan.</p>
      </header>
      <div className="mt-8 space-y-8">
        {sections.map(({ title, text }) => (
          <section key={title} className="space-y-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm leading-7 text-gray-300">{text}</p>
          </section>
        ))}
      </div>
      <footer className="mt-10 flex flex-wrap gap-5 border-t border-gray-800 pt-6 text-sm text-lime-400">
        <Link href={`${APP_ORIGIN}/login`} className="hover:underline">Masuk / Daftar</Link>
        <Link href={MARKETING_ORIGIN} className="hover:underline">Tentang Abadikan Gym</Link>
      </footer>
    </main>
  );
}
