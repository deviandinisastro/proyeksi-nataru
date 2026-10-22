/**
 * ==============================================================================
 * EXECUTIVE.JS: MODUL 1 - IKHTISAR POSKO & PEMANTAUAN PUNCAK NATARU
 * Sistem Penunjang Keputusan (DSS) Nataru 2026/2027 - Pusdatin Kemenhub
 * Standar: INA Digital Foundation Colors
 * ==============================================================================
 */

let executiveRendered = false;

// Palet Resmi INA Digital untuk 5 Moda Penumpang
const INA_MODA_COLORS = {
  'Angkutan Udara': '#0284C7',     // Sky / Azure Primary
  'Kereta Api': '#EA580C',         // Warm Orange
  'Angkutan Penyeberangan (SDP)': '#7C3AED', // Purple
  'Angkutan SDP': '#7C3AED',
  'Angkutan Jalan': '#059669',     // Emerald Green
  'Angkutan Laut': '#003882'       // Deep Navy Blue
};

function renderExecutiveModule() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  // Render komponen utama
  renderKPISection(data.kpi_summary);
  renderModaShareSection(data.makro_penumpang);
  renderEarlyWarningSection(data.early_warning_calendar);
  renderCriticalInfrastructureSection(data.titik_kritis_tol, data.titik_kritis_asdp);

  // Resize Plotly chart jika tab dibuka ulang atau ukuran berubah
  setTimeout(() => {
    const donutEl = document.getElementById('chart-moda-share');
    if (donutEl && window.Plotly) {
      Plotly.Plots.resize(donutEl);
    }
  }, 50);

  // Refresh Lucide icons di elemen baru
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  executiveRendered = true;
}

/**
 * 1. Render 4 Kartu KPI Eksekutif Utama (Menggunakan Font Tabular Modern)
 */
function renderKPISection(kpi) {
  const container = document.getElementById('executive-kpi-cards');
  if (!container || !kpi) return;

  container.innerHTML = `
    <!-- KPI 1: Total Proyeksi Penumpang -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider">Total Proyeksi Penumpang</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ${formatPercent(kpi.pertumbuhan_penumpang_pct)} YoY
          </span>
        </div>
        <div class="text-2xl font-extrabold text-gov-navy num-tabular mb-1">
          ${formatNumber(kpi.total_penumpang_2026)}
          <span class="text-xs font-normal text-gov-muted">orang</span>
        </div>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted">
        <span>Realisasi 2025:</span>
        <span class="font-semibold text-slate-700 num-tabular">${formatNumber(kpi.total_penumpang_2025)} orang</span>
      </div>
    </div>

    <!-- KPI 2: Puncak Arus Mudik -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider">Puncak Arus Mudik</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Siaga Puncak 1
          </span>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 num-tabular mb-1">
          ${kpi.puncak_mudik_hari}
        </div>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted">
        <span>Beban Puncak:</span>
        <span class="font-bold text-gov-navy num-tabular">${formatNumber(kpi.puncak_mudik_vol)} orang/hari</span>
      </div>
    </div>

    <!-- KPI 3: Puncak Arus Balik -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider">Puncak Arus Balik</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Siaga Puncak 2
          </span>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 num-tabular mb-1">
          ${kpi.puncak_balik_hari}
        </div>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted">
        <span>Beban Puncak:</span>
        <span class="font-bold text-gov-navy num-tabular">${formatNumber(kpi.puncak_balik_vol)} orang/hari</span>
      </div>
    </div>

    <!-- KPI 4: Moda Tertinggi & Total Sarana -->
    <div class="bg-white p-5 rounded-xl border border-gov-border shadow-xs hover:border-gov-azure/40 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gov-muted uppercase tracking-wider">Pertumbuhan Tertinggi</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-gov-azure_light text-gov-azure border border-blue-200">
            ${formatPercent(kpi.moda_tertinggi_pct)}
          </span>
        </div>
        <div class="text-xl font-extrabold text-slate-900 truncate mb-1">
          ${kpi.moda_tertinggi_nama}
        </div>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted">
        <span>Total Sarana (7 Moda):</span>
        <span class="font-bold text-slate-800 num-tabular">${formatNumber(kpi.total_sarana_2026)} unit</span>
      </div>
    </div>
  `;
}

/**
 * 2. Render Donut Chart Pangsa Moda Penumpang & Tabel Ringkasan
 * (Sesuai Pedoman Visual INA Digital: 2D Donut Chart Bersih & Presisi)
 */
function renderModaShareSection(makroList) {
  const chartEl = document.getElementById('chart-moda-share');
  const tableEl = document.getElementById('table-moda-share');
  if (!chartEl || !makroList) return;

  const isDark = document.documentElement.classList.contains('dark');
  const labels = makroList.map(m => m.label);
  const values = makroList.map(m => m.proyeksi_2026);
  const colors = makroList.map(m => INA_MODA_COLORS[m.label] || INA_MODA_COLORS[m.moda] || m.color);

  // Plotly 2D Donut Chart (Standar HCI & Visualisasi Data Pemerintah)
  const plotData = [{
    values: values,
    labels: labels,
    type: 'pie',
    hole: 0.58,
    marker: {
      colors: colors,
      line: { color: isDark ? '#131D31' : '#FFFFFF', width: 2 }
    },
    textinfo: 'percent',
    textposition: 'inside',
    insidetextfont: { color: '#FFFFFF', size: 12, family: 'Plus Jakarta Sans', weight: 'bold' },
    hoverinfo: 'label+value+percent',
    hovertemplate: '<b>%{label}</b><br>Proyeksi: %{value:,.0f} orang<br>Pangsa: %{percent}<extra></extra>'
  }];

  const layout = {
    showlegend: false,
    margin: { t: 10, b: 10, l: 10, r: 10 },
    height: 260,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    hoverlabel: {
      bgcolor: isDark ? '#1E293B' : '#FFFFFF',
      bordercolor: isDark ? '#334155' : '#E2E8F0',
      font: { family: 'Plus Jakarta Sans', size: 11, color: isDark ? '#F8FAFC' : '#0F172A' }
    }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(chartEl, plotData, layout, config);

  // Tabel Rincian Pangsa Moda
  if (tableEl) {
    const rowsHtml = makroList.map(m => {
      const modeColor = INA_MODA_COLORS[m.label] || INA_MODA_COLORS[m.moda] || m.color;
      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
          <td class="py-2.5 px-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${modeColor}"></span>
              <span class="font-semibold text-slate-800">${m.label}</span>
            </div>
          </td>
          <td class="py-2.5 px-3 text-right num-tabular text-slate-600 font-medium">${formatNumber(m.realisasi_2025)}</td>
          <td class="py-2.5 px-3 text-right num-tabular text-gov-navy font-bold">${formatNumber(m.proyeksi_2026)}</td>
          <td class="py-2.5 px-3 text-right num-tabular font-semibold ${m.pertumbuhan_pct >= 5 ? 'text-emerald-600' : 'text-slate-700'}">
            ${formatPercent(m.pertumbuhan_pct)}
          </td>
          <td class="py-2.5 px-3 text-right num-tabular font-bold text-gov-azure">${m.porsi_share_pct.toLocaleString('id-ID')}%</td>
        </tr>
      `;
    }).join('');

    tableEl.innerHTML = rowsHtml;
  }
}

/**
 * 3. Render Kalender Kesiagaan Operasional Posko (18 Hari)
 */
function renderEarlyWarningSection(ewCalendar) {
  const container = document.getElementById('executive-early-warning-table');
  const countNormalEl = document.getElementById('count-status-normal');
  const countWaspadaEl = document.getElementById('count-status-waspada');
  const countSiagaEl = document.getElementById('count-status-siaga');

  if (!container || !ewCalendar) return;

  let normalCount = 0;
  let waspadaCount = 0;
  let siagaCount = 0;

  const rows = ewCalendar.map((item) => {
    const isNormal = item.status_kesiagaan.includes('HIJAU') || item.status_kesiagaan.includes('LANCAR');
    const isWaspada = item.status_kesiagaan.includes('KUNING') || item.status_kesiagaan.includes('PADAT');
    const isSiaga = item.status_kesiagaan.includes('MERAH') || item.status_kesiagaan.includes('KRITIS');

    if (isNormal) normalCount++;
    else if (isWaspada) waspadaCount++;
    else if (isSiaga) siagaCount++;

    let badgeClass = 'badge-normal';
    let statusLabel = 'Lancar / Normal';
    let pulseHtml = '';

    if (isSiaga) {
      badgeClass = 'badge-siaga';
      statusLabel = 'Siaga Puncak';
      pulseHtml = '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0 mr-1.5"></span>';
    } else if (isWaspada) {
      badgeClass = 'badge-waspada';
      statusLabel = 'Waspada Antrean';
      pulseHtml = '<span class="w-2 h-2 rounded-full bg-amber-500 shrink-0 mr-1.5"></span>';
    } else {
      pulseHtml = '<span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mr-1.5"></span>';
    }

    const isPeakHighlight = item.hari_posko === 'H-1' || item.hari_posko === 'H+9';

    return `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 ${isPeakHighlight ? 'bg-amber-50/40' : ''}">
        <td class="py-2.5 px-3 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <span class="font-extrabold ${isPeakHighlight ? 'text-amber-800' : 'text-slate-800'} num-tabular text-xs">
              ${item.hari_posko}
            </span>
            ${isPeakHighlight ? '<span class="px-1.5 py-0.2 text-[9px] font-bold bg-amber-200 text-amber-900 rounded">PUNCAK</span>' : ''}
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-700 whitespace-nowrap text-xs">
          ${item.hari_pekan}
        </td>
        <td class="py-2.5 px-3 text-right num-tabular font-bold text-gov-navy text-xs">
          ${formatNumber(item.proyeksi_total_penumpang)}
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">
          <div class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${badgeClass}">
            ${pulseHtml}
            <span>${statusLabel}</span>
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-600 text-xs leading-snug">
          ${item.rekomendasi_operasional}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = rows;

  if (countNormalEl) countNormalEl.innerText = `${normalCount} Hari`;
  if (countWaspadaEl) countWaspadaEl.innerText = `${waspadaCount} Hari`;
  if (countSiagaEl) countSiagaEl.innerText = `${siagaCount} Hari`;
}

/**
 * 4. Render Titik Kritis: 4 Gerbang Tol Jakarta & 3 Lintas ASDP
 * (Dengan Kebijakan Operasional Kontekstual & Realistis)
 */
function renderCriticalInfrastructureSection(tolList, asdpList) {
  const tolContainer = document.getElementById('executive-tol-cards');
  const asdpContainer = document.getElementById('executive-asdp-cards');

  // A. Gerbang Tol Jakarta (Trans Jawa, Bandung, Merak, Puncak)
  if (tolContainer && tolList) {
    const gates = {};
    tolList.forEach(item => {
      const name = item.gerbang_tol;
      if (!gates[name]) {
        gates[name] = { name: name, keluar: 0, keluar_25: 0, masuk: 0, masuk_25: 0, growth: item.pertumbuhan_pct };
      }
      if (item.arah.toLowerCase().includes('keluar')) {
        gates[name].keluar = item.proyeksi_2026;
        gates[name].keluar_25 = item.realisasi_2025;
      } else {
        gates[name].masuk = item.proyeksi_2026;
        gates[name].masuk_25 = item.realisasi_2025;
      }
    });

    tolContainer.innerHTML = Object.values(gates).map(g => {
      const totalVol = g.keluar + g.masuk;
      return `
        <div class="p-4 bg-white rounded-xl border border-gov-border shadow-xs hover:border-gov-azure/50 transition-all">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <span class="text-[10px] font-bold text-gov-azure uppercase tracking-wider">Barrier Utama</span>
              <h4 class="text-xs font-bold text-gov-text leading-snug">${g.name}</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              ${formatPercent(g.growth)}
            </span>
          </div>

          <div class="space-y-2 mb-3">
            <div class="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
              <span class="text-slate-600 flex items-center gap-1.5">
                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 text-rose-500"></i>
                Keluar (Mudik)
              </span>
              <span class="font-bold text-gov-text num-tabular">${formatNumber(g.keluar)}</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
              <span class="text-slate-600 flex items-center gap-1.5">
                <i data-lucide="arrow-down-left" class="w-3.5 h-3.5 text-emerald-600"></i>
                Masuk (Balik)
              </span>
              <span class="font-bold text-gov-text num-tabular">${formatNumber(g.masuk)}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-gov-muted">
            <span>Total Lalu Lintas:</span>
            <span class="font-extrabold text-gov-navy num-tabular">${formatNumber(totalVol)} kend</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // B. Lintasan ASDP Penyeberangan (Kebijakan Kontekstual Sesuai SOP Wilayah)
  if (asdpContainer && asdpList) {
    asdpContainer.innerHTML = asdpList.map(a => {
      let policyText = a.kebijakan_operasional;

      // Kontekstualisasi kebijakan operasional spesifik per lintasan
      if (a.lintas.includes('Merak') || a.lintas.includes('Sunda')) {
        policyText = 'Sistem Delaying & Buffer Zone Rest Area KM 43 & 68 Tol Tangerang-Merak, Pengalihan Truk Logistik ke Pelabuhan Ciwandan.';
      } else if (a.lintas.includes('Ketapang') || a.lintas.includes('Bali')) {
        policyText = 'Buffer Zone Terminal Sritanjung Banyuwangi & Pengalihan Angkutan Logistik Berat ke Pelabuhan Jangkar Situbondo.';
      } else if (a.lintas.includes('Ciwandan') || a.lintas.includes('BBJ')) {
        policyText = 'Pelabuhan Penyangga Khusus Truk Logistik Sumbu 3+ (Golongan VII-IX) dan Roda 2 Jalur Banten-Lampung.';
      }

      return `
        <div class="p-4 bg-white rounded-xl border border-gov-border shadow-xs hover:border-gov-azure/50 transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <h4 class="text-xs font-bold text-gov-navy leading-snug">${a.lintas}</h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                Lintas Strategis
              </span>
            </div>
            <div class="text-xl font-extrabold text-gov-text num-tabular mb-3">
              ${formatNumber(a.proyeksi_total_2026)}
              <span class="text-xs font-normal text-gov-muted">kendaraan</span>
            </div>

            <!-- Rincian Moda Kendaraan -->
            <div class="grid grid-cols-3 gap-1.5 mb-3 text-center">
              <div class="p-2 bg-slate-50 rounded-lg">
                <span class="text-[10px] text-slate-500 block">Roda 2</span>
                <span class="text-xs font-bold text-slate-800 num-tabular">${formatNumber(a.proyeksi_motor_r2)}</span>
              </div>
              <div class="p-2 bg-slate-50 rounded-lg">
                <span class="text-[10px] text-slate-500 block">Roda 4</span>
                <span class="text-xs font-bold text-slate-800 num-tabular">${formatNumber(a.proyeksi_mobil_r4)}</span>
              </div>
              <div class="p-2 bg-slate-50 rounded-lg">
                <span class="text-[10px] text-slate-500 block">Truk Sumbu 3+</span>
                <span class="text-xs font-bold text-slate-800 num-tabular">${formatNumber(a.proyeksi_truk_sumbu3)}</span>
              </div>
            </div>
          </div>

          <div class="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-900 leading-snug">
            <span class="font-bold block mb-0.5">SOP & Kebijakan Operasional:</span>
            ${policyText}
          </div>
        </div>
      `;
    }).join('');
  }
}

