import type { Metadata } from "next";
import Link from "next/link";
import { MARKETING_ORIGIN } from "@/lib/site";
import { MarketingSiteFooter, MarketingSiteHeader } from "@/components/MarketingSiteChrome";

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
    text: "Supabase memproses autentikasi dan penyimpanan cloud. Jika menggunakan login Google, autentikasi juga melibatkan Google. Aplikasi memproses identitas akun, email, catatan latihan, program, jadwal, dan pengukuran yang Anda masukkan untuk menyediakan fitur tersebut. Di production, browser pada halaman aplikasi setelah login dapat diarahkan ke tautan Shopee setiap lima menit selama tab terlihat jika akun tidak memiliki akses Coach Premium aktif. Tautan dapat membawa atribusi referral/afiliasi; jika memenuhi ketentuan Shopee, pengelola dapat menerima komisi tanpa biaya tambahan bagi Anda. Animasi tutorial dimuat dari CDN ExerciseDB saat tutorial dibuka; penyedia menerima permintaan jaringan dari perangkat Anda. Masing-masing penyedia juga memiliki kebijakan privasi sendiri.",
  },
  {
    title: "6. Analitik penggunaan",
    text: "Versi production menggunakan Google Analytics untuk mencatat kunjungan halaman, termasuk alamat halaman dan parameter URL. Mixpanel, jika diaktifkan, mencatat aktivitas fitur, autentikasi, instalasi, dan sinkronisasi untuk memahami penggunaan aplikasi. Profil Mixpanel dihubungkan dengan ID akun dan email; nama serta peran dapat disertakan jika tersedia. Layanan analitik menggunakan penyimpanan browser dan dapat memproses informasi perangkat serta jaringan. Karena itu, penggunaan aplikasi tidak sepenuhnya anonim.",
  },
  {
    title: "7. Iklan pada blog",
    text: "Blog publik dapat menampilkan iklan Google AdSense. Google dan mitranya dapat memproses informasi perangkat, jaringan, serta menggunakan cookie atau penyimpanan browser untuk penayangan dan pengukuran iklan sesuai pilihan persetujuan dan kebijakan mereka. Iklan tidak dimuat pada halaman pencatatan latihan, program, timer, progres, autentikasi, atau data akun; data latihan dan pengukuran tubuh tidak dibagikan untuk personalisasi iklan.",
  },
  {
    title: "8. Menghapus data dan berhenti menggunakan layanan",
    text: "Anda dapat menghapus entri latihan, program, dan pengukuran melalui fitur yang tersedia. Penghapusan data cloud membutuhkan koneksi dan sinkronisasi yang berhasil. Keluar dari akun atau menghapus data browser tidak menghapus akun maupun seluruh salinan cloud dan analitik. Saat ini belum tersedia tombol penghapusan akun, ekspor seluruh data, atau penghapusan profil analitik mandiri dalam aplikasi.",
  },
  {
    title: "9. Ketersediaan dan perubahan layanan",
    text: "Layanan dapat mengalami gangguan, kesalahan, atau perubahan fitur. Penyimpanan dan sinkronisasi tidak menjamin data selalu dapat dipulihkan. Simpan salinan terpisah untuk catatan yang penting bagi Anda. Ketentuan ini tidak dimaksudkan untuk menghapus hak pengguna atau kewajiban pengelola yang diberikan oleh hukum yang berlaku.",
  },
  {
    title: "10. Pembaruan ketentuan",
    text: "Perubahan ketentuan akan ditampilkan pada halaman ini beserta tanggal pembaruannya. Periksa kembali halaman ini untuk memahami ketentuan terbaru. Pemberitahuan ini bukan pengganti persetujuan terpisah apabila persetujuan tersebut diwajibkan untuk suatu pemrosesan data.",
  },
  {
    title: "11. Kontak",
    text: "Untuk pertanyaan terkait privasi atau permintaan mengenai data pribadi, hubungi pengelola Abadikan Gym melalui gabutintech@gmail.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="marketing-site min-h-screen bg-gray-950 text-gray-100">
      <MarketingSiteHeader />
      <main className="marketing-legal mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-20 lg:px-14">
        <Link href="/" className="marketing-article-back">← Kembali ke Abadikan Gym</Link>
        <header className="marketing-legal-header mt-8">
          <p className="marketing-editorial-kicker">INFORMASI LAYANAN</p>
          <h1 className="marketing-editorial-title mt-5">Syarat &amp; Ketentuan</h1>
          <p className="mt-5 text-sm text-gray-500">Terakhir diperbarui: 14 Oktober 2026</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-400">Kenali cara kerja layanan dan pengelolaan data Anda sebelum mulai mencatat latihan.</p>
        </header>
        <div className="marketing-legal-sections mt-12">
          {sections.map(({ title, text }, index) => (
            <section key={title} className="marketing-legal-section">
              <span className="marketing-legal-index">{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{title.replace(/^\d+\.\s*/, "")}</h2><p>{text}</p></div>
            </section>
          ))}
        </div>
      </main>
      <MarketingSiteFooter />
    </div>
  );
}
