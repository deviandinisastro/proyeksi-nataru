/**
 * ==============================================================================
 * KORIDOR.JS: MODUL 5 - DINAMIKA ALIRAN KORIDOR & MATRIKS ASAL-TUJUAN (OD FLOW)
 * Pusat Data dan Informasi (Pusdatin) - Kementerian Perhubungan RI
 * Nataru 2026/2027
 * ==============================================================================
 * Catatan Metodologi Data:
 * Murni visualisasi data analitis deskriptif & spasial aliran pergerakan penumpang,
 * tanpa asumsi simulasi kebijakan sepihak untuk menjamin netralitas dan validitas.
 * ==============================================================================
 */

let koridorFilter = 'semua'; // 'semua' | 'jawa' | 'selat' | 'udara_laut'

const KORIDOR_DATA = [
  {
    id: 1,
    kategori: 'jawa',
    nama: 'Jabodetabek → Jawa Tengah & DIY',
    subrute: 'Semarang, Solo, Purwokerto, Yogyakarta via Tol Trans Jawa & Lintas KA',
    volume: 4953284,
    share: 26.83,
    moda_utama: 'Jalan Tol & KA Jarak Jauh',
    moda_badge: 'bg-blue-50 text-blue-800 border-blue-200',
    puncak_mudik: 'H-1 (24 Des)',
    puncak_balik: 'H+9 (3 Jan)',
    rasio_lonjakan: '1.42×',
    status: 'Arus Terpadat Nasional'
  },
  {
    id: 2,
    kategori: 'jawa',
    nama: 'Jabodetabek → Jawa Timur',
    subrute: 'Surabaya, Malang, Madiun, Jember via GT Warugunung, KA & Udara',
    volume: 3951059,
    share: 21.40,
    moda_utama: 'Tol Trans Jawa & Udara/KA',
    moda_badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    puncak_mudik: 'H-2 s/d H-1',
    puncak_balik: 'H+8 s/d H+9',
    rasio_lonjakan: '1.38×',
    status: 'Koridor Jarak Jauh'
  },
  {
    id: 3,
    kategori: 'jawa',
    nama: 'Jabodetabek → Jawa Barat (Aglomerasi & Priangan)',
    subrute: 'Bandung Raya, Cirebon, Sukabumi, Garut via Cipularang & KCJB Whoosh',
    volume: 3046380,
    share: 16.50,
    moda_utama: 'Tol, KCJB Whoosh & Arteri',
    moda_badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    puncak_mudik: 'H-1 & Hari H',
    puncak_balik: 'H+3 & H+10',
    rasio_lonjakan: '1.25×',
    status: 'Wisata & Komuter'
  },
  {
    id: 4,
    kategori: 'selat',
    nama: 'Lintas Selat Sunda (Jawa ↔ Sumatera)',
    subrute: 'Pelabuhan Merak – Bakauheni & Tol Trans Sumatera',
    volume: 2842150,
    share: 15.39,
    moda_utama: 'Penyeberangan Feri ASDP',
    moda_badge: 'bg-purple-50 text-purple-800 border-purple-200',
    puncak_mudik: 'H-2 (Malam Hari)',
    puncak_balik: 'H+8 (Siang-Malam)',
    rasio_lonjakan: '1.51×',
    status: 'Titik Kritis Penyeberangan'
  },
  {
    id: 5,
    kategori: 'udara_laut',
    nama: 'Jabodetabek & Jawa → Bali & Nusa Tenggara',
    subrute: 'Denpasar, Mataram, Labuan Bajo via Udara CGK-DPS & Lintas Selat',
    volume: 1957069,
    share: 10.60,
    moda_utama: 'Angkutan Udara & ASDP',
    moda_badge: 'bg-sky-50 text-sky-800 border-sky-200',
    puncak_mudik: 'H-2 s/d Hari H',
    puncak_balik: 'H+8 s/d H+9',
    rasio_lonjakan: '1.45×',
    status: 'Pusat Wisata Tahun Baru'
  },
  {
    id: 6,
    kategori: 'selat',
    nama: 'Lintas Selat Bali (Jawa Timur ↔ Bali)',
    subrute: 'Pelabuhan Ketapang (Banyuwangi) – Gilimanuk (Jembrana)',
    volume: 1185420,
    share: 6.42,
    moda_utama: 'Penyeberangan Feri ASDP',
    moda_badge: 'bg-purple-50 text-purple-800 border-purple-200',
    puncak_mudik: 'H-1 & H+4',
    puncak_balik: 'H+7 s/d H+9',
    rasio_lonjakan: '1.48×',
    status: 'Gerbang Wisata Darat'
  },
  {
    id: 7,
    kategori: 'udara_laut',
    nama: 'Koridor Udara Antar-Pulau Utama',
    subrute: 'Jakarta ↔ Medan (KNO), Makassar (UPG), Balikpapan (BPN)',
    volume: 980400,
    share: 5.31,
    moda_utama: 'Angkutan Udara Berjadwal',
    moda_badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    puncak_mudik: 'H-2 (23 Des)',
    puncak_balik: 'H+8 (2 Jan)',
    rasio_lonjakan: '1.30×',
    status: 'Konektivitas Antar-Pulau'
  },
  {
    id: 8,
    kategori: 'udara_laut',
    nama: 'Jalur Kepulauan Nusantara (Laut PELNI & Ro-Ro Lokal)',
    subrute: 'Batam, Tanjung Pinang, Belawan, Kupang, Ambon, Sorong',
    volume: 547151,
    share: 2.96,
    moda_utama: 'Kapal Laut PELNI & Perintis',
    moda_badge: 'bg-teal-50 text-teal-800 border-teal-200',
    puncak_mudik: 'H-4 s/d H-1',
    puncak_balik: 'H+6 s/d H+10',
    rasio_lonjakan: '1.35×',
    status: 'Jalur Sabuk Kepulauan'
  }
];

function renderKoridorModule() {
  renderKoridorKPICards();
  renderSankeyChart();
  renderKoridorTable();
  setupKoridorControls();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * 1. Render 4 Kartu Ringkasan Koridor Utama
 */
function renderKoridorKPICards() {
  const container = document.getElementById('koridor-kpi-cards');
  if (!container) return;

  container.innerHTML = `
    <!-- Card 1 -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider leading-tight">Koridor Darat<br>Terpadat</span>
          <span class="whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            26,8% Pangsa
          </span>
        </div>
        <div class="text-xl font-extrabold text-gov-navy num-tabular mb-1">
          Jabodetabek → Jateng/DIY
        </div>
        <p class="text-xs text-gov-muted">Estimasi volume: <strong class="text-slate-800 num-tabular">4.953.284 orang</strong></p>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted mt-3">
        <span>Arus Puncak:</span>
        <span class="font-bold text-slate-700">H-1 (Mudik) & H+9 (Balik)</span>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider leading-tight">Koridor Selat<br>Sunda (ASDP)</span>
          <span class="whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            15,4% Pangsa
          </span>
        </div>
        <div class="text-xl font-extrabold text-slate-900 num-tabular mb-1">
          Merak ↔ Bakauheni
        </div>
        <p class="text-xs text-gov-muted">Estimasi volume: <strong class="text-slate-800 num-tabular">2.842.150 orang</strong></p>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted mt-3">
        <span>Kapasitas Sarana:</span>
        <span class="font-bold text-slate-700">612.235 Kendaraan (Feri)</span>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider leading-tight">Destinasi Wisata<br>Tahun Baru</span>
          <span class="whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            10,6% Pangsa
          </span>
        </div>
        <div class="text-xl font-extrabold text-slate-900 num-tabular mb-1">
          Bali & Nusa Tenggara
        </div>
        <p class="text-xs text-gov-muted">Estimasi volume: <strong class="text-slate-800 num-tabular">1.957.069 orang</strong></p>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted mt-3">
        <span>Akses Transportasi:</span>
        <span class="font-bold text-slate-700">Udara (DPS) & Feri Ketapang</span>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider leading-tight">Koridor Jarak Jauh<br>Trans Jawa</span>
          <span class="whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            21,4% Pangsa
          </span>
        </div>
        <div class="text-xl font-extrabold text-slate-900 num-tabular mb-1">
          Jabodetabek → Jatim
        </div>
        <p class="text-xs text-gov-muted">Estimasi volume: <strong class="text-slate-800 num-tabular">3.951.059 orang</strong></p>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted mt-3">
        <span>Moda Integrasi:</span>
        <span class="font-bold text-slate-700">Tol Trans Jawa, KA, Udara</span>
      </div>
    </div>
  `;
}

/**
 * 2. Render Diagram Sankey Interaktif (Plotly Native)
 */
function renderSankeyChart() {
  const chartEl = document.getElementById('chart-sankey-od');
  if (!chartEl || !window.Plotly) return;

  const isDark = document.documentElement.classList.contains('dark');

  // Label Node (0-5: Asal, 6-10: Moda, 11-16: Tujuan)
  const nodeLabels = [
    // Origins (0 - 5)
    'Jabodetabek (Asal: 6,37 Jt)',
    'Jawa Barat (Asal: 2,23 Jt)',
    'Jawa Timur (Asal: 2,99 Jt)',
    'Jawa Tengah & DIY (Asal: 2,55 Jt)',
    'Sumatera Bag. Utara (Asal: 1,75 Jt)',
    'Bali & Wilayah Lain (Asal: 2,57 Jt)',

    // Modes (6 - 10)
    'Jalan Tol & Arteri (5,43 Jt)',
    'Kereta Api (3,98 Jt)',
    'Penyeberangan ASDP (3,25 Jt)',
    'Angkutan Udara (3,65 Jt)',
    'Angkutan Laut (2,15 Jt)',

    // Destinations (11 - 16)
    'Jawa Tengah & DIY (Tujuan: 4,95 Jt)',
    'Jawa Timur (Tujuan: 3,95 Jt)',
    'Jawa Barat (Tujuan: 3,05 Jt)',
    'Jabodetabek (Arus Balik: 2,62 Jt)',
    'Bali & Nusa Tenggara (Tujuan: 1,96 Jt)',
    'Sumatera Bag. Selatan (Tujuan: 1,93 Jt)'
  ];

  // Warna Node
  const nodeColors = [
    // Origins: Biru Navy ke Azure
    '#003882', '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
    // Modes: Warna Identitas Moda Kemenhub
    '#003882', // Jalan (Navy)
    '#EA580C', // KA (Orange KAI)
    '#7C3AED', // ASDP (Ungu)
    '#0284C7', // Udara (Sky Azure)
    '#0D9488', // Laut (Teal Pelni)
    // Destinations: Hijau & Amber Regional
    '#059669', '#10B981', '#34D399', '#D97706', '#F59E0B', '#FBBF24'
  ];

  // Aliran Link Hasil Optimasi Konservasi Aliran 18.462.913 Penumpang
  const sources = [
    0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5,
    6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10
  ];

  const targets = [
    6, 7, 8, 9, 10, 6, 7, 8, 9, 10, 6, 7, 8, 9, 10, 6, 7, 8, 9, 10, 6, 7, 8, 9, 10, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 11, 12, 13, 14, 15, 16, 11, 12, 13, 14, 15, 16, 11, 12, 13, 14, 15, 16, 11, 12, 13, 14, 15, 16
  ];

  const values = [
    2200000, 1800000, 800000, 1200000, 369705,
    1100000, 500000, 150000, 250000, 234012,
    900000, 700000, 600000, 500000, 291000,
    750000, 750000, 300000, 450000, 297882,
    250000, 100000, 700000, 500000, 203977,
    230000, 130000, 700000, 752913, 753424,
    1750000, 1400000, 1200000, 700000, 150000, 230000,
    1650000, 1150000, 600000, 450000, 80000, 50000,
    300000, 400000, 200000, 150000, 1000000, 1200000,
    800000, 700000, 400000, 850000, 600000, 302913,
    453284, 301059, 646380, 471734, 127069, 150474
  ];

  // Pewarnaan semi-transparan link
  const linkColors = sources.map(s => {
    if (s <= 5) return isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(0, 56, 130, 0.18)';
    if (s === 6) return isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(0, 56, 130, 0.25)'; // Jalan
    if (s === 7) return isDark ? 'rgba(251, 146, 60, 0.35)' : 'rgba(234, 88, 12, 0.25)'; // KA
    if (s === 8) return isDark ? 'rgba(192, 132, 252, 0.35)' : 'rgba(124, 58, 237, 0.25)'; // ASDP
    if (s === 9) return isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)'; // Udara
    return isDark ? 'rgba(45, 212, 191, 0.35)' : 'rgba(13, 148, 136, 0.25)'; // Laut
  });

  const plotData = [{
    type: 'sankey',
    orientation: 'h',
    node: {
      pad: 16,
      thickness: 20,
      line: { color: isDark ? '#334155' : '#E2E8F0', width: 1 },
      label: nodeLabels,
      color: nodeColors,
      hovertemplate: '<b>%{label}</b><br>Total Aliran: %{value:,.0f} orang<extra></extra>'
    },
    link: {
      source: sources,
      target: targets,
      value: values,
      color: linkColors,
      hovertemplate: '%{source.label} → %{target.label}<br><b>%{value:,.0f} orang</b><extra></extra>'
    }
  }];

  const layout = {
    font: { family: 'Plus Jakarta Sans', size: 11, color: isDark ? '#CBD5E1' : '#334155' },
    margin: { t: 30, b: 30, l: 20, r: 20 },
    height: 500,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(chartEl, plotData, layout, config);
}

/**
 * 3. Render Tabel 8 Koridor Arus Mobilitas Utama
 */
function renderKoridorTable() {
  const tbody = document.getElementById('koridor-table-body');
  if (!tbody) return;

  const filtered = koridorFilter === 'semua'
    ? KORIDOR_DATA
    : KORIDOR_DATA.filter(k => k.kategori === koridorFilter);

  tbody.innerHTML = filtered.map((k, idx) => `
    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
      <td class="py-3 px-3 text-center font-bold text-slate-500 text-xs">${idx + 1}</td>
      <td class="py-3 px-3">
        <span class="font-bold text-slate-900 block text-xs">${k.nama}</span>
        <span class="text-[11px] text-gov-muted">${k.subrute}</span>
      </td>
      <td class="py-3 px-3 text-right">
        <span class="font-extrabold text-gov-navy num-tabular text-xs block">${formatNumber(k.volume)}</span>
        <span class="text-[10px] text-gov-muted">${k.share.toFixed(1)}% pangsa</span>
      </td>
      <td class="py-3 px-3">
        <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${k.moda_badge}">
          ${k.moda_utama}
        </span>
      </td>
      <td class="py-3 px-3 text-xs">
        <span class="block text-slate-800 font-semibold">Mudik: ${k.puncak_mudik}</span>
        <span class="block text-slate-500 text-[10px]">Balik: ${k.puncak_balik}</span>
      </td>
      <td class="py-3 px-3 text-center">
        <span class="font-extrabold text-slate-800 num-tabular text-xs">${k.rasio_lonjakan}</span>
      </td>
      <td class="py-3 px-3">
        <span class="text-[11px] font-semibold text-slate-700 block">${k.status}</span>
      </td>
    </tr>
  `).join('');
}

/**
 * 4. Setup Tombol Filter Kategori Koridor
 */
function setupKoridorControls() {
  const btnSemua = document.getElementById('btn-filter-koridor-semua');
  const btnJawa = document.getElementById('btn-filter-koridor-jawa');
  const btnSelat = document.getElementById('btn-filter-koridor-selat');
  const btnUdaraLaut = document.getElementById('btn-filter-koridor-udara-laut');

  const btns = [
    { el: btnSemua, val: 'semua' },
    { el: btnJawa, val: 'jawa' },
    { el: btnSelat, val: 'selat' },
    { el: btnUdaraLaut, val: 'udara_laut' }
  ];

  btns.forEach(b => {
    if (b.el) {
      b.el.onclick = () => {
        koridorFilter = b.val;
        btns.forEach(x => {
          if (x.el) {
            if (x.val === koridorFilter) {
              x.el.className = 'px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gov-navy text-white shadow-xs transition-all';
            } else {
              x.el.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gov-border text-gov-muted hover:bg-slate-50 transition-all';
            }
          }
        });
        renderKoridorTable();
      };
    }
  });
}
