/**
 * ==============================================================================
 * MAP_GIS.JS: MODUL 4 - PETA SPASIAL DISTRIBUSI SIMPUL MULTIMODA (LEAFLET GIS)
 * Pusat Data dan Informasi (Pusdatin) - Kementerian Perhubungan RI
 * Nataru 2026/2027
 * ==============================================================================
 * Standar Kartografi & Statistik Kemenhub:
 * 1. Ukuran titik simpul dibuat SAMA RATA (Uniform Radius: 4.2px) agar tidak bertumpuk
 *    atau menutupi simpul lain di wilayah padat (sesuai masukan rapat pegawai statistisi).
 * 2. Perbedaan intensitas volume mobilitas diwakili oleh LAPISAN HEATMAP KEPADATAN
 *    dan KETERANGAN PETA SPASIAL di pojok kiri bawah peta (membebaskan area Papua & Indonesia Timur).
 * 3. Dilengkapi pemantauan Titik Kritis Khusus Posko Nataru (Gerbang Tol Barrier & ASDP).
 * ==============================================================================
 */

let mapInstance = null;
let markerLayerGroup = null;
let heatmapLayerGroup = null;
let criticalLayerGroup = null;
let baseTileLayer = null;
let currentMapModa = 'ALL';
let showHeatmap = true;
let showMarkers = true;
let showCritical = true;
let mapInitialized = false;

const UNIFORM_RADIUS = 4.2; // Ukuran titik sama rata sesuai arahan statistisi rapat

const MAP_MODA_CONFIG = [
  { key: 'ALL', label: 'Semua Moda (855)', color: '#003882' },
  { key: 'Angkutan Udara', label: '✈️ Bandara (230)', color: '#0284C7' },
  { key: 'Kereta Api', label: '🚆 Stasiun KA (186)', color: '#EA580C' },
  { key: 'Angkutan Jalan', label: '🚌 Terminal Bus (189)', color: '#16A34A' },
  { key: 'Angkutan SDP', label: '⛴️ Penyeberangan (196)', color: '#9333EA' },
  { key: 'Angkutan Laut', label: '🚢 Pelabuhan Laut (209)', color: '#0D9488' }
];

const TITIK_KRITIS_DATA = [
  {
    nama: 'GT Cikatama (Cikampek Utama)',
    kategori: 'tol',
    lat: -6.4025,
    lon: 107.4586,
    tipe: 'Gerbang Tol Barrier Trans Jawa',
    vol_teks: '813.413 kendaraan (+16,76% YoY)',
    info: 'Titik awal arus mudik keluar Jabodetabek menuju Jawa Tengah/Jatim'
  },
  {
    nama: 'GT Kalikangkung (Semarang)',
    kategori: 'tol',
    lat: -6.9856,
    lon: 110.3012,
    tipe: 'Gerbang Tol Barrier Utama',
    vol_teks: '482.350 kendaraan',
    info: 'Titik temu arus mudik Jawa Tengah dan pelintasan ke Jawa Timur'
  },
  {
    nama: 'GT Warugunung (Surabaya)',
    kategori: 'tol',
    lat: -7.3325,
    lon: 112.6789,
    tipe: 'Gerbang Tol Barrier Akhir Trans Jawa',
    vol_teks: '392.120 kendaraan',
    info: 'Pintu masuk utama aglomerasi Surabaya dan destinasi Jawa Timur'
  },
  {
    nama: 'GT Ciawi (Jagorawi)',
    kategori: 'tol',
    lat: -6.6583,
    lon: 106.8522,
    tipe: 'Gerbang Tol Wisata Puncak',
    vol_teks: '412.500 kendaraan',
    info: 'Jalur wisata libur Natal & Tahun Baru kawasan Puncak/Bogor'
  },
  {
    nama: 'Pelabuhan Merak (Banten)',
    kategori: 'asdp',
    lat: -5.9328,
    lon: 105.9986,
    tipe: 'Pelabuhan Penyeberangan Utama',
    vol_teks: '612.235 kendaraan / 2.84 juta orang',
    info: 'Lintas Selat Sunda Jawa menuju Sumatera (Pola TBB saat puncak)'
  },
  {
    nama: 'Pelabuhan Bakauheni (Lampung)',
    kategori: 'asdp',
    lat: -5.8692,
    lon: 105.7533,
    tipe: 'Pelabuhan Penyeberangan Utama',
    vol_teks: 'Puncak Arus Balik H+8 s/d H+9',
    info: 'Pintu gerbang arus balik dari Tol Trans Sumatera menuju Pulau Jawa'
  },
  {
    nama: 'Pelabuhan Ketapang (Banyuwangi)',
    kategori: 'asdp',
    lat: -8.1481,
    lon: 114.3986,
    tipe: 'Pelabuhan Penyeberangan Selat Bali',
    vol_teks: '326.400 kendaraan / 1.18 juta orang',
    info: 'Lintas utama penyeberangan wisatawan libur akhir tahun ke Bali'
  },
  {
    nama: 'Pelabuhan Gilimanuk (Bali)',
    kategori: 'asdp',
    lat: -8.1611,
    lon: 114.4394,
    tipe: 'Pelabuhan Penyeberangan Selat Bali',
    vol_teks: 'Arus Wisatawan Masuk & Balik',
    info: 'Pintu masuk darat wisatawan domestik Pulau Bali'
  }
];

function renderMapModule() {
  const nodes = window.DSS_STATE.spatialNodes;
  if (!nodes || nodes.length === 0) return;

  if (!mapInitialized) {
    initLeafletMap();
    setupMapControls();
    mapInitialized = true;
  } else {
    updateBasemap();
  }

  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize();
      mapInstance.setView([-2.5, 118.0], 5);
    }
  }, 150);

  refreshMapLayers();
}

/**
 * Inisialisasi Peta Leaflet dengan Basemap OpenStreetMap
 */
function initLeafletMap() {
  const mapContainer = document.getElementById('gis-map-canvas');
  if (!mapContainer || mapInstance) return;

  mapInstance = L.map('gis-map-canvas', {
    center: [-2.5, 118.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: false
  });

  // Zoom Control di Kanan Atas
  L.control.zoom({ position: 'topright' }).addTo(mapInstance);

  // Layer Group Urutan: Heatmap (bawah) -> Simpul Markers (tengah) -> Titik Kritis (atas)
  heatmapLayerGroup = L.layerGroup().addTo(mapInstance);
  markerLayerGroup = L.layerGroup().addTo(mapInstance);
  criticalLayerGroup = L.layerGroup().addTo(mapInstance);

  // Pasang Legenda di Pojok Kanan Bawah
  setupMapLegend();

  // Pasang Basemap Resmi OpenStreetMap
  updateBasemap();
}

/**
 * Memperbarui Basemap Sesuai Tema (Terang: OpenStreetMap, Gelap: Esri Dark Canvas)
 */
function updateBasemap() {
  if (!mapInstance) return;
  const isDark = document.documentElement.classList.contains('dark');

  if (baseTileLayer) {
    mapInstance.removeLayer(baseTileLayer);
  }

  if (isDark) {
    baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com" target="_blank">Esri</a> &bull; Pusdatin Kemenhub',
      maxZoom: 16
    }).addTo(mapInstance);
  } else {
    baseTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &bull; Pusdatin Kemenhub',
      maxZoom: 19
    }).addTo(mapInstance);
  }
}

/**
 * Setup Kotak Keterangan Peta di Pojok Kiri Bawah (Membebaskan Area Papua & Indonesia Timur)
 * dengan Fitur Ciutkan / Buka ▲/▼
 */
function setupMapLegend() {
  const legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'leaflet-bar border-0 shadow-none bg-transparent');
    div.innerHTML = `
      <div class="p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[11px] shadow-lg max-w-[245px] font-sans">
        <!-- Header Baris Atas dengan Tombol Ciutkan / Buka -->
        <div id="legend-header-toggle" class="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none" title="Klik untuk Ciutkan / Buka Keterangan Peta">
          <div class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
            <span class="text-gov-azure font-extrabold">🗺️</span>
            <span>Keterangan Peta Spasial</span>
          </div>
          <span id="legend-toggle-icon" class="text-[10px] text-slate-500 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">▲</span>
        </div>

        <!-- Isi Konten Legenda yang Dapat Diciutkan -->
        <div id="legend-body" class="space-y-2.5 pt-2">
          <!-- Bagian 1: Intensitas Kepadatan Arus (Heatmap) -->
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between mb-1">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"></span>
                <span>Intensitas Kepadatan Arus:</span>
              </span>
              <span class="text-[9px] font-semibold text-gov-navy dark:text-sky-300 px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 rounded">Posko Nataru</span>
            </div>
            <div class="h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-600 mb-1"></div>
            <div class="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
              <span>Rendah</span>
              <span>Sedang</span>
              <span>Padat</span>
              <span>Puncak Beban</span>
            </div>
            <div class="text-[8.5px] text-slate-400 dark:text-slate-500 italic mt-0.5 leading-tight">
              *Normalisasi Kernel Density thd. Soetta (Simpul Terpadat)
            </div>
          </div>

          <!-- Bagian 2: Titik Simpul per Moda (Ukuran Seragam) -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
            <div class="font-bold text-slate-800 dark:text-slate-100 text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Simpul Pantau (Ukuran Seragam)</span>
              <span class="text-[9px] text-slate-400 font-normal">855 Titik</span>
            </div>
            <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#0284C7] shrink-0 border border-white"></span> Udara (230)</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#EA580C] shrink-0 border border-white"></span> Kereta Api (186)</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#16A34A] shrink-0 border border-white"></span> Terminal Bus (189)</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#9333EA] shrink-0 border border-white"></span> Pelabuhan SDP (196)</span>
              <span class="flex items-center gap-1.5 col-span-2"><span class="w-2 h-2 rounded-full bg-[#0D9488] shrink-0 border border-white"></span> Pelabuhan Laut (209)</span>
            </div>
          </div>

          <!-- Bagian 3: Titik Pantau Khusus Posko Nataru -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
            <div class="font-bold text-slate-800 dark:text-slate-100 text-[10px] uppercase tracking-wider mb-1">
              <span>Fokus Khusus Posko Nataru</span>
            </div>
            <div class="grid grid-cols-1 gap-y-1 text-[10px]">
              <span class="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                <span class="w-2 h-2 rotate-45 bg-[#E11D48] shrink-0 border border-white shadow-2xs"></span> 
                <span>Gerbang Tol Barrier (Trans Jawa)</span>
              </span>
              <span class="flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400">
                <span class="w-2.5 h-2.5 rounded-full bg-[#9333EA] ring-2 ring-amber-400 shrink-0 border border-white"></span> 
                <span>Penyeberangan Utama (Merak & Ketapang)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Mencegah interaksi peta saat mengklik keterangan
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    // Event listener ciutkan / buka (collapse toggle)
    const toggleBtn = div.querySelector('#legend-header-toggle');
    const legendBody = div.querySelector('#legend-body');
    const toggleIcon = div.querySelector('#legend-toggle-icon');

    if (toggleBtn && legendBody && toggleIcon) {
      let isCollapsed = false;
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
          legendBody.classList.add('hidden');
          toggleIcon.textContent = '▼';
          toggleBtn.classList.remove('border-b', 'pb-2');
        } else {
          legendBody.classList.remove('hidden');
          toggleIcon.textContent = '▲';
          toggleBtn.classList.add('border-b', 'pb-2');
        }
      });
    }

    return div;
  };

  legend.addTo(mapInstance);
}

/**
 * Setup Tombol Filter Moda, Toggle Heatmap, dan Reset Peta
 */
function setupMapControls() {
  const filterContainer = document.getElementById('gis-moda-pills');
  const btnResetMap = document.getElementById('btn-reset-map');
  const btnToggleHeatmap = document.getElementById('btn-toggle-heatmap');
  const btnToggleCritical = document.getElementById('btn-toggle-critical');

  if (filterContainer) {
    filterContainer.innerHTML = MAP_MODA_CONFIG.map(m => `
      <button 
        data-map-moda="${m.key}"
        class="map-pill px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
          m.key === currentMapModa 
            ? 'bg-gov-navy text-white border-gov-navy shadow-xs font-bold' 
            : 'bg-white text-slate-700 border-gov-border hover:bg-slate-50'
        }"
      >
        <span>${m.label}</span>
      </button>
    `).join('');

    filterContainer.querySelectorAll('.map-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-map-moda');
        if (target) {
          currentMapModa = target;
          filterContainer.querySelectorAll('.map-pill').forEach(b => {
            if (b.getAttribute('data-map-moda') === target) {
              b.className = 'map-pill px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 bg-gov-navy text-white border-gov-navy shadow-xs';
            } else {
              b.className = 'map-pill px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 bg-white text-slate-700 border-gov-border hover:bg-slate-50';
            }
          });
          refreshMapLayers();
        }
      });
    });
  }

  // Toggle Heatmap Layer
  if (btnToggleHeatmap) {
    btnToggleHeatmap.onclick = () => {
      showHeatmap = !showHeatmap;
      updateToggleBtnState(btnToggleHeatmap, showHeatmap, 'Heatmap Kepadatan');
      refreshMapLayers();
    };
  }

  // Toggle Critical Points Layer
  if (btnToggleCritical) {
    btnToggleCritical.onclick = () => {
      showCritical = !showCritical;
      updateToggleBtnState(btnToggleCritical, showCritical, 'Titik Kritis Posko');
      refreshMapLayers();
    };
  }

  // Reset Peta ke Seluruh Indonesia
  if (btnResetMap) {
    btnResetMap.addEventListener('click', (e) => {
      e.preventDefault();
      if (mapInstance) {
        mapInstance.invalidateSize();
        mapInstance.setView([-2.5, 118.0], 5, { animate: true });
      }
    });
  }
}

function updateToggleBtnState(btn, isActive, label) {
  if (isActive) {
    btn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 bg-gov-navy text-white border-gov-navy shadow-xs';
  } else {
    btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 bg-white text-slate-500 border-gov-border hover:bg-slate-50 opacity-60';
  }
}

/**
 * Refresh Seluruh Layer Peta (Heatmap, Markers Sama Rata, Titik Kritis)
 */
function refreshMapLayers() {
  if (!mapInstance || !window.DSS_STATE.spatialNodes) return;

  const allNodes = window.DSS_STATE.spatialNodes;
  const filteredNodes = currentMapModa === 'ALL'
    ? allNodes
    : allNodes.filter(n => n.moda === currentMapModa);

  // 1. Perbarui Info Teks di Atas Peta
  const countEl = document.getElementById('gis-nodes-count');
  const volEl = document.getElementById('gis-nodes-volume');
  let totalVol = 0;
  filteredNodes.forEach(n => totalVol += (n.proyeksi_2026 || 0));

  if (countEl) countEl.innerText = `${filteredNodes.length} Simpul Terpetakan (Ukuran Seragam)`;
  if (volEl) volEl.innerText = `${formatNumber(totalVol)} Orang (Proyeksi 2026)`;

  // 2. Render Lapisan Heatmap (Kepadatan Spasial Halus)
  renderHeatmapLayer(filteredNodes);

  // 3. Render Titik Simpul Marker (SAMA RATA / UNIFORM RADIUS)
  renderEqualMarkers(filteredNodes);

  // 4. Render Titik Kritis Infrastruktur Posko Nataru
  renderCriticalInfrastructure();
}

/**
 * Render Lapisan Heatmap Kepadatan (Menjawab: "Yang membedakan volumenya itu dari heatmap")
 */
function renderHeatmapLayer(nodes) {
  if (!heatmapLayerGroup) return;
  heatmapLayerGroup.clearLayers();

  if (!showHeatmap || typeof L.heatLayer !== 'function') return;

  const maxVol = Math.max(...nodes.map(n => n.proyeksi_2026 || 0), 100000);

  const heatPoints = nodes.map(n => {
    const vol = n.proyeksi_2026 || 0;
    // Skala intensitas normalisasi logaritmik agar wilayah luar Jawa tetap memancarkan panas secara seimbang
    const intensity = Math.min(1.0, Math.max(0.18, Math.pow(vol / maxVol, 0.4)));
    return [n.lat, n.lon, intensity];
  });

  const heatLayer = L.heatLayer(heatPoints, {
    radius: 30,
    blur: 20,
    maxZoom: 11,
    minOpacity: 0.38,
    gradient: {
      0.15: '#38BDF8', // Cyan Lembut
      0.35: '#10B981', // Hijau Normal
      0.60: '#FBBF24', // Amber Padat
      0.82: '#F97316', // Oranye Tinggi
      1.00: '#EF4444'  // Merah Puncak
    }
  });

  heatmapLayerGroup.addLayer(heatLayer);
}

/**
 * Render Titik Simpul Lingkaran (SAMA RATA / UNIFORM RADIUS)
 */
function renderEqualMarkers(nodes) {
  if (!markerLayerGroup) return;
  markerLayerGroup.clearLayers();

  if (!showMarkers) return;

  nodes.forEach(node => {
    const isTop10 = (node.peringkat_nasional || 999) <= 10;
    const vol = node.proyeksi_2026 || 0;

    // Titik lingkaran dengan UKURAN SAMA RATA (UNIFORM RADIUS: 4.2px)
    const marker = L.circleMarker([node.lat, node.lon], {
      radius: UNIFORM_RADIUS,
      fillColor: node.color || '#003882',
      color: isTop10 ? '#F59E0B' : '#FFFFFF',
      weight: isTop10 ? 1.8 : 1.1,
      opacity: 1.0,
      fillOpacity: 0.95
    });

    // Efek Hover: Membesar Halus tanpa Merusak Peta
    marker.on('mouseover', function() {
      this.setStyle({ radius: 6.5, weight: 2.2, fillOpacity: 1.0 });
    });
    marker.on('mouseout', function() {
      this.setStyle({ radius: UNIFORM_RADIUS, weight: isTop10 ? 1.8 : 1.1, fillOpacity: 0.95 });
    });

    // Tooltip Ramping
    marker.bindTooltip(`<b>${node.nama}</b><br><span class="text-gov-navy">${formatNumber(vol)} orang</span>`, {
      direction: 'top',
      offset: [0, -4],
      className: 'bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-md border-0'
    });

    // Popup Detail saat Diklik
    const rankBadge = isTop10
      ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Top 10 Nasional</span>`
      : `<span class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700">Peringkat #${node.peringkat_nasional || '-'}</span>`;

    const popupHtml = `
      <div class="p-2 space-y-2 max-w-[260px] text-xs font-sans">
        <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
          <span class="font-bold text-slate-900 truncate">${node.nama}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0" style="background-color: ${node.color || '#003882'}">
            ${node.moda_label || node.moda}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-500">
          <span>Provinsi: ${node.provinsi || '-'}</span>
          ${rankBadge}
        </div>
        <div class="p-2 bg-slate-50 rounded border border-slate-100 space-y-1 text-[11px]">
          <div class="flex items-center justify-between font-bold text-gov-navy">
            <span>Proyeksi Nataru 2026:</span>
            <span class="num-tabular">${formatNumber(vol)} org</span>
          </div>
          <div class="flex items-center justify-between text-slate-600">
            <span>Realisasi Baseline 2025:</span>
            <span class="num-tabular font-semibold text-slate-800">${formatNumber(node.realisasi_2025)} org</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-200 text-emerald-700 font-semibold">
            <span>Pangsa terhadap Moda:</span>
            <span class="num-tabular">${(node.porsi_share_pct || 0).toLocaleString('id-ID')}%</span>
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, { maxWidth: 280 });
    markerLayerGroup.addLayer(marker);
  });
}

/**
 * Render Titik Kritis Infrastruktur Posko Nataru (Gerbang Tol Barrier & Simpul Penyeberangan Utama)
 * Semua berukuran SAMA RATA (serasi dengan titik 4.2px) tanpa ada titik raksasa
 */
function renderCriticalInfrastructure() {
  if (!criticalLayerGroup) return;
  criticalLayerGroup.clearLayers();

  if (!showCritical) return;

  TITIK_KRITIS_DATA.forEach(t => {
    const isTol = t.kategori === 'tol';

    if (isTol) {
      // 1. Gerbang Tol Barrier: Penanda Belah Ketupat (Diamond Marker) Berukuran Sama Rata (8.5px)
      const diamondIcon = L.divIcon({
        className: 'border-0 bg-transparent flex items-center justify-center',
        html: `<div style="width: 8.5px; height: 8.5px; background-color: #E11D48; border: 1.2px solid #FFFFFF; transform: rotate(45deg); box-shadow: 0 1px 3px rgba(0,0,0,0.5);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });

      const marker = L.marker([t.lat, t.lon], { icon: diamondIcon });

      marker.bindTooltip(`<b>🚩 ${t.nama}</b><br><span class="text-rose-400 font-bold">${t.tipe}</span>`, {
        direction: 'top',
        offset: [0, -6],
        className: 'bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-md border-0'
      });

      const popupHtml = `
        <div class="p-2 space-y-2 max-w-[260px] text-xs font-sans">
          <div class="border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span class="font-bold text-slate-900">${t.nama}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase bg-rose-600">
              Gerbang Tol Barrier
            </span>
          </div>
          <p class="text-[11px] text-slate-600 leading-tight">${t.info}</p>
          <div class="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] font-bold text-rose-900">
            Estimasi Beban: ${t.vol_teks}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      criticalLayerGroup.addLayer(marker);
    } else {
      // 2. Simpul Penyeberangan Utama (Merak, Bakauheni, Ketapang, Gilimanuk):
      // Ukuran SAMA RATA (radius 4.2px) dengan Cincin Emas Khas Simpul Prioritas Posko
      const marker = L.circleMarker([t.lat, t.lon], {
        radius: UNIFORM_RADIUS,
        fillColor: '#9333EA',
        color: '#F59E0B', // Cincin Emas Penanda Prioritas Posko Nataru
        weight: 2.2,
        opacity: 1.0,
        fillOpacity: 1.0
      });

      marker.on('mouseover', function() {
        this.setStyle({ radius: 6.5, weight: 3.0 });
      });
      marker.on('mouseout', function() {
        this.setStyle({ radius: UNIFORM_RADIUS, weight: 2.2 });
      });

      marker.bindTooltip(`<b>⚓ ${t.nama}</b><br><span class="text-purple-300 font-bold">Simpul Prioritas Posko Nataru</span>`, {
        direction: 'top',
        offset: [0, -4],
        className: 'bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-md border-0'
      });

      const popupHtml = `
        <div class="p-2 space-y-2 max-w-[260px] text-xs font-sans">
          <div class="border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span class="font-bold text-slate-900">${t.nama}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase bg-purple-700">
              Penyeberangan Utama
            </span>
          </div>
          <p class="text-[11px] text-slate-600 leading-tight">${t.info}</p>
          <div class="p-2 bg-purple-50 border border-purple-200 rounded text-[11px] font-bold text-purple-900">
            Estimasi Beban: ${t.vol_teks}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      criticalLayerGroup.addLayer(marker);
    }
  });
}
