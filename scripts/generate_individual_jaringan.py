import pandas as pd
import numpy as np
import json
import os

base_dir = r"d:\A - Kuliah\Magang Pusdatin"
f_tol_25 = os.path.join(base_dir, "TOL/Tol - Sarana Transportasi/nataru_2025_sarana_tol_Total Kendaraan_Titik_Pantauan_Nasional.csv")
f_tol_24 = os.path.join(base_dir, "TOL/Tol - Sarana Transportasi/nataru_2024_sarana_tol_Total Kendaraan (nataru 2025-2026 Titik Pantauan Nasional).csv")
f_art_25 = os.path.join(base_dir, "ARTERI/Arteri - Sarana Transportasi/nataru_2025_sarana_arteri_Total Kendaraan_Titik_Pantauan_Nasional.csv")
f_art_24 = os.path.join(base_dir, "ARTERI/Arteri - Sarana Transportasi/nataru_2024_sarana_arteri_Total Kendaraan(nataru 2025-2026 Titik Pantauan Nasional).csv")

json_path = os.path.join(base_dir, "proyeksi-nataru-dss/data/nataru_data.json")

def clean_val(val):
    if pd.isna(val): return None
    s = str(val).replace(',', '').strip()
    try:
        return float(s)
    except:
        return None

# ==========================================
# 1. PROCESS 43 GERBANG TOL
# ==========================================
df_tol_25 = pd.read_csv(f_tol_25)
df_tol_24 = pd.read_csv(f_tol_24)

macro_tol_target = 24759380
macro_tol_growth = 0.167584

tol_raw = []
for idx in range(2, len(df_tol_25)):
    r = df_tol_25.iloc[idx]
    if pd.isna(r['Lokasi']): continue
    
    no_asli = int(r['No']) if str(r['No']).isdigit() else len(tol_raw) + 1
    nama_raw = str(r['Lokasi']).strip()
    v25 = clean_val(r['Total']) or 0
    
    # match 2024
    r24 = df_tol_24[df_tol_24['Lokasi'] == nama_raw]
    if len(r24) > 0:
        v24 = clean_val(r24.iloc[0]['Total']) or 0
    else:
        v24 = clean_val(df_tol_24.iloc[idx]['Total']) if idx < len(df_tol_24) else 0
        
    prov = 'Nasional'
    if '(' in nama_raw and ')' in nama_raw:
        prov = nama_raw[nama_raw.rfind('(')+1:nama_raw.rfind(')')].strip()
        nama_clean = nama_raw[:nama_raw.rfind('(')].strip()
    else:
        nama_clean = nama_raw
        
    if v25 > 0 and v24 and v24 > 0:
        g_hist = (v25 - v24) / v24
    else:
        g_hist = macro_tol_growth
        
    # Empirical Bayes / Damped Holt-Winters growth
    # Shrink toward macro growth, clip between -2% and +28%
    g_shrunk = 0.35 * g_hist + 0.65 * macro_tol_growth
    g_clamped = float(np.clip(g_shrunk, -0.02, 0.28)) if v25 > 0 else 0.0
    
    tol_raw.append({
        'no_asli': no_asli,
        'nama': nama_clean,
        'nama_lengkap': nama_raw,
        'provinsi': prov,
        'realisasi_2024': int(v24) if v24 else 0,
        'realisasi_2025': int(v25),
        'initial_proj': v25 * (1 + g_clamped) if v25 > 0 else 0
    })

# Calibrate sum of positive items to macro target
sum_init_tol = sum(x['initial_proj'] for x in tol_raw)
scale_tol = macro_tol_target / sum_init_tol if sum_init_tol > 0 else 1.0

tol_items = []
for x in tol_raw:
    if x['realisasi_2025'] > 0:
        final_proj = int(round(x['initial_proj'] * scale_tol))
        yoy = round(((final_proj - x['realisasi_2025']) / x['realisasi_2025']) * 100, 2)
    else:
        final_proj = 0
        yoy = 0.0
        
    tol_items.append({
        'no_asli': x['no_asli'],
        'nama': x['nama'],
        'nama_lengkap': x['nama_lengkap'],
        'provinsi': x['provinsi'],
        'realisasi_2024': x['realisasi_2024'],
        'realisasi_2025': x['realisasi_2025'],
        'proyeksi_2026': final_proj,
        'pertumbuhan_pct': yoy
    })

# Sort by realisasi_2025 desc
tol_items.sort(key=lambda x: x['realisasi_2025'], reverse=True)
tot_tol_2025 = sum(x['realisasi_2025'] for x in tol_items)

for idx, x in enumerate(tol_items):
    x['rank'] = idx + 1
    x['share_pct'] = round((x['realisasi_2025'] / tot_tol_2025) * 100, 2) if tot_tol_2025 > 0 else 0.0

# ==========================================
# 2. PROCESS 44 RUAS ARTERI
# ==========================================
df_art_25 = pd.read_csv(f_art_25)
df_art_24 = pd.read_csv(f_art_24)

macro_art_target = 33116488
macro_art_growth = 0.142618

art_raw = []
for idx in range(2, len(df_art_25)):
    r = df_art_25.iloc[idx]
    if pd.isna(r['Lokasi']): continue
    
    no_asli = int(r['No']) if str(r['No']).isdigit() else len(art_raw) + 1
    nama_raw = str(r['Lokasi']).strip()
    v25 = clean_val(r['Total']) or 0
    
    # match 2024
    r24 = df_art_24[df_art_24['Lokasi'] == nama_raw]
    if len(r24) > 0:
        v24 = clean_val(r24.iloc[0]['Total']) or 0
    else:
        v24 = clean_val(df_art_24.iloc[idx]['Total']) if idx < len(df_art_24) else 0
        
    prov = 'Nasional'
    if '(' in nama_raw and ')' in nama_raw:
        prov = nama_raw[nama_raw.rfind('(')+1:nama_raw.rfind(')')].strip()
        nama_clean = nama_raw[:nama_raw.rfind('(')].strip()
    else:
        nama_clean = nama_raw
        
    if v25 > 0 and v24 and v24 > 0:
        g_hist = (v25 - v24) / v24
    else:
        g_hist = macro_art_growth
        
    g_shrunk = 0.35 * g_hist + 0.65 * macro_art_growth
    g_clamped = float(np.clip(g_shrunk, -0.02, 0.25)) if v25 > 0 else 0.0
    
    art_raw.append({
        'no_asli': no_asli,
        'nama': nama_clean,
        'nama_lengkap': nama_raw,
        'provinsi': prov,
        'realisasi_2024': int(v24) if v24 else 0,
        'realisasi_2025': int(v25),
        'initial_proj': v25 * (1 + g_clamped) if v25 > 0 else 0
    })

sum_init_art = sum(x['initial_proj'] for x in art_raw)
scale_art = macro_art_target / sum_init_art if sum_init_art > 0 else 1.0

art_items = []
for x in art_raw:
    if x['realisasi_2025'] > 0:
        final_proj = int(round(x['initial_proj'] * scale_art))
        yoy = round(((final_proj - x['realisasi_2025']) / x['realisasi_2025']) * 100, 2)
    else:
        final_proj = 0
        yoy = 0.0
        
    art_items.append({
        'no_asli': x['no_asli'],
        'nama': x['nama'],
        'nama_lengkap': x['nama_lengkap'],
        'provinsi': x['provinsi'],
        'realisasi_2024': x['realisasi_2024'],
        'realisasi_2025': x['realisasi_2025'],
        'proyeksi_2026': final_proj,
        'pertumbuhan_pct': yoy
    })

# Sort by realisasi_2025 desc
art_items.sort(key=lambda x: x['realisasi_2025'], reverse=True)
tot_art_2025 = sum(x['realisasi_2025'] for x in art_items)

for idx, x in enumerate(art_items):
    x['rank'] = idx + 1
    x['share_pct'] = round((x['realisasi_2025'] / tot_art_2025) * 100, 2) if tot_art_2025 > 0 else 0.0

print(f"Tol 43 count: {len(tol_items)} | Tot Real 25: {tot_tol_2025:,} | Tot Proj 26: {sum(x['proyeksi_2026'] for x in tol_items):,}")
print(f"Arteri 44 count: {len(art_items)} | Tot Real 25: {tot_art_2025:,} | Tot Proj 26: {sum(x['proyeksi_2026'] for x in art_items):,}")

# Update nataru_data.json
with open(json_path, 'r', encoding='utf-8') as f:
    full_data = json.load(f)

full_data['jaringan_tol_43'] = tol_items
full_data['jaringan_arteri_44'] = art_items

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(full_data, f, indent=2, ensure_ascii=False)

print("SUCCESS: nataru_data.json updated with individual projections and historical realisasi!")
