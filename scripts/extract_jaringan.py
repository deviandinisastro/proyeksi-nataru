import pandas as pd
import json
import os

base_dir = r"d:\A - Kuliah\Magang Pusdatin"
f_tol = os.path.join(base_dir, "TOL/Tol - Sarana Transportasi/nataru_2025_sarana_tol_Total Kendaraan_Titik_Pantauan_Nasional.csv")
f_art = os.path.join(base_dir, "ARTERI/Arteri - Sarana Transportasi/nataru_2025_sarana_arteri_Total Kendaraan_Titik_Pantauan_Nasional.csv")

# 1. Parse Tol (43 Gates)
df_tol = pd.read_csv(f_tol)
tol_items = []
for idx, r in df_tol.iloc[2:].iterrows():
    if pd.isna(r['Lokasi']): continue
    val_str = str(r['Total']).replace(',', '').strip()
    vol_2025 = 0
    if val_str and val_str != 'nan':
        vol_2025 = int(float(val_str))
    
    vol_2026 = int(round(vol_2025 * 1.167584)) # Damped HW growth +16.76%
    
    nama_raw = str(r['Lokasi']).strip()
    prov = 'Nasional'
    if '(' in nama_raw and ')' in nama_raw:
        prov = nama_raw[nama_raw.rfind('(')+1:nama_raw.rfind(')')].strip()
        nama_clean = nama_raw[:nama_raw.rfind('(')].strip()
    else:
        nama_clean = nama_raw
        
    tol_items.append({
        'no_asli': int(r['No']) if str(r['No']).isdigit() else len(tol_items) + 1,
        'nama': nama_clean,
        'nama_lengkap': nama_raw,
        'provinsi': prov,
        'realisasi_2025': vol_2025,
        'proyeksi_2026': vol_2026,
        'pertumbuhan_pct': 16.76 if vol_2025 > 0 else 0.0
    })

# Urutkan berdasarkan volume realisasi 2025 tertinggi
tol_items.sort(key=lambda x: x['realisasi_2025'], reverse=True)
tot_tol_2025 = sum(x['realisasi_2025'] for x in tol_items)
for i, item in enumerate(tol_items):
    item['rank'] = i + 1
    item['share_pct'] = round((item['realisasi_2025'] / tot_tol_2025) * 100, 2) if tot_tol_2025 > 0 else 0.0

# 2. Parse Arteri (44 Locations)
df_art = pd.read_csv(f_art)
art_items = []
for idx, r in df_art.iloc[2:].iterrows():
    if pd.isna(r['Lokasi']): continue
    val_str = str(r['Total']).replace(',', '').strip()
    vol_2025 = 0
    if val_str and val_str != 'nan':
        vol_2025 = int(float(val_str))
        
    vol_2026 = int(round(vol_2025 * 1.142618)) # Damped HW growth +14.26%
    
    nama_raw = str(r['Lokasi']).strip()
    prov = 'Nasional'
    if '(' in nama_raw and ')' in nama_raw:
        prov = nama_raw[nama_raw.rfind('(')+1:nama_raw.rfind(')')].strip()
        nama_clean = nama_raw[:nama_raw.rfind('(')].strip()
    else:
        nama_clean = nama_raw
        
    art_items.append({
        'no_asli': int(r['No']) if str(r['No']).isdigit() else len(art_items) + 1,
        'nama': nama_clean,
        'nama_lengkap': nama_raw,
        'provinsi': prov,
        'realisasi_2025': vol_2025,
        'proyeksi_2026': vol_2026,
        'pertumbuhan_pct': 14.26 if vol_2025 > 0 else 0.0
    })

art_items.sort(key=lambda x: x['realisasi_2025'], reverse=True)
tot_art_2025 = sum(x['realisasi_2025'] for x in art_items)
for i, item in enumerate(art_items):
    item['rank'] = i + 1
    item['share_pct'] = round((item['realisasi_2025'] / tot_art_2025) * 100, 2) if tot_art_2025 > 0 else 0.0

print(f"Tol parsed: {len(tol_items)} gates, total 2025: {tot_tol_2025:,}")
print(f"Arteri parsed: {len(art_items)} ruas, total 2025: {tot_art_2025:,}")

# Injeksi ke data/nataru_data.json
json_target = os.path.join(base_dir, "proyeksi-nataru-dss/data/nataru_data.json")
with open(json_target, 'r', encoding='utf-8') as f:
    master_data = json.load(f)

master_data['jaringan_tol_43'] = tol_items
master_data['jaringan_arteri_44'] = art_items

with open(json_target, 'w', encoding='utf-8') as f:
    json.dump(master_data, f, ensure_ascii=False, indent=2)

print("Berhasil menginjeksi jaringan_tol_43 dan jaringan_arteri_44 ke data/nataru_data.json!")
