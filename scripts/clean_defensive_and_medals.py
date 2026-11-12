import re

def clean_codebase():
    # 1. Update index.html
    with open('index.html', 'r', encoding='utf-8', newline='') as f:
        html = f.read()

    # Hapus Banner Rekonsiliasi di Modul 3 (Gambar 2)
    start_simpul = html.find('<!-- BANNER REKONSILIASI SIMPUL RESMI KEMENHUB')
    if start_simpul != -1:
        end_simpul = html.find('<!-- Toolbar Modul 3 -->', start_simpul)
        if end_simpul != -1:
            html = html[:start_simpul] + html[end_simpul:]
            print('✅ Banner rekonsiliasi Modul 3 (Gambar 2) berhasil dihapus!')

    # Hapus Badge "Slide 1 & 4 Rekonsiliasi" (Gambar 1)
    badge_target = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gov-navy text-white">Slide 1 & 4 Rekonsiliasi</span>\n                '
    if badge_target in html:
        html = html.replace(badge_target, '')
        print('✅ Badge "Slide 1 & 4 Rekonsiliasi" (Gambar 1) berhasil dihapus!')
    else:
        # Fallback regex if whitespace differs
        html = re.sub(r'<span class="[^"]*">Slide 1 & 4 Rekonsiliasi</span>\s*', '', html)
        print('✅ Badge "Slide 1 & 4 Rekonsiliasi" (Gambar 1) berhasil dihapus via regex!')

    # Hapus Callout Harmonisasi di Modul 6 (Metodologi)
    start_meto = html.find('<!-- Callout Harmonisasi Simpul Pantau Slide 1 vs Slide 4 PPT Kemenhub -->')
    if start_meto != -1:
        # cari penutup tag </div> dari callout ini
        end_meto = html.find('</div>\n\n        </div>\n\n        <!-- 2. FORMULASI METRIK DASAR', start_meto)
        if end_meto != -1:
            html = html[:start_meto] + html[end_meto + 7:] # keep the outer closing </div>
            print('✅ Callout harmonisasi di Modul 6 berhasil dihapus!')
        else:
            # alternative search
            match = re.search(r'<!-- Callout Harmonisasi Simpul Pantau Slide 1 vs Slide 4 PPT Kemenhub -->.*?</div>\s*(?=</div>\s*<!-- 2\. FORMULASI)', html, re.DOTALL)
            if match:
                html = html[:match.start()] + html[match.end():]
                print('✅ Callout harmonisasi di Modul 6 berhasil dihapus via regex!')

    # Bersihkan Slide 3 di Tabel Turnamen Model
    html = html.replace('Metode resmi Slide 3 Kemenhub, akurat di total agregat namun kaku di fluktuasi harian.', 'Metode resmi proporsional harian (PDP), akurat di total agregat namun kaku di fluktuasi harian.')

    # Bump cache buster ke 20261112_1020
    html = html.replace('?v=20261112_1000', '?v=20261112_1020')

    with open('index.html', 'w', encoding='utf-8', newline='') as f:
        f.write(html)

    # 2. Update assets/js/koridor.js
    with open('assets/js/koridor.js', 'r', encoding='utf-8', newline='') as f:
        js = f.read()

    # Ganti comment Slide 1 & 4
    js = js.replace('Menjawab Rekonsiliasi Slide 1 & Slide 4 PPT Laporan Posko Nataru Kemenhub RI', 'Direktori Pemantauan 43 Gerbang Tol & 44 Ruas Arteri Pantauan Nasional')
    
    # Hapus (Slide 4) di kartu Realisasi 2025
    js = js.replace('Total volume kendaraan selama 18 hari masa posko Nataru 2024/2025 (Slide 4).', 'Total volume kendaraan selama 18 hari masa posko Nataru 2024/2025.')

    # Ganti badge medali emoji ke background pembeda nomor 1, 2, 3 tanpa emot
    old_badge_logic = '''    let rankBadge = '';
    if (row.rank === 1) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[11px] shadow-2xs">🥇 1</span>';
    } else if (row.rank === 2) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-extrabold text-[11px] shadow-2xs">🥈 2</span>';
    } else if (row.rank === 3) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-[11px] shadow-2xs">🥉 3</span>';
    } else {
      rankBadge = `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">${row.rank}</span>`;
    }'''

    new_badge_logic = '''    let rankBadge = '';
    if (row.rank === 1) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-xs">1</span>';
    } else if (row.rank === 2) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400 text-white font-extrabold text-xs shadow-xs">2</span>';
    } else if (row.rank === 3) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs shadow-xs">3</span>';
    } else {
      rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs">${row.rank}</span>`;
    }'''

    if old_badge_logic in js:
        js = js.replace(old_badge_logic, new_badge_logic)
        print('✅ Badge nomor 1, 2, 3 tanpa emot berhasil dipasang!')
    else:
        print('⚠️ Pola badge lama tidak cocok persis, mencari via regex...')
        js = re.sub(
            r"if \(row\.rank === 1\) \{[\s\S]*?\} else \{[\s\S]*?\}",
            """if (row.rank === 1) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-xs">1</span>';
    } else if (row.rank === 2) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400 text-white font-extrabold text-xs shadow-xs">2</span>';
    } else if (row.rank === 3) {
      rankBadge = '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs shadow-xs">3</span>';
    } else {
      rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs">${row.rank}</span>`;
    }""",
            js
        )
        print('✅ Badge nomor 1, 2, 3 tanpa emot berhasil diperbarui via regex!')

    with open('assets/js/koridor.js', 'w', encoding='utf-8', newline='') as f:
        f.write(js)

    print('✨ Pembersihan selesai!')

if __name__ == '__main__':
    clean_codebase()
