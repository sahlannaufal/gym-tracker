import type { Metadata } from "next";
import Link from "next/link";
import { APP_ORIGIN, MARKETING_ORIGIN } from "@/lib/site";

const pageUrl = `${MARKETING_ORIGIN}/privacy`;

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Abadikan Gym",
  description: "Penjelasan pemrosesan data, cookie, analitik, dan iklan di Abadikan Gym.",
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: pageUrl,
    siteName: "Abadikan Gym",
    title: "Kebijakan Privasi | Abadikan Gym",
    description: "Penjelasan pemrosesan data di Abadikan Gym.",
  },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "1. Ruang lingkup",
    text: "Kebijakan ini menjelaskan bagaimana Abadikan Gym memproses data saat Anda memakai aplikasi di gym.abadikan.com serta situs marketing dan blog di abadikan.com. Kebijakan ini berlaku bersama Syarat & Ketentuan dan tidak menggantikan hak yang diberikan oleh hukum yang berlaku.",
  },
  {
    title: "2. Data yang diproses",
    text: "Kami memproses data akun seperti alamat email dan ID pengguna dari layanan autentikasi, serta data yang Anda masukkan ke aplikasi: catatan workout, program latihan, jadwal, latihan custom, pengukuran tubuh, dan preferensi timer. Saat Anda mengunjungi situs, layanan pihak ketiga dapat memproses data teknis seperti alamat IP, jenis perangkat/peramban, halaman yang dibuka, serta cookie atau penyimpanan browser sesuai pengaturan dan pilihan persetujuan Anda.",
  },
  {
    title: "3. Tujuan penggunaan",
    text: "Data aplikasi digunakan untuk autentikasi, menyimpan dan menyinkronkan catatan antarperangkat, menampilkan progres, serta menjaga layanan berfungsi. Data kunjungan digunakan untuk memahami penggunaan situs dan memperbaiki layanan. Kami tidak menjual catatan workout atau pengukuran tubuh Anda.",
  },
  {
    title: "4. Penyimpanan lokal dan cloud",
    text: "Aplikasi menyimpan salinan data di browser perangkat agar dapat tetap digunakan secara offline. Saat login dan koneksi tersedia, data disinkronkan ke Supabase. Menghapus data browser dapat menghapus salinan lokal yang belum tersinkron; menghapus entri di aplikasi memerlukan sinkronisasi yang berhasil agar perubahan diterapkan pada salinan cloud.",
  },
  {
    title: "5. Penyedia layanan pihak ketiga",
    text: "Supabase digunakan untuk autentikasi dan penyimpanan cloud. Google dapat terlibat saat Anda memakai login Google, Google Analytics, atau iklan Google AdSense di blog. Mixpanel dapat digunakan untuk analitik penggunaan aplikasi. Tutorial gerakan memuat animasi dari CDN ExerciseDB hanya ketika tutorial dibuka. Setiap penyedia memproses data sesuai kebijakan privasinya masing-masing.",
  },
  {
    title: "6. Iklan, cookie, dan pilihan persetujuan",
    text: "Iklan Google AdSense hanya dapat tampil di artikel blog publik, bukan pada layar latihan, timer, progres, akun, atau autentikasi. Data workout dan pengukuran tubuh tidak dikirim untuk personalisasi iklan. Jika Google CMP aktif, pengunjung di wilayah yang relevan akan menerima pilihan untuk menyetujui, menolak, atau mengatur penggunaan data dan cookie untuk iklan. Anda dapat mengubah pilihan tersebut melalui pengaturan privasi dan cookie yang tersedia di situs.",
  },
  {
    title: "7. Retensi dan penghapusan data",
    text: "Data disimpan selama diperlukan untuk menyediakan layanan atau sampai dihapus melalui fitur yang tersedia. Anda dapat menghapus catatan workout, program, dan pengukuran dari aplikasi. Keluar dari akun atau menghapus data browser tidak otomatis menghapus akun, seluruh salinan cloud, atau data analitik. Fitur penghapusan akun dan ekspor seluruh data belum tersedia secara mandiri pada versi saat ini.",
  },
  {
    title: "8. Keamanan",
    text: "Kami menggunakan autentikasi dan aturan akses pada layanan penyimpanan cloud untuk membatasi akses ke data akun. Namun, tidak ada pengiriman atau penyimpanan digital yang sepenuhnya bebas risiko. Lindungi kredensial akun dan gunakan perangkat yang tepercaya, terutama pada perangkat bersama.",
  },
  {
    title: "9. Hak dan pertanyaan privasi",
    text: "Bergantung pada hukum yang berlaku di lokasi Anda, Anda dapat memiliki hak untuk meminta akses, koreksi, penghapusan, pembatasan, atau informasi mengenai pemrosesan data. Untuk pertanyaan atau permintaan privasi, hubungi pengelola data Abadikan Gym melalui gabutintech@gmail.com. Gunakan fitur penghapusan data yang tersedia di aplikasi dan jangan memasukkan informasi kesehatan yang tidak diperlukan.",
  },
  {
    title: "10. Perubahan kebijakan",
    text: "Kami dapat memperbarui kebijakan ini saat layanan, penyedia, atau kewajiban hukum berubah. Tanggal pembaruan akan diubah pada halaman ini. Perubahan penting dapat memerlukan pemberitahuan atau persetujuan tambahan sesuai hukum yang berlaku.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
      <Link href={MARKETING_ORIGIN} className="text-sm text-lime-400 hover:underline">Kembali ke Abadikan Gym</Link>
      <header className="mt-6 space-y-3">
        <p className="text-sm font-semibold text-lime-400">Abadikan Gym</p>
        <h1 className="text-3xl font-bold">Kebijakan Privasi</h1>
        <p className="text-sm text-gray-400">Terakhir diperbarui: 21 September 2026</p>
        <p className="leading-relaxed text-gray-300">Penjelasan ringkas mengenai data yang diproses, alasan penggunaannya, dan pilihan Anda saat memakai Abadikan Gym.</p>
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
        <Link href="/terms" className="hover:underline">Syarat &amp; Ketentuan</Link>
        <a href="mailto:gabutintech@gmail.com" className="hover:underline">gabutintech@gmail.com</a>
      </footer>
    </main>
  );
}
