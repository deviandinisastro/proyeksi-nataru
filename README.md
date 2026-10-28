# 🚆 Dashboard Proyeksi Angkutan Nataru 2026/2027

> **Dashboard Pemantauan dan Visualisasi Proyeksi Mobilitas Nasional Masa Posko Natal dan Tahun Baru 2026/2027**  
> *Pusat Data dan Teknologi Informasi (Pusdatin) — Kementerian Perhubungan Republik Indonesia*

🌐 **Akses Web Demo (Live):** [https://deviandinisastro.github.io/proyeksi-nataru/](https://deviandinisastro.github.io/proyeksi-nataru/)

---

## 📌 Sekilas Proyek

Repositori ini memuat prototipe antarmuka web interaktif untuk pemantauan dan analisis proyeksi mobilitas penumpang serta sarana transportasi nasional selama masa **Posko Terpadu Nataru 2026/2027** (18 hari operasional: H-7 s/d H+10, 18 Desember 2026 – 4 Januari 2027).

Sistem ini mengintegrasikan pengolahan data deret waktu (*time-series forecasting*) berbasis model acuan resmi **Damped Holt-Winters ($\phi=0.85$)** dengan visualisasi geospasial (*Web GIS*) untuk memetakan seluruh simpul pantau nasional secara terpadu.

### 📊 Parameter Utama Dataset
* **Total Volume Proyeksi:** **18.462.913 penumpang** (+3,45% YoY vs 17.848.066 realisasi 2025).
* **Durasi Pemantauan:** 18 Hari Posko Terpadu (18 Des 2026 s.d. 4 Jan 2027).
* **Cakupan Spasial:** **909 Simpul Pantau Nasional** berkoordinat presisi (213 Bandara, 183 Stasiun KA, 201 Pelabuhan Laut, 157 Terminal Bus, dan 155 Pelabuhan Penyeberangan ASDP).
* **Titik Kritis Jalur:** 4 Gerbang Tol Utama Barrier Jabodetabek & 3 Lintas Penyeberangan Utama ASDP.

---

## 🚀 Fitur Utama Dashboard

1. **Ikhtisar Proyeksi Posko (*Executive Overview*)**  
   Rangkuman indikator makro nasional, pangsa pasar (*modal share*) 5 moda transportasi, estimasi kebutuhan armada, serta kalender deteksi hari puncak arus mudik (**H-1 / 24 Des 2026**) dan arus balik (**H+9 / 3 Jan 2027**).

2. **Tren Harian Proyeksi (18 Hari Deret Waktu)**  
   Visualisasi grafik pergerakan harian komparasi 3 tahun (2024, 2025, dan Proyeksi 2026) dengan filter interaktif per moda transportasi dan pilihan metrik (*Penumpang vs Sarana*).

3. **Direktori Simpul Multimoda**  
   Peringkat 10 simpul terpadat nasional per moda serta tabel direktori pencarian 909 simpul pantau dengan fitur pencarian instan (*live search*), filter moda, dan penomoran halaman (*pagination*).

4. **Peta Spasial Proyeksi (*Web GIS Leaflet*)**  
   Pemetaan geospasial interaktif 909 simpul transportasi nasional yang dilengkapi dengan fitur *Heatmap* Kepadatan Spasial, filter moda, dan informasi detail volume per simpul.

5. **Titik Kritis Gerbang Tol & Penyeberangan ASDP**  
   Pemantauan volume lalu lintas keluar/masuk Jakarta melalui 4 Gerbang Tol Barrier utama (Cikatama, Kalihurip Utama, Cikupa, Ciawi) serta dinamika operasional penyeberangan lintas Selat Sunda (Merak–Bakauheni) dan Selat Bali (Ketapang–Gilimanuk).

6. **Informasi Sistem & Kamus Rumus Posko**  
   Dokumentasi transparansi data, formulasi matematis metrik dasar ($P_{\text{total}}$, $\bar{P}_{\text{harian}}$, *Modal Share*, YoY, *Surge Ratio*), rasional ilmiah pemilihan model Damped Holt-Winters, matriks 12 indikator posko, serta kamus istilah resmi transportasi Kemenhub RI.

---

## 🛠️ Tumpukan Teknologi (*Tech Stack*)

* **Frontend:** HTML5, Tailwind CSS (Modern Government Palette INA Digital), JavaScript (Vanilla ES6).
* **Visualisasi Grafis:** Plotly.js (Grafik Deret Waktu & Bar Chart).
* **Geospasial (GIS):** Leaflet.js, Leaflet Heatmap.
* **Ikonografi & Desain:** Lucide Icons, Plus Jakarta Sans Typography.
* **Pengolahan Data (ETL):** Python 3, Pandas, NumPy (Pipeline ekstraksi log posko menjadi JSON terstruktur).
* **Hosting:** GitHub Pages.

---

## 📁 Struktur Direktori

```text
proyeksi-nataru/
├── index.html              # Halaman antarmuka utama dashboard (Single Page Application)
├── assets/
│   ├── css/
│   │   └── custom.css      # Styling khusus, tema INA Digital & mode gelap/terang
│   └── js/
│       ├── app.js          # Router utama, inisialisasi state, dan event handler navigasi
│       ├── executive.js    # Modul renderer Ikhtisar Proyeksi Posko
│       ├── harian.js       # Modul renderer visualisasi deret waktu 18 hari
│       ├── simpul.js       # Modul renderer direktori & tabel 909 simpul pantau
│       ├── map_gis.js      # Modul renderer peta spasial GIS & heatmap Leaflet
│       ├── koridor.js      # Modul renderer titik kritis Gerbang Tol & lintasan ASDP
│       ├── metodologi.js   # Modul renderer matriks 12 indikator & kamus glosarium
│       └── leaflet-heat.js # Library heatmap spasial untuk Leaflet
├── data/
│   ├── nataru_data.json    # Master dataset numerik posko (makro, harian, tol, ASDP)
│   └── spatial_nodes.json  # Dataset koordinat geografis 909 simpul pantau nasional
└── scripts/
    ├── build_data.py       # Skrip Python pipeline ekstraksi & normalisasi data Excel ke JSON
    └── reference_coords.json # Basis data referensi koordinat simpul transportasi
```

---

## 👤 Penyusun

* **Devi Andini Sastro** (NPM: 10123320)  
  *Program Studi S1 Sistem Informasi — Universitas Gunadarma*  
  *Program Magang Mandiri — Tim Pengelolaan Data, Pusdatin Kementerian Perhubungan RI*
