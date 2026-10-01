"""Copy rendered aa-* structures into dist/assets/structures under the exact
filenames the quiz JSON references, then verify every referenced src exists.

The renderer names files "<id>-<english_name>-<image_type>.<ext>" where id is
"aa-alanine" etc. The quiz references "alanine-alanine-neutral.png" (stem only,
without the "aa-" id prefix), so the copy must strip that prefix -- otherwise
every <img> 404s.
"""
import json
import pathlib
import shutil

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
SRC = ROOT / 'scripts' / '_aa-render-v2'
DST = ROOT / 'dist' / 'assets' / 'structures'
DST.mkdir(parents=True, exist_ok=True)

# source stem ("aa-alanine-alanine") -> destination stem ("alanine-alanine")
copied = []
for path in sorted(SRC.glob('aa-*')):
    name = path.name
    # strip the leading "aa-" id prefix segment
    if name.startswith('aa-'):
        target_name = name[3:]
    else:
        target_name = name
    shutil.copy2(path, DST / target_name)
    copied.append((name, target_name))

print(f'copied {len(copied)} files')
for a, b in copied[:4]:
    print(f'  {a}  ->  {b}')

# --- verify every image src referenced by the quiz resolves on disk ---
quiz = json.loads((ROOT / 'dist' / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
missing, found = [], 0
for q in quiz['questions']:
    src = q.get('image', {}).get('src')
    if not src:
        continue
    p = ROOT / 'dist' / src
    if p.exists():
        found += 1
    else:
        missing.append((q['id'], src))

print(f'\nimage references: {found} resolve, {len(missing)} MISSING')
for qid, src in missing[:10]:
    print(f'  {qid}: {src}')

# also confirm the sibling .svg / .mol / .metadata.json made it across
for ext in ('.svg', '.mol', '.metadata.json'):
    n = len(list(DST.glob(f'*{ext}')))
    aa = len([p for p in DST.glob(f'*{ext}') if not p.name.startswith(('bioc-', 'symmetry-', 'org-'))])
    print(f'  total {ext}: {n}')
