import json

with open('D:/A - Kuliah/Magang Pusdatin/proyeksi-nataru-dss/data/nataru_data.json', encoding='utf-8') as f:
    d = json.load(f)

print("=== MAKRO PENUMPANG ===")
for m in d['makro_penumpang']:
    print(f"Moda: {m['moda']:16} | 2025: {m['realisasi_2025']:,} | 2026: {m['proyeksi_2026']:,} | YoY: {m['pertumbuhan_pct']:+.2f}% | Share: {m['porsi_share_pct']:.2f}%")

print("\n=== MAKRO SARANA ===")
for m in d['makro_sarana']:
    print(f"Moda: {m['moda']:16} | 2025: {m['realisasi_2025']:,} | 2026: {m['proyeksi_2026']:,} | YoY: {m['pertumbuhan_pct']:+.2f}%")

print("\n=== TURNAMEN MAPE RINGKASAN JUARA ===")
for j in d['turnamen_mape']['ringkasan_juara']:
    print(j)

print("\n=== EARLY WARNING CALENDAR ===")
if 'early_warning_calendar' in d:
    print(d['early_warning_calendar'])
