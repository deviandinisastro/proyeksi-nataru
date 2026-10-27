import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('d:/A - Kuliah/Magang Pusdatin/proyeksi-nataru-dss/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

views = re.findall(r'<section id="([^"]+)" class="view-section[^"]*">([\s\S]*?)</section>', text)

print(f"Total views found: {len(views)}")
for v_id, v_content in views:
    headings = re.findall(r'<(h[234]|span)[^>]*class="[^"]*font-[^"]*"[^>]*>([^<]+)</\1>', v_content)
    print(f"\n================ VIEW: {v_id} ================")
    for tag, h_text in headings[:5]:
        print(f"  [{tag}] {h_text.strip()}")
