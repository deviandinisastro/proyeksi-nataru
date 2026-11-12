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
  const tol43 = data.jaringan_tol_43 || [];
  const arteri44 = data.jaringan_arteri_44 || [];

  renderTitikKritisKPIs(tolData, asdpData);
  renderTolChart(tolData);
  renderTolTable(tolData);
  renderAsdpChart(asdpData);
  renderAsdpTable(asdpData);
  initJaringanNasional(tol43, arteri44);

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
      <div class="text-2xl font-extrabold text-purple-900 dark:text-purple-300 num-tabular mb-1">
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
      <div class="text-2xl font-extrabold text-purple-900 dark:text-purple-300 num-tabular mb-1">
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

    // Tooltip gabungan 2 arah arus (Mudik & Balik)
  // Tooltip gabungan 2 arah arus (Mudik & Balik) - Lega, nyaman, dan berjarak proporsional
  const combinedTolHoverTexts = gates.map((g, idx) => {
    const k = keluarValues[idx] || 0;
    const m = masukValues[idx] || 0;
    const tot = k + m;
    let cleanGate = g.key;
    let subtitle = '';
    if (cleanGate === 'Cikatama') {
      cleanGate = 'GT Cikampek Utama';
      subtitle = 'Koridor Trans Jawa';
    } else if (cleanGate === 'Kalitama') {
      cleanGate = 'GT Kalihurip Utama';
      subtitle = 'Koridor Cipularang / Bandung';
    } else if (cleanGate === 'Cikupa') {
      cleanGate = 'GT Cikupa';
      subtitle = 'Koridor Merak / Banten';
    } else {
      cleanGate = 'GT Ciawi';
      subtitle = 'Koridor Jagorawi / Puncak';
    }

    return [
      `<span style="font-size:12px;font-weight:800;color:#FFFFFF;">${cleanGate}</span><br>`,
      `<span style="font-size:10px;color:#94A3B8;">${subtitle}</span><br>`,
      `<br>`,
      `<span style="color:#38BDF8;font-size:12px;">●</span>  Keluar (Arus Mudik) :  <b>${formatNumber(k)}</b> unit<br>`,
      `<span style="color:#60A5FA;font-size:12px;">●</span>  Masuk (Arus Balik) :  <b>${formatNumber(m)}</b> unit<br>`,
      `<br>`,
      `<span style="font-size:11px;font-weight:700;color:#F8FAFC;">Total Arus Gerbang :  ${formatNumber(tot)} unit</span>`
    ].join('');
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
    hovertext: combinedTolHoverTexts,
    hovertemplate: '%{hovertext}<extra></extra>'
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
    hovertext: combinedTolHoverTexts,
    hovertemplate: '%{hovertext}<extra></extra>'
  };

  const layout = {
    barmode: 'group',
    bargap: 0.35,
    bargroupgap: 0.14,
    height: 380,
    margin: { l: 95, r: 25, t: 35, b: 65 },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: {
      family: 'Plus Jakarta Sans, sans-serif',
      size: 11,
      color: isDark ? '#94A3B8' : '#475569'
    },
    hoverlabel: {
      bgcolor: '#0F172A',
      bordercolor: '#334155',
      align: 'left',
      font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#FFFFFF' }
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
      title: {
        text: 'Volume Kendaraan (Unit)',
        standoff: 18
      },
      automargin: true,
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
    if (d.lintas.includes('Merak')) return 'Merak - Bakauheni<br><span style="font-size:10px;opacity:0.8;">(Selat Sunda)</span>';
    if (d.lintas.includes('Ketapang')) return 'Ketapang - Gilimanuk<br><span style="font-size:10px;opacity:0.8;">(Selat Bali)</span>';
    return 'Ciwandan & BBJ<br><span style="font-size:10px;opacity:0.8;">(Kontinjensi Truk)</span>';
  });

  const cleanNames = asdpData.map(d => {
    if (d.lintas.includes('Merak')) return 'Merak - Bakauheni (Selat Sunda)';
    if (d.lintas.includes('Ketapang')) return 'Ketapang - Gilimanuk (Selat Bali)';
    return 'Ciwandan & BBJ Bojonegara (Pelabuhan Pengalihan Truk)';
  });

  const motor = asdpData.map(d => d.proyeksi_motor_r2 || 0);
  const mobil = asdpData.map(d => d.proyeksi_mobil_r4 || 0);
  const truk = asdpData.map(d => d.proyeksi_truk_sumbu3 || 0);

  // Sumbu-Y presisi: batas tick maksimal 400.000 (angka 500.000 dihilangkan)
  // Range diberikan ruang hingga 425.000 agar label angka 397.953 tetap utuh & proporsional

    // Tooltip gabungan 3 moda kendaraan sekaligus (Mobil R4, Motor R2, Truk)
  // Tooltip gabungan 3 moda kendaraan - Lega, nyaman, dan berjarak proporsional
  const combinedAsdpHoverTexts = asdpData.map(d => {
    const total = d.proyeksi_total_2026 || (d.proyeksi_mobil_r4 + d.proyeksi_motor_r2 + d.proyeksi_truk_sumbu3);
    const pMobil = Math.round(((d.proyeksi_mobil_r4 || 0) / total) * 100);
    const pMotor = Math.round(((d.proyeksi_motor_r2 || 0) / total) * 100);
    const pTruk = Math.round(((d.proyeksi_truk_sumbu3 || 0) / total) * 100);

    let cleanTitle = d.lintas;
    let subtitle = '';
    if (cleanTitle.includes('Merak')) {
      cleanTitle = 'Merak – Bakauheni';
      subtitle = 'Lintas Selat Sunda';
    } else if (cleanTitle.includes('Ketapang')) {
      cleanTitle = 'Ketapang – Gilimanuk';
      subtitle = 'Lintas Selat Bali';
    } else {
      cleanTitle = 'Ciwandan & BBJ Bojonegara';
      subtitle = 'Pelabuhan Kontinjensi Truk';
    }

    return [
      `<span style="font-size:12px;font-weight:800;color:#FFFFFF;">${cleanTitle}</span><br>`,
      `<span style="font-size:10px;color:#94A3B8;">${subtitle}</span><br>`,
      `<br>`,
      `<span style="color:#38BDF8;font-size:12px;">●</span>  Mobil Pribadi (R4) :  <b>${formatNumber(d.proyeksi_mobil_r4)}</b> unit  <span style="color:#94A3B8;">(${pMobil}%)</span><br>`,
      `<span style="color:#FBBF24;font-size:12px;">●</span>  Sepeda Motor (R2) :  <b>${formatNumber(d.proyeksi_motor_r2)}</b> unit  <span style="color:#94A3B8;">(${pMotor}%)</span><br>`,
      `<span style="color:#C084FC;font-size:12px;">●</span>  Truk Logistik (S3+) :  <b>${formatNumber(d.proyeksi_truk_sumbu3)}</b> unit  <span style="color:#94A3B8;">(${pTruk}%)</span><br>`,
      `<br>`,
      `<span style="font-size:11px;font-weight:700;color:#F8FAFC;">Total Proyeksi :  ${formatNumber(total)} unit</span>`
    ].join('');
  });

  const traceR4 = {
    x: names,
    y: mobil,
    name: 'Mobil Pribadi (Roda 4)',
    type: 'bar',
    marker: { color: '#0284C7' },
    hovertext: combinedAsdpHoverTexts,
    hovertemplate: '%{hovertext}<extra></extra>',
    cliponaxis: false
  };

  const traceR2 = {
    x: names,
    y: motor,
    name: 'Sepeda Motor (Roda 2)',
    type: 'bar',
    marker: { color: '#F59E0B' },
    hovertext: combinedAsdpHoverTexts,
    hovertemplate: '%{hovertext}<extra></extra>',
    cliponaxis: false
  };

  const traceTruk = {
    x: names,
    y: truk,
    name: 'Truk Logistik (Sumbu 3+)',
    type: 'bar',
    marker: { color: '#7C3AED' },
    hovertext: combinedAsdpHoverTexts,
    hovertemplate: '%{hovertext}<extra></extra>',
    cliponaxis: false
  };

  // Label angka di atas batang bar agar langsung terbaca tanpa perlu mengira-ngira
  traceR4.text = mobil.map(v => v > 0 ? formatNumber(v) : '');
  traceR4.textposition = 'outside';
  traceR4.cliponaxis = false;
  traceR4.textfont = { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#475569' };

  traceR2.text = motor.map(v => v > 0 ? formatNumber(v) : '');
  traceR2.textposition = 'outside';
  traceR2.cliponaxis = false;
  traceR2.textfont = { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#475569' };

  traceTruk.text = truk.map(v => v > 0 ? formatNumber(v) : '');
  traceTruk.textposition = 'outside';
  traceTruk.cliponaxis = false;
  traceTruk.textfont = { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#475569' };

  // Grouped Bar Chart: 3 Batang Terpisah Berdampingan (Mobil R4, Motor R2, Truk)
  const layout = {
    barmode: 'group',
    bargap: 0.36,
    bargroupgap: 0.14,
    height: 410,
    margin: { l: 85, r: 25, t: 45, b: 45 },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: {
      family: 'Plus Jakarta Sans, sans-serif',
      size: 11,
      color: isDark ? '#94A3B8' : '#475569'
    },
    hoverlabel: {
      bgcolor: '#0F172A',
      bordercolor: '#334155',
      align: 'left',
      font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#FFFFFF' }
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
      tickfont: { size: 11, color: isDark ? '#E2E8F0' : '#1E293B', weight: 'bold' }
    },
    yaxis: {
      title: {
        text: 'Volume Kendaraan (Unit)',
        standoff: 16
      },
      range: [0, 425000],
      tickmode: 'array',
      tickvals: [0, 100000, 200000, 300000, 400000],
      ticktext: ['0', '100,000', '200,000', '300,000', '400,000'],
      automargin: true,
      gridcolor: isDark ? '#334155' : '#E2E8F0'
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

  const karakteristikMap = {
    'merak': {
      label: 'Didominasi Mobil Pribadi (65%)',
      badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    'ketapang': {
      label: 'Didominasi Wisatawan Mobil (45%) & Motor (35%)',
      badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    'ciwandan': {
      label: 'Khusus Pengalihan Truk Logistik (85%)',
      badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    }
  };

  tbody.innerHTML = asdpData.map((row, idx) => {
    let key = 'merak';
    if (row.lintas.toLowerCase().includes('ketapang')) key = 'ketapang';
    if (row.lintas.toLowerCase().includes('ciwandan')) key = 'ciwandan';
    const info = karakteristikMap[key];

    return `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
        <td class="py-2.5 px-3 text-center text-slate-400 font-semibold">${idx + 1}</td>
        <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
          ${row.lintas}
        </td>
        <td class="py-2.5 px-3 text-right font-medium text-slate-600 dark:text-slate-300 num-tabular">
          ${formatNumber(row.realisasi_total_2025)}
        </td>
        <td class="py-2.5 px-3 text-right font-extrabold text-purple-900 dark:text-purple-300 num-tabular">
          ${formatNumber(row.proyeksi_total_2026)}
        </td>
        <td class="py-2.5 px-3 text-right text-amber-700 dark:text-amber-400 font-semibold num-tabular">
          ${formatNumber(row.proyeksi_motor_r2)}
        </td>
        <td class="py-2.5 px-3 text-right text-blue-700 dark:text-sky-400 font-bold num-tabular">
          ${formatNumber(row.proyeksi_mobil_r4)}
        </td>
        <td class="py-2.5 px-3 text-right text-purple-700 dark:text-purple-400 font-semibold num-tabular">
          ${formatNumber(row.proyeksi_truk_sumbu3)}
        </td>
        <td class="py-2.5 px-3 text-[11px]">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${info.badge}">
            ${info.label}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * ==============================================================================
 * 6. DIREKTORI JARINGAN LALU LINTAS NASIONAL (43 GERBANG TOL & 44 RUAS ARTERI)
 * Direktori Pemantauan 43 Gerbang Tol & 44 Ruas Arteri Pantauan Nasional
 * ==============================================================================
 */

let jaringanState = {
  activeTab: 'tol', // 'tol' | 'arteri'
  searchQuery: '',
  selectedProv: 'ALL',
  tolData: [],
  arteriData: [],
  initialized: false
};

function initJaringanNasional(tol43, arteri44) {
  jaringanState.tolData = tol43 || [];
  jaringanState.arteriData = arteri44 || [];

  if (!jaringanState.initialized) {
    setupJaringanControls();
    jaringanState.initialized = true;
  }

  updateJaringanView(true);
}

function setupJaringanControls() {
  const searchInput = document.getElementById('input-jaringan-search');
  const provSelect = document.getElementById('select-jaringan-prov');
  const resetBtn = document.getElementById('btn-reset-jaringan');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      jaringanState.searchQuery = (e.target.value || '').toLowerCase().trim();
      updateJaringanView(false);
    });
  }

  if (provSelect) {
    provSelect.addEventListener('change', (e) => {
      jaringanState.selectedProv = e.target.value;
      updateJaringanView(false);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      jaringanState.searchQuery = '';
      jaringanState.selectedProv = 'ALL';
      if (searchInput) searchInput.value = '';
      if (provSelect) provSelect.value = 'ALL';
      updateJaringanView(false);
    });
  }
}

window.switchJaringanTab = function(tabKey) {
  if (jaringanState.activeTab === tabKey) return;
  jaringanState.activeTab = tabKey;
  jaringanState.searchQuery = '';
  jaringanState.selectedProv = 'ALL';

  const searchInput = document.getElementById('input-jaringan-search');
  if (searchInput) searchInput.value = '';

  const btnTol = document.getElementById('btn-tab-tol43');
  const btnArteri = document.getElementById('btn-tab-arteri44');

  if (tabKey === 'tol') {
    if (btnTol) {
      btnTol.className = 'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 bg-gov-navy text-white shadow-xs';
    }
    if (btnArteri) {
      btnArteri.className = 'px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700';
    }
  } else {
    if (btnArteri) {
      btnArteri.className = 'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 bg-gov-navy text-white shadow-xs';
    }
    if (btnTol) {
      btnTol.className = 'px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700';
    }
  }

  updateJaringanView(true);
};

function updateJaringanView(resetProvDropdown) {
  const isTol = jaringanState.activeTab === 'tol';
  const rawData = isTol ? jaringanState.tolData : jaringanState.arteriData;

  if (resetProvDropdown) {
    populateJaringanProvDropdown(rawData);
  }

  const filtered = rawData.filter(item => {
    const q = jaringanState.searchQuery;
    const matchQuery = !q || 
      (item.nama && item.nama.toLowerCase().includes(q)) ||
      (item.provinsi && item.provinsi.toLowerCase().includes(q));

    const matchProv = jaringanState.selectedProv === 'ALL' || item.provinsi === jaringanState.selectedProv;

    return matchQuery && matchProv;
  });

  renderJaringanKPIs(rawData, isTol);
  renderJaringanTable(filtered, isTol, rawData.length);

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function populateJaringanProvDropdown(dataList) {
  const select = document.getElementById('select-jaringan-prov');
  if (!select) return;

  const provs = Array.from(new Set(dataList.map(d => d.provinsi).filter(Boolean))).sort();
  select.innerHTML = `<option value="ALL">Semua Provinsi (${dataList.length})</option>` +
    provs.map(p => {
      const count = dataList.filter(d => d.provinsi === p).length;
      return `<option value="${p}">${p} (${count})</option>`;
    }).join('');

  select.value = jaringanState.selectedProv;
}

function renderJaringanKPIs(fullData, isTol) {
  const container = document.getElementById('jaringan-kpi-cards');
  if (!container || fullData.length === 0) return;

  const totReal = fullData.reduce((acc, c) => acc + (c.realisasi_2025 || 0), 0);
  const totProy = fullData.reduce((acc, c) => acc + (c.proyeksi_2026 || 0), 0);
  const growth = totReal > 0 ? (((totProy - totReal) / totReal) * 100).toFixed(2) : '0';
  const top1 = fullData[0] || {};

  const titlePrefix = isTol ? '43 Gerbang Tol' : '44 Ruas Arteri';
  const badgeColor = isTol 
    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

  container.innerHTML = `
    <!-- Card 1: Total Realisasi 2025 -->
    <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gov-border dark:border-slate-800 shadow-xs">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-bold text-gov-muted dark:text-slate-400 uppercase tracking-wider">Realisasi 2025 (${titlePrefix})</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor} border">
          Baseline Posko
        </span>
      </div>
      <div class="text-xl font-extrabold text-slate-800 dark:text-slate-100 num-tabular mb-0.5">
        ${formatNumber(totReal)}
      </div>
      <p class="text-[10px] text-gov-muted dark:text-slate-400">
        Total volume kendaraan selama 18 hari masa posko Nataru 2024/2025.
      </p>
    </div>

    <!-- Card 2: Total Proyeksi 2026 -->
    <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gov-border dark:border-slate-800 shadow-xs">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-bold text-gov-muted dark:text-slate-400 uppercase tracking-wider">Proyeksi 2026 (${titlePrefix})</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gov-navy text-white">
          Damped HW
        </span>
      </div>
      <div class="text-xl font-extrabold text-gov-navy dark:text-sky-400 num-tabular mb-0.5">
        ${formatNumber(totProy)}
      </div>
      <p class="text-[10px] text-gov-muted dark:text-slate-400">
        Estimasi arus kendaraan Nataru 2026/2027 dengan peredam kapasitas jalan riil.
      </p>
    </div>

    <!-- Card 3: Pertumbuhan YoY -->
    <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gov-border dark:border-slate-800 shadow-xs">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-bold text-gov-muted dark:text-slate-400 uppercase tracking-wider">Pertumbuhan YoY</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Tren Makro
        </span>
      </div>
      <div class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 num-tabular mb-0.5">
        +${growth}%
      </div>
      <p class="text-[10px] text-gov-muted dark:text-slate-400">
        Kenaikan beban volume lalu lintas agregat dibanding realisasi tahun lalu.
      </p>
    </div>

    <!-- Card 4: Titik #1 Terpadat -->
    <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gov-border dark:border-slate-800 shadow-xs">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-bold text-gov-muted dark:text-slate-400 uppercase tracking-wider">#1 Titik Paling Padat</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          Rank 1 (${top1.share_pct}%)
        </span>
      </div>
      <div class="text-sm font-extrabold text-rose-700 dark:text-rose-400 truncate mb-0.5" title="${top1.nama || '-'}">
        ${top1.nama || '-'}
      </div>
      <p class="text-[10px] text-gov-muted dark:text-slate-400">
        ${formatNumber(top1.proyeksi_2026 || 0)} Kendaraan &bull; ${top1.provinsi || '-'}
      </p>
    </div>
  `;
}

function renderJaringanTable(filteredData, isTol, totalCount) {
  const tbody = document.getElementById('table-jaringan-body');
  const counterEl = document.getElementById('label-jaringan-counter');
  if (!tbody) return;

  const typeLabel = isTol ? 'Gerbang Tol' : 'Ruas Jalan Arteri';
  if (counterEl) {
    counterEl.textContent = `Menampilkan ${filteredData.length} dari ${totalCount} ${typeLabel}`;
  }

  if (filteredData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          <i data-lucide="search-x" class="w-6 h-6 mx-auto mb-2 opacity-50"></i>
          Tidak ditemukan ${typeLabel} yang cocok dengan pencarian atau filter provinsi.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredData.map((row) => {
    let rankBadge = '';
    if (row.rank === 1) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-xs">1</span>';
    } else if (row.rank === 2) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400 text-white font-extrabold text-xs shadow-xs">2</span>';
    } else if (row.rank === 3) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs shadow-xs">3</span>';
    } else {
      rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs">${row.rank}</span>`;
    }

    let densityBadge = '';
    if (row.proyeksi_2026 >= 1000000) {
      densityBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Ekstrem Padat (&gt;1 Jt)</span>';
    } else if (row.proyeksi_2026 >= 500000) {
      densityBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Sangat Padat</span>';
    } else {
      densityBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Padat Normal</span>';
    }

    return `
      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60">
        <td class="py-2.5 px-3 text-center">${rankBadge}</td>
        <td class="py-2.5 px-3">
          <div class="font-bold text-slate-900 dark:text-slate-100 text-xs">${row.nama}</div>
          <div class="text-[10px] text-slate-400 dark:text-slate-500">ID Pantauan #${row.no_asli}</div>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ${row.provinsi}
          </span>
        </td>
        <td class="py-2.5 px-3 text-right font-medium text-slate-600 dark:text-slate-300 num-tabular">
          ${formatNumber(row.realisasi_2025)}
        </td>
        <td class="py-2.5 px-3 text-right font-extrabold text-gov-navy dark:text-sky-400 num-tabular">
          ${formatNumber(row.proyeksi_2026)}
        </td>
        <td class="py-2.5 px-3 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            +${row.pertumbuhan_pct}%
          </span>
        </td>
        <td class="py-2.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-300 num-tabular">
          ${row.share_pct}%
        </td>
        <td class="py-2.5 px-3 text-center whitespace-nowrap">
          ${densityBadge}
        </td>
      </tr>
    `;
  }).join('');
}
