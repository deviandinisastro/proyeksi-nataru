/**
 * ==============================================================================
 * APP.JS: MASTER ROUTER & STATE MANAGEMENT
 * Sistem Penunjang Keputusan (DSS) Nataru 2026/2027 - Pusdatin Kemenhub
 * ==============================================================================
 */

window.DSS_STATE = {
  currentTab: 'executive',
  data: null,
  spatialNodes: null,
  isLoading: true
};

// Pemetaan Nama Tab ke Judul Breadcrumb & Pertanyaan Keputusan
const TAB_METADATA = {
  executive: {
    title: 'Ringkasan Eksekutif & Early Warning',
    breadcrumb: 'Dashboard Eksekutif',
    question: 'Bagaimana kondisi makro transportasi nasional dan kapan status siaga tertinggi diberlakukan?'
  },
  harian: {
    title: 'Tren Harian Multimoda (18 Hari Posko)',
    breadcrumb: 'Tren Harian Multimoda',
    question: 'Kapan gelombang arus pergerakan terjadi pada moda tertentu dan bagaimana polanya dibanding 2 tahun lalu?'
  },
  simpul: {
    title: 'Direktori & Peringkat Simpul Pantau',
    breadcrumb: 'Direktori Simpul',
    question: 'Simpul mana saja yang paling padat pada moda tertentu dan berapa beban kapasitasnya?'
  },
  map: {
    title: 'Peta Spasial Simpul Multimoda (GIS)',
    breadcrumb: 'Peta Spasial GIS',
    question: 'Bagaimana sebaran geografis simpul terpadat di seluruh wilayah kepulauan Indonesia?'
  },
  simulator: {
    title: 'Simulator Kebijakan & What-If Engine',
    breadcrumb: 'Simulator What-If (DSS)',
    question: 'Bagaimana jika realisasi pergerakan menyimpang dari prediksi dasar? Apa tindakan mitigasinya?'
  },
  metodologi: {
    title: 'Transparansi Metodologi & Evaluasi Model',
    breadcrumb: 'Metodologi & Turnamen MAPE',
    question: 'Seberapa valid dan dapat dipertanggungjawabkan angka proyeksi yang disajikan?'
  }
};

/**
 * Format Angka Indonesia (Contoh: 1.234.567)
 */
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return Number(num).toLocaleString('id-ID');
}

/**
 * Format Persen Indonesia (Contoh: +12,3%)
 */
function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${Number(num).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
}

/**
 * Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
 */
document.addEventListener('DOMContentLoaded', async () => {
  initClock();
  setupSidebarNavigation();
  await loadApplicationData();
});

/**
 * Jam & Tanggal Operasional Posko di Header
 */
function initClock() {
  const clockEl = document.getElementById('live-clock');
  function update() {
    const now = new Date();
    const opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    if (clockEl) clockEl.innerText = now.toLocaleDateString('id-ID', opts) + ' WIB';
  }
  update();
  setInterval(update, 1000);
}

/**
 * Memuat Master Data JSON Secara Asinkron
 */
async function loadApplicationData() {
  const loadingOverlay = document.getElementById('loading-overlay');
  try {
    const [resNataru, resSpatial] = await Promise.all([
      fetch('./data/nataru_data.json'),
      fetch('./data/spatial_nodes.json')
    ]);

    if (!resNataru.ok || !resSpatial.ok) {
      throw new Error('Gagal memuat berkas data JSON.');
    }

    window.DSS_STATE.data = await resNataru.json();
    window.DSS_STATE.spatialNodes = await resSpatial.json();
    window.DSS_STATE.isLoading = false;

    console.log('✅ Master Data Berhasil Dimuat:', window.DSS_STATE.data);
    console.log('✅ Spatial GIS Nodes Berhasil Dimuat:', window.DSS_STATE.spatialNodes.length, 'simpul');

    // Sembunyikan Overlay Loading
    if (loadingOverlay) {
      loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => loadingOverlay.classList.add('hidden'), 300);
    }

    // Aktifkan Tab Awal
    switchTab('executive');

  } catch (err) {
    console.error('❌ Error saat memuat data:', err);
    if (loadingOverlay) {
      loadingOverlay.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg border border-red-200 max-w-md text-center">
          <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1">Gagal Memuat Berkas Data</h3>
          <p class="text-xs text-slate-600 mb-4">${err.message}<br>Pastikan skrip <code>build_data.py</code> telah dijalankan.</p>
          <button onclick="location.reload()" class="px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-md shadow hover:bg-opacity-90">Muat Ulang Halaman</button>
        </div>
      `;
    }
  }
}

/**
 * Event Listener Navigasi Menu Sidebar
 */
function setupSidebarNavigation() {
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) {
        switchTab(targetTab);
      }
    });
  });
}

/**
 * Mengganti Tab / Modul yang Aktif
 */
function switchTab(tabId) {
  if (!TAB_METADATA[tabId]) return;
  window.DSS_STATE.currentTab = tabId;

  // 1. Update State Tombol Sidebar
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Update Teks Header & Breadcrumb
  const meta = TAB_METADATA[tabId];
  const breadcrumbEl = document.getElementById('current-breadcrumb');
  const viewTitleEl = document.getElementById('current-view-title');
  const viewDescEl = document.getElementById('current-view-desc');

  if (breadcrumbEl) breadcrumbEl.innerText = meta.breadcrumb;
  if (viewTitleEl) viewTitleEl.innerText = meta.title;
  if (viewDescEl) viewDescEl.innerText = meta.question;

  // 3. Tampilkan View Container yang Cocok
  document.querySelectorAll('.view-section').forEach(sec => {
    if (sec.id === `view-${tabId}`) {
      sec.classList.remove('hidden');
    } else {
      sec.classList.add('hidden');
    }
  });

  // 4. Panggil Renderer Modul Spesifik jika Tersedia
  if (!window.DSS_STATE.isLoading && window.DSS_STATE.data) {
    if (tabId === 'executive' && typeof renderExecutiveModule === 'function') {
      renderExecutiveModule();
    } else if (tabId === 'harian' && typeof renderHarianModule === 'function') {
      renderHarianModule();
    } else if (tabId === 'simpul' && typeof renderSimpulModule === 'function') {
      renderSimpulModule();
    } else if (tabId === 'map' && typeof renderMapModule === 'function') {
      renderMapModule();
    } else if (tabId === 'simulator' && typeof renderSimulatorModule === 'function') {
      renderSimulatorModule();
    } else if (tabId === 'metodologi' && typeof renderMetodologiModule === 'function') {
      renderMetodologiModule();
    }
  }

  // Scroll kembali ke atas
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
