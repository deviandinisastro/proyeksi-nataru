/**
 * ==============================================================================
 * MAP_GIS.JS: MODUL 4 - PETA SPASIAL DISTRIBUSI SIMPUL MULTIMODA (LEAFLET GIS)
 * Pusat Data dan Informasi (Pusdatin) - Kementerian Perhubungan RI
 * Nataru 2026/2027
 * ==============================================================================
 * Standar Kartografi & Statistik Kemenhub:
 * 1. Ukuran titik simpul dibuat SAMA RATA (Uniform Radius: 4.2px) untuk seluruh 909
 *    simpul multimoda terverifikasi agar tidak tumpang tindih.
 * 2. Perbedaan intensitas volume mobilitas diwakili oleh LAPISAN HEATMAP KEPADATAN
 *    dan KETERANGAN PETA SPASIAL di pojok kiri bawah peta (default terlipat rapi).
 * ==============================================================================
 */

let mapInstance = null;
let markerLayerGroup = null;
let heatmapLayerGroup = null;
let baseTileLayer = null;
let currentMapModa = 'ALL';
let showHeatmap = true;
let showMarkers = true;
let mapInitialized = false;

const UNIFORM_RADIUS = 4.2; // Ukuran titik sama rata sesuai arahan statistisi rapat
const INDONESIA_BOUNDS = [[-10.8, 95.0], [5.8, 141.0]]; // Batas koordinat seluruh kepulauan Indonesia

const MAP_MODA_CONFIG = [
  { key: 'ALL', label: 'Semua Moda (909)', moda_name: 'Multimoda', color: '#003882', makro_total: 18462913 },
  { key: 'Angkutan Udara', label: '✈️ Bandara (213)', moda_name: 'Angkutan Udara', color: '#0284C7', makro_total: 4880174 },
  { key: 'Kereta Api', label: '🚆 Stasiun KA (183)', moda_name: 'Kereta Api', color: '#EA580C', makro_total: 4062995 },
  { key: 'Angkutan Laut', label: '🚢 Pelabuhan Laut (201)', moda_name: 'Angkutan Laut', color: '#0D9488', makro_total: 2268857 },
  { key: 'Angkutan Jalan', label: '🚌 Terminal Bus (157)', moda_name: 'Angkutan Jalan', color: '#16A34A', makro_total: 3434854 },
  { key: 'Angkutan SDP', label: '⛴️ Penyeberangan (155)', moda_name: 'Angkutan SDP', color: '#9333EA', makro_total: 3816033 }
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
      fitIndonesiaMap();
    }
  }, 150);

  refreshMapLayers();
}

/**
 * Menyesuaikan zoom & batas peta agar seluruh pulau Indonesia (Sabang s/d Merauke) terlihat proporsional
 */
function fitIndonesiaMap() {
  if (!mapInstance) return;
  mapInstance.fitBounds(INDONESIA_BOUNDS, {
    padding: [15, 15],
    animate: true
  });
}

/**
 * Inisialisasi Peta Leaflet dengan Basemap OpenStreetMap
 */
function initLeafletMap() {
  const mapContainer = document.getElementById('gis-map-canvas');
  if (!mapContainer || mapInstance) return;

  mapInstance = L.map('gis-map-canvas', {
    center: [-2.2, 118.0],
    zoom: 4.8,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: false
  });

  // Zoom Control di Kanan Atas
  L.control.zoom({ position: 'topright' }).addTo(mapInstance);

  // Layer Group Urutan: Heatmap (bawah) -> Simpul Markers (atas)
  heatmapLayerGroup = L.layerGroup().addTo(mapInstance);
  markerLayerGroup = L.layerGroup().addTo(mapInstance);

  // Pasang Keterangan Peta di Pojok Kiri Bawah (Default Tertutup Rapi)
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
 * Default: TERTUTUP RAPI (Collapsed) agar Tidak Menutupi Pulau/Simpul Manapun
 */
function setupMapLegend() {
  const legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'leaflet-bar border-0 shadow-none bg-transparent');
    div.innerHTML = `
      <div class="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[11px] shadow-lg max-w-[245px] font-sans">
        <!-- Header Baris Atas dengan Tombol Buka / Ciutkan (Default Tertutup Rapi) -->
        <div id="legend-header-toggle" class="flex items-center justify-between gap-2 cursor-pointer select-none" title="Klik untuk Buka / Ciutkan Keterangan Peta">
          <div class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
            <span class="text-gov-azure font-extrabold">🗺️</span>
            <span>Keterangan Peta Spasial</span>
          </div>
          <span id="legend-toggle-icon" class="text-[10px] text-slate-500 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">▼</span>
        </div>

        <!-- Isi Konten Legenda yang Secara Default Diciutkan (Hidden) agar Peta Bebas Hambatan -->
        <div id="legend-body" class="space-y-2.5 pt-2 hidden">
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
              <span>Simpul Terpetakan (Ukuran Seragam)</span>
              <span class="text-[9px] text-slate-400 font-normal">909 Titik</span>
            </div>
            <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#0284C7] shrink-0 border border-white"></span> Udara (213)</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#EA580C] shrink-0 border border-white"></span> Kereta Api (183)</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#0D9488] shrink-0 border border-white"></span> Pelabuhan Laut (201)</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#16A34A] shrink-0 border border-white"></span> Terminal Bus (157)</span>
              <span class="flex items-center gap-1.5 col-span-2"><span class="w-2 h-2 rounded-full bg-[#9333EA] shrink-0 border border-white"></span> Pelabuhan SDP (155)</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Mencegah interaksi peta saat mengklik keterangan
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    // Event listener ciutkan / buka (default: collapsed)
    const toggleBtn = div.querySelector('#legend-header-toggle');
    const legendBody = div.querySelector('#legend-body');
    const toggleIcon = div.querySelector('#legend-toggle-icon');

    if (toggleBtn && legendBody && toggleIcon) {
      let isCollapsed = true; // Default tertutup rapi
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

  // Reset Peta ke Seluruh Indonesia dengan Batas Wilayah Lengkap
  if (btnResetMap) {
    btnResetMap.addEventListener('click', (e) => {
      e.preventDefault();
      fitIndonesiaMap();
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
 * Refresh Seluruh Layer Peta (Heatmap, Markers Sama Rata)
 */
function refreshMapLayers() {
  if (!mapInstance || !window.DSS_STATE.spatialNodes) return;

  const allNodes = window.DSS_STATE.spatialNodes;
  const filteredNodes = currentMapModa === 'ALL'
    ? allNodes
    : allNodes.filter(n => n.moda === currentMapModa);

  // 1. Info Teks di Atas Peta: Menampilkan Angka Proyeksi Resmi Posko (100% Selaras dengan Modul Lain)
  const countEl = document.getElementById('gis-nodes-count');
  const volEl = document.getElementById('gis-nodes-volume');

  const currentModaCfg = MAP_MODA_CONFIG.find(m => m.key === currentMapModa) || MAP_MODA_CONFIG[0];
  const officialProj = currentModaCfg.makro_total || 18462913;

  if (countEl) {
    if (currentMapModa === 'ALL') {
      countEl.innerText = `${filteredNodes.length} Simpul Multimoda Terpetakan`;
    } else {
      countEl.innerText = `${filteredNodes.length} Simpul ${currentModaCfg.moda_name} Terpetakan`;
    }
  }

  if (volEl) {
    if (currentMapModa === 'ALL') {
      volEl.innerHTML = `
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Proyeksi Nasional:</span>
        <span class="text-gov-navy dark:text-sky-400 font-extrabold text-sm ml-1.5">${formatNumber(officialProj)} Orang</span>
      `;
    } else {
      volEl.innerHTML = `
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Proyeksi ${currentModaCfg.moda_name}:</span>
        <span class="text-gov-navy dark:text-sky-400 font-extrabold text-sm ml-1.5">${formatNumber(officialProj)} Orang</span>
      `;
    }
  }

  // 2. Render Lapisan Heatmap (Kepadatan Spasial Halus)
  renderHeatmapLayer(filteredNodes);

  // 3. Render Titik Simpul Marker (SAMA RATA / UNIFORM RADIUS)
  renderEqualMarkers(filteredNodes);
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
 * Render Titik Simpul Lingkaran (SAMA RATA / UNIFORM RADIUS: 4.2px)
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

    // Tooltip Ramping dengan Angka Putih Jelas (Mudah Dibaca di Latar Gelap)
    marker.bindTooltip(`<b>${node.nama}</b><br><span class="text-white font-medium">${formatNumber(vol)} orang</span>`, {
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
