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

  const isDark = document.documentElement.classList.contains('dark');
  const days = records.map(r => r.hari_posko);
  const hoverDays = records.map(r => `${r.hari_posko} (${r.hari_pekan})`);
  const v2024 = records.map(r => r.vol_2024);
  const v2025 = records.map(r => r.vol_2025);
  const v2026 = records.map(r => r.vol_2026);

  const unitLabel = harianState.metric === 'penumpang' ? 'orang' : 'unit kendaraan';

  // Opsi Utama: Apache ECharts (Kurva Spline Halus, Animasi Fisika, dan Tooltip Modern)
  if (window.echarts) {
    if (chartEl._plotly) {
      Plotly.purge(chartEl);
    }
    let echartsInstance = echarts.getInstanceByDom(chartEl);
    if (!echartsInstance) {
      echartsInstance = echarts.init(chartEl);
      window.addEventListener('resize', () => echartsInstance && echartsInstance.resize());
    }

    const textColor = isDark ? '#CBD5E1' : '#334155';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.22)';

    const option = {
      backgroundColor: 'transparent',
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        borderColor: isDark ? '#334155' : '#CBD5E1',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#0F172A',
          fontSize: 12,
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        },
        formatter: (params) => {
          if (!params || !params.length) return '';
          const idx = params[0].dataIndex;
          const r = records[idx];
          let html = `<div style="font-weight:700;margin-bottom:6px;">${r.hari_posko} (${r.hari_pekan}) — ${harianState.mode}</div>`;
          params.forEach((p) => {
            html += `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;">
              <span>${p.marker} ${p.seriesName}</span>
              <span style="font-weight:700;">${Number(p.value).toLocaleString('id-ID')} ${unitLabel}</span>
            </div>`;
          });
          return html;
        }
      },
      legend: {
        top: 0,
        textStyle: {
          color: textColor,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        }
      },
      grid: { top: 55, right: 24, bottom: 42, left: 75 },
      xAxis: {
        type: 'category',
        data: days,
        axisLabel: {
          color: textColor,
          fontSize: 11,
          interval: 0,
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        },
        axisLine: { lineStyle: { color: gridColor } }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: textColor,
          fontSize: 11,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          formatter: (val) => {
            if (val >= 1000000) return (val / 1000000).toFixed(1) + ' Jt';
            if (val >= 1000) return (val / 1000).toFixed(0) + ' Rb';
            return val;
          }
        },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } }
      },
      series: [
        {
          name: 'Realisasi 2024',
          type: 'line',
          smooth: 0.35,
          data: v2024,
          itemStyle: { color: '#94A3B8' },
          lineStyle: { width: 2, type: 'dotted' },
          symbolSize: 5
        },
        {
          name: 'Realisasi 2025 (Baseline)',
          type: 'line',
          smooth: 0.35,
          data: v2025,
          itemStyle: { color: isDark ? '#38BDF8' : '#0066CC' },
          lineStyle: { width: 2.8 },
          symbolSize: 6,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: isDark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(0, 102, 204, 0.16)' },
              { offset: 1, color: isDark ? 'rgba(56, 189, 248, 0.01)' : 'rgba(0, 102, 204, 0.01)' }
            ])
          }
        },
        {
          name: 'Proyeksi 2026 (Damped HW)',
          type: 'line',
          smooth: 0.35,
          data: v2026,
          itemStyle: { color: '#D97706' },
          lineStyle: { width: 3.5 },
          symbolSize: 8,
          markPoint: {
            symbol: 'roundRect',
            symbolSize: [54, 22],
            symbolOffset: [0, -18],
            itemStyle: {
              color: '#DC2626',
              borderColor: '#FFFFFF',
              borderWidth: 1.5,
              shadowBlur: 6,
              shadowColor: 'rgba(220, 38, 38, 0.35)'
            },
            data: [{ type: 'max', name: 'Puncak Tertinggi' }],
            label: {
              fontSize: 10,
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              formatter: 'Puncak'
            }
          }
        }
      ]
    };

    echartsInstance.setOption(option, true);
    return;
  }

  // Trace 1: Realisasi 2024 (Slate Netral Solid - Historical Benchmark)
  const trace2024 = {
    x: days,
    y: v2024,
    name: 'Realisasi 2024',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: '#94A3B8', width: 2, shape: 'spline', smoothing: 1.3 },
    marker: { size: 4.5, color: '#94A3B8' },
    hovertemplate: '%{y:,.0f} ' + unitLabel + '<extra>2024</extra>'
  };

  // Trace 2: Realisasi 2025 (Biru Resmi Baseline Kemenhub Solid)
  const trace2025 = {
    x: days,
    y: v2025,
    name: 'Realisasi 2025 (Baseline)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: isDark ? '#38BDF8' : '#003882', width: 2.8, shape: 'spline', smoothing: 1.3 },
    marker: { size: 5, color: isDark ? '#38BDF8' : '#003882' },
    hovertemplate: '%{y:,.0f} ' + unitLabel + '<extra>2025</extra>'
  };

  // Trace 3: Proyeksi 2026 (Amber Gold / Sunset Glow - Kontras Tinggi & Sorotan Utama Damped HW)
  const trace2026 = {
    x: days,
    y: v2026,
    name: 'Proyeksi 2026 (Damped HW)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: isDark ? '#F59E0B' : '#D97706', width: 3.5, shape: 'spline', smoothing: 1.3 },
    marker: { size: 6, color: isDark ? '#F59E0B' : '#D97706' },
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
      bgcolor: isDark ? '#1E293B' : '#FFFFFF',
      bordercolor: isDark ? '#334155' : '#E2E8F0',
      font: { family: 'Plus Jakarta Sans', size: 11, color: isDark ? '#F8FAFC' : '#0F172A' }
    },
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: 1.15,
      font: { family: 'Plus Jakarta Sans', size: 11, color: isDark ? '#F8FAFC' : '#0F172A' }
    },
    xaxis: {
      tickmode: 'array',
      tickvals: days,
      ticktext: days,
      showgrid: true,
      gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      linecolor: isDark ? '#334155' : '#CBD5E1',
      tickfont: { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#64748B' }
    },
    yaxis: {
      showgrid: true,
      gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      linecolor: isDark ? '#334155' : '#CBD5E1',
      tickformat: ',.0f',
      tickfont: { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#64748B' },
      title: {
        text: `Volume (${unitLabel}/hari)`,
        standoff: 18,
        font: { size: 11, family: 'Plus Jakarta Sans', color: isDark ? '#CBD5E1' : '#64748B' }
      }
    },
    shapes: shapes,
    annotations: annotations,
    margin: { t: 50, b: 40, l: 90, r: 25 },
    height: 380,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  const config = {
    responsive: true,
    displayModeBar: false
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
