import json

with open('D:/A - Kuliah/Magang Pusdatin/proyeksi-nataru-dss/data/nataru_data.json', encoding='utf-8') as f:
    d = json.load(f)

hp = d['harian_penumpang']['data']
for mode, records in hp.items():
    mudik_recs = [r for r in records if r['hari_posko'] in ['H-7','H-6','H-5','H-4','H-3','H-2','H-1','H']]
    balik_recs = [r for r in records if r['hari_posko'] in ['H+1','H+2','H+3','H+4','H+5','H+6','H+7','H+8','H+9','H+10']]
    peak_m = max(mudik_recs, key=lambda x: x['vol_2026'])
    peak_b = max(balik_recs, key=lambda x: x['vol_2026'])
    median_vol = sorted([r['vol_2026'] for r in records])[len(records)//2]
    surge = peak_m['vol_2026'] / median_vol if median_vol > 0 else 0
    print(f"Moda: {mode}")
    print(f"  Peak Mudik: {peak_m['hari_posko']} ({peak_m['hari_pekan']}) - {peak_m['vol_2026']:,} orang")
    print(f"  Peak Balik: {peak_b['hari_posko']} ({peak_b['hari_pekan']}) - {peak_b['vol_2026']:,} orang")
    print(f"  Surge Ratio: {surge:.2f}x\n")
