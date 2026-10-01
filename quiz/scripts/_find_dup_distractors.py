"""Locate every distractor list in amino-acid-questions.mjs that is contaminated.

Re-implements the table scan by importing nothing (the module throws), so we
parse the source instead and report the offending arrays with line numbers.
"""
import pathlib
import re
from collections import Counter

src = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz\scripts\amino-acid-questions.mjs').read_text(encoding='utf-8')
lines = src.splitlines()

# Distractor lists look like:  ['key', ['a', 'b', 'c'], 12, 'easy'],
pat = re.compile(r"^\s*\[\s*'([^']*)'\s*,\s*\[([^\]]*)\]\s*,\s*(\d+)\s*,\s*'([a-z]+)'\s*\]\s*,?\s*$")

report = []
for i, line in enumerate(lines, 1):
    m = pat.match(line)
    if not m:
        continue
    items = [s.strip().strip("'") for s in m.group(2).split(',') if s.strip()]
    counts = Counter(items)
    dupes = [k for k, v in counts.items() if v > 1]
    report.append((i, m.group(1), items, dupes, line.strip()))

print(f'{len(report)} distractor lists found')
multi = [r for r in report if r[3]]
print(f'{len(multi)} contain an internal duplicate (same text twice)\n')
for ln, key, items, dupes, raw in multi:
    print(f'  line {ln}: key={key!r} dupes={dupes}')
    print(f'      {raw}')
