/**
 * ==============================================================================
 * SIMPUL.JS: MODUL 3 - DIREKTORI & PERINGKAT 1.212 SIMPUL PANTAU NASIONAL
 * Sistem Penunjang Keputusan (DSS) Nataru 2026/2027 - Pusdatin Kemenhub
 * ==============================================================================
 * Prinsip DSS:
 * 1. Isolasi Moda Mutlak (100% Apple-to-Apple): Bandara hanya dibanding Bandara.
 * 2. Visualisasi Top 10 Slim Bar Chart (Plotly: bargap=0.40).
 * 3. Fitur Pencarian Real-Time & Navigasi Antara Top 10 vs Seluruh Simpul.
 * ==============================================================================
 */

let simpulState = {
  activeModa: 'Angkutan Udara',
  showAll: false,
  searchQuery: '',
  initialized: false
};

const SIMPUL_MODA_LIST = [
  { key: 'Angkutan Udara', label: '✈️ Angkutan Udara (257 Bandara)', color: '#0284C7', count: 257, unit: 'Bandara' },
  { key: 'Angkutan Jalan', label: '🚌 Angkutan Jalan (215 Terminal)', color: '#16A34A', count: 215, unit: 'Terminal Bus' },
  { key: 'Angkutan Laut', label: '🚢 Angkutan Laut (267 Pelabuhan)', color: '#1E40AF', count: 267, unit: 'Pelabuhan Laut' },
  { key: 'Kereta Api', label: '🚆 Kereta Api (197 Stasiun Antarkota)', color: '#EA580C', count: 197, unit: 'Stasiun KA' },
  { key: 'Angkutan SDP', label: '⛴️ Angkutan SDP (276 Lintas/Pelabuhan)', color: '#9333EA', count: 276, unit: 'Penyeberangan SDP' }
];

function renderSimpulModule() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  if (!simpulState.initialized) {
    setupSimpulControls();
    simpulState.initialized = true;
  }

  updateSimpulView();
}

/**
 * Setup Event Listener Toolbar Kontrol
 */
function setupSimpulControls() {
  const selectModa = document.getElementById('select-simpul-moda');
  const btnLoadAll = document.getElementById('btn-load-all-simpul');
  const inputSearch = document.getElementById('input-simpul-search');

  // Populate Dropdown Moda (Hanya 5 Opsi Resmi)
  if (selectModa) {
    selectModa.innerHTML = SIMPUL_MODA_LIST.map(m => `
      <option value="${m.key}" ${m.key === simpulState.activeModa ? 'selected' : ''}>
        ${m.label}
      </option>
    `).join('');

    selectModa.addEventListener('change', (e) => {
      simpulState.activeModa = e.target.value;
      simpulState.showAll = false; // Reset ke Top 10 saat moda berganti
      simpulState.searchQuery = '';
      if (inputSearch) inputSearch.value = '';
      updateSimpulView();
    });
  }

  // Tombol Lihat Seluruh Simpul di Bawah Tabel
  if (btnLoadAll) {
    btnLoadAll.addEventListener('click', () => {
      simpulState.showAll = !simpulState.showAll;
      renderSimpulTable();
    });
  }

  // Pencarian Cepat Nama Simpul
  if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
      simpulState.searchQuery = e.target.value.toLowerCase().trim();
      renderSimpulTable();
    });
  }
}

/**
 * Memperbarui Seluruh Tampilan Modul 3
 */
function updateSimpulView() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  renderSimpulChart();
  renderSimpulTable();

  // Resize Chart jika diperlukan
  setTimeout(() => {
    const chartEl = document.getElementById('chart-simpul-top10');
    if (chartEl && window.Plotly) {
      Plotly.Plots.resize(chartEl);
    }
  }, 50);

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Render Horizontal Slim Bar Chart (Top 10 Simpul)
 */
function renderSimpulChart() {
  const data = window.DSS_STATE.data;
  const chartEl = document.getElementById('chart-simpul-top10');
  const chartTitleEl = document.getElementById('simpul-chart-title');
  if (!chartEl || !data) return;

  const top10 = data.simpul_top10[simpulState.activeModa] || [];
  const modaInfo = SIMPUL_MODA_LIST.find(m => m.key === simpulState.activeModa) || SIMPUL_MODA_LIST[0];

  if (chartTitleEl) {
    chartTitleEl.innerText = `Grafik 10 Simpul Terpadat: ${simpulState.activeModa}`;
  }

  // Urutan dibalik agar peringkat 1 berada di atas pada horizontal bar
  const reversedList = [...top10].reverse();
  const yNames = reversedList.map(item => {
    let name = item.nama;
    // Format khusus Sepinggan Balikpapan agar tidak terpotong di y-axis grafik
    if (name.includes('Sultan Aji Muhammad Sulaiman Sepinggan')) {
      return name.replace('Sultan Aji Muhammad Sulaiman Sepinggan', 'SAMS Sepinggan');
    }
    return name;
  });
  const xValues = reversedList.map(item => item.proyeksi_2026);
  const shares = reversedList.map(item => item.porsi_share_pct);
  const r25 = reversedList.map(item => item.realisasi_2025);

  // Opsi Utama: Apache ECharts (Bar Rounded, Animasi Lembut & Tooltip Modern)
  if (window.echarts) {
    if (chartEl._plotly) {
      Plotly.purge(chartEl);
    }
    let echartsBar = echarts.getInstanceByDom(chartEl);
    if (!echartsBar) {
      echartsBar = echarts.init(chartEl);
      window.addEventListener('resize', () => echartsBar && echartsBar.resize());
    }

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#CBD5E1' : '#334155';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.22)';

    const option = {
      backgroundColor: 'transparent',
      animationDuration: 900,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
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
          const item = reversedList[idx];
          return `<div style="font-weight:700;margin-bottom:4px;">${item.nama}</div>
            <div style="font-size:11px;color:${isDark ? '#94A3B8' : '#64748B'};margin-bottom:6px;">${item.kategori || simpulState.activeModa}</div>
            <div style="display:flex;justify-content:space-between;gap:16px;">
              <span>Proyeksi 2026:</span>
              <span style="font-weight:700;color:${modaInfo.color};">${formatNumber(item.proyeksi_2026)} orang</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;">
              <span>Realisasi 2025:</span>
              <span style="font-weight:600;">${formatNumber(item.realisasi_2025)} orang</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;">
              <span>Pangsa di Moda:</span>
              <span style="font-weight:700;color:#0284C7;">${item.porsi_share_pct.toFixed(2).replace('.', ',')}%</span>
            </div>`;
        }
      },
      grid: { top: 20, right: 30, bottom: 20, left: 160 },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: textColor,
          fontSize: 10,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          formatter: (v) => v >= 1000000 ? (v / 1000000).toFixed(1) + ' Jt' : (v >= 1000 ? (v / 1000).toFixed(0) + ' Rb' : v)
        },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: yNames,
        axisLabel: {
          color: textColor,
          fontSize: 11,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          formatter: (val) => val.length > 22 ? val.slice(0, 20) + '…' : val
        },
        axisLine: { lineStyle: { color: gridColor } }
      },
      series: [
        {
          name: 'Proyeksi 2026',
          type: 'bar',
          data: xValues,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: modaInfo.color },
              { offset: 1, color: isDark ? 'rgba(0, 56, 130, 0.45)' : 'rgba(0, 102, 204, 0.35)' }
            ]),
            borderRadius: [0, 6, 6, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: (p) => formatNumber(p.value),
            fontSize: 10,
            fontWeight: 600,
            color: textColor,
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }
      ]
    };

    echartsBar.setOption(option, true);
    return;
  }

  const trace = {
    type: 'bar',
    orientation: 'h',
    x: xValues,
    y: yNames,
    marker: {
      color: modaInfo.color,
      opacity: 0.9,
      line: { color: modaInfo.color, width: 1 }
    },
    hoverinfo: 'text',
    text: xValues.map(v => formatNumber(v) + ' orang'),
    textposition: 'auto',
    textfont: { family: 'Plus Jakarta Sans', size: 10, color: '#FFFFFF' },
    customdata: reversedList.map(item => ({
      share: item.porsi_share_pct,
      v25: item.realisasi_2025,
      kat: item.kategori,
      fullName: item.nama
    })),
    hovertemplate: 
      '<b>%{customdata.fullName}</b><br>' +
      'Proyeksi 2026: <b>%{x:,.0f} orang</b><br>' +
      'Realisasi 2025: %{customdata.v25:,.0f} orang<br>' +
      'Pangsa Moda: %{customdata.share}%<extra></extra>'
  };

  const isDark = document.documentElement.classList.contains('dark');

  const layout = {
    bargap: 0.28, // Batang tegas dan proporsional
    margin: { t: 20, b: 45, l: 270, r: 25 }, // Memberi ruang horizontal lebih panjang ke kanan
    height: 420, // Tinggi proporsional agar 10 batang nyaman dilihat
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: {
      tickformat: ',.0f',
      gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      linecolor: isDark ? '#334155' : '#E2E8F0',
      zeroline: true,
      zerolinecolor: isDark ? '#334155' : '#E2E8F0', // Garis batas vertikal lembut institusional (bukan hitam pekat)
      zerolinewidth: 1.5,
      tickfont: { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#64748B' },
      title: { text: 'Volume Penumpang (orang)', font: { size: 11, family: 'Plus Jakarta Sans', color: isDark ? '#CBD5E1' : '#64748B' } }
    },
    yaxis: {
      ticksuffix: '   ', // Jarak spasi breathing room sebelum garis vertikal
      ticks: 'outside',
      ticklen: 12, // Jarak fisik standoff 12px
      tickcolor: 'transparent', // Tanpa garis tick yang mengganggu
      showline: false, // Menghilangkan garis vertikal hitam kasar y-axis
      tickfont: { family: 'Plus Jakarta Sans', size: 11, color: isDark ? '#F8FAFC' : '#0F172A', weight: 600 }
    },
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

  Plotly.newPlot(chartEl, [trace], layout, config);
}

/**
 * Render Tabel Direktori Simpul (Top 10 atau Seluruh Simpul)
 */
function renderSimpulTable() {
  const data = window.DSS_STATE.data;
  const tbody = document.getElementById('simpul-table-body');
  const countBadgeEl = document.getElementById('simpul-count-badge');
  const btnLoadAll = document.getElementById('btn-load-all-simpul');
  const footerInfo = document.getElementById('simpul-footer-info');
  if (!tbody || !data) return;

  const allSimpul = data.simpul_semua[simpulState.activeModa] || [];
  const modaInfo = SIMPUL_MODA_LIST.find(m => m.key === simpulState.activeModa) || SIMPUL_MODA_LIST[0];
  const unitLabel = modaInfo.unit || 'Simpul';

  let displayList = simpulState.showAll ? allSimpul : (data.simpul_top10[simpulState.activeModa] || []);

  // Filter berdasarkan pencarian
  if (simpulState.searchQuery) {
    displayList = allSimpul.filter(s => s.nama.toLowerCase().includes(simpulState.searchQuery));
  }

  // Update Status Badge di Atas
  if (countBadgeEl) {
    if (simpulState.searchQuery) {
      countBadgeEl.innerText = `${displayList.length} Ditemukan`;
    } else if (simpulState.showAll) {
      countBadgeEl.innerText = `Menampilkan Seluruh ${allSimpul.length} ${unitLabel}`;
    } else {
      countBadgeEl.innerText = `10 dari ${allSimpul.length} ${unitLabel}`;
    }
  }

  // Update Tombol Aksi di Bawah Tabel
  if (btnLoadAll && footerInfo) {
    if (simpulState.searchQuery) {
      footerInfo.innerText = `Ditemukan ${displayList.length} simpul sesuai pencarian "${simpulState.searchQuery}" (dari total ${allSimpul.length} ${unitLabel})`;
      btnLoadAll.style.display = 'none';
    } else {
      btnLoadAll.style.display = 'inline-flex';
      if (simpulState.showAll) {
        footerInfo.innerText = `Menampilkan seluruh ${allSimpul.length} ${unitLabel} terverifikasi`;
        btnLoadAll.innerHTML = `
          <i data-lucide="chevron-up" class="w-4 h-4"></i>
          <span>Tutup & Tampilkan 10 Simpul Saja</span>
        `;
        btnLoadAll.className = 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all text-xs';
      } else {
        footerInfo.innerText = `Menampilkan 10 simpul terpadat dari total ${allSimpul.length} ${unitLabel}`;
        btnLoadAll.innerHTML = `
          <span>Lihat Seluruh Simpul (${allSimpul.length} ${unitLabel})</span>
          <i data-lucide="chevron-down" class="w-4 h-4"></i>
        `;
        btnLoadAll.className = 'px-4 py-2 bg-gov-navy hover:bg-gov-navy/90 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all text-xs';
      }
    }
  }

  if (displayList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-xs text-gov-muted">
          Tidak ditemukan simpul dengan kata kunci "<b>${simpulState.searchQuery}</b>".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = displayList.map(s => {
    const isTop3 = s.peringkat_moda <= 3;
    let rankBadge = `<span class="num-mono font-bold text-slate-700 text-xs">#${s.peringkat_moda}</span>`;
    if (s.peringkat_moda === 1) {
      rankBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">#1</span>`;
    } else if (s.peringkat_moda === 2) {
      rankBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-200 text-slate-800 border border-slate-300">#2</span>`;
    } else if (s.peringkat_moda === 3) {
      rankBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">#3</span>`;
    }

    const diff = (s.proyeksi_2026 || 0) - (s.realisasi_2025 || 0);
    const pct = s.realisasi_2025 > 0 ? (diff / s.realisasi_2025) * 100 : 0;

    return `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 ${isTop3 ? 'bg-blue-50/20' : ''}">
        <td class="py-2.5 px-3 text-center whitespace-nowrap">${rankBadge}</td>
        <td class="py-2.5 px-3 text-xs font-bold text-slate-800 truncate" title="${s.nama}">${s.nama}</td>
        <td class="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap truncate">${s.kategori}</td>
        <td class="py-2.5 px-3 text-right num-mono text-slate-600 text-xs">${formatNumber(s.realisasi_2025)}</td>
        <td class="py-2.5 px-3 text-right num-mono font-bold text-gov-navy text-xs">${formatNumber(s.proyeksi_2026)}</td>
        <td class="py-2.5 px-3 text-right num-mono font-bold text-gov-azure text-xs">${s.porsi_share_pct.toLocaleString('id-ID')}%</td>
        <td class="py-2.5 px-3 text-right num-mono text-xs font-semibold ${pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
          ${formatPercent(pct)}
        </td>
      </tr>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}
