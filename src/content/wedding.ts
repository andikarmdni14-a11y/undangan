/**
 * Sumber tunggal seluruh konten undangan.
 * Nilai bertanda `PLACEHOLDER` wajib diganti dengan data asli sebelum rilis.
 */

export type Person = {
  fullName: string;
  nickname: string;
  role: "Putra" | "Putri";
  childOrder: string;
  father: string;
  mother: string;
  instagram: string; // tanpa "@"
  photo: { src: string; srcSm: string; alt: string };
};

export type WeddingEvent = {
  id: "akad" | "resepsi";
  title: string;
  /** ISO 8601 dengan offset zona waktu. */
  start: string;
  end: string;
  venue: string;
  address: string;
  mapsUrl: string;
};

export type StoryChapter = { year: string; title: string; body: string };
export type GalleryPhoto = { src: string; thumb: string; width: number; height: number; alt: string; category: "berdua" | "mempelai" };

export const TIMEZONE = "Asia/Jakarta";
export const TIMEZONE_LABEL = "WIB";

export const wedding = {
  couple: {
    groom: {
      fullName: "Raihan Pratama", // PLACEHOLDER nama lengkap
      nickname: "Raihan",
      role: "Putra",
      childOrder: "pertama", // PLACEHOLDER
      father: "Bapak Ahmad Santoso", // PLACEHOLDER
      mother: "Ibu Siti Rahmawati", // PLACEHOLDER
      instagram: "raihan.pratama", // PLACEHOLDER
      photo: {
        src: "/images/couple/groom.webp",
        srcSm: "/images/couple/groom-sm.webp",
        alt: "Raihan mengenakan jas krem dengan bunga mawar putih di dada, tersenyum di taman",
      },
    },
    bride: {
      fullName: "Andini Putri", // PLACEHOLDER nama lengkap
      nickname: "Andini",
      role: "Putri",
      childOrder: "kedua", // PLACEHOLDER
      father: "Bapak Hendra Wijaya", // PLACEHOLDER
      mother: "Ibu Dewi Lestari", // PLACEHOLDER
      instagram: "andini.putri", // PLACEHOLDER
      photo: {
        src: "/images/couple/bride.webp",
        srcSm: "/images/couple/bride-sm.webp",
        alt: "Andini dalam gaun brokat putih memegang buket mawar putih di taman",
      },
    },
  } satisfies Record<"groom" | "bride", Person>,

  /** Hero — 3 layar teks bergantian (PRD §6). Nama tamu disisipkan pada layar 1. */
  hero: {
    greetingPrefix: "Kepada Yth. Bapak/Ibu/Saudara/i",
    fallbackGuestName: "Tamu Undangan",
    tagline: "Perayaan Cinta & Janji Suci",
    openButton: "Buka Undangan",
  },

  quote: {
    text: "Dua jiwa yang menemukan satu arah. Dalam keanggunan waktu dan restu semesta, kami memulai perjalanan baru bersama.",
    // Opsional untuk nuansa Islami: QS. Ar-Rum: 21
    verse: {
      text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
      source: "QS. Ar-Rum: 21",
    },
  },

  events: [
    {
      id: "akad",
      title: "Akad Nikah",
      start: "2029-10-24T10:00:00+07:00",
      end: "2029-10-24T11:00:00+07:00",
      venue: "Masjid Agung Al-Ikhlas", // PLACEHOLDER
      address: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan", // PLACEHOLDER
      mapsUrl: "https://maps.google.com/?q=Masjid+Agung+Al-Ikhlas+Jakarta", // PLACEHOLDER
    },
    {
      id: "resepsi",
      title: "Resepsi",
      start: "2029-10-24T12:00:00+07:00", // PLACEHOLDER jam resepsi
      end: "2029-10-24T15:00:00+07:00",
      venue: "Gedung Graha Kencana", // PLACEHOLDER
      address: "Jl. Anggrek Raya No. 45, Kebayoran Baru, Jakarta Selatan", // PLACEHOLDER
      mapsUrl: "https://maps.google.com/?q=Graha+Kencana+Jakarta", // PLACEHOLDER
    },
  ] satisfies WeddingEvent[],

  liveStream: {
    platform: "Instagram Live",
    account: "raihan.andini", // PLACEHOLDER
    url: "https://www.instagram.com/raihan.andini/live/", // PLACEHOLDER
    start: "2029-10-24T10:00:00+07:00",
    text: "Kami juga mengundang Bapak/Ibu untuk menyaksikan momen sakral kami secara virtual.",
    button: "Tonton Siaran Langsung",
  },

  story: [
    {
      year: "2022", // PLACEHOLDER
      title: "Awal Cerita",
      body: "Pertemuan sederhana yang tak pernah kami duga akan menjadi awal dari segalanya.", // PLACEHOLDER
    },
    {
      year: "2028", // PLACEHOLDER
      title: "Lamaran",
      body: "Dengan restu kedua keluarga, kami mengikat janji untuk melangkah bersama.", // PLACEHOLDER
    },
    {
      year: "2029",
      title: "Hari Bahagia",
      body: "Kami melangkah ke pelaminan, memulai babak baru sebagai satu keluarga.",
    },
  ] satisfies StoryChapter[],

  /** Urutan sengaja diselang portrait/landscape agar ritme masonry terasa. */
  gallery: [
    { src: "/images/gallery/g2.webp", thumb: "/images/gallery/g2-thumb.webp", width: 1920, height: 1072, category: "berdua", alt: "Raihan dan Andini berjalan sambil tertawa di padang bunga" },
    { src: "/images/gallery/g7.webp", thumb: "/images/gallery/g7-thumb.webp", width: 1440, height: 1920, category: "mempelai", alt: "Andini dalam gaun brokat putih memegang buket mawar putih" },
    { src: "/images/gallery/g3.webp", thumb: "/images/gallery/g3-thumb.webp", width: 1920, height: 1072, category: "berdua", alt: "Raihan memutar Andini seperti berdansa di padang rumput" },
    { src: "/images/gallery/g1.webp", thumb: "/images/gallery/g1-thumb.webp", width: 1920, height: 1047, category: "berdua", alt: "Raihan dan Andini bergandengan tangan menyusuri jalan setapak taman bunga saat senja" },
    { src: "/images/gallery/g6.webp", thumb: "/images/gallery/g6-thumb.webp", width: 1440, height: 1920, category: "mempelai", alt: "Raihan mengenakan jas krem dengan bunga mawar putih di dada" },
    { src: "/images/gallery/g5.webp", thumb: "/images/gallery/g5-thumb.webp", width: 1920, height: 1072, category: "berdua", alt: "Raihan mencium Andini di tengah padang bunga" },
    { src: "/images/gallery/g4.webp", thumb: "/images/gallery/g4-thumb.webp", width: 1920, height: 1072, category: "berdua", alt: "Raihan dan Andini berjalan bergandengan membelakangi kamera ke arah matahari terbenam" },
  ] satisfies GalleryPhoto[],

  /** #43 Informasi tamu (akordeon). PLACEHOLDER — sesuaikan dengan ketentuan acara. */
  faq: [
    { q: "Apakah ada ketentuan busana?", a: "Kami mengundang Bapak/Ibu mengenakan busana formal bernuansa pastel atau warna netral." },
    { q: "Bagaimana dengan parkir kendaraan?", a: "Area parkir tersedia di lokasi acara. Kami menyarankan datang 15 menit lebih awal." },
    { q: "Bolehkah membawa anak-anak?", a: "Tentu. Mohon sertakan jumlahnya pada kolom Jumlah Tamu saat konfirmasi kehadiran." },
    { q: "Saya tidak bisa hadir. Bagaimana menyampaikan doa?", a: "Silakan pilih \"Tidak Hadir\" pada formulir konfirmasi dan tuliskan doa restu Anda. Acara juga disiarkan langsung melalui Instagram." },
  ],

  sections: {
    couple: "Mempelai",
    countdown: "Menuju Hari Bahagia",
    story: "Kisah Kami",
    gallery: "Galeri",
    events: "Rangkaian Acara",
    liveStream: "Siaran Langsung",
    faq: "Informasi Tamu",
  },

  rsvp: {
    title: "Konfirmasi & Harapan",
    submit: "Kirim Konfirmasi & Pesan",
    messagePlaceholder: "Tuliskan pesan & doa restu Anda",
  },

  closing: {
    text: "Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir.",
    signOff: "Salam Hangat,",
    family: "beserta Keluarga Besar",
  },

  music: {
    src: "/audio/a-thousand-years.m4a",
    title: "A Thousand Years — Christina Perri",
  },
} as const;

export type Wedding = typeof wedding;
