/**
 * ==============================================================================
 * METODOLOGI.JS: MODUL 6 - TRANSPARANSI METODOLOGI & TURNAMEN EVALUASI MAPE
 * Sistem Penunjang Keputusan (DSS) Nataru 2026/2027 - Pusdatin Kemenhub
 * ==============================================================================
 * Landasan Teori Sistem Informasi (DSS Architecture):
 * Sub-sistem Manajemen Model (Model Management Subsystem) bertanggung jawab:
 * 1. Menyimpan, mengelola, dan menguji berbagai model kuantitatif time-series.
 * 2. Menyajikan validasi empiris akurasi (MAPE & RMSE) untuk menjamin objektivitas
 *    dan akuntabilitas keputusan pimpinan posko.
 * 3. Menjelaskan justifikasi ilmiah pemilihan Damped Holt-Winters (phi=0.85).
 * ==============================================================================
 */

let metodologiMetric = 'penumpang'; // 'penumpang' | 'sarana'

function renderMetodologiModule() {
  const data = window.DSS_STATE.data;
  if (!data || !data.turnamen_mape) return;

  renderRingkasanJuara(data.turnamen_mape.ringkasan_juara);
  renderMAPEMatrixTable(data.turnamen_mape);
  setupMetodologiControls();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Setup Toggle Metrik Matriks MAPE (Penumpang vs Sarana)
 */
function setupMetodologiControls() {
  const btnPnp = document.getElementById('btn-mape-penumpang');
  const btnSar = document.getElementById('btn-mape-sarana');

  if (btnPnp && btnSar) {
    btnPnp.onclick = () => {
      metodologiMetric = 'penumpang';
      btnPnp.className = 'px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gov-navy text-white shadow-xs transition-all';
      btnSar.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gov-border text-gov-muted hover:bg-slate-50 transition-all';
      const data = window.DSS_STATE.data;
      if (data) renderMAPEMatrixTable(data.turnamen_mape);
    };

    btnSar.onclick = () => {
      metodologiMetric = 'sarana';
      btnPnp.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gov-border text-gov-muted hover:bg-slate-50 transition-all';
      btnSar.className = 'px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gov-navy text-white shadow-xs transition-all';
      const data = window.DSS_STATE.data;
      if (data) renderMAPEMatrixTable(data.turnamen_mape);
    };
  }
}

/**
 * 1. Render Tabel Ringkasan Model Juara
 */
function renderRingkasanJuara(juaraList) {
  const tbody = document.getElementById('metodologi-juara-body');
  if (!tbody || !juaraList) return;

  tbody.innerHTML = juaraList.map(j => {
    const mapePnp = j['MAPE Penumpang (%)'];
    const mapeSar = j['MAPE Sarana (%)'];

    return `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
        <td class="py-2.5 px-3 font-bold text-slate-800 text-xs">${j.Moda}</td>
        <td class="py-2.5 px-3 text-xs text-gov-navy font-semibold">
          ${j['Metode Juara (Penumpang)'] || '<span class="text-slate-400 italic">Tidak Berlaku</span>'}
        </td>
        <td class="py-2.5 px-3 text-right num-mono text-xs font-bold ${mapePnp ? 'text-emerald-700' : 'text-slate-400'}">
          ${mapePnp !== null && !isNaN(mapePnp) ? mapePnp.toFixed(2) + '%' : '-'}
        </td>
        <td class="py-2.5 px-3 text-xs text-gov-navy font-semibold">
          ${j['Metode Juara (Sarana)'] || '-'}
        </td>
        <td class="py-2.5 px-3 text-right num-mono text-xs font-bold ${mapeSar ? 'text-emerald-700' : 'text-slate-400'}">
          ${mapeSar !== null && !isNaN(mapeSar) ? mapeSar.toFixed(2) + '%' : '-'}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 2. Render Matriks Lengkap Evaluasi 7 Metode Peramalan
 */
function renderMAPEMatrixTable(turnamen) {
  const tbody = document.getElementById('metodologi-mape-body');
  const titleEl = document.getElementById('metodologi-mape-title');
  if (!tbody || !turnamen) return;

  const dataset = metodologiMetric === 'penumpang' ? turnamen.penumpang : turnamen.sarana;
  if (titleEl) {
    titleEl.innerText = `Matriks MAPE 7 Metode: Kategori ${metodologiMetric === 'penumpang' ? 'Penumpang Multimoda' : 'Sarana / Kendaraan'}`;
  }

  const methodCols = [
    '1. Seasonal Naive (2024)',
    '2. Moving Average (2-Yr)',
    '3. Proportional Daily Profile (PDP)',
    '4. Holt-Winters Additive',
    '5. Damped Holt-Winters (phi=0.85)',
    '6. ARIMA (1,1,1)',
    '7. SARIMAX (Peak Calendar Regressor)'
  ];

  tbody.innerHTML = dataset.map(row => {
    // Cari nilai minimum MAPE untuk baris ini (sebagai juara)
    const validVals = methodCols.map(col => row[col]).filter(v => v !== null && !isNaN(v) && v > 0);
    const minVal = validVals.length > 0 ? Math.min(...validVals) : null;

    const cellsHtml = methodCols.map(col => {
      const val = row[col];
      if (val === null || val === undefined || isNaN(val)) {
        return `<td class="py-2.5 px-2 text-center text-slate-400 num-mono text-xs">-</td>`;
      }

      const isBest = minVal !== null && Math.abs(val - minVal) < 0.01;
      return `
        <td class="py-2.5 px-2 text-right num-mono text-xs ${isBest ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 rounded' : 'text-slate-600'}">
          ${val.toFixed(2)}%
        </td>
      `;
    }).join('');

    const avgVal = row['Rata-Rata MAPE (%)'];

    return `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
        <td class="py-2.5 px-3 font-bold text-slate-800 text-xs whitespace-nowrap">${row.Moda}</td>
        ${cellsHtml}
        <td class="py-2.5 px-3 text-right num-mono text-xs font-bold text-gov-navy bg-slate-50/50">
          ${avgVal !== null && !isNaN(avgVal) ? avgVal.toFixed(2) + '%' : '-'}
        </td>
      </tr>
    `;
  }).join('');
}
