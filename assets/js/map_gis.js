/**
 * ==============================================================================
 * MAP_GIS.JS: MODUL 4 - PETA SPASIAL SIMPUL MULTIMODA NASIONAL (LEAFLET GIS)
 * Sistem Penunjang Keputusan (DSS) Nataru 2026/2027 - Pusdatin Kemenhub
 * ==============================================================================
 * Fitur:
 * 1. 855 Simpul Pantau Nasional Berkoordinat Geografis Valid (Lat/Lon).
 * 2. Basemap CartoDB Positron / OpenStreetMap (100% Free Open-Source, No API Key).
 * 3. Titik CircleMarker Proporsional Berdasarkan Volume Penumpang.
 * 4. Filter Kategori Moda Interaktif & Kontrol Reset Peta Indonesia.
 * ==============================================================================
 */

let mapInstance = null;
let markerLayerGroup = null;
let baseTileLayer = null;
let currentMapModa = 'ALL';
let mapInitialized = false;

const MAP_MODA_CONFIG = [
  { key: 'ALL', label: 'Semua Moda', color: '#003882', icon: 'layers' },
  { key: 'Angkutan Udara', label: '✈️ Bandara', color: '#0284C7', icon: 'plane' },
  { key: 'Angkutan Jalan', label: '🚌 Terminal Bus', color: '#16A34A', icon: 'bus' },
  { key: 'Angkutan Laut', label: '🚢 Pelabuhan Laut', color: '#1E40AF', icon: 'ship' },
  { key: 'Kereta Api', label: '🚆 Stasiun KA', color: '#EA580C', icon: 'train' },
  { key: 'Angkutan SDP', label: '⛴️ ASDP Penyeberangan', color: '#9333EA', icon: 'anchor' }
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

  // Paksa Leaflet menghitung ulang ukuran kontainer setelah tab unhide
  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize();
    }
  }, 100);

  updateMapMarkers();
}

/**
 * Inisialisasi Peta Leaflet dengan Basemap OpenStreetMap (Sama dengan Ka Wildan, 100% Free No API Key)
 */
function initLeafletMap() {
  const mapContainer = document.getElementById('gis-map-canvas');
  if (!mapContainer || mapInstance) return;

  // Titik tengah kepulauan Indonesia: Lat -2.5, Lon 118.0, Zoom Level 5
  mapInstance = L.map('gis-map-canvas', {
    center: [-2.5, 118.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: false // Kita posisikan ulang di kanan atas
  });

  // Tambahkan Zoom Control di Kanan Atas
  L.control.zoom({ position: 'topright' }).addTo(mapInstance);

  markerLayerGroup = L.layerGroup().addTo(mapInstance);

  // Pasang Basemap Resmi OpenStreetMap (100% Bebas Watermark API KEY)
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
    // Mode Gelap: Esri World Dark Gray Canvas (Elegan, Bersih, Bebas API Key)
    baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com" target="_blank">Esri</a> &bull; Pusdatin Kemenhub',
      maxZoom: 16
    }).addTo(mapInstance);
  } else {
    // Mode Terang: OpenStreetMap Standard (Sama Persis dengan Pilihan Ka Wildan, 100% Free Open-Source)
    baseTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &bull; Pusdatin Kemenhub',
      maxZoom: 19
    }).addTo(mapInstance);
  }

  if (markerLayerGroup) {
    markerLayerGroup.bringToFront();
  }
}

/**
 * Setup Tombol Filter Moda & Reset Peta
 */
function setupMapControls() {
  const filterContainer = document.getElementById('gis-moda-pills');
  const btnResetMap = document.getElementById('btn-reset-map');

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
      btn.addEventListener('click', (e) => {
        const target = btn.getAttribute('data-map-moda');
        if (target) {
          currentMapModa = target;
          // Update active class
          filterContainer.querySelectorAll('.map-pill').forEach(b => {
            if (b.getAttribute('data-map-moda') === target) {
              b.className = 'map-pill px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 bg-gov-navy text-white border-gov-navy shadow-xs';
            } else {
              b.className = 'map-pill px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 bg-white text-slate-700 border-gov-border hover:bg-slate-50';
            }
          });
          updateMapMarkers();
        }
      });
    });
  }

  if (btnResetMap) {
    btnResetMap.addEventListener('click', () => {
      if (mapInstance) {
        mapInstance.setView([-2.5, 118.0], 5);
      }
    });
  }
}

/**
 * Memperbarui Titik Simpul pada Peta Sesuai Filter Moda
 */
function updateMapMarkers() {
  if (!markerLayerGroup || !window.DSS_STATE.spatialNodes) return;

  markerLayerGroup.clearLayers();
  const allNodes = window.DSS_STATE.spatialNodes;

  const filteredNodes = currentMapModa === 'ALL'
    ? allNodes
    : allNodes.filter(n => n.moda === currentMapModa);

  // Update Status Banner Peta
  const countEl = document.getElementById('gis-nodes-count');
  const volEl = document.getElementById('gis-nodes-volume');
  
  if (countEl) countEl.innerText = `${filteredNodes.length} Simpul Aktif`;

  let totalVol = 0;

  filteredNodes.forEach(node => {
    totalVol += (node.proyeksi_2026 || 0);

    // Kalkulasi radius proporsional: min 4px, max 18px
    const vol = node.proyeksi_2026 || 0;
    const radius = Math.max(4, Math.min(18, Math.sqrt(vol / 2000)));

    const marker = L.circleMarker([node.lat, node.lon], {
      radius: radius,
      fillColor: node.color || '#003882',
      color: '#FFFFFF',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.75
    });

    // Tooltip Ramping saat Kursor Hover
    marker.bindTooltip(`<b>${node.nama}</b><br>${formatNumber(vol)} orang`, {
      direction: 'top',
      offset: [0, -5],
      className: 'bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-md'
    });

    // Popup Detail saat Titik Diklik
    const popupHtml = `
      <div class="p-1 space-y-2">
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white" style="background-color: ${node.color || '#003882'}">
            ${node.moda_label || node.moda}
          </span>
          <span class="text-[10px] font-bold text-gov-navy num-mono">Peringkat #${node.peringkat_nasional || '-'}</span>
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-900 leading-tight">${node.nama}</h4>
          <p class="text-[10px] text-slate-500">Provinsi: ${node.provinsi || '-'}</p>
        </div>
        <div class="p-2 bg-slate-50 rounded border border-slate-100 space-y-1 text-[11px]">
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Proyeksi 2026:</span>
            <span class="font-bold text-gov-navy num-mono">${formatNumber(node.proyeksi_2026)} org</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Realisasi 2025:</span>
            <span class="font-medium text-slate-700 num-mono">${formatNumber(node.realisasi_2025)} org</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-200">
            <span class="text-slate-600">Pangsa Moda:</span>
            <span class="font-bold text-gov-azure num-mono">${(node.porsi_share_pct || 0).toLocaleString('id-ID')}%</span>
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, { maxWidth: 260 });
    markerLayerGroup.addLayer(marker);
  });

  if (volEl) volEl.innerText = `${formatNumber(totalVol)} Orang Terpantau (Proyeksi 2026)`;
}
