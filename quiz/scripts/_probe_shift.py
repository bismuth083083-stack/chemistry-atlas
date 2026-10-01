"""Inspect the threeToChinese family in detail.

opts() rotates [correct, d1, d2, d3] by `shift % 4`, then labels A..D.
So the correct option's letter is NOT simply chr(65 + shift%4): after rotating
by k, the element originally at index 0 (the correct one) sits at index
(len - k) % len.

The generator hardcodes `String.fromCharCode(65 + (shift % 4))` as the answer,
which is only correct when the rotation puts `correct` at index shift%4 -- true
for a naive `rot` that shifts the OTHER way. Let's print the actual layout.
"""
import json
import pathlib
import re

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))

for q in quiz['questions']:
    m = re.match(r'三字母缩写 (\w+) 对应的氨基酸是', q['question'])
    if not m:
        continue
    opts = {o['id']: o['text'] for o in q['options']}
    print(f"{q['id']}  {m.group(1):>4}  answer={q['answer']} -> {opts[q['answer']]!r}")
    print(f"        layout: {opts}")

# how the rotation works: replicate it
def rot(arr, n):
    return arr[n:] + arr[:n]

print('\n--- rotation reality check ---')
for shift in range(4):
    allv = ['CORRECT', 'd1', 'd2', 'd3']
    rotated = rot(allv, shift % 4)
    labeled = {chr(65 + i): t for i, t in enumerate(rotated)}
    where = [k for k, v in labeled.items() if v == 'CORRECT'][0]
    print(f'shift={shift}: rotated={rotated}  CORRECT at {where}   generator claims {chr(65 + shift % 4)}')
