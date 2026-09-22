export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  keywords: string[];
  intro: string;
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "latihan-gym-3-kali-seminggu",
    title: "Latihan Gym 3 Kali Seminggu: Panduan Program Full Body untuk Pemula",
    description: "Panduan menyusun latihan gym 3 kali seminggu dengan program full body yang sederhana, seimbang, dan mudah dipantau progresnya.",
    publishedAt: "2026-09-21",
    readingTime: "7 menit baca",
    keywords: ["latihan gym 3 kali seminggu", "program gym 3 hari", "full body workout pemula", "jadwal gym pemula"],
    intro: "Latihan tiga kali seminggu adalah pilihan yang realistis bagi banyak pemula. Jadwal ini memberi cukup kesempatan untuk mempelajari gerakan dasar, membangun kebiasaan, dan tetap menyediakan hari pemulihan di antara sesi.",
    sections: [
      {
        heading: "Mengapa tiga kali seminggu cocok untuk pemula",
        paragraphs: [
          "Program yang baik adalah program yang dapat dijalankan berulang kali. Tiga sesi gym per minggu lebih mudah dipertahankan dibanding jadwal yang padat, terutama saat Anda masih menyesuaikan waktu, teknik, dan pemulihan.",
          "Dengan pola full body, kelompok otot utama mendapat stimulus di setiap sesi tanpa perlu menghabiskan terlalu banyak waktu di gym. Anda juga memperoleh beberapa kesempatan setiap minggu untuk berlatih gerakan yang sama dan melihat perkembangannya.",
        ],
      },
      {
        heading: "Contoh jadwal latihan 3 hari",
        paragraphs: [
          "Pilih hari yang menyisakan setidaknya satu hari istirahat di antara sesi, misalnya Senin, Rabu, dan Jumat. Jika jadwal Anda berubah, pindahkan sesi ke hari lain tanpa perlu memulai program dari awal.",
        ],
        bullets: [
          "Senin: Full body A.",
          "Rabu: Full body B.",
          "Jumat: Full body A, lalu gunakan B pada Senin berikutnya.",
          "Istirahat atau aktivitas ringan pada hari di antara sesi.",
        ],
      },
      {
        heading: "Pilih gerakan utama yang sederhana",
        paragraphs: [
          "Setiap sesi cukup berisi satu gerakan untuk pola squat, dorong, tarik, dan hip hinge. Tambahkan satu atau dua latihan pendukung jika waktu dan energi masih cukup. Pilih variasi yang sesuai dengan alat yang tersedia dan dapat dilakukan dengan teknik stabil.",
        ],
        bullets: [
          "Squat atau leg press untuk kaki.",
          "Bench press, chest press, atau push-up untuk pola dorong.",
          "Seated row atau lat pulldown untuk pola tarik.",
          "Romanian deadlift atau hip thrust untuk hip hinge.",
          "Plank, curl, atau lateral raise sebagai latihan pendukung opsional.",
        ],
      },
      {
        heading: "Atur set, repetisi, dan istirahat",
        paragraphs: [
          "Mulailah dengan dua hingga tiga set kerja per gerakan. Untuk banyak latihan, rentang 8–12 repetisi adalah titik awal yang praktis. Gunakan beban yang masih memungkinkan rentang gerak dan teknik tetap rapi.",
          "Istirahat sekitar satu hingga tiga menit biasanya cukup untuk latihan umum, sementara gerakan compound yang lebih berat dapat membutuhkan waktu lebih lama. Gunakan timer sebagai pengingat, lalu sesuaikan saat napas atau teknik belum siap untuk set berikutnya.",
        ],
      },
      {
        heading: "Cara menaikkan target secara bertahap",
        paragraphs: [
          "Tidak perlu menaikkan beban pada setiap sesi. Coba gunakan rentang repetisi: saat semua set dapat mencapai batas atas dengan teknik baik, tambahkan beban sekecil yang tersedia dan kembali ke bagian bawah rentang repetisi.",
          "Contohnya, bila Anda dapat melakukan tiga set chest press 12 repetisi dengan beban yang sama, naikkan sedikit beban pada sesi berikutnya. Jika repetisi kembali menjadi 8 atau 9, itu tetap bagian normal dari proses progresif.",
        ],
      },
      {
        heading: "Catat hasil agar program mudah dievaluasi",
        paragraphs: [
          "Catat nama latihan, beban, repetisi, set, dan tanggal segera setelah latihan. Catatan ini membantu Anda menentukan target sesi berikutnya dan membedakan variasi performa harian dari tren progres yang nyata.",
          "Jalankan program setidaknya beberapa minggu sebelum mengubah banyak hal sekaligus. Jika gerakan terasa nyeri atau teknik tidak aman, hentikan latihan tersebut dan pertimbangkan meminta bantuan pelatih yang kompeten.",
        ],
      },
    ],
  },
  {
    slug: "cara-mencatat-progres-gym",
    title: "Cara Mencatat Progres Gym agar Latihan Lebih Terarah",
    description: "Panduan praktis mencatat beban, repetisi, set, dan perkembangan latihan gym agar progres lebih mudah dievaluasi.",
    publishedAt: "2026-09-11",
    readingTime: "5 menit baca",
    keywords: ["cara mencatat progres gym", "catatan latihan gym", "tracking gym"],
    intro: "Progres latihan sulit dinilai jika kita hanya mengandalkan ingatan. Catatan sederhana membantu menunjukkan apa yang benar-benar meningkat dan bagian mana yang perlu diperbaiki.",
    sections: [
      { heading: "Data yang perlu dicatat", paragraphs: ["Untuk latihan beban, mulailah dari empat data utama: nama gerakan, beban, repetisi, dan jumlah set. Tambahkan tanggal agar setiap sesi dapat dibandingkan secara kronologis."], bullets: ["Gunakan nama latihan yang konsisten.", "Catat set kerja, bukan hanya set pemanasan.", "Masukkan data segera setelah set atau sesi selesai.", "Gunakan satuan beban yang sama."] },
      { heading: "Bandingkan latihan yang sama", paragraphs: ["Bench press sebaiknya dibandingkan dengan bench press, bukan dengan gerakan dada lain. Lihat beban terbaik pada jumlah repetisi yang serupa dan perhatikan total pekerjaan selama beberapa sesi.", "Satu sesi yang buruk tidak selalu berarti kemunduran. Tidur, teknik, jeda istirahat, dan kondisi tubuh dapat memengaruhi performa harian."] },
      { heading: "Evaluasi dalam beberapa minggu", paragraphs: ["Cari pola dalam rentang beberapa minggu. Jika beban, repetisi, atau kualitas teknik perlahan naik, program kemungkinan bergerak ke arah yang benar."], bullets: ["Tinjau grafik untuk setiap latihan utama.", "Periksa apakah frekuensi latihan konsisten.", "Catat perubahan program agar perbandingan tetap adil."] },
      { heading: "Gunakan catatan untuk sesi berikutnya", paragraphs: ["Catatan terbaik adalah catatan yang membantu mengambil keputusan. Sebelum memulai sesi, lihat hasil terakhir lalu tentukan target realistis, misalnya menambah satu repetisi atau kenaikan beban kecil."] },
    ],
  },
  {
    slug: "panduan-progressive-overload",
    title: "Panduan Progressive Overload untuk Pemula",
    description: "Pelajari progressive overload, cara menerapkannya, dan kapan menaikkan beban tanpa terburu-buru.",
    publishedAt: "2026-09-11",
    readingTime: "6 menit baca",
    keywords: ["progressive overload", "cara menambah beban gym", "progres latihan"],
    intro: "Progressive overload adalah proses meningkatkan tuntutan latihan secara bertahap. Tujuannya bukan menambah beban setiap hari, melainkan memberi tubuh alasan untuk beradaptasi dari waktu ke waktu.",
    sections: [
      { heading: "Overload tidak hanya berarti beban", paragraphs: ["Menambah berat barbel hanyalah salah satu cara. Anda juga dapat menambah repetisi, set yang berkualitas, rentang gerak, kontrol tempo, atau memperbaiki teknik pada beban yang sama."], bullets: ["Beban bertambah dengan teknik tetap baik.", "Repetisi bertambah pada beban yang sama.", "Gerakan menjadi lebih stabil dan terkontrol.", "Volume mingguan naik secara bertahap."] },
      { heading: "Gunakan rentang repetisi", paragraphs: ["Pilih rentang, misalnya 8–12 repetisi. Pertahankan beban hingga semua set mencapai batas atas dengan teknik yang konsisten. Setelah itu naikkan beban sedikit dan mulai lagi dari bagian bawah rentang."] },
      { heading: "Jangan memaksa progres linear", paragraphs: ["Semakin lama berlatih, progres biasanya melambat. Menahan beban selama beberapa sesi bukan kegagalan. Hindari mengorbankan teknik hanya untuk membuat angka terlihat naik."], bullets: ["Kurangi target saat pemulihan buruk.", "Gunakan kenaikan beban terkecil yang tersedia.", "Pertimbangkan minggu latihan lebih ringan ketika kelelahan menumpuk."] },
      { heading: "Catat sebelum mengambil keputusan", paragraphs: ["Lihat setidaknya beberapa sesi untuk latihan yang sama. Riwayat beban dan repetisi membantu membedakan stagnasi nyata dari variasi performa biasa."] },
    ],
  },
  {
    slug: "program-latihan-gym-pemula",
    title: "Contoh Program Latihan Gym untuk Pemula",
    description: "Contoh susunan program gym pemula yang sederhana, seimbang, dan mudah diikuti secara konsisten.",
    publishedAt: "2026-09-11",
    readingTime: "6 menit baca",
    keywords: ["program gym pemula", "jadwal latihan gym", "latihan full body"],
    intro: "Program pemula tidak perlu berisi banyak gerakan. Program yang sederhana lebih mudah dipelajari, diulang, dan dievaluasi daripada jadwal rumit yang sering berubah.",
    sections: [
      { heading: "Mulai dengan tiga sesi full body", paragraphs: ["Tiga sesi per minggu memberi kesempatan berlatih secara rutin sekaligus menyediakan waktu pemulihan. Sisakan setidaknya satu hari di antara dua sesi jika tubuh belum terbiasa."], bullets: ["Squat atau leg press.", "Bench press atau push-up.", "Row atau lat pulldown.", "Hip hinge seperti Romanian deadlift.", "Latihan core sederhana."] },
      { heading: "Batasi jumlah latihan", paragraphs: ["Empat hingga enam gerakan per sesi sudah cukup sebagai awal. Utamakan gerakan yang dapat dilakukan dengan teknik stabil dan peralatan yang tersedia di tempat latihan."] },
      { heading: "Tentukan set dan repetisi", paragraphs: ["Mulailah dengan dua atau tiga set kerja per latihan. Rentang 8–12 repetisi praktis untuk banyak gerakan, tetapi bukan aturan mutlak. Pilih beban yang masih memungkinkan teknik tetap rapi."], bullets: ["Berhenti jika gerakan terasa sakit.", "Berikan waktu untuk mempelajari teknik.", "Tambahkan beban secara bertahap."] },
      { heading: "Pertahankan program cukup lama", paragraphs: ["Jalankan pola dasar selama beberapa minggu agar tersedia data yang dapat dibandingkan. Ganti gerakan jika ada alasan jelas, seperti keterbatasan alat, rasa tidak nyaman, atau kebutuhan program baru."] },
    ],
  },
  {
    slug: "waktu-istirahat-antar-set",
    title: "Berapa Lama Waktu Istirahat Antar Set?",
    description: "Panduan menentukan waktu istirahat antar set berdasarkan jenis latihan dan tujuan sesi gym.",
    publishedAt: "2026-09-11",
    readingTime: "5 menit baca",
    keywords: ["waktu istirahat antar set", "rest timer gym", "jeda latihan gym"],
    intro: "Jeda antar set memengaruhi kesiapan untuk set berikutnya. Waktu yang terlalu singkat dapat menurunkan performa, sedangkan jeda yang sangat panjang bisa membuat sesi kurang efisien.",
    sections: [
      { heading: "Sesuaikan dengan jenis latihan", paragraphs: ["Gerakan compound berat biasanya membutuhkan jeda lebih panjang daripada latihan isolasi ringan. Kebutuhan setiap orang juga berbeda berdasarkan beban, repetisi, dan kondisi hari itu."], bullets: ["Latihan compound berat: sekitar 2–4 menit.", "Latihan hipertrofi umum: sekitar 1–3 menit.", "Latihan isolasi ringan: sekitar 45–90 detik."] },
      { heading: "Gunakan performa sebagai petunjuk", paragraphs: ["Jika repetisi turun tajam karena napas belum pulih, jeda mungkin terlalu singkat. Jika tubuh sudah siap tetapi Anda terus menunggu tanpa alasan, jeda dapat diringkas."] },
      { heading: "Jaga konsistensi pengukuran", paragraphs: ["Menggunakan jeda yang relatif konsisten membuat perbandingan antar sesi lebih masuk akal. Kenaikan performa menjadi lebih mudah dibaca karena kondisi latihannya serupa."] },
      { heading: "Timer membantu tanpa mengikat", paragraphs: ["Rest timer dapat mencegah jeda tanpa sadar menjadi terlalu lama. Gunakan sebagai pengingat, lalu sesuaikan berdasarkan kesiapan dan keamanan—bukan sebagai aturan yang harus dipatuhi secara kaku."] },
    ],
  },
  {
    slug: "cara-membaca-grafik-progres-beban",
    title: "Cara Membaca Grafik Progres Beban Latihan",
    description: "Cara memahami tren grafik beban gym dan menghindari kesimpulan dari satu sesi latihan saja.",
    publishedAt: "2026-09-11",
    readingTime: "5 menit baca",
    keywords: ["grafik progres beban", "progres gym", "tracking beban latihan"],
    intro: "Grafik progres mengubah catatan latihan menjadi pola yang lebih mudah dilihat. Namun, garis yang naik dan turun tetap perlu dibaca bersama repetisi, set, dan konteks program.",
    sections: [
      { heading: "Perhatikan tren, bukan satu titik", paragraphs: ["Penurunan pada satu sesi dapat terjadi karena kelelahan, perubahan urutan latihan, atau waktu istirahat. Fokus pada arah beberapa minggu, bukan satu angka yang berdiri sendiri."] },
      { heading: "Bandingkan kondisi yang setara", paragraphs: ["Beban 80 kg untuk tiga repetisi tidak sama dengan 75 kg untuk sepuluh repetisi. Saat membaca grafik beban maksimum, buka riwayat untuk memastikan jumlah repetisi dan set masih relevan."], bullets: ["Gunakan nama gerakan yang sama.", "Perhatikan perubahan teknik atau alat.", "Bandingkan rentang repetisi yang serupa."] },
      { heading: "Volume memberi konteks tambahan", paragraphs: ["Total volume sederhana dapat dihitung dari beban × repetisi × set. Angka ini bukan ukuran sempurna, tetapi dapat membantu menjelaskan mengapa beban maksimum tidak berubah sementara total pekerjaan meningkat."] },
      { heading: "Kapan program perlu dievaluasi", paragraphs: ["Jika tren tidak bergerak selama beberapa minggu dan performa terasa terus menurun, periksa pemulihan, teknik, target beban, serta susunan program sebelum menambah latihan secara sembarangan."] },
    ],
  },
  {
    slug: "cara-konsisten-latihan-gym",
    title: "Cara Menjaga Konsistensi Latihan Gym",
    description: "Strategi praktis membangun kebiasaan gym yang realistis dan dapat dipertahankan dalam jangka panjang.",
    publishedAt: "2026-09-11",
    readingTime: "5 menit baca",
    keywords: ["cara konsisten gym", "kebiasaan latihan", "jadwal gym"],
    intro: "Konsistensi bukan berarti tidak pernah melewatkan latihan. Konsistensi berarti memiliki pola yang cukup realistis sehingga Anda dapat kembali berlatih setelah jadwal terganggu.",
    sections: [
      { heading: "Buat target yang dapat dijalankan", paragraphs: ["Jadwal dua atau tiga kali per minggu yang benar-benar dilakukan lebih berguna daripada rencana enam hari yang cepat ditinggalkan. Mulailah dari kapasitas waktu yang tersedia sekarang."] },
      { heading: "Kurangi keputusan saat hari latihan", paragraphs: ["Program yang sudah disiapkan membuat Anda tidak perlu menentukan latihan dari awal setiap kali datang ke gym."], bullets: ["Tentukan hari latihan yang paling realistis.", "Simpan program tetap untuk beberapa minggu.", "Siapkan alternatif ketika alat sedang digunakan.", "Catat hasil sebelum meninggalkan gym."] },
      { heading: "Pantau kehadiran tanpa mengejar kesempurnaan", paragraphs: ["Kalender atau heatmap aktivitas membantu melihat pola dalam jangka panjang. Minggu kosong adalah informasi, bukan alasan untuk berhenti. Mulai kembali dari sesi berikutnya."] },
      { heading: "Buat sesi minimum", paragraphs: ["Pada hari yang sibuk, lakukan versi singkat dari program: beberapa gerakan utama dengan jumlah set yang wajar. Strategi ini menjaga kebiasaan tanpa memaksakan volume ketika waktu atau energi terbatas."] },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
