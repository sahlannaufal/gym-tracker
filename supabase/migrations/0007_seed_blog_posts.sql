-- Seed 7 artikel awal yang sebelumnya hardcoded di lib/blog.ts.
-- Konten dikonversi dari struktur sections menjadi HTML (h2/p/ul).
insert into public.blog_posts
  (slug, title, description, intro, published_at, reading_time, keywords, content_html, status)
values
(
  'latihan-gym-3-kali-seminggu',
  'Latihan Gym 3 Kali Seminggu: Panduan Program Full Body untuk Pemula',
  'Panduan menyusun latihan gym 3 kali seminggu dengan program full body yang sederhana, seimbang, dan mudah dipantau progresnya.',
  'Latihan tiga kali seminggu adalah pilihan yang realistis bagi banyak pemula. Jadwal ini memberi cukup kesempatan untuk mempelajari gerakan dasar, membangun kebiasaan, dan tetap menyediakan hari pemulihan di antara sesi.',
  '2026-09-21'::date,
  '7 menit baca',
  array['latihan gym 3 kali seminggu', 'program gym 3 hari', 'full body workout pemula', 'jadwal gym pemula'],
  '<p>Latihan tiga kali seminggu adalah pilihan yang realistis bagi banyak pemula. Jadwal ini memberi cukup kesempatan untuk mempelajari gerakan dasar, membangun kebiasaan, dan tetap menyediakan hari pemulihan di antara sesi.</p><h2>Mengapa tiga kali seminggu cocok untuk pemula</h2><p>Program yang baik adalah program yang dapat dijalankan berulang kali. Tiga sesi gym per minggu lebih mudah dipertahankan dibanding jadwal yang padat, terutama saat Anda masih menyesuaikan waktu, teknik, dan pemulihan.</p><p>Dengan pola full body, kelompok otot utama mendapat stimulus di setiap sesi tanpa perlu menghabiskan terlalu banyak waktu di gym. Anda juga memperoleh beberapa kesempatan setiap minggu untuk berlatih gerakan yang sama dan melihat perkembangannya.</p><h2>Contoh jadwal latihan 3 hari</h2><p>Pilih hari yang menyisakan setidaknya satu hari istirahat di antara sesi, misalnya Senin, Rabu, dan Jumat. Jika jadwal Anda berubah, pindahkan sesi ke hari lain tanpa perlu memulai program dari awal.</p><ul><li>Senin: Full body A.</li><li>Rabu: Full body B.</li><li>Jumat: Full body A, lalu gunakan B pada Senin berikutnya.</li><li>Istirahat atau aktivitas ringan pada hari di antara sesi.</li></ul><h2>Pilih gerakan utama yang sederhana</h2><p>Setiap sesi cukup berisi satu gerakan untuk pola squat, dorong, tarik, dan hip hinge. Tambahkan satu atau dua latihan pendukung jika waktu dan energi masih cukup. Pilih variasi yang sesuai dengan alat yang tersedia dan dapat dilakukan dengan teknik stabil.</p><ul><li>Squat atau leg press untuk kaki.</li><li>Bench press, chest press, atau push-up untuk pola dorong.</li><li>Seated row atau lat pulldown untuk pola tarik.</li><li>Romanian deadlift atau hip thrust untuk hip hinge.</li><li>Plank, curl, atau lateral raise sebagai latihan pendukung opsional.</li></ul><h2>Atur set, repetisi, dan istirahat</h2><p>Mulailah dengan dua hingga tiga set kerja per gerakan. Untuk banyak latihan, rentang 8–12 repetisi adalah titik awal yang praktis. Gunakan beban yang masih memungkinkan rentang gerak dan teknik tetap rapi.</p><p>Istirahat sekitar satu hingga tiga menit biasanya cukup untuk latihan umum, sementara gerakan compound yang lebih berat dapat membutuhkan waktu lebih lama. Gunakan timer sebagai pengingat, lalu sesuaikan saat napas atau teknik belum siap untuk set berikutnya.</p><h2>Cara menaikkan target secara bertahap</h2><p>Tidak perlu menaikkan beban pada setiap sesi. Coba gunakan rentang repetisi: saat semua set dapat mencapai batas atas dengan teknik baik, tambahkan beban sekecil yang tersedia dan kembali ke bagian bawah rentang repetisi.</p><p>Contohnya, bila Anda dapat melakukan tiga set chest press 12 repetisi dengan beban yang sama, naikkan sedikit beban pada sesi berikutnya. Jika repetisi kembali menjadi 8 atau 9, itu tetap bagian normal dari proses progresif.</p><h2>Catat hasil agar program mudah dievaluasi</h2><p>Catat nama latihan, beban, repetisi, set, dan tanggal segera setelah latihan. Catatan ini membantu Anda menentukan target sesi berikutnya dan membedakan variasi performa harian dari tren progres yang nyata.</p><p>Jalankan program setidaknya beberapa minggu sebelum mengubah banyak hal sekaligus. Jika gerakan terasa nyeri atau teknik tidak aman, hentikan latihan tersebut dan pertimbangkan meminta bantuan pelatih yang kompeten.</p>',
  'published'
),
(
  'cara-mencatat-progres-gym',
  'Cara Mencatat Progres Gym agar Latihan Lebih Terarah',
  'Panduan praktis mencatat beban, repetisi, set, dan perkembangan latihan gym agar progres lebih mudah dievaluasi.',
  'Progres latihan sulit dinilai jika kita hanya mengandalkan ingatan. Catatan sederhana membantu menunjukkan apa yang benar-benar meningkat dan bagian mana yang perlu diperbaiki.',
  '2026-09-11'::date,
  '5 menit baca',
  array['cara mencatat progres gym', 'catatan latihan gym', 'tracking gym'],
  '<p>Progres latihan sulit dinilai jika kita hanya mengandalkan ingatan. Catatan sederhana membantu menunjukkan apa yang benar-benar meningkat dan bagian mana yang perlu diperbaiki.</p><h2>Data yang perlu dicatat</h2><p>Untuk latihan beban, mulailah dari empat data utama: nama gerakan, beban, repetisi, dan jumlah set. Tambahkan tanggal agar setiap sesi dapat dibandingkan secara kronologis.</p><ul><li>Gunakan nama latihan yang konsisten.</li><li>Catat set kerja, bukan hanya set pemanasan.</li><li>Masukkan data segera setelah set atau sesi selesai.</li><li>Gunakan satuan beban yang sama.</li></ul><h2>Bandingkan latihan yang sama</h2><p>Bench press sebaiknya dibandingkan dengan bench press, bukan dengan gerakan dada lain. Lihat beban terbaik pada jumlah repetisi yang serupa dan perhatikan total pekerjaan selama beberapa sesi.</p><p>Satu sesi yang buruk tidak selalu berarti kemunduran. Tidur, teknik, jeda istirahat, dan kondisi tubuh dapat memengaruhi performa harian.</p><h2>Evaluasi dalam beberapa minggu</h2><p>Cari pola dalam rentang beberapa minggu. Jika beban, repetisi, atau kualitas teknik perlahan naik, program kemungkinan bergerak ke arah yang benar.</p><ul><li>Tinjau grafik untuk setiap latihan utama.</li><li>Periksa apakah frekuensi latihan konsisten.</li><li>Catat perubahan program agar perbandingan tetap adil.</li></ul><h2>Gunakan catatan untuk sesi berikutnya</h2><p>Catatan terbaik adalah catatan yang membantu mengambil keputusan. Sebelum memulai sesi, lihat hasil terakhir lalu tentukan target realistis, misalnya menambah satu repetisi atau kenaikan beban kecil.</p>',
  'published'
),
(
  'panduan-progressive-overload',
  'Panduan Progressive Overload untuk Pemula',
  'Pelajari progressive overload, cara menerapkannya, dan kapan menaikkan beban tanpa terburu-buru.',
  'Progressive overload adalah proses meningkatkan tuntutan latihan secara bertahap. Tujuannya bukan menambah beban setiap hari, melainkan memberi tubuh alasan untuk beradaptasi dari waktu ke waktu.',
  '2026-09-11'::date,
  '6 menit baca',
  array['progressive overload', 'cara menambah beban gym', 'progres latihan'],
  '<p>Progressive overload adalah proses meningkatkan tuntutan latihan secara bertahap. Tujuannya bukan menambah beban setiap hari, melainkan memberi tubuh alasan untuk beradaptasi dari waktu ke waktu.</p><h2>Overload tidak hanya berarti beban</h2><p>Menambah berat barbel hanyalah salah satu cara. Anda juga dapat menambah repetisi, set yang berkualitas, rentang gerak, kontrol tempo, atau memperbaiki teknik pada beban yang sama.</p><ul><li>Beban bertambah dengan teknik tetap baik.</li><li>Repetisi bertambah pada beban yang sama.</li><li>Gerakan menjadi lebih stabil dan terkontrol.</li><li>Volume mingguan naik secara bertahap.</li></ul><h2>Gunakan rentang repetisi</h2><p>Pilih rentang, misalnya 8–12 repetisi. Pertahankan beban hingga semua set mencapai batas atas dengan teknik yang konsisten. Setelah itu naikkan beban sedikit dan mulai lagi dari bagian bawah rentang.</p><h2>Jangan memaksa progres linear</h2><p>Semakin lama berlatih, progres biasanya melambat. Menahan beban selama beberapa sesi bukan kegagalan. Hindari mengorbankan teknik hanya untuk membuat angka terlihat naik.</p><ul><li>Kurangi target saat pemulihan buruk.</li><li>Gunakan kenaikan beban terkecil yang tersedia.</li><li>Pertimbangkan minggu latihan lebih ringan ketika kelelahan menumpuk.</li></ul><h2>Catat sebelum mengambil keputusan</h2><p>Lihat setidaknya beberapa sesi untuk latihan yang sama. Riwayat beban dan repetisi membantu membedakan stagnasi nyata dari variasi performa biasa.</p>',
  'published'
),
(
  'program-latihan-gym-pemula',
  'Contoh Program Latihan Gym untuk Pemula',
  'Contoh susunan program gym pemula yang sederhana, seimbang, dan mudah diikuti secara konsisten.',
  'Program pemula tidak perlu berisi banyak gerakan. Program yang sederhana lebih mudah dipelajari, diulang, dan dievaluasi daripada jadwal rumit yang sering berubah.',
  '2026-09-11'::date,
  '6 menit baca',
  array['program gym pemula', 'jadwal latihan gym', 'latihan full body'],
  '<p>Program pemula tidak perlu berisi banyak gerakan. Program yang sederhana lebih mudah dipelajari, diulang, dan dievaluasi daripada jadwal rumit yang sering berubah.</p><h2>Mulai dengan tiga sesi full body</h2><p>Tiga sesi per minggu memberi kesempatan berlatih secara rutin sekaligus menyediakan waktu pemulihan. Sisakan setidaknya satu hari di antara dua sesi jika tubuh belum terbiasa.</p><ul><li>Squat atau leg press.</li><li>Bench press atau push-up.</li><li>Row atau lat pulldown.</li><li>Hip hinge seperti Romanian deadlift.</li><li>Latihan core sederhana.</li></ul><h2>Batasi jumlah latihan</h2><p>Empat hingga enam gerakan per sesi sudah cukup sebagai awal. Utamakan gerakan yang dapat dilakukan dengan teknik stabil dan peralatan yang tersedia di tempat latihan.</p><h2>Tentukan set dan repetisi</h2><p>Mulailah dengan dua atau tiga set kerja per latihan. Rentang 8–12 repetisi praktis untuk banyak gerakan, tetapi bukan aturan mutlak. Pilih beban yang masih memungkinkan teknik tetap rapi.</p><ul><li>Berhenti jika gerakan terasa sakit.</li><li>Berikan waktu untuk mempelajari teknik.</li><li>Tambahkan beban secara bertahap.</li></ul><h2>Pertahankan program cukup lama</h2><p>Jalankan pola dasar selama beberapa minggu agar tersedia data yang dapat dibandingkan. Ganti gerakan jika ada alasan jelas, seperti keterbatasan alat, rasa tidak nyaman, atau kebutuhan program baru.</p>',
  'published'
),
(
  'waktu-istirahat-antar-set',
  'Berapa Lama Waktu Istirahat Antar Set?',
  'Panduan menentukan waktu istirahat antar set berdasarkan jenis latihan dan tujuan sesi gym.',
  'Jeda antar set memengaruhi kesiapan untuk set berikutnya. Waktu yang terlalu singkat dapat menurunkan performa, sedangkan jeda yang sangat panjang bisa membuat sesi kurang efisien.',
  '2026-09-11'::date,
  '5 menit baca',
  array['waktu istirahat antar set', 'rest timer gym', 'jeda latihan gym'],
  '<p>Jeda antar set memengaruhi kesiapan untuk set berikutnya. Waktu yang terlalu singkat dapat menurunkan performa, sedangkan jeda yang sangat panjang bisa membuat sesi kurang efisien.</p><h2>Sesuaikan dengan jenis latihan</h2><p>Gerakan compound berat biasanya membutuhkan jeda lebih panjang daripada latihan isolasi ringan. Kebutuhan setiap orang juga berbeda berdasarkan beban, repetisi, dan kondisi hari itu.</p><ul><li>Latihan compound berat: sekitar 2–4 menit.</li><li>Latihan hipertrofi umum: sekitar 1–3 menit.</li><li>Latihan isolasi ringan: sekitar 45–90 detik.</li></ul><h2>Gunakan performa sebagai petunjuk</h2><p>Jika repetisi turun tajam karena napas belum pulih, jeda mungkin terlalu singkat. Jika tubuh sudah siap tetapi Anda terus menunggu tanpa alasan, jeda dapat diringkas.</p><h2>Jaga konsistensi pengukuran</h2><p>Menggunakan jeda yang relatif konsisten membuat perbandingan antar sesi lebih masuk akal. Kenaikan performa menjadi lebih mudah dibaca karena kondisi latihannya serupa.</p><h2>Timer membantu tanpa mengikat</h2><p>Rest timer dapat mencegah jeda tanpa sadar menjadi terlalu lama. Gunakan sebagai pengingat, lalu sesuaikan berdasarkan kesiapan dan keamanan—bukan sebagai aturan yang harus dipatuhi secara kaku.</p>',
  'published'
),
(
  'cara-membaca-grafik-progres-beban',
  'Cara Membaca Grafik Progres Beban Latihan',
  'Cara memahami tren grafik beban gym dan menghindari kesimpulan dari satu sesi latihan saja.',
  'Grafik progres mengubah catatan latihan menjadi pola yang lebih mudah dilihat. Namun, garis yang naik dan turun tetap perlu dibaca bersama repetisi, set, dan konteks program.',
  '2026-09-11'::date,
  '5 menit baca',
  array['grafik progres beban', 'progres gym', 'tracking beban latihan'],
  '<p>Grafik progres mengubah catatan latihan menjadi pola yang lebih mudah dilihat. Namun, garis yang naik dan turun tetap perlu dibaca bersama repetisi, set, dan konteks program.</p><h2>Perhatikan tren, bukan satu titik</h2><p>Penurunan pada satu sesi dapat terjadi karena kelelahan, perubahan urutan latihan, atau waktu istirahat. Fokus pada arah beberapa minggu, bukan satu angka yang berdiri sendiri.</p><h2>Bandingkan kondisi yang setara</h2><p>Beban 80 kg untuk tiga repetisi tidak sama dengan 75 kg untuk sepuluh repetisi. Saat membaca grafik beban maksimum, buka riwayat untuk memastikan jumlah repetisi dan set masih relevan.</p><ul><li>Gunakan nama gerakan yang sama.</li><li>Perhatikan perubahan teknik atau alat.</li><li>Bandingkan rentang repetisi yang serupa.</li></ul><h2>Volume memberi konteks tambahan</h2><p>Total volume sederhana dapat dihitung dari beban × repetisi × set. Angka ini bukan ukuran sempurna, tetapi dapat membantu menjelaskan mengapa beban maksimum tidak berubah sementara total pekerjaan meningkat.</p><h2>Kapan program perlu dievaluasi</h2><p>Jika tren tidak bergerak selama beberapa minggu dan performa terasa terus menurun, periksa pemulihan, teknik, target beban, serta susunan program sebelum menambah latihan secara sembarangan.</p>',
  'published'
),
(
  'cara-konsisten-latihan-gym',
  'Cara Menjaga Konsistensi Latihan Gym',
  'Strategi praktis membangun kebiasaan gym yang realistis dan dapat dipertahankan dalam jangka panjang.',
  'Konsistensi bukan berarti tidak pernah melewatkan latihan. Konsistensi berarti memiliki pola yang cukup realistis sehingga Anda dapat kembali berlatih setelah jadwal terganggu.',
  '2026-09-11'::date,
  '5 menit baca',
  array['cara konsisten gym', 'kebiasaan latihan', 'jadwal gym'],
  '<p>Konsistensi bukan berarti tidak pernah melewatkan latihan. Konsistensi berarti memiliki pola yang cukup realistis sehingga Anda dapat kembali berlatih setelah jadwal terganggu.</p><h2>Buat target yang dapat dijalankan</h2><p>Jadwal dua atau tiga kali per minggu yang benar-benar dilakukan lebih berguna daripada rencana enam hari yang cepat ditinggalkan. Mulailah dari kapasitas waktu yang tersedia sekarang.</p><h2>Kurangi keputusan saat hari latihan</h2><p>Program yang sudah disiapkan membuat Anda tidak perlu menentukan latihan dari awal setiap kali datang ke gym.</p><ul><li>Tentukan hari latihan yang paling realistis.</li><li>Simpan program tetap untuk beberapa minggu.</li><li>Siapkan alternatif ketika alat sedang digunakan.</li><li>Catat hasil sebelum meninggalkan gym.</li></ul><h2>Pantau kehadiran tanpa mengejar kesempurnaan</h2><p>Kalender atau heatmap aktivitas membantu melihat pola dalam jangka panjang. Minggu kosong adalah informasi, bukan alasan untuk berhenti. Mulai kembali dari sesi berikutnya.</p><h2>Buat sesi minimum</h2><p>Pada hari yang sibuk, lakukan versi singkat dari program: beberapa gerakan utama dengan jumlah set yang wajar. Strategi ini menjaga kebiasaan tanpa memaksakan volume ketika waktu atau energi terbatas.</p>',
  'published'
)
on conflict (slug) do nothing;
