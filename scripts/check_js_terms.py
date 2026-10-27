import os

terms = ['7 model', '7 metode', 'turnamen', 'mape']
js_dir = r'd:\A - Kuliah\Magang Pusdatin\proyeksi-nataru-dss\assets\js'

for f in os.listdir(js_dir):
    if f.endswith('.js'):
        path = os.path.join(js_dir, f)
        text = open(path, 'r', encoding='utf-8').read()
        for t in terms:
            if t.lower() in text.lower():
                print(f"Found '{t}' in {f}:")
                for i, line in enumerate(text.splitlines()):
                    if t.lower() in line.lower():
                        print(f"  Line {i+1}: {line.strip()[:100]}")
