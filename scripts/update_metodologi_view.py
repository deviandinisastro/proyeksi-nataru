import re

INDEX_PATH = r"d:\A - Kuliah\Magang Pusdatin\proyeksi-nataru-dss\index.html"

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Verify section exists
start_marker = '<!-- VIEW 6: METODOLOGI & ARSITEKTUR DSS -->'
end_marker = '</section>'

pos_start = content.find(start_marker)
if pos_start == -1:
    print("Error: start_marker not found")
    exit(1)

pos_section_open = content.find('<section id="view-metodologi"', pos_start)
if pos_section_open == -1:
    print("Error: section opening tag not found")
    exit(1)

pos_section_close = content.find('</section>', pos_section_open)
if pos_section_close == -1:
    print("Error: section closing tag not found")
    exit(1)

pos_end = pos_section_close + len('</section>')

new_section_html = '''<!-- VIEW 6: METODOLOGI & ARSITEKTUR DSS -->
      <section id="view-metodologi" class="view-section hidden space-y-6">
        <!-- Banner Kerangka Sistem Informasi & Rekayasa Data -->
        <div class="p-5 bg-white dark:bg-slate-900 border border-gov-border dark:border-slate-800 rounded-xl shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-gov-azure_light text-gov-azure border border-blue-200 dark:border-blue-900">
                Standar Pusdatin Kemenhub RI
              </span>
              <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                Arsitektur Sistem Informasi & Rekayasa Data
              </span>
              <span class="text-xs text-gov-muted dark:text-slate-400 hidden sm:inline">&bull; Kerangka Decision Support System (DSS)</span>
            </div>
            <span class="text-[11px] font-semibold text-gov-muted dark:text-slate-400">Posko Terpadu Nataru 2026/2027</span>
          </div>
          <h2 class="text-base sm:text-lg font-extrabold text-gov-text dark:text-slate-100">
            Informasi Sistem, Metodologi Analisis & Kamus Rumus Proyeksi Nataru 2026/2027
          </h2>
          <p class="text-xs text-gov-muted dark:text-slate-400 mt-1 max-w-4xl leading-relaxed">
            Dokumentasi komprehensif transparansi data, formulasi matematis, pemilihan model deret waktu Damped Holt-Winters, matriks 12 indikator kinerja posko, arsitektur 3-tier DSS, serta glosarium resmi Kementerian Perhubungan RI.
          </p>

          <!-- Navigasi Lompat Cepat (Quick Jump Pills) -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div class="text-[10px] font-bold uppercase tracking-wider text-gov-muted dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <i data-lucide="compass" class="w-3.5 h-3.5 text-gov-azure dark:text-sky-400"></i>
              Lompat Cepat ke Bagian Dokumen:
            </div>
            <div class="flex flex-wrap gap-2 text-xs">
              <a href="#sec-integritas" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="database" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                1. Integritas Dataset
              </a>
              <a href="#sec-metrik-dasar" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="calculator" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                2. Metrik Dasar
              </a>
              <a href="#sec-modal-share" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="pie-chart" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                3. Modal Share & YoY
              </a>
              <a href="#sec-analisis-puncak" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="trending-up" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                4. Analisis Puncak & Surge
              </a>
              <a href="#sec-model-damped" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="cpu" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                5. Model Damped HW
              </a>
              <a href="#sec-matriks-12" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="layers" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                6. Matriks 12 Indikator
              </a>
              <a href="#sec-arsitektur-dss" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="network" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                7. Arsitektur DSS 3-Tier
              </a>
              <a href="#sec-glosarium" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-gov-azure_light text-slate-700 hover:text-gov-azure dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-sky-300 transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <i data-lucide="book-marked" class="w-3 h-3 text-gov-azure dark:text-sky-400"></i>
                8. Glosarium Singkatan
              </a>
            </div>
          </div>
        </div>

        <!-- 1. KOTAK INTEGRITAS DATASET -->
        <div id="sec-integritas" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="database" class="w-4 h-4 text-gov-navy dark:text-sky-400"></i>
                1. Integritas Dataset & Cakupan Operasional Posko Nataru 2026/2027
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Parameter agregasi resmi, cakupan waktu, dan batas geografis pemantauan posko terpadu nasional</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
              Terverifikasi Pusdatin
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Card 1: Total Volume -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Proyeksi Nasional</span>
                <div class="text-xl font-extrabold text-gov-navy dark:text-sky-300 tracking-tight num-tabular">18.462.913</div>
                <div class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span>+3,45% YoY</span>
                  <span class="text-slate-400 dark:text-slate-500 font-normal">vs 17.848.066 (2025)</span>
                </div>
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 leading-relaxed">
                Agregasi proyeksi 5 moda transportasi selama 18 hari operasional posko dengan prinsip <strong>Zero Discrepancy</strong> tanpa selisih pembulatan.
              </p>
            </div>

            <!-- Card 2: Durasi Posko -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Durasi Operasional</span>
                <div class="text-xl font-extrabold text-gov-navy dark:text-sky-300 tracking-tight num-tabular">18 Hari Posko</div>
                <div class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  H-7 s/d H+10 (18 Des 2026 – 4 Jan 2027)
                </div>
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 leading-relaxed">
                Mencakup puncak mudik Natal pada <strong>H-1 (24 Des 2026)</strong> dan puncak arus balik Tahun Baru pada <strong>H+9 (3 Jan 2027)</strong>.
              </p>
            </div>

            <!-- Card 3: Simpul Pantau -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Simpul Multimoda Spasial</span>
                <div class="text-xl font-extrabold text-gov-navy dark:text-sky-300 tracking-tight num-tabular">909 Simpul</div>
                <div class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  100% Terpetakan Geospasial GIS
                </div>
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 leading-relaxed">
                213 Bandara, 183 Stasiun KA, 201 Pelabuhan Laut, 157 Terminal Bus, dan 155 Pelabuhan ASDP dengan koordinat lintang/bujur terverifikasi.
              </p>
            </div>

            <!-- Card 4: Moda & Koridor -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Cakupan Moda & Titik Kritis</span>
                <div class="text-xl font-extrabold text-gov-navy dark:text-sky-300 tracking-tight num-tabular">5 Moda + Tol & ASDP</div>
                <div class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  4 Gerbang Tol & 3 Lintas ASDP
                </div>
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 leading-relaxed">
                Integrasi menyeluruh 5 moda transportasi ditambah pemantauan intensif titik rawan antrean gerbang tol barrier dan dermaga penyeberangan.
              </p>
            </div>
          </div>
        </div>

        <!-- 2. FORMULASI METRIK DASAR PERGERAKAN -->
        <div id="sec-metrik-dasar" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="calculator" class="w-4 h-4 text-gov-azure dark:text-sky-400"></i>
                2. Formulasi Metrik Dasar Pergerakan Penumpang
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Perhitungan total volume kumulatif pergerakan dan rata-rata intensitas harian operasional posko</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-gov-navy dark:text-sky-300 border border-blue-200 dark:border-blue-900">
              Metrik Dasar
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Box Rumus 1: P_total -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Total Volume Pergerakan Simpul & Moda</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Penjumlahan volume kedatangan dan keberangkatan penumpang</p>
              
              <div class="font-mono text-center text-sm font-bold text-gov-navy dark:text-sky-300 py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                P<sub>total</sub> = P<sub>datang</sub> + P<sub>berangkat</sub>
              </div>

              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Total pergerakan pada suatu simpul atau moda transportasi merupakan akumulasi seluruh penumpang yang tiba di tujuan dan bertolak dari simpul asal perjalanan selama 18 hari pemantauan.
              </p>
            </div>

            <!-- Box Rumus 2: Rata-Rata Harian -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Rata-Rata Volume Harian Posko (P̄<sub>harian</sub>)</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Intensitas beban harian normal selama 18 hari masa posko</p>
              
              <div class="font-mono text-center text-sm font-bold text-gov-navy dark:text-sky-300 py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                P̄<sub>harian</sub> = &Sigma; P<sub>t</sub> / N = 18.462.913 / 18 = 1.025.717 orang/hari
              </div>

              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Rata-rata volume harian diperoleh dengan membagi total kumulatif 18 hari proyeksi dengan jumlah hari operasional posko (N = 18). Menjadi garis dasar (baseline) pembanding beban arus puncak.
              </p>
            </div>
          </div>

          <!-- Tabel Notasi Simbol Metrik Dasar -->
          <div class="overflow-x-auto pt-2">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th class="py-2.5 px-3 w-28">Simbol</th>
                  <th class="py-2.5 px-3 w-48">Nama Variabel</th>
                  <th class="py-2.5 px-3 w-28">Satuan</th>
                  <th class="py-2.5 px-3 w-40">Nilai / Rentang</th>
                  <th class="py-2.5 px-3">Keterangan Operasional Transportasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P<sub>total</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Total Penumpang Proyeksi</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang</td>
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-300">18.462.913</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Akumulasi pergerakan 5 moda transportasi selama 18 hari masa posko</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P<sub>datang</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Penumpang Tiba / Masuk</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang</td>
                  <td class="py-2 px-3 text-slate-500">Disagregasi simpul</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Volume penumpang yang mendarat/turun di simpul kedatangan</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P<sub>berangkat</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Penumpang Bertolak / Keluar</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang</td>
                  <td class="py-2 px-3 text-slate-500">Disagregasi simpul</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Volume penumpang yang berangkat dari simpul asal keberangkatan</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P̄<sub>harian</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Rata-Rata Harian Nasional</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang/hari</td>
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-300">1.025.717</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Beban pergerakan rata-rata per hari operasional sebagai tolok ukur stabil</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">N</td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Jumlah Hari Pemantauan</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">hari</td>
                  <td class="py-2 px-3 font-mono">18</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Masa pemantauan posko terpadu: H-7 (18 Des 2026) s/d H+10 (4 Jan 2027)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. PANGSA PASAR (MODAL SHARE) & LAJU PERTUMBUHAN (YOY) -->
        <div id="sec-modal-share" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-4 h-4 text-gov-azure dark:text-sky-400"></i>
                3. Formulasi Pangsa Pasar (Modal Share) & Laju Pertumbuhan Tahunan (YoY)
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Metrik distribusi antarmoda transportasi dan laju perubahan volume terhadap baseline historis</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-gov-navy dark:text-sky-300 border border-blue-200 dark:border-blue-900">
              Distribusi Antarmoda
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Box Rumus 1: Modal Share -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Pangsa Pasar Antar-Moda (Modal Share)</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Proporsi kontribusi volume pergerakan tiap moda terhadap total nasional</p>
              
              <div class="font-mono text-center text-sm font-bold text-gov-navy dark:text-sky-300 py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                MS<sub>m</sub> = ( P<sub>m</sub> / &Sigma; P<sub>k</sub> ) &times; 100%
              </div>

              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Mengukur preferensi mobilitas masyarakat antar-5 moda utama. Angkutan Udara memimpin pangsa pasar sebesar <strong>26,43%</strong>, disusul Kereta Api <strong>22,01%</strong>, Penyeberangan ASDP <strong>20,67%</strong>, Angkutan Jalan <strong>18,60%</strong>, dan Angkutan Laut <strong>12,29%</strong>.
              </p>
            </div>

            <!-- Box Rumus 2: YoY Growth -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Laju Pertumbuhan Tahunan (Year-on-Year / YoY)</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Persentase pertumbuhan proyeksi 2026 terhadap realisasi baseline 2025</p>
              
              <div class="font-mono text-center text-sm font-bold text-gov-navy dark:text-sky-300 py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                YoY<sub>m</sub> = [ ( P<sub>m,2026</sub> - P<sub>m,2025</sub> ) / P<sub>m,2025</sub> ] &times; 100%
              </div>

              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Total proyeksi nasional tumbuh <strong>+3,45% YoY</strong> (dari 17.848.066 menjadi 18.462.913). Pertumbuhan tertinggi terjadi pada Angkutan Jalan (<strong>+8,65%</strong>) dan Kereta Api (<strong>+5,00%</strong>).
              </p>
            </div>
          </div>

          <!-- Tabel Notasi Simbol Modal Share & YoY -->
          <div class="overflow-x-auto pt-2">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th class="py-2.5 px-3 w-28">Simbol</th>
                  <th class="py-2.5 px-3 w-48">Nama Variabel</th>
                  <th class="py-2.5 px-3 w-28">Satuan</th>
                  <th class="py-2.5 px-3 w-40">Nilai / Rentang</th>
                  <th class="py-2.5 px-3">Keterangan Operasional Transportasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">MS<sub>m</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Pangsa Pasar Moda <em>m</em></td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">%</td>
                  <td class="py-2 px-3 font-mono">12,29% &ndash; 26,43%</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Pangsa pasar moda transportasi spesifik (total 5 moda = 100,00%)</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P<sub>m,2026</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Volume Proyeksi Moda 2026</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang</td>
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-300">2,27 jt &ndash; 4,88 jt</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Volume proyeksi resmi masa posko Nataru 2026/2027 per moda</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P<sub>m,2025</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Realisasi Baseline Posko 2025</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang</td>
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-300">17.848.066 (Total)</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Data aktual hasil evaluasi Posko Terpadu Nataru 2025/2026 sebagai pembanding</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">YoY<sub>m</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Laju Pertumbuhan Tahunan</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">%</td>
                  <td class="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">+0,63% &ndash; +8,65%</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Tingkat kenaikan mobilitas masyarakat per moda pada periode liburan akhir tahun</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. ANALISIS HARI PUNCAK & LONJAKAN (SURGE FACTOR) -->
        <div id="sec-analisis-puncak" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="trending-up" class="w-4 h-4 text-gov-azure dark:text-sky-400"></i>
                4. Formulasi Hari Puncak & Rasio Lonjakan Beban (Surge Ratio)
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Identifikasi waktu beban kritis dan kalkulasi kelipatan lonjakan penumpang terhadap volume median</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
              Analisis Beban Puncak
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Box Rumus 1: Surge Ratio -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Faktor Rasio Lonjakan (Surge Ratio)</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Kelipatan volume hari puncak terhadap nilai tengah volume harian</p>
              
              <div class="font-mono text-center text-sm font-bold text-gov-navy dark:text-sky-300 py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                Surge Ratio = P<sub>puncak</sub> / P<sub>median</sub> = 1.140.758 / 1.025.717 &asymp; 1,11&times;
              </div>

              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Surge Ratio sebesar <strong>1,11&times;</strong> menunjukkan beban hari puncak nasional berada 11% di atas beban harian median. Rasio lonjakan tertinggi dialami moda Kereta Api (<strong>1,15&times;</strong>) dan Angkutan Udara (<strong>1,14&times;</strong>).
              </p>
            </div>

            <!-- Box Rumus 2: Nomenklatur Hari Operasional -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Nomenklatur Hari Operasional Posko (&Delta;Hari)</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Standardisasi hari kalender terhadap titik jangkar Hari H Natal</p>
              
              <div class="font-mono text-center text-sm font-bold text-gov-navy dark:text-sky-300 py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                &Delta;Hari = Tanggal Operasional &minus; 25 Desember 2026
              </div>

              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Standardisasi Kemenhub menetapkan 25 Des 2026 sebagai <strong>Hari H</strong>. Periode operasional posko mencakup <strong>H-7 (18 Des)</strong> hingga <strong>H+10 (4 Jan 2027)</strong>. Puncak Mudik: H-1 (24 Des), Puncak Balik: H+9 (3 Jan 2027).
              </p>
            </div>
          </div>

          <!-- Tabel Notasi Simbol Surge & Hari Puncak -->
          <div class="overflow-x-auto pt-2">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th class="py-2.5 px-3 w-28">Simbol</th>
                  <th class="py-2.5 px-3 w-48">Nama Variabel</th>
                  <th class="py-2.5 px-3 w-28">Satuan</th>
                  <th class="py-2.5 px-3 w-40">Nilai / Rentang</th>
                  <th class="py-2.5 px-3">Keterangan Operasional Transportasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">Surge Ratio</td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Faktor Lonjakan Puncak</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">pengali (&times;)</td>
                  <td class="py-2 px-3 font-mono font-bold text-amber-700 dark:text-amber-400">1,08&times; &ndash; 1,15&times;</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Tingkat lonjakan kapasitas sarana yang wajib diantisipasi operator pada hari puncak</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P<sub>puncak,mudik</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Volume Puncak Arus Mudik</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang/hari</td>
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-300">1.140.758</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Beban arus mudik tertinggi nasional, terjadi serentak pada H-1 (Kamis, 24 Des 2026)</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">P<sub>puncak,balik</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Volume Puncak Arus Balik</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">orang/hari</td>
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-300">1.127.235</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Beban arus balik liburan akhir tahun, terkonsentrasi pada H+9 (Minggu, 3 Jan 2027)</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">H</td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Titik Jangkar Hari H Posko</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">tanggal</td>
                  <td class="py-2 px-3 font-mono">25 Des 2026</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Hari Raya Natal sebagai titik pembagi masa arus mudik (H-n) dan arus balik (H+n)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. MODEL DERET WAKTU TERPILIH: DAMPED HOLT-WINTERS -->
        <div id="sec-model-damped" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="cpu" class="w-4 h-4 text-gov-azure dark:text-sky-400"></i>
                5. Model Deret Waktu Terpilih: Holt-Winters Multiplicative Damped (&phi; = 0.85)
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Landasan sains data pemilihan model resmi proyeksi mobilitas nasional Nataru Pusdatin Kemenhub</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
              Model Acuan Posko
            </span>
          </div>

          <!-- Penjelasan Mengapa Holt-Winters Damped Terpilih -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">Mengapa Holt-Winters Damped Dipilih?</span>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  Pusdatin Kemenhub menetapkan model <strong>Holt-Winters Multiplicative dengan Redaman Tren (Damped Trend)</strong> sebagai model acuan resmi proyeksi Nataru 2026/2027. Model ini mampu memodelkan tiga komponen kunci pergerakan liburan: tingkat volume dasar (level), dinamika pertumbuhan (trend), serta siklus lonjakan mingguan (seasonality 7-hari).
                </p>
              </div>
              <div class="text-[10px] font-semibold text-gov-azure dark:text-sky-400 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                Sifat Adaptif: Menangkap siklus libur akhir pekan & pergeseran cuti bersama
              </div>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">Prinsip Batas Kapasitas Fisik (&phi; = 0.85)</span>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  Dalam transportasi nyata, permintaan mobilitas (demand) tidak dapat bertumbuh secara linier tak terbatas karena tertahan oleh <strong>kapasitas fisik maksimum sarana dan prasarana</strong> (jumlah armada bus, slot take-off/landing bandara, kapasitas gerbong KA, dan daya tampung dermaga kapal ferry). Parameter redaman (&phi; = 0.85) mencegah <em>over-forecasting</em> yang tidak realistis di lapangan.
                </p>
              </div>
              <div class="text-[10px] font-semibold text-amber-700 dark:text-amber-400 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                Prinsip Operasional: Proyeksi terkendali sesuai daya tampung infrastruktur riil
              </div>
            </div>
          </div>

          <!-- Formula Holt-Winters Damped Display -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">Formulasi Matematis Peramalan Damped Holt-Winters</span>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Persamaan proyeksi horizon <em>h</em> hari ke depan dengan redaman kemiringan tren geometris</p>
            
            <div class="font-mono text-center text-sm font-bold text-gov-navy dark:text-sky-300 py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto">
              &#375;<sub>t+h|t</sub> = [ &ell;<sub>t</sub> + (&phi; + &phi;<sup>2</sup> + ... + &phi;<sup>h</sup>) b<sub>t</sub> ] &times; s<sub>t+h&minus;m</sub>
            </div>
          </div>

          <!-- Tabel Notasi Parameter & Komponen Model -->
          <div class="overflow-x-auto pt-2">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th class="py-2.5 px-3 w-28">Parameter</th>
                  <th class="py-2.5 px-3 w-48">Komponen Model</th>
                  <th class="py-2.5 px-3 w-28">Nilai / Rentang</th>
                  <th class="py-2.5 px-3">Makna Matematis & Pengaruh Operasional Transportasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">&ell;<sub>t</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Tingkat Dasar (Level)</td>
                  <td class="py-2 px-3 font-mono">Variabel waktu</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Estimasi intensitas dasar rata-rata volume penumpang pada hari ke-<em>t</em></td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">b<sub>t</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Kemiringan Tren (Trend Slope)</td>
                  <td class="py-2 px-3 font-mono">Variabel waktu</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Laju kenaikan atau penurunan volume pergerakan antarhari operasional</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">s<sub>t</sub></td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Indeks Musiman (Seasonality)</td>
                  <td class="py-2 px-3 font-mono">Multiplikatif</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Faktor pengali siklus mingguan (<em>m=7</em>), membedakan dinamika hari kerja vs akhir pekan</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">&phi;</td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Faktor Redaman (Damping Factor)</td>
                  <td class="py-2 px-3 font-mono font-bold text-amber-700 dark:text-amber-400">&phi; = 0.85</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Koefisien peredam (0 &lt; &phi; &lt; 1) yang menahan tren linier agar tetap berada dalam kapasitas sarana</td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-2 px-3 font-mono font-bold text-gov-navy dark:text-sky-400">&alpha;, &beta;, &gamma;</td>
                  <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">Bobot Pemulusan (Smoothing Weights)</td>
                  <td class="py-2 px-3 font-mono">0 &lt; weight &lt; 1</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-300">Bobot optimasi empiris data historis yang mengontrol kecepatan pembaruan estimasi model</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. TABEL MATRIKS 12 INDIKATOR KOMPARASI KINERJA MULTIMODA -->
        <div id="sec-matriks-12" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="layers" class="w-4 h-4 text-gov-azure dark:text-sky-400"></i>
                6. Matriks Rekapitulasi Komparasi 12 Indikator Multimoda Nasional 2026/2027
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Perbandingan komprehensif performa proyeksi, pangsa pasar, beban puncak, dan dinamika pelayanan 5 moda</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gov-azure_light text-gov-azure border border-blue-200 dark:border-blue-900">
              12 Indikator Kuantitatif
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th class="py-2.5 px-3">Indikator Kuantitatif</th>
                  <th class="py-2.5 px-3 text-right">Angkutan Jalan</th>
                  <th class="py-2.5 px-3 text-right">Kereta Api</th>
                  <th class="py-2.5 px-3 text-right">Angkutan Udara</th>
                  <th class="py-2.5 px-3 text-right">Penyeberangan (ASDP)</th>
                  <th class="py-2.5 px-3 text-right">Angkutan Laut</th>
                  <th class="py-2.5 px-3 text-right bg-blue-50/50 dark:bg-blue-950/40 text-gov-navy dark:text-sky-400">Total Seluruh Moda</th>
                </tr>
              </thead>
              <tbody id="metodologi-indikator-body">
                <!-- Diisi dinamis oleh metodologi.js -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 7. ARSITEKTUR DSS TIGA TINGKAT (THREE-TIER DSS ARCHITECTURE) -->
        <div id="sec-arsitektur-dss" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="network" class="w-4 h-4 text-gov-navy dark:text-sky-400"></i>
                7. Arsitektur Tiga Tingkat Sistem Informasi Penunjang Keputusan (Three-Tier DSS)
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Kerangka rekayasa perangkat lunak dan aliran data dari berkas mentah hingga antarmuka eksekutif</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-gov-navy dark:text-sky-300 border border-blue-200 dark:border-blue-900">
              Sistem Informasi
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <!-- Tier 1: Ingestion & ETL -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-gov-navy dark:text-sky-300 flex items-center justify-center font-bold text-xs mb-3">
                  T1
                </div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Data Ingestion & ETL Pipeline</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Tingkat Ekstraksi, Transformasi, dan Normalisasi Data</p>
                <ul class="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Ekstraksi data log harian Posko Kemenhub (Sheet 1 s/d Sheet 7).</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Pembersihan toponimi nama simpul (penghapusan tag birokrasi & format Title Case).</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Geocoding presisi lintang-bujur untuk 909 simpul pantau nasional.</span>
                  </li>
                </ul>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[10px] font-semibold text-gov-muted dark:text-slate-400">
                Teknologi: Python Data Pipeline (build_data.py)
              </div>
            </div>

            <!-- Tier 2: Analytic Engine -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs mb-3">
                  T2
                </div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Analytic & Processing Engine</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Tingkat Pengolahan Analisis & Pemodelan Posko</p>
                <ul class="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Distribusi deret waktu 18 hari operasional posko (H-7 s/d H+10).</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Perhitungan faktor lonjakan beban puncak (Surge Ratio) dan laju pertumbuhan YoY.</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Estimasi kepadatan spasial (Kernel Density) untuk deteksi titik jenuh.</span>
                  </li>
                </ul>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[10px] font-semibold text-gov-muted dark:text-slate-400">
                Logika: Normalisasi Kapasitas Nyata (Damped HW Concept)
              </div>
            </div>

            <!-- Tier 3: Presentation Tier -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs mb-3">
                  T3
                </div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Executive Presentation Tier</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Tingkat Penyajian Antarmuka Keputusan Interaktif</p>
                <ul class="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Single Page Application (SPA) responsif tanpa ketergantungan framework berat.</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Peta Geospasial Interaktif Leaflet GIS dengan kontrol utilitas terintegrasi.</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"></i>
                    <span>Visualisasi Plotly.js deret waktu & matriks dengan aksesibilitas mode gelap/terang.</span>
                  </li>
                </ul>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[10px] font-semibold text-gov-muted dark:text-slate-400">
                Antarmuka: HTML5, Tailwind CSS, Leaflet GIS, Plotly.js
              </div>
            </div>
          </div>

          <!-- 4 Pilar Penjaminan Mutu & Rekonsiliasi Data -->
          <div class="pt-2">
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
                Prinsip Penjaminan Mutu & Rekonsiliasi Data (Data Quality Assurance)
              </h4>
              <span class="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">4 Pilar Validasi</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span class="font-extrabold text-gov-navy dark:text-sky-400 text-sm block mb-1">1. Zero Discrepancy</span>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Total proyeksi nasional <strong>18.462.913 penumpang</strong> terdistribusi 100% konsisten ke 5 moda transportasi tanpa selisih pembulatan di seluruh modul.
                </p>
              </div>

              <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span class="font-extrabold text-gov-navy dark:text-sky-400 text-sm block mb-1">2. 909 Simpul Spasial</span>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Harmonisasi 213 Bandara, 183 Stasiun KA, 201 Pelabuhan Laut, 157 Terminal Bus, dan 155 Pelabuhan Penyeberangan dengan titik koordinat terverifikasi.
                </p>
              </div>

              <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span class="font-extrabold text-gov-navy dark:text-sky-400 text-sm block mb-1">3. Nomenklatur Baku</span>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Standardisasi penamaan simpul pantau nasional dan pembersihan tag penamaan administratif agar rapi dan mudah diidentifikasi para pejabat posko.
                </p>
              </div>

              <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span class="font-extrabold text-gov-navy dark:text-sky-400 text-sm block mb-1">4. Titik Kritis Terpisah</span>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pemisahan monitoring khusus untuk 4 Gerbang Tol Utama Jabodetabek dan 3 Lintas Penyeberangan Strategis ASDP berbasis lembar resmi posko.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. GLOSARIUM RESMI TRANSPORTASI PUSDATIN KEMENHUB -->
        <div id="sec-glosarium" class="scroll-mt-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3 pb-3 border-b border-gov-border dark:border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-gov-text dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="book-marked" class="w-4 h-4 text-gov-navy dark:text-sky-400"></i>
                8. Kamus Istilah Resmi & Glosarium Transportasi Pusdatin Kemenhub
              </h3>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">Panduan terminologi operasional posko dan sains data transportasi multimoda nasional</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Standar Pusdatin
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th class="py-2.5 px-3 w-36">Istilah Resmi</th>
                  <th class="py-2.5 px-3 w-72">Kepanjangan / Nama Baku</th>
                  <th class="py-2.5 px-3">Definisi & Makna Operasional Lapangan</th>
                </tr>
              </thead>
              <tbody id="metodologi-glosarium-body">
                <!-- Diisi dinamis oleh metodologi.js -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Atribusi Akademik & Kelembagaan -->
        <div class="p-5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-gov-border dark:border-slate-800 text-xs text-gov-muted dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="font-bold text-gov-text dark:text-slate-200 block mb-1">Atribusi Kelembagaan & Kolaborasi Penelitian:</span>
            <span class="leading-relaxed">Pengolahan data empiris dan peramalan multimoda dilaksanakan di Subbidang Pengelolaan Data, Pusdatin Kemenhub RI bersama Novi Rahmawati (Statistisi) dan Wildan Nazhif (Statistisi). Arsitektur Sistem Informasi, Rekayasa Antarmuka Analitik, Integrasi Spasial GIS, dan Visualisasi Aliran Koridor dikembangkan oleh Devi Andini Sastro (Universitas Gunadarma).</span>
          </div>
        </div>
      </section>'''

updated_content = content[:pos_start] + new_section_html + content[pos_end:]

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(updated_content)

print(f"Success! Replaced view-metodologi in {INDEX_PATH}")
