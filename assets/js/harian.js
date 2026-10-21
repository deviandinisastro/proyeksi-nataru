/**
 * ==============================================================================
 * HARIAN.JS: MODUL 2 - TREN HARIAN MULTIMODA 18 HARI OPERASIONAL POSKO
 * Sistem Penunjang Keputusan (DSS) Nataru 2026/2027 - Pusdatin Kemenhub
 * ==============================================================================
 */

let harianState = {
  metric: 'penumpang', // 'penumpang' | 'sarana'
  mode: 'TOTAL SELURUH MODA',
  initialized: false
};

function renderHarianModule() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  if (!harianState.initialized) {
    setupHarianControls();
    harianState.initialized = true;
  }

  updateHarianView();

  // Resize Plotly chart saat tab dibuka agar pas dengan lebar kontainer
  setTimeout(() => {
    const chartEl = document.getElementById('harian-timeseries-chart');
    if (chartEl && window.Plotly) {
      Plotly.Plots.resize(chartEl);
    }
  }, 50);
}

/**
 * Setup Event Listeners untuk Tombol Toggle Metrik & Dropdown Pilihan Moda
 */
function setupHarianControls() {
  const btnPenumpang = document.getElementById('btn-metric-penumpang');
  const btnSarana = document.getElementById('btn-metric-sarana');
  const modeSelect = document.getElementById('select-harian-moda');
  const btnExport = document.getElementById('btn-export-harian-csv');

  if (btnPenumpang && btnSarana) {
    btnPenumpang.addEventListener('click', () => {
      if (harianState.metric === 'penumpang') return;
      harianState.metric = 'penumpang';
      harianState.mode = 'TOTAL SELURUH MODA';
      updateMetricButtons();
      populateModeDropdown();
      updateHarianView();
    });

    btnSarana.addEventListener('click', () => {
      if (harianState.metric === 'sarana') return;
      harianState.metric = 'sarana';
      harianState.mode = 'TOTAL SELURUH MODA';
      updateMetricButtons();
      populateModeDropdown();
      updateHarianView();
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      harianState.mode = e.target.value;
      updateHarianView();
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportHarianCSV();
    });
  }

  updateMetricButtons();
  populateModeDropdown();
}

/**
 * Update Tampilan Tombol Metrik (Active vs Inactive)
 */
function updateMetricButtons() {
  const btnPenumpang = document.getElementById('btn-metric-penumpang');
  const btnSarana = document.getElementById('btn-metric-sarana');
  if (!btnPenumpang || !btnSarana) return;

  if (harianState.metric === 'penumpang') {
    btnPenumpang.className = 'px-4 py-2 text-xs font-bold rounded-lg bg-gov-navy text-white shadow-xs transition-all flex items-center gap-2';
    btnSarana.className = 'px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-gov-border text-gov-muted hover:bg-slate-50 transition-all flex items-center gap-2';
  } else {
    btnPenumpang.className = 'px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-gov-border text-gov-muted hover:bg-slate-50 transition-all flex items-center gap-2';
    btnSarana.className = 'px-4 py-2 text-xs font-bold rounded-lg bg-gov-navy text-white shadow-xs transition-all flex items-center gap-2';
  }
}

/**
 * Isi Dropdown Pilihan Moda Sesuai Metrik Aktif
 */
function populateModeDropdown() {
  const data = window.DSS_STATE.data;
  const select = document.getElementById('select-harian-moda');
  if (!select || !data) return;

  const dataset = harianState.metric === 'penumpang' ? data.harian_penumpang : data.harian_sarana;
  const availableModes = Object.keys(dataset.data);

  // Pastikan TOTAL SELURUH MODA di urutan pertama
  const sortedModes = availableModes.sort((a, b) => {
    if (a.includes('TOTAL')) return -1;
    if (b.includes('TOTAL')) return 1;
    return a.localeCompare(b);
  });

  select.innerHTML = sortedModes.map(m => `
    <option value="${m}" ${m === harianState.mode ? 'selected' : ''}>
      ${m === 'TOTAL SELURUH MODA' ? '📊 TOTAL SELURUH MODA (Agregat)' : m}
    </option>
  `).join('');
}

/**
 * Refresh Grafik Plotly dan Tabel Harian
 */
function updateHarianView() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  const dataset = harianState.metric === 'penumpang' ? data.harian_penumpang : data.harian_sarana;
  const records = dataset.data[harianState.mode] || [];

  renderHarianPlotlyChart(records);
  renderHarianTable(records);

  // Refresh Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Render Grafik Deret Waktu Interaktif (Plotly.js)
 */
function renderHarianPlotlyChart(records) {
  const chartEl = document.getElementById('harian-timeseries-chart');
  if (!chartEl || !records || records.length === 0) return;

  const days = records.map(r => r.hari_posko);
  const hoverDays = records.map(r => `${r.hari_posko} (${r.hari_pekan})`);
  const v2024 = records.map(r => r.vol_2024);
  const v2025 = records.map(r => r.vol_2025);
  const v2026 = records.map(r => r.vol_2026);

  const unitLabel = harianState.metric === 'penumpang' ? 'orang' : 'unit kendaraan';

  // Trace 1: Realisasi 2024 (Abu-abu Dotted)
  const trace2024 = {
    x: days,
    y: v2024,
    name: 'Realisasi 2024',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#94A3B8', width: 2, dash: 'dot' },
    marker: { size: 5, color: '#94A3B8' },
    hovertemplate: '%{y:,.0f} ' + unitLabel + '<extra>2024</extra>'
  };

  // Trace 2: Realisasi 2025 (Navy Baseline Solid)
  const trace2025 = {
    x: days,
    y: v2025,
    name: 'Realisasi 2025 (Baseline)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#003882', width: 3 },
    marker: { size: 6, color: '#003882' },
    hovertemplate: '%{y:,.0f} ' + unitLabel + '<extra>2025</extra>'
  };

  // Trace 3: Proyeksi 2026 (Azure Blue Primary Solid/Dashed)
  const trace2026 = {
    x: days,
    y: v2026,
    name: 'Proyeksi 2026 (Damped HW)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#388AEB', width: 3.5 },
    marker: { size: 7, symbol: 'diamond', color: '#388AEB' },
    hovertemplate: '%{y:,.0f} ' + unitLabel + '<extra>Proyeksi 2026</extra>'
  };

  // Anotasi Garis Vertikal Acara Penting (Hari H Natal & H+7 Tahun Baru)
  const shapes = [
    {
      type: 'line',
      x0: 'H',
      x1: 'H',
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: { color: '#EF4444', width: 1.5, dash: 'dash' }
    },
    {
      type: 'line',
      x0: 'H+7',
      x1: 'H+7',
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: { color: '#8B5CF6', width: 1.5, dash: 'dash' }
    }
  ];

  const annotations = [
    {
      x: 'H',
      y: 1,
      yref: 'paper',
      text: 'Hari H (Natal)',
      showarrow: false,
      font: { size: 10, color: '#EF4444', family: 'Plus Jakarta Sans', weight: 'bold' },
      yshift: 15
    },
    {
      x: 'H+7',
      y: 1,
      yref: 'paper',
      text: 'H+7 (Tahun Baru)',
      showarrow: false,
      font: { size: 10, color: '#8B5CF6', family: 'Plus Jakarta Sans', weight: 'bold' },
      yshift: 15
    }
  ];

  const layout = {
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: '#FFFFFF',
      bordercolor: '#E2E8F0',
      font: { family: 'Plus Jakarta Sans', size: 11, color: '#0F172A' }
    },
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: 1.15,
      font: { family: 'Plus Jakarta Sans', size: 11 }
    },
    xaxis: {
      tickmode: 'array',
      tickvals: days,
      ticktext: days,
      showgrid: true,
      gridcolor: '#F1F5F9',
      linecolor: '#CBD5E1'
    },
    yaxis: {
      showgrid: true,
      gridcolor: '#F1F5F9',
      linecolor: '#CBD5E1',
      tickformat: ',.0f',
      title: {
        text: `Volume (${unitLabel}/hari)`,
        font: { size: 11, family: 'Plus Jakarta Sans', color: '#64748B' }
      }
    },
    shapes: shapes,
    annotations: annotations,
    margin: { t: 50, b: 40, l: 70, r: 25 },
    height: 380,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
    displaylogo: false
  };

  Plotly.newPlot(chartEl, [trace2024, trace2025, trace2026], layout, config);
}

/**
 * Render Tabel Data Harian 18 Hari
 */
function renderHarianTable(records) {
  const tbody = document.getElementById('harian-table-body');
  const badgeTitle = document.getElementById('harian-table-title');
  if (!tbody || !records) return;

  if (badgeTitle) {
    const unitLabel = harianState.metric === 'penumpang' ? 'Penumpang' : 'Sarana / Kendaraan';
    badgeTitle.innerText = `Data Rinci Deret Waktu: ${harianState.mode} (${unitLabel})`;
  }

  tbody.innerHTML = records.map(r => {
    const vol25 = r.vol_2025 || 0;
    const vol26 = r.vol_2026 || 0;
    const diff = vol26 - vol25;
    const pct = vol25 > 0 ? (diff / vol25) * 100 : 0;
    const isPeak = r.hari_posko === 'H-1' || r.hari_posko === 'H+9';

    return `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 ${isPeak ? 'bg-amber-50/30' : ''}">
        <td class="py-2.5 px-3">
          <div class="flex items-center gap-2">
            <span class="font-extrabold ${isPeak ? 'text-amber-800' : 'text-slate-800'} num-mono text-xs">
              ${r.hari_posko}
            </span>
            ${isPeak ? '<span class="px-1.5 py-0.2 text-[9px] font-bold bg-amber-200 text-amber-900 rounded">PUNCAK</span>' : ''}
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-700 text-xs whitespace-nowrap">${r.hari_pekan}</td>
        <td class="py-2.5 px-3 text-right num-mono text-slate-500 text-xs">${formatNumber(r.vol_2024)}</td>
        <td class="py-2.5 px-3 text-right num-mono text-slate-700 font-medium text-xs">${formatNumber(r.vol_2025)}</td>
        <td class="py-2.5 px-3 text-right num-mono text-gov-navy font-bold text-xs">${formatNumber(r.vol_2026)}</td>
        <td class="py-2.5 px-3 text-right num-mono text-xs font-semibold ${pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
          ${formatPercent(pct)}
        </td>
        <td class="py-2.5 px-3 text-right num-mono text-xs ${diff >= 0 ? 'text-slate-800' : 'text-rose-700'}">
          ${diff >= 0 ? '+' : ''}${formatNumber(diff)}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Ekspor Data Harian Aktif ke Berkas CSV
 */
function exportHarianCSV() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  const dataset = harianState.metric === 'penumpang' ? data.harian_penumpang : data.harian_sarana;
  const records = dataset.data[harianState.mode] || [];
  if (records.length === 0) return;

  const header = ['Hari_Operasional', 'Hari_Pekan', 'Volume_2024', 'Volume_2025', 'Proyeksi_2026', 'Pertumbuhan_Pct', 'Selisih_Volume'];
  const rows = records.map(r => {
    const vol25 = r.vol_2025 || 0;
    const vol26 = r.vol_2026 || 0;
    const diff = vol26 - vol25;
    const pct = vol25 > 0 ? ((diff / vol25) * 100).toFixed(2) : '0';
    return [
      r.hari_posko,
      `"${r.hari_pekan}"`,
      r.vol_2024 || 0,
      vol25,
      vol26,
      pct,
      diff
    ].join(',');
  });

  const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const sanitizedMode = harianState.mode.replace(/\s+/g, '_').toLowerCase();
  link.setAttribute('href', url);
  link.setAttribute('download', `nataru_2026_harian_${harianState.metric}_${sanitizedMode}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
