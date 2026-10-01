"""For each distractor list, check whether it contains the correct answer text.

Determines 'correct' by resolving the key through the AA table for each family,
which is the only way to know what opts() will be called with.
"""
import pathlib
import re

src = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz\scripts\amino-acid-questions.mjs').read_text(encoding='utf-8')

# Build the AA table
aa_block = re.search(r'const AA = \[(.*?)\n\];', src, re.S).group(1)
AA = []
for row in re.finditer(r"\[\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\s*\]", aa_block):
    AA.append(row.groups())
by_key = {r[0]: r for r in AA}
print(f'AA table rows: {len(AA)}')

lines = src.splitlines()
pat = re.compile(r"^\s*\[\s*'([^']*)'\s*,\s*\[([^\]]*)\]\s*,\s*(\d+)\s*,\s*'([a-z]+)'\s*\]\s*,?\s*$")

def texts(items):
    return [s.strip().strip("'") for s in items.split(',') if s.strip()]

# scan with preceding section context
section = None
bad = []
for i, line in enumerate(lines, 1):
    s = re.search(r'\* (Family \d[^*]*|Discriminating[^*]*|Naming[^*]*)', line)
    if s:
        section = s.group(1).strip()
    m = pat.match(line)
    if not m:
        continue
    key, items_raw = m.group(1), m.group(2)
    items = texts(items_raw)
    row = by_key.get(key)
    if not row:
        bad.append((i, key, items, 'UNKNOWN KEY', section))
        continue
    _, cn, en, three, oneletter, _cls = row
    # distractor texts may be any of cn/en/three/one depending on family
    cands = {cn, en, three, oneletter}
    if any(d in cands for d in items):
        hit = [d for d in items if d in cands]
        bad.append((i, key, items, f'contains own answer {hit}', section))

print(f'\n{len(bad)} lists contain their own answer (would leave <3 unique distractors or duplicate an option):\n')
for ln, key, items, why, sec in bad:
    print(f'  line {ln}  [{sec}]  key={key}')
    print(f'      {items}')
    print(f'      -> {why}')
