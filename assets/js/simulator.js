/**
 * ==============================================================================
 * SIMULATOR.JS: MODUL 5 - SIMULATOR KEBIJAKAN & WHAT-IF DECISION ENGINE
 * Sistem Penunjang Keputusan (DSS) Nataru 2026/2027 - Pusdatin Kemenhub
 * ==============================================================================
 * Landasan Teori Sistem Penunjang Keputusan (DSS):
 * 1. Model Subsystem: Menerapkan Sensitivity Analysis & What-If Scenario Analysis.
 * 2. Menguji dampak perubahan variabel eksogen (misal: lonjakan mobilitas,
 *    gangguan cuaca, atau insentif tarif) terhadap variabel endogen (beban puncak,
 *    distribusi harian, dan eskalasi status kesiagaan posko).
 * 3. Output Preskriptif: Rekomendasi manajerial taktis otomatis untuk Posko Kemenhub.
 * ==============================================================================
 */

let simulatorState = {
  macroDeltaPct: 0,      // -20% s/d +20%
  modaJalanDeltaPct: 0,  // -20% s/d +25%
  policyTrukRestriction: true,  // Pembatasan Truk Sumbu 3+
  policyBufferZone: true,       // Buffer Zone ASDP
  policyOffpeakDiscount: false, // Diskon Tiket Luar Hari Puncak
  initialized: false
};

function renderSimulatorModule() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  if (!simulatorState.initialized) {
    setupSimulatorControls();
    simulatorState.initialized = true;
  }

  runSimulation();
}

/**
 * Setup Event Listeners untuk Slider dan Checkbox Kebijakan
 */
function setupSimulatorControls() {
  const sliderMacro = document.getElementById('slider-macro-delta');
  const sliderJalan = document.getElementById('slider-jalan-delta');
  const checkTruk = document.getElementById('check-policy-truk');
  const checkBuffer = document.getElementById('check-policy-buffer');
  const checkDiscount = document.getElementById('check-policy-discount');
  const btnReset = document.getElementById('btn-reset-simulator');

  if (sliderMacro) {
    sliderMacro.addEventListener('input', (e) => {
      simulatorState.macroDeltaPct = parseInt(e.target.value, 10);
      document.getElementById('val-macro-delta').innerText = formatPercent(simulatorState.macroDeltaPct);
      runSimulation();
    });
  }

  if (sliderJalan) {
    sliderJalan.addEventListener('input', (e) => {
      simulatorState.modaJalanDeltaPct = parseInt(e.target.value, 10);
      document.getElementById('val-jalan-delta').innerText = formatPercent(simulatorState.modaJalanDeltaPct);
      runSimulation();
    });
  }

  if (checkTruk) {
    checkTruk.addEventListener('change', (e) => {
      simulatorState.policyTrukRestriction = e.target.checked;
      runSimulation();
    });
  }

  if (checkBuffer) {
    checkBuffer.addEventListener('change', (e) => {
      simulatorState.policyBufferZone = e.target.checked;
      runSimulation();
    });
  }

  if (checkDiscount) {
    checkDiscount.addEventListener('change', (e) => {
      simulatorState.policyOffpeakDiscount = e.target.checked;
      runSimulation();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      simulatorState.macroDeltaPct = 0;
      simulatorState.modaJalanDeltaPct = 0;
      simulatorState.policyTrukRestriction = true;
      simulatorState.policyBufferZone = true;
      simulatorState.policyOffpeakDiscount = false;

      if (sliderMacro) sliderMacro.value = 0;
      if (sliderJalan) sliderJalan.value = 0;
      if (checkTruk) checkTruk.checked = true;
      if (checkBuffer) checkBuffer.checked = true;
      if (checkDiscount) checkDiscount.checked = false;

      document.getElementById('val-macro-delta').innerText = '0%';
      document.getElementById('val-jalan-delta').innerText = '0%';

      runSimulation();
    });
  }
}

/**
 * Mesin Kalkulasi Simulasi What-If (DSS Computation Engine)
 */
function runSimulation() {
  const data = window.DSS_STATE.data;
  if (!data) return;

  const baseKPI = data.kpi_summary;
  const harianTotalList = data.harian_penumpang.data['TOTAL SELURUH MODA'] || [];

  // Faktor Pengali Makro
  const macroFactor = 1 + (simulatorState.macroDeltaPct / 100);

  // Kalkulasi Volume Total Penumpang Baru
  const simulatedTotalPax = Math.round(baseKPI.total_penumpang_2026 * macroFactor);

  // Rekalkulasi Kurva 18 Hari
  const simulatedDays = harianTotalList.map(item => {
    let vol = item.vol_2026 * macroFactor;

    // Jika kebijakan diskon tiket di luar jam sibuk aktif:
    // Terjadi pengalihan beban puncak (H-1) ke hari santai (H-4 dan H-3) sebesar 8%
    if (simulatorState.policyOffpeakDiscount) {
      if (item.hari_posko === 'H-1') {
        vol = vol * 0.92; // Puncak berkurang 8%
      } else if (item.hari_posko === 'H-3' || item.hari_posko === 'H-4') {
        vol = vol * 1.04; // Hari pra-puncak naik 4%
      }
    }

    return {
      hari_posko: item.hari_posko,
      hari_pekan: item.hari_pekan,
      vol_base: item.vol_2026,
      vol_simulasi: Math.round(vol)
    };
  });

  // Cari Puncak Baru Mudik & Balik
  const peakMudik = simulatedDays.slice(0, 8).reduce((max, d) => d.vol_simulasi > max.vol_simulasi ? d : max, simulatedDays[0]);
  const peakBalik = simulatedDays.slice(8).reduce((max, d) => d.vol_simulasi > max.vol_simulasi ? d : max, simulatedDays[8]);

  // Evaluasi Status Kesiagaan Baru (Threshold Operasional Posko)
  let normalDays = 0;
  let waspadaDays = 0;
  let siagaDays = 0;

  simulatedDays.forEach(d => {
    if (d.vol_simulasi > 1100000) {
      siagaDays++;
    } else if (d.vol_simulasi > 1000000) {
      waspadaDays++;
    } else {
      normalDays++;
    }
  });

  // Render Kartu Perbandingan Metrik
  renderSimulationCards({
    baseTotal: baseKPI.total_penumpang_2026,
    simTotal: simulatedTotalPax,
    basePeakMudik: baseKPI.puncak_mudik_vol,
    simPeakMudik: peakMudik.vol_simulasi,
    basePeakBalik: baseKPI.puncak_balik_vol,
    simPeakBalik: peakBalik.vol_simulasi,
    siagaDays: siagaDays
  });

  // Render Grafik Perbandingan Baseline vs Simulasi
  renderSimulationChart(simulatedDays);

  // Render Rekomendasi Manajerial Taktis Preskriptif
  renderSimulationRecommendations({
    macroDelta: simulatorState.macroDeltaPct,
    simPeakMudik: peakMudik.vol_simulasi,
    siagaDays: siagaDays,
    trukActive: simulatorState.policyTrukRestriction,
    bufferActive: simulatorState.policyBufferZone,
    discountActive: simulatorState.policyOffpeakDiscount
  });
}

/**
 * Render Kartu Perbandingan Baseline vs Simulasi
 */
function renderSimulationCards(metrics) {
  const container = document.getElementById('simulator-kpi-cards');
  if (!container) return;

  const diffPax = metrics.simTotal - metrics.baseTotal;
  const pctPax = ((diffPax) / metrics.baseTotal) * 100;

  container.innerHTML = `
    <!-- Kartu 1: Total Penumpang Simulasi -->
    <div class="bg-white p-4 rounded-xl border border-gov-border shadow-xs">
      <span class="text-[10px] font-bold text-gov-muted uppercase tracking-wider block mb-1">Total Proyeksi Simulasi</span>
      <div class="text-xl font-extrabold text-gov-navy num-mono">
        ${formatNumber(metrics.simTotal)}
        <span class="text-xs font-normal text-gov-muted">pax</span>
      </div>
      <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span class="text-slate-500">Deviasi vs Base:</span>
        <span class="font-bold num-mono ${diffPax >= 0 ? 'text-rose-600' : 'text-emerald-600'}">
          ${diffPax >= 0 ? '+' : ''}${formatNumber(diffPax)} (${formatPercent(pctPax)})
        </span>
      </div>
    </div>

    <!-- Kartu 2: Beban Puncak Mudik Baru -->
    <div class="bg-white p-4 rounded-xl border border-gov-border shadow-xs">
      <span class="text-[10px] font-bold text-gov-muted uppercase tracking-wider block mb-1">Beban Puncak Mudik (H-1)</span>
      <div class="text-xl font-extrabold text-slate-900 num-mono">
        ${formatNumber(metrics.simPeakMudik)}
        <span class="text-xs font-normal text-gov-muted">pax/hari</span>
      </div>
      <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span class="text-slate-500">Kapasitas Maksimal:</span>
        <span class="font-bold text-slate-700 num-mono">1.200.000 pax</span>
      </div>
    </div>

    <!-- Kartu 3: Beban Puncak Balik Baru -->
    <div class="bg-white p-4 rounded-xl border border-gov-border shadow-xs">
      <span class="text-[10px] font-bold text-gov-muted uppercase tracking-wider block mb-1">Beban Puncak Balik (H+9)</span>
      <div class="text-xl font-extrabold text-slate-900 num-mono">
        ${formatNumber(metrics.simPeakBalik)}
        <span class="text-xs font-normal text-gov-muted">pax/hari</span>
      </div>
      <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span class="text-slate-500">Kapasitas Maksimal:</span>
        <span class="font-bold text-slate-700 num-mono">1.200.000 pax</span>
      </div>
    </div>

    <!-- Kartu 4: Hari Berstatus Siaga Merah -->
    <div class="bg-white p-4 rounded-xl border border-gov-border shadow-xs">
      <span class="text-[10px] font-bold text-gov-muted uppercase tracking-wider block mb-1">Hari Berstatus Siaga Merah</span>
      <div class="text-xl font-extrabold text-rose-600 num-mono">
        ${metrics.siagaDays} Hari
        <span class="text-xs font-normal text-slate-500">dari 18 Hari</span>
      </div>
      <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span class="text-slate-500">Kondisi Baseline:</span>
        <span class="font-bold text-slate-700 num-mono">3 Hari</span>
      </div>
    </div>
  `;
}

/**
 * Render Grafik Kurva Perbandingan Baseline vs Skenario Simulasi
 */
function renderSimulationChart(simulatedDays) {
  const chartEl = document.getElementById('chart-simulator-curve');
  if (!chartEl || !simulatedDays) return;

  const days = simulatedDays.map(d => d.hari_posko);
  const baseCurve = simulatedDays.map(d => d.vol_base);
  const simCurve = simulatedDays.map(d => d.vol_simulasi);

  const isDark = document.documentElement.classList.contains('dark');

  const traceBase = {
    x: days,
    y: baseCurve,
    name: 'Skenario Dasar (Baseline)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: isDark ? '#94A3B8' : '#94A3B8', width: 2, dash: 'dot' },
    marker: { size: 5, color: '#94A3B8' },
    hovertemplate: '%{y:,.0f} orang<extra>Baseline</extra>'
  };

  const traceSim = {
    x: days,
    y: simCurve,
    name: 'Skenario Kebijakan (Simulasi)',
    type: 'scatter',
    mode: 'lines+markers',
    line: { color: isDark ? '#38BDF8' : '#003882', width: 3.5 },
    marker: { size: 7, color: isDark ? '#38BDF8' : '#388AEB', symbol: 'diamond' },
    hovertemplate: '%{y:,.0f} orang<extra>Simulasi What-If</extra>'
  };

  // Garis Ambang Batas Kapasitas Posko (1.100.000 pax)
  const capacityShape = {
    type: 'line',
    x0: 'H-7',
    x1: 'H+10',
    y0: 1100000,
    y1: 1100000,
    line: { color: '#EF4444', width: 1.5, dash: 'dash' }
  };

  const capacityAnnotation = {
    x: 'H-3',
    y: 1100000,
    text: 'Ambang Batas Siaga Merah (1,10 Juta Pax/Hari)',
    showarrow: false,
    font: { size: 10, color: '#EF4444', family: 'Plus Jakarta Sans', weight: 'bold' },
    yshift: 12
  };

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
      gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      linecolor: isDark ? '#334155' : '#CBD5E1',
      tickfont: { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#64748B' }
    },
    yaxis: {
      tickformat: ',.0f',
      gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      linecolor: isDark ? '#334155' : '#CBD5E1',
      tickfont: { family: 'Plus Jakarta Sans', size: 10, color: isDark ? '#CBD5E1' : '#64748B' },
      title: { text: 'Volume Penumpang / Hari', font: { size: 11, family: 'Plus Jakarta Sans', color: isDark ? '#CBD5E1' : '#64748B' } }
    },
    shapes: [capacityShape],
    annotations: [capacityAnnotation],
    margin: { t: 40, b: 40, l: 70, r: 25 },
    height: 340,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  const config = { responsive: true, displayModeBar: false };
  Plotly.newPlot(chartEl, [traceBase, traceSim], layout, config);
}

/**
 * Render Rekomendasi Manajerial Taktis Preskriptif (DSS Output)
 */
function renderSimulationRecommendations(params) {
  const container = document.getElementById('simulator-prescriptive-action');
  if (!container) return;

  const recommendations = [];

  // Aturan Keputusan 1: Beban Puncak Melebihi Batas
  if (params.simPeakMudik > 1150000) {
    recommendations.push({
      level: 'CRITICAL',
      title: 'Aktivasi Skema One-Way Tol Cikatama s/d Kalikangkung',
      desc: `Beban puncak arus mudik diproyeksikan mencapai ${formatNumber(params.simPeakMudik)} penumpang. Korlantas dan Ditjen Hubdat wajib memberlakukan rekayasa lalu lintas satu arah (one-way) penuh pada H-2 s/d H-1.`
    });
  }

  // Aturan Keputusan 2: Penyeberangan Merak-Bakauheni
  if (!params.bufferActive) {
    recommendations.push({
      level: 'WARNING',
      title: 'Peringatan: Risiko Antrean Mengular di Tol Tangerang-Merak',
      desc: 'Penonaktifan sistem Buffer Zone di Rest Area KM 43 & 68 berisiko menyebabkan antrean kendaraan pribadi mengunci akses pelabuhan ASDP Merak lebih dari 6 jam.'
    });
  } else {
    recommendations.push({
      level: 'INFO',
      title: 'Buffer Zone ASDP Berjalan Optimal',
      desc: 'Penahanan tiket belum bertanggal di Rest Area KM 43 dan KM 68 Tol Tangerang-Merak berhasil menstabilkan waktu tunggu kapal di bawah 90 menit.'
    });
  }

  // Aturan Keputusan 3: Efektivitas Diskon Tiket Off-Peak
  if (params.discountActive) {
    recommendations.push({
      level: 'SUCCESS',
      title: 'Insentif Tarif Off-Peak Efektif Meratakan Puncak',
      desc: 'Pemberian diskon tarif pada H-4 dan H-3 berhasil menurunkan beban puncak H-1 sebesar 8%, menghemat konsumsi energi operasional posko dan mengurangi risiko kelelahan pengemudi.'
    });
  }

  // Aturan Keputusan 4: Pembatasan Truk Logistik
  if (!params.trukActive) {
    recommendations.push({
      level: 'CRITICAL',
      title: 'Risiko Bottleneck: Truk Sumbu 3+ Bercampur dengan Arus Mudik',
      desc: 'Tidak diberlakukannya Surat Keputusan Bersama (SKB) pembatasan truk sumbu 3+ akan menurunkan kecepatan rata-rata jalan tol Trans Jawa hingga di bawah 30 km/jam.'
    });
  }

  container.innerHTML = recommendations.map(rec => {
    let colorClass = 'bg-blue-50 border-blue-200 text-blue-900';
    let icon = 'info';

    if (rec.level === 'CRITICAL') {
      colorClass = 'bg-rose-50 border-rose-200 text-rose-900';
      icon = 'alert-triangle';
    } else if (rec.level === 'WARNING') {
      colorClass = 'bg-amber-50 border-amber-200 text-amber-900';
      icon = 'alert-circle';
    } else if (rec.level === 'SUCCESS') {
      colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
      icon = 'check-circle';
    }

    return `
      <div class="p-3.5 rounded-lg border ${colorClass} flex items-start gap-3">
        <i data-lucide="${icon}" class="w-4 h-4 shrink-0 mt-0.5"></i>
        <div>
          <h5 class="text-xs font-bold leading-tight mb-1">${rec.title}</h5>
          <p class="text-[11px] leading-relaxed opacity-90">${rec.desc}</p>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}
