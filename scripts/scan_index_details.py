import re

with open('d:/A - Kuliah/Magang Pusdatin/proyeksi-nataru-dss/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Check for keywords that might indicate legacy or conflicting info
    for kw in ['7 model', '7 metode', 'turnamen', 'mape', 'rmse', 'pdp vs', 'champion', 'kalah', 'menang']:
        if kw in line.lower():
            print(f"L{i+1}: {line.strip()[:100]}")
