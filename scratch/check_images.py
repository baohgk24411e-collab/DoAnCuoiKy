import os
import re

files = ['index.html', 'about.html']
images = set()

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    matches = re.findall(r'src=["\']([^"\']+)["\']', content)
    for m in matches:
        if m.startswith('images/'):
            images.add(m)
    bg_matches = re.findall(r"url\(['\"]?([^'\")\s]+)['\"]?\)", content)
    for m in bg_matches:
        if m.startswith('images/'):
            images.add(m)

with open('scratch/img_check.txt', 'w', encoding='utf-8') as out:
    out.write('Images referenced:\n')
    for img in sorted(images):
        exists = os.path.exists(img)
        status = 'EXISTS' if exists else 'MISSING'
        out.write(f'  [{status}] {img}\n')

print("Done")
