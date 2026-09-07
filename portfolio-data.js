// ============================================================
//  PORTFOLIO DATA - Edit file ini untuk kustomisasi konten
// ============================================================

const PORTFOLIO_CONFIG = {

  // ── HERO IMAGE & SETTINGS ───────────────────────────────
  hero: {
    baseImage:    "assets/images/hero-base.jpg.png",   // foto background (B&W)
    revealImage:  "assets/images/hero-reveal.jpg.png", // foto reveal saat cursor gerak (orange)
    badge:        "✦ Available for work",               // teks badge kecil di hero
    available:    true,                                 // true = badge muncul, false = disembunyikan
  },

  // ── PROFIL ───────────────────────────────────────────────
  profile: {
    name: "Nama Kamu",
    title: "UI/UX Designer & Creative Developer",
    tagline: "Crafting digital experiences that leave an impression.",
    avatar: "assets/images/avatar.jpg",   // ganti dengan foto kamu
    about: `Halo! Saya seorang desainer dan developer kreatif yang passionate
            dalam membangun pengalaman digital yang memukau. Dengan fokus pada
            detail estetika dan interaksi pengguna, setiap proyek yang saya
            kerjakan selalu mengutamakan kualitas dan inovasi.`,
    email: "hello@namakamu.com",
    whatsapp:  "6281234567890",              // nomor WA tanpa + (misal 6281234567890)
    socials: {
      instagram: "https://instagram.com/username",
      behance:   "https://behance.net/username",
      fiverr:    "https://fiverr.com/username",
      linkedin:  "https://linkedin.com/in/username",
    }
  },

  // ── SKILLS / KEAHLIAN ────────────────────────────────────
  skills: [
    { name: "UI/UX Design",       level: 90, icon: "✦" },
    { name: "Motion Design",      level: 85, icon: "◈" },
    { name: "3D Modeling",        level: 75, icon: "⬡" },
    { name: "Web Development",    level: 80, icon: "⟨⟩" },
    { name: "Brand Identity",     level: 88, icon: "◉" },
    { name: "Video Editing",      level: 70, icon: "▶" },
  ],

  // ── KATEGORI FILTER ──────────────────────────────────────
  // Sesuaikan dengan kategori proyekmu
  categories: ["All", "Design", "Development", "Motion", "3D", "Branding"],

  // ── SHOWREEL ─────────────────────────────────────────────
  // Satu video utama yang tampil besar setelah section Work
  // type: "video"   → file lokal di assets/videos/
  // type: "youtube" → isi youtubeId
  showreel: {
    enabled:   true,
    heading:   "My Showreel",
    subtitle:  "A compilation of my best creative work",
    type:      "youtube",            // "video" | "youtube"
    src:       "",                   // "assets/videos/showreel.mp4" jika type video
    youtubeId: "dQw4w9WgXcQ",       // ID YouTube jika type youtube
    thumbnail: "",                   // cover sebelum play (kosongkan = auto dari YouTube)
    year:      "2025",
    duration:  "2:45",              // durasi (opsional, tampil di poster)
    description: "Kompilasi karya terbaik saya dari tahun 2023–2025, mencakup motion design, 3D visualization, branding, dan UI/UX.",
    tags:      ["Motion", "3D", "Branding", "UI/UX"],
    externalLink: "",               // link eksternal opsional (misal Vimeo)
    externalLabel: "Watch on Vimeo",
  },

  // ── PROYEK PORTFOLIO ─────────────────────────────────────
  // Untuk setiap item, pilih salah satu:
  //   type: "image" → masukkan file ke assets/images/
  //   type: "video" → masukkan file ke assets/videos/
  //   type: "youtube" → isi field "youtubeId"
  //
  // thumbnail: gambar preview untuk card (assets/thumbnails/)
  // Ukuran thumbnail yang direkomendasikan: 800x600px

  projects: [
    {
      id: 1,
      title: "Brand Redesign – Startup X",
      category: "Branding",
      tags: ["Logo", "Identity", "Print"],
      type: "image",                               // "image" | "video" | "youtube"
      src: "assets/images/project-1.jpg",          // path file gambar
      thumbnail: "assets/thumbnails/thumb-1.jpg",  // thumbnail card
      description: "Redesain identitas visual lengkap untuk startup teknologi, mencakup logo, palet warna, dan panduan brand.",
      year: "2025",
      client: "Startup X",
      featured: true,                              // tampil besar di hero grid
    },
    {
      id: 2,
      title: "Mobile App – Finance Tracker",
      category: "Design",
      tags: ["UI/UX", "Mobile", "Figma"],
      type: "image",
      src: "assets/images/project-2.jpg",
      thumbnail: "assets/thumbnails/thumb-2.jpg",
      description: "Desain antarmuka aplikasi pelacak keuangan pribadi dengan pendekatan minimalisme dan UX yang intuitif.",
      year: "2025",
      client: "Personal Project",
      featured: true,
    },
    {
      id: 3,
      title: "Motion Reel 2025",
      category: "Motion",
      tags: ["After Effects", "Animation", "Reel"],
      type: "video",                               // file video lokal
      src: "assets/videos/motion-reel.mp4",
      thumbnail: "assets/thumbnails/thumb-3.jpg",
      description: "Kompilasi proyek motion graphics terbaik sepanjang 2025.",
      year: "2025",
      client: "Self",
      featured: true,
    },
    {
      id: 4,
      title: "Product Visualization 3D",
      category: "3D",
      tags: ["Blender", "Rendering", "Product"],
      type: "youtube",                             // video dari YouTube
      youtubeId: "dQw4w9WgXcQ",                   // ganti dengan ID video YouTube kamu
      thumbnail: "assets/thumbnails/thumb-4.jpg",
      description: "Visualisasi produk 3D menggunakan Blender dengan pencahayaan studio realistis.",
      year: "2024",
      client: "Client A",
      featured: false,
    },
    {
      id: 5,
      title: "E-Commerce Website",
      category: "Development",
      tags: ["React", "Web", "Frontend"],
      type: "image",
      src: "assets/images/project-5.jpg",
      thumbnail: "assets/thumbnails/thumb-5.jpg",
      description: "Website e-commerce modern dengan animasi halus dan performa tinggi.",
      year: "2024",
      client: "Client B",
      featured: false,
    },
    {
      id: 6,
      title: "Social Media Campaign",
      category: "Design",
      tags: ["Photoshop", "Social Media", "Campaign"],
      type: "image",
      src: "assets/images/project-6.jpg",
      thumbnail: "assets/thumbnails/thumb-6.jpg",
      description: "Kampanye visual untuk platform sosial media dengan konsisten dalam identitas brand.",
      year: "2024",
      client: "Client C",
      featured: false,
    },
  ],

  // ── PENDIDIKAN / EDUCATION ──────────────────────────────
  education: [
    {
      school:  "Universitas Nama Kamu",
      degree:  "S1 Desain Komunikasi Visual",
      period:  "2018 – 2022",
      gpa:     "3.85",
      desc:    "Fokus pada desain grafis, tipografi, dan motion design. Aktif di organisasi desain kampus.",
      tags:    ["DKV", "Desain Grafis", "Tipografi"],
      icon:    "🎓",
    },
    {
      school:  "SMK Negeri Contoh",
      degree:  "Multimedia & Animasi",
      period:  "2015 – 2018",
      gpa:     "",
      desc:    "Dasar-dasar multimedia, videografi, dan desain grafis. Juara 1 lomba desain poster tingkat provinsi.",
      tags:    ["Multimedia", "Animasi", "Videografi"],
      icon:    "🏫",
    },
  ],

  // ── PENGALAMAN / EXPERIENCE ──────────────────────────────
  experience: [
    {
      role: "Senior UI/UX Designer",
      company: "Creative Agency",
      period: "2023 – Sekarang",
      desc: "Memimpin tim desain untuk berbagai klien nasional dan internasional."
    },
    {
      role: "Freelance Designer",
      company: "Self-employed",
      period: "2021 – 2023",
      desc: "Mengerjakan proyek branding, UI/UX, dan motion design untuk lebih dari 30 klien."
    },
    {
      role: "Junior Designer",
      company: "Startup Studio",
      period: "2020 – 2021",
      desc: "Desain produk digital dan aset marketing untuk platform SaaS."
    },
  ],

  // ── TEMA WARNA ───────────────────────────────────────────
  // Ganti hex code untuk ubah warna aksen
  theme: {
    accent1: "#6C63FF",   // ungu
    accent2: "#FF6584",   // pink
    accent3: "#43E6FC",   // cyan
  }
};
