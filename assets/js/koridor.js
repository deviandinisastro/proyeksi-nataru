/**
 * ==============================================================================
 * KORIDOR.JS: MODUL 5 - TITIK KRITIS GERBANG TOL & PENYEBERANGAN ASDP
 * Pusat Data dan Informasi (Pusdatin) - Kementerian Perhubungan RI
 * Nataru 2026/2027
 * ==============================================================================
 * Prinsip DSS & Kepatuhan Data Resmi:
 * 1. 100% Berbasis Fakta Data Resmi Pusdatin (Sheet 6 & Sheet 7 Master Proyeksi).
 * 2. Menghilangkan asumsi matriks OD spekulatif untuk menjaga kredibilitas sistem.
 * 3. Menampilkan komparasi 4 Gerbang Tol Utama Akses Jabodetabek dan komposisi
 *    kendaraan 3 Lintas Penyeberangan Strategis ASDP.
 * ==============================================================================
 */

function renderKoridorModule() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  const tolData = data.titik_kritis_tol || [];
  const asdpData = data.titik_kritis_asdp || [];

  renderTitikKritisKPIs(tolData, asdpData);
  renderTolChart(tolData);
  renderTolTable(tolData);
  renderAsdpChart(asdpData);
  renderAsdpTable(asdpData);

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * 1. Render 4 Kartu KPI Ringkasan Titik Kritis
 */
function renderTitikKritisKPIs(tolData, asdpData) {
  const container = document.getElementById('koridor-kpi-cards');
  if (!container) return;

  // Hitung total arus tol
  let totKeluarTol = 0;
  let totMasukTol = 0;
  tolData.forEach(item => {
    if (item.arah.toLowerCase().includes('keluar')) {
      totKeluarTol += (item.proyeksi_2026 || 0);
    } else {
      totMasukTol += (item.proyeksi_2026 || 0);
    }
  });

  // Ambil data penyeberangan
  const merak = asdpData.find(d => d.lintas.toLowerCase().includes('merak')) || {};
  const ketapang = asdpData.find(d => d.lintas.toLowerCase().includes('ketapang')) || {};

  container.innerHTML = `
    <!-- Card 1: Tol Keluar Jakarta -->
    <div class="kpi-card p-4 rounded-xl bg-white border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold text-gov-muted uppercase tracking-wider">Tol Keluar Jakarta</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          Arus Mudik
        </span>
      </div>
      <div class="text-2xl font-extrabold text-gov-navy num-tabular mb-1">
        ${formatNumber(totKeluarTol)}
      </div>
      <div class="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
        <span>+16,76%</span>
        <span class="text-slate-400 font-normal">vs Realisasi 2025</span>
      </div>
      <p class="text-[11px] text-gov-muted mt-2 border-t border-slate-100 pt-2">
        Total arus 4 gerbang tol utama menuju Jawa, Bandung, Merak & Puncak.
      </p>
    </div>

    <!-- Card 2: Tol Masuk Jakarta -->
    <div class="kpi-card p-4 rounded-xl bg-white border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold text-gov-muted uppercase tracking-wider">Tol Masuk Jakarta</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
          Arus Balik
        </span>
      </div>
      <div class="text-2xl font-extrabold text-slate-900 num-tabular mb-1">
        ${formatNumber(totMasukTol)}
      </div>
      <div class="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
        <span>+16,76%</span>
        <span class="text-slate-400 font-normal">vs Realisasi 2025</span>
      </div>
      <p class="text-[11px] text-gov-muted mt-2 border-t border-slate-100 pt-2">
        Arus balik terpadat di GT Cikupa (Merak) & GT Cikatama (Trans Jawa).
      </p>
    </div>

    <!-- Card 3: Penyeberangan Merak - Bakauheni -->
    <div class="kpi-card p-4 rounded-xl bg-white border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold text-gov-muted uppercase tracking-wider">Lintas Selat Sunda</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Merak - Bakauheni
        </span>
      </div>
      <div class="text-2xl font-extrabold text-purple-900 num-tabular mb-1">
        ${formatNumber(merak.proyeksi_total_2026 || 0)}
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
        <span class="text-blue-700 font-bold">${formatNumber(merak.proyeksi_mobil_r4 || 0)} R4</span>
        <span class="text-slate-300">|</span>
        <span class="text-amber-700 font-bold">${formatNumber(merak.proyeksi_motor_r2 || 0)} R2</span>
      </div>
      <p class="text-[11px] text-gov-muted mt-2 border-t border-slate-100 pt-2">
        65% volume didominasi mobil pribadi. Buffer zone KM 43 & KM 68A diaktifkan.
      </p>
    </div>

    <!-- Card 4: Penyeberangan Ketapang - Gilimanuk -->
    <div class="kpi-card p-4 rounded-xl bg-white border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold text-gov-muted uppercase tracking-wider">Lintas Selat Bali</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Ketapang - Gilimanuk
        </span>
      </div>
      <div class="text-2xl font-extrabold text-purple-900 num-tabular mb-1">
        ${formatNumber(ketapang.proyeksi_total_2026 || 0)}
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
        <span class="text-blue-700 font-bold">${formatNumber(ketapang.proyeksi_mobil_r4 || 0)} R4</span>
        <span class="text-slate-300">|</span>
        <span class="text-amber-700 font-bold">${formatNumber(ketapang.proyeksi_motor_r2 || 0)} R2</span>
      </div>
      <p class="text-[11px] text-gov-muted mt-2 border-t border-slate-100 pt-2">
        Akses utama wisata Bali via darat dengan porsi pemotor (R2) mencapai 35%.
      </p>
    </div>
  `;
}

/**
 * 2. Render Grafik Batang Komparasi 4 Gerbang Tol (Plotly.js)
 */
function renderTolChart(tolData) {
  const chartEl = document.getElementById('chart-tol-komparasi');
  if (!chartEl || !tolData || tolData.length === 0) return;

  const isDark = document.documentElement.classList.contains('dark');

  // Urutan 4 gerbang tol unik
  const gates = [
    { key: 'Cikatama', label: 'GT Cikatama<br><span style="font-size:10px;color:#64748b;">(Trans Jawa)</span>' },
    { key: 'Kalitama', label: 'GT Kalitama<br><span style="font-size:10px;color:#64748b;">(Cipularang/Bdg)</span>' },
    { key: 'Cikupa', label: 'GT Cikupa<br><span style="font-size:10px;color:#64748b;">(Merak/Banten)</span>' },
    { key: 'Ciawi', label: 'GT Ciawi<br><span style="font-size:10px;color:#64748b;">(Jagorawi/Puncak)</span>' }
  ];

  const keluarValues = [];
  const masukValues = [];
  const keluarReal25 = [];
  const masukReal25 = [];

  gates.forEach(g => {
    const kItem = tolData.find(d => d.gerbang_tol.includes(g.key) && d.arah.toLowerCase().includes('keluar'));
    const mItem = tolData.find(d => d.gerbang_tol.includes(g.key) && d.arah.toLowerCase().includes('masuk'));

    keluarValues.push(kItem ? kItem.proyeksi_2026 : 0);
    masukValues.push(mItem ? mItem.proyeksi_2026 : 0);
    keluarReal25.push(kItem ? kItem.realisasi_2025 : 0);
    masukReal25.push(mItem ? mItem.realisasi_2025 : 0);
  });

  const traceKeluar = {
    x: gates.map(g => g.label),
    y: keluarValues,
    name: 'Proyeksi Keluar Jakarta (Arus Mudik)',
    type: 'bar',
    marker: {
      color: '#0284C7',
      line: { color: '#0369A1', width: 1 }
    },
    hovertemplate: '<b>%{x}</b><br>Keluar (Mudik): %{y:,.0f} Kendaraan<extra></extra>'
  };

  const traceMasuk = {
    x: gates.map(g => g.label),
    y: masukValues,
    name: 'Proyeksi Masuk Jakarta (Arus Balik)',
    type: 'bar',
    marker: {
      color: '#003882',
      line: { color: '#002554', width: 1 }
    },
    hovertemplate: '<b>%{x}</b><br>Masuk (Balik): %{y:,.0f} Kendaraan<extra></extra>'
  };

  const layout = {
    barmode: 'group',
    bargap: 0.28,
    bargroupgap: 0.1,
    height: 340,
    margin: { l: 65, r: 25, t: 30, b: 65 },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: {
      family: 'Plus Jakarta Sans, sans-serif',
      size: 11,
      color: isDark ? '#94A3B8' : '#475569'
    },
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: 1.15,
      font: { size: 11 }
    },
    xaxis: {
      showgrid: false,
      tickfont: { size: 11, color: isDark ? '#E2E8F0' : '#1E293B' }
    },
    yaxis: {
      title: 'Volume Kendaraan',
      gridcolor: isDark ? '#334155' : '#E2E8F0',
      tickformat: ',.0f'
    }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(chartEl, [traceKeluar, traceMasuk], layout, config);
}

/**
 * 3. Render Tabel Rinci 4 Gerbang Tol (Sheet 6)
 */
function renderTolTable(tolData) {
  const tbody = document.getElementById('table-tol-body');
  if (!tbody || !tolData || tolData.length === 0) return;

  tbody.innerHTML = tolData.map((row, idx) => {
    const isKeluar = row.arah.toLowerCase().includes('keluar');
    const badgeArah = isKeluar
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Keluar (Mudik/Wisata)</span>'
      : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Masuk (Arus Balik)</span>';

    return `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 transition-colors">
        <td class="py-2.5 px-3 text-center text-slate-400 font-semibold">${idx + 1}</td>
        <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
          ${row.gerbang_tol}
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">${badgeArah}</td>
        <td class="py-2.5 px-3 text-right font-medium text-slate-600 num-tabular">
          ${formatNumber(row.realisasi_2025)}
        </td>
        <td class="py-2.5 px-3 text-right font-extrabold text-gov-navy num-tabular">
          ${formatNumber(row.proyeksi_2026)}
        </td>
        <td class="py-2.5 px-3 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            +${row.pertumbuhan_pct}%
          </span>
        </td>
        <td class="py-2.5 px-3 text-slate-500 text-[11px]">
          Damped Holt-Winters Gate Flow
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 4. Render Grafik Komposisi Kendaraan ASDP (Plotly.js Stacked Bar)
 */
function renderAsdpChart(asdpData) {
  const chartEl = document.getElementById('chart-asdp-komposisi');
  if (!chartEl || !asdpData || asdpData.length === 0) return;

  const isDark = document.documentElement.classList.contains('dark');

  const names = asdpData.map(d => {
    if (d.lintas.includes('Merak')) return 'Merak - Bakauheni<br><span style="font-size:10px;color:#64748b;">(Selat Sunda)</span>';
    if (d.lintas.includes('Ketapang')) return 'Ketapang - Gilimanuk<br><span style="font-size:10px;color:#64748b;">(Selat Bali)</span>';
    return 'Ciwandan & BBJ<br><span style="font-size:10px;color:#64748b;">(Kontinjensi Truk)</span>';
  });

  const motor = asdpData.map(d => d.proyeksi_motor_r2 || 0);
  const mobil = asdpData.map(d => d.proyeksi_mobil_r4 || 0);
  const truk = asdpData.map(d => d.proyeksi_truk_sumbu3 || 0);

  const traceR4 = {
    x: names,
    y: mobil,
    name: 'Mobil Pribadi (Roda 4)',
    type: 'bar',
    marker: { color: '#0284C7' },
    hovertemplate: '<b>%{x}</b><br>Mobil Pribadi (R4): %{y:,.0f} Unit<extra></extra>'
  };

  const traceR2 = {
    x: names,
    y: motor,
    name: 'Sepeda Motor (Roda 2)',
    type: 'bar',
    marker: { color: '#F59E0B' },
    hovertemplate: '<b>%{x}</b><br>Sepeda Motor (R2): %{y:,.0f} Unit<extra></extra>'
  };

  const traceTruk = {
    x: names,
    y: truk,
    name: 'Truk Logistik (Sumbu 3+)',
    type: 'bar',
    marker: { color: '#7C3AED' },
    hovertemplate: '<b>%{x}</b><br>Truk Logistik: %{y:,.0f} Unit<extra></extra>'
  };

  const layout = {
    barmode: 'stack',
    bargap: 0.35,
    height: 330,
    margin: { l: 65, r: 25, t: 30, b: 65 },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: {
      family: 'Plus Jakarta Sans, sans-serif',
      size: 11,
      color: isDark ? '#94A3B8' : '#475569'
    },
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: 1.15,
      font: { size: 11 }
    },
    xaxis: {
      showgrid: false,
      tickfont: { size: 11, color: isDark ? '#E2E8F0' : '#1E293B' }
    },
    yaxis: {
      title: 'Total Unit Kendaraan',
      gridcolor: isDark ? '#334155' : '#E2E8F0',
      tickformat: ',.0f'
    }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(chartEl, [traceR4, traceR2, traceTruk], layout, config);
}

/**
 * 5. Render Tabel Rinci ASDP (Sheet 7)
 */
function renderAsdpTable(asdpData) {
  const tbody = document.getElementById('table-asdp-body');
  if (!tbody || !asdpData || asdpData.length === 0) return;

  tbody.innerHTML = asdpData.map((row, idx) => {
    return `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 transition-colors">
        <td class="py-2.5 px-3 text-center text-slate-400 font-semibold">${idx + 1}</td>
        <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
          ${row.lintas}
        </td>
        <td class="py-2.5 px-3 text-right font-medium text-slate-600 num-tabular">
          ${formatNumber(row.realisasi_total_2025)}
        </td>
        <td class="py-2.5 px-3 text-right font-extrabold text-purple-900 num-tabular">
          ${formatNumber(row.proyeksi_total_2026)}
        </td>
        <td class="py-2.5 px-3 text-right text-amber-700 font-semibold num-tabular">
          ${formatNumber(row.proyeksi_motor_r2)}
        </td>
        <td class="py-2.5 px-3 text-right text-blue-700 font-bold num-tabular">
          ${formatNumber(row.proyeksi_mobil_r4)}
        </td>
        <td class="py-2.5 px-3 text-right text-purple-700 font-semibold num-tabular">
          ${formatNumber(row.proyeksi_truk_sumbu3)}
        </td>
        <td class="py-2.5 px-3 text-slate-600 text-[11px]">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            ${row.kebijakan_operasional || 'Buffer Zone & Pengalihan Truk'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}
