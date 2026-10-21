#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
SCRIPT: build_data.py
PROJECT: Sistem Penunjang Keputusan (DSS) Multimoda Nataru 2026/2027
INSTANSI: Subbidang Pengelolaan Data, Pusdatin Kementerian Perhubungan RI
PENULIS : Devi Andini Sastro (NPM: 10123320) - S1 Sistem Informasi Gunadarma
================================================================================
Fungsi:
1. Mengekstrak dan memvalidasi data resmi dari:
   - Master_Proyeksi_Lengkap_Nataru_2026_2027.xlsx
   - turnamen_7_metode_mape_nataru.xlsx
   - reference_coords.json (Database koordinat 900+ simpul spasial)
2. Menghasilkan 2 file JSON terstruktur dan teroptimasi untuk web:
   - data/nataru_data.json   : Dataset numerik lengkap untuk Modul 1, 2, 3, 5, 6
   - data/spatial_nodes.json : Dataset geografis untuk Modul 4 (Peta GIS Leaflet)
================================================================================
"""

import os
import sys
import io
import json
import datetime
import pandas as pd
import numpy as np

# Pastikan output konsol selalu UTF-8 aman di Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

# 1. Konfigurasi Path Berkas
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
SCRIPTS_DIR = os.path.join(BASE_DIR, 'scripts')
SOURCE_DIR = r"D:\A - Kuliah\Magang Pusdatin\Proyeksi Nataru"

PATH_EXCEL_MASTER = os.path.join(SOURCE_DIR, "Master_Proyeksi_Lengkap_Nataru_2026_2027.xlsx")
PATH_EXCEL_MAPE   = os.path.join(SOURCE_DIR, "turnamen_7_metode_mape_nataru.xlsx")
PATH_COORDS_REF   = os.path.join(SCRIPTS_DIR, "reference_coords.json")

OUTPUT_NATARU_JSON = os.path.join(DATA_DIR, "nataru_data.json")
OUTPUT_SPATIAL_JSON = os.path.join(DATA_DIR, "spatial_nodes.json")

# Urutan Kronologis Hari Operasional Posko Nataru (18 Hari: H-7 s/d H+10)
URUTAN_HARI_POSKO = [
    'H-7', 'H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1',
    'H', 'H+1', 'H+2', 'H+3', 'H+4', 'H+5', 'H+6', 'H+7', 'H+8', 'H+9', 'H+10'
]

# Pemetaan Standar Nama Moda
MODA_DISPLAY = {
    'Angkutan Udara': {'label': 'Angkutan Udara', 'icon': '✈️', 'jenis': 'Bandara', 'color': '#0284C7'},
    'Kereta Api': {'label': 'Kereta Api', 'icon': '🚆', 'jenis': 'Stasiun Antarkota', 'color': '#EA580C'},
    'Angkutan Jalan': {'label': 'Angkutan Jalan', 'icon': '🚌', 'jenis': 'Terminal Bus', 'color': '#16A34A'},
    'Angkutan SDP': {'label': 'Angkutan Penyeberangan (SDP)', 'icon': '⛴️', 'jenis': 'Lintas ASDP', 'color': '#9333EA'},
    'Angkutan Laut': {'label': 'Angkutan Laut', 'icon': '🚢', 'jenis': 'Pelabuhan Laut', 'color': '#1E40AF'},
    'Jalan Tol': {'label': 'Jalan Tol', 'icon': '🛣️', 'jenis': 'Gerbang Tol Barrier', 'color': '#D97706'},
    'Jalan Arteri': {'label': 'Jalan Arteri', 'icon': '🚗', 'jenis': 'Ruas Arteri Utama', 'color': '#64748B'}
}

class NpEncoder(json.JSONEncoder):
    """Encoder khusus untuk mengonversi tipe data numpy/pandas ke tipe standar Python"""
    def default(self, obj):
        if isinstance(obj, (np.integer, int)):
            return int(obj)
        if isinstance(obj, (np.floating, float)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super().default(obj)

def clean_val(v):
    """Membersihkan nilai NaN/inf/numpy types agar aman diserialisasi ke JSON"""
    if pd.isna(v) or v is None:
        return None
    if isinstance(v, (np.integer, int)):
        return int(v)
    if isinstance(v, (np.floating, float)):
        if np.isnan(v) or np.isinf(v):
            return None
        return round(float(v), 2)
    return str(v).strip()

def sanitize_json(obj):
    """Membersihkan seluruh struktur data secara rekursif agar 100% patuh standar JSON (tanpa NaN/inf)"""
    if isinstance(obj, dict):
        return {str(k): sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_json(v) for v in obj]
    elif isinstance(obj, (float, np.floating)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (int, np.integer)):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return [sanitize_json(v) for v in obj.tolist()]
    return obj

def build_data_pipeline():
    print("=" * 70)
    print("🚀 MEMULAI PIPELINE EKSTRAKSI DATA DSS NATARU 2026/2027")
    print("=" * 70)

    # Validasi Berkas Sumber
    for path, desc in [
        (PATH_EXCEL_MASTER, "Master Excel Proyeksi"),
        (PATH_EXCEL_MAPE, "Excel Turnamen MAPE"),
        (PATH_COORDS_REF, "Database Koordinat Referensi")
    ]:
        if not os.path.exists(path):
            print(f"❌ Error: File {desc} tidak ditemukan di: {path}")
            sys.exit(1)
        print(f"✅ Ditemukan {desc}: {os.path.basename(path)}")

    # -------------------------------------------------------------------------
    # TAHAP 1: EKSTRAKSI EXCEL MASTER LENGKAP
    # -------------------------------------------------------------------------
    print("\n[1/4] Membaca Sheet Master Excel Proyeksi...")
    xl_master = pd.ExcelFile(PATH_EXCEL_MASTER)

    # A. Makro Penumpang (5 Moda)
    df_makro_pnp = xl_master.parse('1_Makro_Penumpang')
    makro_pnp_records = []
    tot_pnp_2025 = df_makro_pnp['Realisasi_2025'].sum()
    tot_pnp_2026 = df_makro_pnp['Proyeksi_2026_2027'].sum()

    for _, row in df_makro_pnp.iterrows():
        m_name = str(row['Moda']).strip()
        share_2026 = round((row['Proyeksi_2026_2027'] / tot_pnp_2026) * 100, 2)
        makro_pnp_records.append({
            'moda': m_name,
            'label': MODA_DISPLAY.get(m_name, {}).get('label', m_name),
            'icon': MODA_DISPLAY.get(m_name, {}).get('icon', '📍'),
            'color': MODA_DISPLAY.get(m_name, {}).get('color', '#003882'),
            'realisasi_2022': clean_val(row.get('Realisasi_2022', 0)),
            'realisasi_2023': clean_val(row.get('Realisasi_2023', 0)),
            'realisasi_2024': clean_val(row.get('Realisasi_2024', 0)),
            'realisasi_2025': clean_val(row['Realisasi_2025']),
            'proyeksi_2026': clean_val(row['Proyeksi_2026_2027']),
            'pertumbuhan_pct': clean_val(row['Pertumbuhan_Pct']),
            'porsi_share_pct': share_2026,
            'metode': str(row.get('Metode', 'Damped Holt-Winters'))
        })

    # B. Makro Sarana (7 Moda)
    df_makro_sar = xl_master.parse('2_Makro_Sarana')
    makro_sar_records = []
    tot_sar_2026 = df_makro_sar['Proyeksi_2026_2027'].sum()

    for _, row in df_makro_sar.iterrows():
        m_name = str(row['Moda']).strip()
        share_2026 = round((row['Proyeksi_2026_2027'] / tot_sar_2026) * 100, 2)
        makro_sar_records.append({
            'moda': m_name,
            'label': MODA_DISPLAY.get(m_name, {}).get('label', m_name),
            'icon': MODA_DISPLAY.get(m_name, {}).get('icon', '📍'),
            'color': MODA_DISPLAY.get(m_name, {}).get('color', '#003882'),
            'realisasi_2022': clean_val(row.get('Realisasi_2022', 0)),
            'realisasi_2023': clean_val(row.get('Realisasi_2023', 0)),
            'realisasi_2024': clean_val(row.get('Realisasi_2024', 0)),
            'realisasi_2025': clean_val(row['Realisasi_2025']),
            'proyeksi_2026': clean_val(row['Proyeksi_2026_2027']),
            'pertumbuhan_pct': clean_val(row['Pertumbuhan_Pct']),
            'porsi_share_pct': share_2026,
            'metode': str(row.get('Metode', 'Damped Holt-Winters'))
        })

    # C. Harian Penumpang (18 Hari Kronologis)
    df_harian_pnp = xl_master.parse('3_Harian_Penumpang_3Tahun')
    df_harian_pnp['Hari_Operasional'] = pd.Categorical(df_harian_pnp['Hari_Operasional'], categories=URUTAN_HARI_POSKO, ordered=True)
    df_harian_pnp = df_harian_pnp.sort_values(['Moda', 'Hari_Operasional'])

    harian_pnp_dict = {}
    for m in df_harian_pnp['Moda'].unique():
        sub = df_harian_pnp[df_harian_pnp['Moda'] == m]
        harian_pnp_dict[m] = [
            {
                'hari_posko': str(r['Hari_Operasional']),
                'hari_pekan': str(r['Hari_Pekan_2026']),
                'vol_2024': clean_val(r['Volume_2024']),
                'vol_2025': clean_val(r['Volume_2025']),
                'vol_2026': clean_val(r['Proyeksi_2026_2027'])
            }
            for _, r in sub.iterrows()
        ]

    # D. Harian Sarana (18 Hari Kronologis)
    df_harian_sar = xl_master.parse('4_Harian_Sarana_3Tahun')
    df_harian_sar['Hari_Operasional'] = pd.Categorical(df_harian_sar['Hari_Operasional'], categories=URUTAN_HARI_POSKO, ordered=True)
    df_harian_sar = df_harian_sar.sort_values(['Moda', 'Hari_Operasional'])

    harian_sar_dict = {}
    for m in df_harian_sar['Moda'].unique():
        sub = df_harian_sar[df_harian_sar['Moda'] == m]
        harian_sar_dict[m] = [
            {
                'hari_posko': str(r['Hari_Operasional']),
                'hari_pekan': str(r['Hari_Pekan_2026']),
                'vol_2024': clean_val(r['Volume_2024']),
                'vol_2025': clean_val(r['Volume_2025']),
                'vol_2026': clean_val(r['Proyeksi_2026_2027'])
            }
            for _, r in sub.iterrows()
        ]

    # E. Direktori Seluruh 909 Simpul & Top 10 Simpul (100% Apple-to-Apple)
    df_909 = xl_master.parse('5B_Seluruh_909_Simpul')
    simpul_all_dict = {}
    simpul_top10_dict = {}

    for m in ['Angkutan Udara', 'Angkutan Jalan', 'Angkutan Laut', 'Kereta Api', 'Angkutan SDP']:
        sub = df_909[df_909['Moda'] == m].sort_values(by='Proyeksi_2026_2027', ascending=False).reset_index(drop=True)
        records_all = []
        for idx, r in sub.iterrows():
            records_all.append({
                'peringkat_moda': idx + 1,
                'nama': str(r['Nama_Simpul']).strip(),
                'kategori': str(r['Kategori']).strip(),
                'realisasi_2025': clean_val(r['Realisasi_2025']),
                'proyeksi_2026': clean_val(r['Proyeksi_2026_2027']),
                'porsi_share_pct': clean_val(r['Porsi_Share_Pct'])
            })
        simpul_all_dict[m] = records_all
        simpul_top10_dict[m] = records_all[:10]

    # F. Titik Kritis: 4 Gerbang Tol Jakarta
    df_tol = xl_master.parse('6_Gerbang_Tol_Jakarta')
    tol_records = [
        {
            'gerbang_tol': str(r['Gerbang_Tol']).strip(),
            'arah': str(r['Arah']).strip(),
            'realisasi_2025': clean_val(r['Realisasi_2025']),
            'proyeksi_2026': clean_val(r['Proyeksi_2026_2027']),
            'pertumbuhan_pct': clean_val(r['Pertumbuhan_Pct'])
        }
        for _, r in df_tol.iterrows()
    ]

    # G. Titik Kritis: Kendaraan Penyeberangan ASDP
    df_asdp = xl_master.parse('7_Kendaraan_Penyeberangan_ASDP')
    asdp_records = [
        {
            'lintas': str(r['Lintas_Penyeberangan']).strip(),
            'realisasi_total_2025': clean_val(r['Realisasi_Total_2025']),
            'proyeksi_total_2026': clean_val(r['Proyeksi_Total_2026_2027']),
            'proyeksi_motor_r2': clean_val(r['Proyeksi_Roda_2_Motor']),
            'proyeksi_mobil_r4': clean_val(r['Proyeksi_Roda_4_Pribadi']),
            'proyeksi_truk_sumbu3': clean_val(r['Proyeksi_Truk_Logistik_Sumbu3']),
            'kebijakan_operasional': str(r['Kebijakan_Operasional']).strip()
        }
        for _, r in df_asdp.iterrows()
    ]

    # H. Kalender Early Warning (18 Hari)
    df_ew = xl_master.parse('8_Kalender_Early_Warning')
    df_ew['Hari_Operasional'] = pd.Categorical(df_ew['Hari_Operasional'], categories=URUTAN_HARI_POSKO, ordered=True)
    df_ew = df_ew.sort_values('Hari_Operasional')

    ew_records = [
        {
            'hari_posko': str(r['Hari_Operasional']),
            'hari_pekan': str(r['Hari_Pekan_2026']),
            'proyeksi_total_penumpang': clean_val(r['Proyeksi_Total_Penumpang']),
            'status_kesiagaan': str(r['Status_Kesiagaan']).strip(),
            'rekomendasi_operasional': str(r['Rekomendasi_Operasional']).strip()
        }
        for _, r in df_ew.iterrows()
    ]

    # Identifikasi Hari Puncak Arus Mudik & Balik
    tot_harian_list = harian_pnp_dict.get('TOTAL SELURUH MODA', [])
    peak_mudik = max(tot_harian_list[:8], key=lambda x: x['vol_2026']) if len(tot_harian_list) >= 8 else tot_harian_list[0]
    peak_balik = max(tot_harian_list[8:], key=lambda x: x['vol_2026']) if len(tot_harian_list) > 8 else tot_harian_list[-1]
    
    highest_growth_moda = max(makro_pnp_records, key=lambda x: x['pertumbuhan_pct'])

    kpi_summary = {
        'total_penumpang_2025': tot_pnp_2025,
        'total_penumpang_2026': tot_pnp_2026,
        'pertumbuhan_penumpang_pct': round(((tot_pnp_2026 - tot_pnp_2025) / tot_pnp_2025) * 100, 2),
        'total_sarana_2026': tot_sar_2026,
        'puncak_mudik_hari': f"{peak_mudik['hari_posko']} ({peak_mudik['hari_pekan']})",
        'puncak_mudik_vol': peak_mudik['vol_2026'],
        'puncak_balik_hari': f"{peak_balik['hari_posko']} ({peak_balik['hari_pekan']})",
        'puncak_balik_vol': peak_balik['vol_2026'],
        'moda_tertinggi_nama': highest_growth_moda['label'],
        'moda_tertinggi_pct': highest_growth_moda['pertumbuhan_pct']
    }

    # -------------------------------------------------------------------------
    # TAHAP 2: EKSTRAKSI TURNAMEN 7 METODE (MAPE & RMSE)
    # -------------------------------------------------------------------------
    print("\n[2/4] Membaca Evaluasi Akurasi Turnamen MAPE...")
    xl_mape = pd.ExcelFile(PATH_EXCEL_MAPE)

    df_piv_pnp = xl_mape.parse('Pivot_MAPE_Penumpang')
    df_piv_sar = xl_mape.parse('Pivot_MAPE_Sarana')
    df_juara   = xl_mape.parse('Ringkasan_Model_Juara')

    turnamen_data = {
        'penumpang': df_piv_pnp.to_dict(orient='records'),
        'sarana': df_piv_sar.to_dict(orient='records'),
        'ringkasan_juara': df_juara.to_dict(orient='records')
    }

    # -------------------------------------------------------------------------
    # TAHAP 3: MERGER KOORDINAT GIS UNTUK 1.000+ SIMPUL SPASIAL
    # -------------------------------------------------------------------------
    print("\n[3/4] Menggabungkan Koordinat Geografis Simpul Pantau...")
    with open(PATH_COORDS_REF, 'r', encoding='utf-8') as f:
        coords_db = json.load(f)

    # Gabungkan 909 simpul resmi dengan koordinat
    spatial_nodes_list = []
    matched_count = 0

    # Beri peringkat nasional absolut berdasarkan volume 2026
    df_909_sorted = df_909.sort_values(by='Proyeksi_2026_2027', ascending=False).reset_index(drop=True)
    
    for rank_nasional, row in df_909_sorted.iterrows():
        s_nama = str(row['Nama_Simpul']).strip()
        s_upper = s_nama.upper()
        s_moda = str(row['Moda']).strip()
        vol_2025 = clean_val(row['Realisasi_2025'])
        vol_2026 = clean_val(row['Proyeksi_2026_2027'])
        porsi_share = clean_val(row['Porsi_Share_Pct'])

        coord_info = coords_db.get(s_upper)
        if not coord_info:
            # Coba pencocokan sebagian nama jika tidak sama persis
            for k, val in coords_db.items():
                if k in s_upper or s_upper in k:
                    coord_info = val
                    break

        if coord_info and coord_info.get('lat') is not None and coord_info.get('lon') is not None:
            matched_count += 1
            spatial_nodes_list.append({
                'id': coord_info.get('id', f"N{rank_nasional+1}"),
                'nama': s_nama,
                'moda': s_moda,
                'moda_label': MODA_DISPLAY.get(s_moda, {}).get('label', s_moda),
                'color': MODA_DISPLAY.get(s_moda, {}).get('color', '#003882'),
                'provinsi': coord_info.get('provinsi', 'Indonesia'),
                'lat': coord_info['lat'],
                'lon': coord_info['lon'],
                'realisasi_2025': vol_2025,
                'proyeksi_2026': vol_2026,
                'porsi_share_pct': porsi_share,
                'peringkat_nasional': rank_nasional + 1
            })

    print(f"   * Total 909 Simpul Resmi Berhasil Terpetakan ke GIS: {matched_count} Simpul")

    # -------------------------------------------------------------------------
    # TAHAP 4: MENYIMPAN HASIL KE DIREKTORI data/
    # -------------------------------------------------------------------------
    print("\n[4/4] Menyimpan Berkas JSON Teroptimasi...")

    nataru_master_bundle = {
        'meta': {
            'generated_at': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'title': "Sistem Penunjang Keputusan (DSS) Proyeksi Nataru 2026/2027",
            'instansi': "Subbidang Pengelolaan Data, Pusdatin Kemenhub RI",
            'penulis': "Devi Andini Sastro (Universitas Gunadarma)",
            'total_simpul_pantau': len(df_909),
            'hari_operasional_count': len(URUTAN_HARI_POSKO),
            'model_utama': "Damped Holt-Winters (phi=0.85)"
        },
        'kpi_summary': kpi_summary,
        'makro_penumpang': makro_pnp_records,
        'makro_sarana': makro_sar_records,
        'harian_penumpang': {
            'urutan_hari': URUTAN_HARI_POSKO,
            'data': harian_pnp_dict
        },
        'harian_sarana': {
            'urutan_hari': URUTAN_HARI_POSKO,
            'data': harian_sar_dict
        },
        'simpul_top10': simpul_top10_dict,
        'simpul_semua': simpul_all_dict,
        'titik_kritis_tol': tol_records,
        'titik_kritis_asdp': asdp_records,
        'early_warning_calendar': ew_records,
        'turnamen_mape': turnamen_data
    }

    # Sanitasi menyeluruh untuk memastikan 0% NaN dan valid JSON untuk peramban web
    clean_master_bundle = sanitize_json(nataru_master_bundle)
    clean_spatial_list = sanitize_json(spatial_nodes_list)

    with open(OUTPUT_NATARU_JSON, 'w', encoding='utf-8') as f:
        json.dump(clean_master_bundle, f, ensure_ascii=False, indent=2, cls=NpEncoder, allow_nan=False)

    with open(OUTPUT_SPATIAL_JSON, 'w', encoding='utf-8') as f:
        json.dump(clean_spatial_list, f, ensure_ascii=False, indent=2, cls=NpEncoder, allow_nan=False)

    size_nataru = os.path.getsize(OUTPUT_NATARU_JSON) / 1024
    size_spatial = os.path.getsize(OUTPUT_SPATIAL_JSON) / 1024

    print("=" * 70)
    print("✨ PIPELINE SELESAI DENGAN SUKSES!")
    print(f"📁 1. Master Data JSON  : {OUTPUT_NATARU_JSON} ({size_nataru:.1f} KB)")
    print(f"📁 2. Spatial GIS JSON  : {OUTPUT_SPATIAL_JSON} ({size_spatial:.1f} KB)")
    print("=" * 70)
    print(">> Siap untuk FASE 2: Membangun Antarmuka index.html & Sidebar 6 Menu!")

if __name__ == "__main__":
    build_data_pipeline()
