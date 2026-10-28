# Dashboard Proyeksi Angkutan Nataru 2026/2027

Sistem pemantauan dan visualisasi proyeksi mobilitas penumpang serta sarana transportasi nasional selama masa Posko Terpadu Natal 2026 dan Tahun Baru 2027 (Nataru 2026/2027). Dikembangkan dalam rangka kegiatan magang mandiri di Subbidang Pengelolaan Data, Pusat Data dan Teknologi Informasi (Pusdatin), Kementerian Perhubungan Republik Indonesia.

🔗 **Akses Dashboard (Live Demo):** [https://deviandinisastro.github.io/proyeksi-nataru/](https://deviandinisastro.github.io/proyeksi-nataru/)

---

## 1. Latar Belakang & Ruang Lingkup Analisis

Penyelenggaraan Posko Terpadu Nataru memiliki karakteristik mobilitas yang unik dan berbeda dari pola perjalanan harian reguler. Lonjakan perjalanan terpusat pada jendela waktu libur akhir tahun yang relatif singkat, dengan dinamika arus mudik Natal dan arus balik Tahun Baru yang terpisah dalam dua gelombang.

Dashboard ini dirancang khusus untuk memodelkan dan menyajikan perilaku mobilitas pada **18 hari masa posko resmi (H-7 s.d. H+10, 18 Desember 2026 – 4 Januari 2027)** dengan titik jangkar pada Hari Raya Natal (25 Desember 2026). 

Berbeda dari analisis tren harian umum sepanjang tahun berjalan, sistem ini mengolah deret waktu historis 4 tahun masa posko (2022 s.d. 2025) untuk menangkap pola musiman mingguan (*weekly seasonality*) sekaligus mengantisipasi titik jenuh kapasitas sarana transportasi nasional.

---

## 2. Ringkasan Proyeksi Multimoda Nasional 2026/2027

Berdasarkan hasil pemodelan deret waktu *Damped Holt-Winters* ($\phi = 0.85$), total pergerakan penumpang angkutan umum nasional diproyeksikan mencapai **18.462.913 penumpang**, tumbuh **+3,45% (YoY)** dibandingkan realisasi baseline Posko Nataru 2025/2026 sebesar 17.848.066 penumpang.

### Rekapitulasi Proyeksi 5 Moda Transportasi

| Moda Transportasi | Realisasi 2025 (Baseline) | Proyeksi 2026/2027 | Pertumbuhan (YoY) | Pangsa Pasar (*Modal Share*) | Estimasi Sarana Operasi |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Angkutan Udara** | 4.770.215 | **4.880.174** | +2,31% | 26,43% | 44.332 flight |
| **Kereta Api** | 3.869.519 | **4.062.995** | +5,00% | 22,01% | 70.814 KA |
| **Penyeberangan (ASDP)** | 3.792.149 | **3.816.033** | +0,63% | 20,67% | 25.945 trip |
| **Angkutan Jalan (AKAP)** | 3.161.450 | **3.434.854** | +8,65% | 18,60% | 247.027 bus |
| **Angkutan Laut** | 2.254.733 | **2.268.857** | +0,63% | 12,29% | 33.352 kapal |
| **Total Seluruh Moda** | **17.848.066** | **18.462.913** | **+3,45%** | **100,00%** | **421.470 unit** |

---

## 3. Temuan Analitik & Titik Kritis Operasional Posko

1. **Deteksi Gelombang Puncak Ganda (*Twin Peaks*):**
   * **Puncak Arus Mudik (Peak 1):** Diproyeksikan terjadi pada **H-1 (Kamis, 24 Desember 2026)** dengan volume beban nasional sebesar **1.149.332 penumpang/hari**.
   * **Puncak Arus Balik (Peak 2):** Terkonsentrasi pada **H+9 (Minggu, 3 Januari 2027)** dengan volume beban sebesar **1.127.235 penumpang/hari**.
   * **Rasio Lonjakan (*Surge Ratio*):** Rata-rata beban harian nasional berada pada angka **1.025.717 penumpang/hari**, sehingga rasio lonjakan hari puncak mencapai **1,12×** di atas rata-rata beban harian normal.

2. **Dinamika Antarmoda:**
   * Angkutan Udara dan Kereta Api tetap menjadi tulang punggung mobilitas antarkota dengan total kontribusi mencapai **48,44%** dari total penumpang nasional.
   * Angkutan Jalan mencatatkan laju pertumbuhan tahunan tertinggi (**+8,65% YoY**), didorong oleh optimalisasi jaringan jalan tol Trans Jawa dan Trans Sumatera.

3. **Titik Leher (*Bottleneck*) Jalan Tol & Lintas Penyeberangan:**
   * **Jalan Tol Jabodetabek:** Titik pantau utama terpusat pada 4 Gerbang Tol Barrier, dengan beban terberat pada GT Cikampek Utama (arah timur/Trans Jawa) dan GT Kalihurip Utama (arah selatan/Bandung).
   * **Lintas Penyeberangan Utama:** Pemantauan intensif di Pelabuhan Merak–Bakauheni (estimasi 612 ribu penumpang di Merak) dan Ketapang–Gilimanuk (estimasi 454 ribu penumpang di Ketapang), dengan kesiagaan penerapan Pola TBB (Tiba Bongkar Berangkat) saat antrean kendaraan meningkat.

---

## 4. Modul Antarmuka Dashboard

Aplikasi dikemas dalam arsitektur *Single Page Application* (SPA) dengan 6 modul navigasi:

* **Modul 1: Ikhtisar Proyeksi Posko** — Ringkasan indikator makro nasional, kartu metrik 5 moda, kalender 18 hari pemantauan, serta indikator titik kritis tol dan ASDP.
* **Modul 2: Tren Harian Proyeksi** — Visualisasi kurva deret waktu 18 hari komparasi 3 tahun (2024, 2025, dan 2026) dengan filter moda dan pemilahan metrik *Penumpang vs Sarana*.
* **Modul 3: Direktori Simpul Multimoda** — Visualisasi peringkat 10 simpul terpadat per moda serta tabel direktori pencarian 909 simpul pantau terverifikasi lengkap dengan fitur *live search* dan *pagination*.
* **Modul 4: Peta Spasial Proyeksi (Web GIS)** — Pemetaan geografis 909 simpul se-Indonesia berbasis Leaflet.js, dilengkapi visualisasi *Heatmap* Kepadatan Spasial dan filter antarmoda.
* **Modul 5: Titik Kritis Tol & ASDP** — Monitoring pergerakan kendaraan keluar/masuk 4 gerbang tol barrier utama serta detail volume, golongan kendaraan, dan alur penyeberangan feri Merak–Bakauheni dan Ketapang–Gilimanuk.
* **Modul 6: Informasi Sistem & Kamus Rumus** — Dokumentasi transparansi perhitungan matematis ($P_{\text{total}}$, $\bar{P}_{\text{harian}}$, *Modal Share*, YoY, *Surge Ratio*), matriks 12 indikator komparasi multimoda, serta kamus istilah resmi transportasi Kemenhub.

---

## 5. Metodologi Pemodelan Deret Waktu

Peramalan mobilitas posko menggunakan model acuan **Holt-Winters Multiplicative dengan Redaman Tren (*Damped Trend*, $\phi = 0.85$)**:

$$\hat{y}_{t+h|t} = \left[ \ell_t + \sum_{i=1}^{h} \phi^i b_t \right] \times s_{t+h-m}$$

* **Komponen Level ($\ell_t$) & Musiman ($s_t$):** Mengakomodasi variasi siklus mingguan (*periodisitas $m=7$ hari*) untuk membedakan intensitas hari kerja (*weekdays*) dan akhir pekan (*weekends*).
* **Prinsip Redaman Kapasitas Fisik ($\phi = 0.85$):** Dalam operasional transportasi nyata, lonjakan permintaan (*demand*) dibatasi oleh kapasitas fisik sarana dan prasarana (ketersediaan armada bus, slot take-off/landing bandara, gerbong kereta api, dan daya tampung dermaga kapal). Parameter redaman $\phi = 0.85$ menahan ekstrapolasi linier agar proyeksi tetap berada dalam batas daya tampung riil di lapangan.

---

## 6. Spesifikasi Teknologi

* **Frontend & Tampilan:** HTML5, Tailwind CSS (Standar Palet INA Digital & dukungan tema gelap/terang), JavaScript (Vanilla ES6).
* **Engine Visualisasi Data:** Plotly.js (Grafik Deret Waktu Multi-Trace & Bar Chart Interaktif).
* **Engine Geospasial:** Leaflet.js v1.9.4 & Leaflet Heat (Layer Tile CartoDB Positron / Dark Matter).
* **Tipografi & Ikon:** Plus Jakarta Sans Typography, Lucide Icons.
* **Data Processing & Pipeline:** Python 3 (Pandas, NumPy) untuk ekstraksi data mentah log posko (Sheet 1–7) menjadi struktur JSON teroptimasi.
* **Infrastruktur Hosting:** GitHub Pages (Static Web Hosting).

---

## 7. Identitas Penyusun & Hak Cipta

* **Penyusun:** Devi Andini Sastro (NPM: 10123320)  
* **Program Studi:** S1 Sistem Informasi — Universitas Gunadarma  
* **Penugasan:** Program Magang Mandiri, Tim Pengelolaan Data, Pusat Data dan Teknologi Informasi (Pusdatin), Kementerian Perhubungan RI  
* **Mentor Pembimbing:** Hendry Setiadi (Ketua Tim Pengelolaan Data Pusdatin Kemenhub)

> **Catatan Orisinalitas & Hak Cipta:**  
> Proyek dan antarmuka dashboard ini dikembangkan secara mandiri oleh Devi Andini Sastro untuk keperluan pemantauan Posko Nataru di lingkungan Pusdatin Kementerian Perhubungan RI serta pemenuhan luaran magang akademis Universitas Gunadarma. Seluruh analisis, struktur penyajian data, dan kode sumber dilindungi hak cipta orisinalitas penyusun.
