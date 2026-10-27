/**
 * ==============================================================================
 * METODOLOGI.JS: MODUL 6 - MATRIKS INDIKATOR & VALIDASI MODEL TIME-SERIES
 * Pusat Data dan Informasi (Pusdatin) - Kementerian Perhubungan RI
 * Nataru 2026/2027
 * ==============================================================================
 * Catatan Metodologi Akademis:
 * Modul ini menyajikan transparansi ilmiah sains data peramalan deret waktu
 * (Time-Series Forecasting) dan matriks komparasi indikator kinerja analitis multimoda
 * secara objektif, bebas dari asumsi rekomendasi kebijakan sepihak.
 * ==============================================================================
 */

let metodologiMetric = 'penumpang'; // 'penumpang' | 'sarana'

const MATRIKS_INDIKATOR_DATA = [
  {
    indikator: '1. Volume Proyeksi Nataru 2026/2027',
    satuan: 'orang',
    jalan: '3.434.854',
    ka: '4.062.995',
    udara: '4.880.174',
    asdp: '3.816.033',
    laut: '2.268.857',
    total: '18.462.913'
  },
  {
    indikator: '2. Realisasi Baseline Nataru 2025/2026',
    satuan: 'orang',
    jalan: '3.161.450',
    ka: '3.869.519',
    udara: '4.770.215',
    asdp: '3.792.149',
    laut: '2.254.733',
    total: '17.848.066'
  },
  {
    indikator: '3. Laju Pertumbuhan Tahunan (YoY)',
    satuan: '%',
    jalan: '+8,65%',
    ka: '+5,00%',
    udara: '+2,31%',
    asdp: '+0,63%',
    laut: '+0,63%',
    total: '+3,45%'
  },
  {
    indikator: '4. Pangsa Pasar Antar-Moda (Modal Share)',
    satuan: '%',
    jalan: '18,60%',
    ka: '22,01%',
    udara: '26,43%',
    asdp: '20,67%',
    laut: '12,29%',
    total: '100,00%'
  },
  {
    indikator: '5. Estimasi Sarana/Armada Operasi Posko',
    satuan: 'unit / trip',
    jalan: '247.027 bus',
    ka: '70.814 KA',
    udara: '44.332 flight',
    asdp: '25.945 trip',
    laut: '33.352 kapal',
    total: '421.470 armada'
  },
  {
    indikator: '6. Pertumbuhan Kebutuhan Armada YoY',
    satuan: '%',
    jalan: '+10,65%',
    ka: '+7,83%',
    udara: '+6,06%',
    asdp: '-0,72%',
    laut: '+13,55%',
    total: '+8,58%'
  },
  {
    indikator: '7. Hari Puncak Beban Arus Mudik (Peak 1)',
    satuan: 'hari posko',
    jalan: 'H-1 (Kamis)',
    ka: 'H-1 (Kamis)',
    udara: 'H-2 (Rabu)',
    asdp: 'H (Jumat)',
    laut: 'H-2 (Rabu)',
    total: 'H-1 (Kamis)'
  },
  {
    indikator: '8. Estimasi Volume Hari Puncak Mudik',
    satuan: 'orang/hari',
    jalan: '217.381',
    ka: '268.748',
    udara: '309.698',
    asdp: '237.412',
    laut: '146.182',
    total: '1.149.332'
  },
  {
    indikator: '9. Hari Puncak Beban Arus Balik (Peak 2)',
    satuan: 'hari posko',
    jalan: 'H+9 (Minggu)',
    ka: 'H+8 (Sabtu)',
    udara: 'H+9 (Minggu)',
    asdp: 'H+9 (Minggu)',
    laut: 'H+3 (Senin)',
    total: 'H+9 (Minggu)'
  },
  {
    indikator: '10. Estimasi Volume Hari Puncak Balik',
    satuan: 'orang/hari',
    jalan: '216.686',
    ka: '245.808',
    udara: '309.108',
    asdp: '249.197',
    laut: '141.546',
    total: '1.127.235'
  },
  {
    indikator: '11. Rasio Lonjakan Puncak vs Median (Surge)',
    satuan: 'rasio ×',
    jalan: '1,12×',
    ka: '1,15×',
    udara: '1,14×',
    asdp: '1,08×',
    laut: '1,10×',
    total: '1,11×'
  },
  {
    indikator: '12. Simpul Terpadat & Jalur Pantau Utama',
    satuan: 'lokasi',
    jalan: 'Term. Purboyo (Madiun)',
    ka: 'St. Pasar Senen (Jakarta)',
    udara: 'Bandara Soetta (CGK)',
    asdp: 'Pel. Merak (Banten)',
    laut: 'Tanjung Perak (Surabaya)',
    total: '909 Simpul'
  }
];

const GLOSARIUM_DATA = [
  {
    istilah: 'SIASATI',
    kepanjangan: 'Sistem Informasi Angkutan dan Sarana Transportasi Indonesia',
    definisi: 'Sistem basis data terpadu Kementerian Perhubungan RI yang menghimpun log data mobilitas harian 5 moda secara berkesinambungan di seluruh simpul pantau nasional.'
  },
  {
    istilah: 'PDP',
    kepanjangan: 'Proportional Daily Profile (Profil Harian Proporsional)',
    definisi: 'Metode peramalan time-series yang memproyeksikan pergerakan harian dengan mendistribusikan total volume tahunan berdasarkan proporsi bobot harian historis posko tahun-tahun sebelumnya.'
  },
  {
    istilah: 'Baseline Posko 2025',
    kepanjangan: 'Realisasi Tolok Ukur Penyelenggaraan Posko 2025/2026',
    definisi: 'Data aktual resmi hasil rekonsiliasi Posko Terpadu Nataru 2025/2026 yang dijadikan patokan dasar perhitungan persentase pertumbuhan tahunan (YoY).'
  },
  {
    istilah: 'Surge Ratio',
    kepanjangan: 'Faktor Rasio Lonjakan Arus Puncak (Peak to Median Surge)',
    definisi: 'Perbandingan matematis antara volume pada hari puncak tertinggi terhadap volume median harian normal. Mengindikasikan seberapa tajam kapasitas cadangan sarana yang harus disiapkan operator.'
  },
  {
    istilah: 'Pola TBB',
    kepanjangan: 'Tiba Bongkar Berangkat (Pola Operasi Penyeberangan Darurat)',
    definisi: 'Pola operasi kapal feri saat lonjakan antrean padat di mana kapal langsung membongkar muatan di pelabuhan tujuan lalu berangkat kembali tanpa memuat penumpang/kendaraan untuk mempercepat penguraian antrean di dermaga seberang.'
  },
  {
    istilah: 'Gerbang Tol Barrier',
    kepanjangan: 'Barrier Toll Plaza (Gerbang Tol Utama Pembatas Sistem)',
    definisi: 'Gerbang tol utama pembatas sistem transaksi terbuka/tertutup (seperti GT Cikampek Utama, GT Kalikangkung, GT Warugunung) yang menjadi titik pantau volume arus keluar/masuk wilayah aglomerasi.'
  },
  {
    istilah: 'AKAP',
    kepanjangan: 'Antarkota Antarprovinsi (Moda Jalan)',
    definisi: 'Pelayanan angkutan umum bus massal jalan raya yang menghubungkan simpul kota-kota lintas provinsi melalui terminal bus Tipe A terakreditasi.'
  },
  {
    istilah: 'KCJB / Whoosh',
    kepanjangan: 'Kereta Cepat Jakarta-Bandung (PT KCIC)',
    definisi: 'Layanan kereta api berkecepatan tinggi pertama di Asia Tenggara relasi Halim–Karawang–Padalarang–Tegalluar penopang koridor aglomerasi Jakarta–Bandung.'
  },
  {
    istilah: 'ASDP',
    kepanjangan: 'Angkutan Sungai, Danau, dan Penyeberangan (PT ASDP Indonesia Ferry)',
    definisi: 'BUMN operator kapal feri ro-ro penyeberangan lintas antarpulau utama nasional penghubung sabuk jalan darat (misal: Merak–Bakauheni, Ketapang–Gilimanuk).'
  },
  {
    istilah: 'Periode Posko 18 Hari',
    kepanjangan: 'Masa Kesiagaan Posko Terpadu Nataru 2026/2027 (H-7 s/d H+10)',
    definisi: 'Rentang waktu resmi pemantauan posko terpadu nasional selama 18 hari, dimulai dari H-7 (Jumat, 18 Desember 2026) hingga H+10 (Senin, 4 Januari 2027).'
  },
  {
    istilah: 'Damped Parameter (φ=0.85)',
    kepanjangan: 'Damping Factor Tren Peramalan Holt-Winters',
    definisi: 'Konstanta matematis peredam tren (0 < φ < 1) pada model Damped Holt-Winters yang menahan kemiringan proyeksi jangka panjang agar tidak mengalami over-forecasting eksponensial di luar kapasitas fisik infrastruktur.'
  }
];

function renderMetodologiModule() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  renderIndikatorMatrixTable();
  renderGlosariumTable();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * 1. Render Matriks Komparasi 12 Indikator Kuantitatif Multimoda
 */
function renderIndikatorMatrixTable() {
  const tbody = document.getElementById('metodologi-indikator-body');
  if (!tbody) return;

  tbody.innerHTML = MATRIKS_INDIKATOR_DATA.map((row, idx) => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}">
      <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200 text-xs">
        ${row.indikator}
        <span class="text-[10px] text-gov-muted dark:text-slate-400 block font-normal">Satuan: ${row.satuan}</span>
      </td>
      <td class="py-2.5 px-3 text-right num-tabular text-xs font-semibold text-slate-700 dark:text-slate-300">${row.jalan}</td>
      <td class="py-2.5 px-3 text-right num-tabular text-xs font-semibold text-slate-700 dark:text-slate-300">${row.ka}</td>
      <td class="py-2.5 px-3 text-right num-tabular text-xs font-semibold text-slate-700 dark:text-slate-300">${row.udara}</td>
      <td class="py-2.5 px-3 text-right num-tabular text-xs font-semibold text-slate-700 dark:text-slate-300">${row.asdp}</td>
      <td class="py-2.5 px-3 text-right num-tabular text-xs font-semibold text-slate-700 dark:text-slate-300">${row.laut}</td>
      <td class="py-2.5 px-3 text-right num-tabular text-xs font-extrabold text-gov-navy dark:text-sky-300 bg-blue-50/50">${row.total}</td>
    </tr>
  `).join('');
}

/**
 * 2. Render Glosarium Istilah Resmi Transportasi
 */
function renderGlosariumTable() {
  const tbody = document.getElementById('metodologi-glosarium-body');
  if (!tbody) return;

  tbody.innerHTML = GLOSARIUM_DATA.map(g => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
      <td class="py-3 px-3 font-bold text-gov-navy dark:text-sky-400 text-xs whitespace-nowrap">${g.istilah}</td>
      <td class="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 text-xs">${g.kepanjangan}</td>
      <td class="py-3 px-3 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">${g.definisi}</td>
    </tr>
  `).join('');
}
