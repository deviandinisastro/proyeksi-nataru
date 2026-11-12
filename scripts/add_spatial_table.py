import os

index_path = r"d:\A - Kuliah\Magang Pusdatin\proyeksi-nataru-dss\index.html"
with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

# Normalize newlines
html_norm = html.replace("\r\n", "\n")

target_insertion = """          </div>

        </div>

      </section>"""

table_html = """          </div>

        </div>

        <!-- TABEL DIREKTORI GEOSPASIAL SIMPUL MULTIMODA (1.212 SIMPUL) -->
        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gov-border dark:border-slate-800 shadow-xs space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2">
                <i data-lucide="map" class="w-4 h-4 text-gov-navy dark:text-sky-400"></i>
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Direktori Geospasial Simpul Multimoda Terpetakan
                </h3>
                <span id="gis-table-counter" class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                  1.212 Simpul
                </span>
              </div>
              <p class="text-[11px] text-gov-muted dark:text-slate-400 mt-0.5">
                Basis data koordinat geografis resmi Pusdatin Kemenhub RI yang terintegrasi langsung dengan kanvas peta interaktif.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <div class="relative w-full sm:w-64">
                <i data-lucide="search" class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  id="gis-search-input" 
                  placeholder="Cari simpul, provinsi..." 
                  class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-gov-navy focus:bg-white"
                />
              </div>
            </div>
          </div>

          <!-- Tabel Responsif dengan Scroll Vertikal yang Nyaman -->
          <div class="overflow-x-auto max-h-[460px] overflow-y-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th class="py-2.5 px-3 text-center w-12">Rank</th>
                  <th class="py-2.5 px-3">Nama Simpul Pantau</th>
                  <th class="py-2.5 px-3">Moda</th>
                  <th class="py-2.5 px-3">Provinsi</th>
                  <th class="py-2.5 px-3 text-center">Koordinat GIS</th>
                  <th class="py-2.5 px-3 text-right">Realisasi 2025</th>
                  <th class="py-2.5 px-3 text-right">Proyeksi 2026</th>
                  <th class="py-2.5 px-3 text-center">YoY</th>
                  <th class="py-2.5 px-3 text-right">Pangsa (%)</th>
                  <th class="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody id="gis-table-body" class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                <!-- Diisi dinamis oleh map_gis.js -->
              </tbody>
            </table>
          </div>
        </div>

      </section>"""

# Find location in view-map
idx_view_map = html_norm.find('id="view-map"')
idx_end_map = html_norm.find('</section>', idx_view_map)

# Replace the closing of view-map
sub = html_norm[idx_view_map:idx_end_map+10]
if "<!-- TABEL DIREKTORI GEOSPASIAL" not in sub:
    # Find last </div>\n\n      </section>
    last_div = sub.rfind("</div>")
    # replace
    sub_new = sub[:last_div+6] + "\n\n" + table_html[target_insertion.find("<!-- TABEL DIREKTORI"):]
    html_norm = html_norm[:idx_view_map] + sub_new + html_norm[idx_end_map+10:]
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(html_norm)
    print("SUCCESS: index.html updated with spatial table!")
else:
    print("Spatial table already present in index.html")
