with open('d:/A - Kuliah/Magang Pusdatin/proyeksi-nataru-dss/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('7 Metode', '5 Moda')
text = text.replace('span class="text-[9px] text-slate-400 block">Model<', 'span class="text-[9px] text-slate-400 block">Moda<')
text = text.replace('title="Matriks Indikator & Metodologi Model"', 'title="Informasi Sistem, Metodologi Analisis & Kamus Rumus"')

with open('d:/A - Kuliah/Magang Pusdatin/proyeksi-nataru-dss/index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated index.html successfully!')
