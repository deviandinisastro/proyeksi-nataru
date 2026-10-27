import os

search_terms = ['7 model', '7 metode', 'evaluasi akurasi', 'turnamen']
root_dir = r'd:\A - Kuliah\Magang Pusdatin\proyeksi-nataru-dss'

for dirpath, _, filenames in os.walk(root_dir):
    if '.git' in dirpath:
        continue
    for f in filenames:
        if f.endswith(('.html', '.js', '.css', '.json', '.py', '.md')):
            p = os.path.join(dirpath, f)
            try:
                content = open(p, 'r', encoding='utf-8').read()
                for term in search_terms:
                    if term.lower() in content.lower():
                        print(f'Match "{term}" in: {p}')
                        for idx, line in enumerate(content.splitlines()):
                            if term.lower() in line.lower():
                                print(f'  L{idx+1}: {line.strip()[:120]}')
            except Exception as e:
                pass
