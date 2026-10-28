/**

 * ==============================================================================

 * APP.JS: MASTER ROUTER & STATE MANAGEMENT

 * Sistem Analitik Data & Proyeksi Multimoda Nataru 2026/2027 - Pusdatin Kemenhub

 * ==============================================================================

 */

window.DSS_STATE = {

  currentTab: 'executive',

  data: null,

  spatialNodes: null,

  isLoading: true

};

// Pemetaan Nama Tab ke Judul Breadcrumb & Narasi Analitis (Fokus: Analitik & Proyeksi Nataru 2026/2027)

const TAB_METADATA = {

  executive: {

    title: 'Ikhtisar Proyeksi Operasional & Hari Puncak Nataru 2026/2027',

    breadcrumb: 'Ikhtisar Proyeksi',

    question: 'Rangkuman angka proyeksi operasional multimoda nasional 18 hari (H-7 s/d H+10) berbasis Damped Holt-Winters dibandingkan realisasi baseline 2025.'

  },

  harian: {

    title: 'Tren Harian Proyeksi Multimoda (18 Hari Posko)',

    breadcrumb: 'Tren Harian Proyeksi',

    question: 'Kapan gelombang arus pergerakan diproyeksikan terjadi pada moda tertentu dan bagaimana polanya dibanding 2 tahun lalu?'

  },

  simpul: {

    title: 'Direktori Simpul Transportasi Nasional',

    breadcrumb: 'Direktori Simpul Multimoda',

    question: 'Bagaimana distribusi proyeksi volume penumpang dan sebaran simpul pemantauan di seluruh moda transportasi nasional?'

  },

  map: {

    title: 'Peta Spasial Proyeksi Simpul Multimoda (GIS)',

    breadcrumb: 'Peta Spasial Proyeksi',

    question: 'Bagaimana sebaran geografis simpul dengan proyeksi volume terpadat di seluruh wilayah kepulauan Indonesia?'

  },

  koridor: {

    title: 'Pemantauan Titik Kritis Gerbang Tol & Penyeberangan ASDP',

    breadcrumb: 'Titik Kritis Tol & ASDP',

    question: 'Bagaimana estimasi beban lalu lintas di 4 gerbang tol utama Jabodetabek dan komposisi kendaraan penyeberangan lintas Merak-Bakauheni serta Ketapang-Gilimanuk selama masa Posko Nataru?'

  },

  metodologi: {

    title: 'Informasi Sistem, Metodologi Analisis & Kamus Rumus Posko',

    breadcrumb: 'Matriks & Metodologi',

    question: 'Dokumentasi transparansi data, formulasi matematis metrik dasar, peramalan deret waktu Damped Holt-Winters, matriks 12 indikator kinerja posko, dan glosarium resmi Pusdatin Kemenhub.'

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

  initTheme();

  initSidebarToggle();

  initClock();

  setupSidebarNavigation();

  await loadApplicationData();

});

/**

 * Inisialisasi & Pengaturan Mode Gelap / Terang (Dark Mode)

 */

function initTheme() {

  const savedTheme = localStorage.getItem('dss_theme') || 'light';

  if (savedTheme === 'dark') {

    document.documentElement.classList.add('dark');

  } else {

    document.documentElement.classList.remove('dark');

  }

  updateThemeIcons();

  const toggleBtn = document.getElementById('btn-theme-toggle');

  if (toggleBtn) {

    toggleBtn.addEventListener('click', toggleTheme);

  }

}

function toggleTheme() {

  const isDark = document.documentElement.classList.toggle('dark');

  localStorage.setItem('dss_theme', isDark ? 'dark' : 'light');

  updateThemeIcons();

  // Re-render tab aktif agar visualisasi Plotly menyesuaikan warna latar

  if (window.DSS_STATE.data) {

    switchTab(window.DSS_STATE.currentTab);

  }

}

function updateThemeIcons() {

  const isDark = document.documentElement.classList.contains('dark');

  const moonIcon = document.getElementById('theme-icon-moon');

  const sunIcon = document.getElementById('theme-icon-sun');

  if (moonIcon && sunIcon) {

    if (isDark) {

      moonIcon.classList.add('hidden');

      sunIcon.classList.remove('hidden');

    } else {

      moonIcon.classList.remove('hidden');

      sunIcon.classList.add('hidden');

    }

  }

}

/**

 * Inisialisasi Tombol Buka/Tutup Sidebar Navigasi & Hover Interaktif

 */

/**

 * Kontrol Drawer Navigasi Mobile & Layar Sempit / Split-Screen

 */

function openMobileSidebar() {

  const sidebar = document.getElementById('main-sidebar');

  const backdrop = document.getElementById('sidebar-backdrop');

  if (sidebar) sidebar.classList.add('mobile-open');

  if (backdrop) backdrop.classList.remove('hidden');

  document.body.classList.add('overflow-hidden');

  if (typeof lucide !== 'undefined') lucide.createIcons();

}

function closeMobileSidebar() {

  const sidebar = document.getElementById('main-sidebar');

  const backdrop = document.getElementById('sidebar-backdrop');

  if (sidebar) sidebar.classList.remove('mobile-open');

  if (backdrop) backdrop.classList.add('hidden');

  document.body.classList.remove('overflow-hidden');

}

/**

 * Inisialisasi Tombol Buka/Tutup Sidebar Navigasi, Mobile Drawer & Hover Interaktif

 */

function initSidebarToggle() {

  const toggleBtn = document.getElementById('btn-toggle-sidebar');

  const sidebar = document.getElementById('main-sidebar');

  const mobileMenuBtn = document.getElementById('btn-mobile-menu');

  const closeMobileSidebarBtn = document.getElementById('btn-close-mobile-sidebar');

  const backdrop = document.getElementById('sidebar-backdrop');

  if (!sidebar) return;

  // 1. Kontrol Drawer untuk Mobile & Layar Sempit / Split-Screen

  if (mobileMenuBtn) {

    mobileMenuBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      openMobileSidebar();

    });

  }

  if (closeMobileSidebarBtn) {

    closeMobileSidebarBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      closeMobileSidebar();

    });

  }

  if (backdrop) {

    backdrop.addEventListener('click', () => {

      closeMobileSidebar();

    });

  }

  // Tutup drawer jika tombol Escape ditekan

  document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape') {

      closeMobileSidebar();

    }

  });

  // Jika ukuran layar diperbesar melewati 768px (kembali ke desktop), pastikan drawer mobile tertutup rapi

  window.addEventListener('resize', () => {

    if (window.innerWidth >= 768) {

      closeMobileSidebar();

    }

  });

  // 2. Kontrol Ciutkan Menu Khusus Desktop (>= 768px)

  const savedCollapsed = localStorage.getItem('dss_sidebar_collapsed');

  if (savedCollapsed === 'true' && window.innerWidth >= 768) {

    sidebar.classList.add('collapsed-sidebar');

  }

  if (toggleBtn) {

    toggleBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      const isNowCollapsed = sidebar.classList.toggle('collapsed-sidebar');

      localStorage.setItem('dss_sidebar_collapsed', isNowCollapsed ? 'true' : 'false');

      if (typeof lucide !== 'undefined') {

        lucide.createIcons();

      }

      setTimeout(() => {

        window.dispatchEvent(new Event('resize'));

      }, 320);

    });

  }

  // Fitur Desktop: Klik di bagian manapun dari sidebar yang sedang tertutup untuk membuka permanen

  sidebar.addEventListener('click', (e) => {

    if (window.innerWidth >= 768 && sidebar.classList.contains('collapsed-sidebar')) {

      const clickedToggle = e.target.closest('#btn-toggle-sidebar');

      if (!clickedToggle) {

        sidebar.classList.remove('collapsed-sidebar');

        localStorage.setItem('dss_sidebar_collapsed', 'false');

        setTimeout(() => {

          window.dispatchEvent(new Event('resize'));

        }, 320);

      }

    }

  });

}

/**

 * Jam & Tanggal Operasional Posko di Header (Opsional)

 */

function initClock() {

  const clockEl = document.getElementById('live-clock');

  if (!clockEl) return;

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

 * Event Listener Navigasi Menu Sidebar & Brand Link

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

  // Klik pada Logo/Teks Pusdatin mengarahkan ke halaman default (Ikhtisar Posko)

  const brandLink = document.getElementById('brand-link');

  if (brandLink) {

    brandLink.addEventListener('click', (e) => {

      e.preventDefault();

      switchTab('executive');

    });

  }

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

    } else if (tabId === 'koridor' && typeof renderKoridorModule === 'function') {

      renderKoridorModule();

    } else if (tabId === 'metodologi' && typeof renderMetodologiModule === 'function') {

      renderMetodologiModule();

    }

  }

  // Tutup drawer mobile secara otomatis setelah modul dipilih

  if (window.innerWidth < 768) {

    closeMobileSidebar();

  }

  // Scroll kembali ke atas

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

