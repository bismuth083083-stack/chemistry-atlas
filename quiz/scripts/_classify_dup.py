"""Classify the defect in each contaminated distractor list."""
import json
import pathlib
from collections import Counter

root = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((root / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))

kinds = Counter()
examples = {}
for q in quiz['questions']:
    if q['type'] not in ('single-choice', 'multiple-choice'):
        continue
    texts = [o['text'] for o in q['options']]
    if len(set(texts)) == len(texts):
        continue
    if q['type'] == 'single-choice':
        correct = [o['text'] for o in q['options'] if o['id'] == q['answer']]
    else:
        correct = [o['text'] for o in q['options'] if o['id'] in q['answers']]
    dup = sorted({t for t in texts if texts.count(t) > 1})
    if set(correct) & set(dup):
        kind = 'answer also used as a distractor'
    else:
        kind = 'same distractor repeated twice'
    kinds[kind] += 1
    examples.setdefault(kind, []).append((q['id'], correct, dup))

for kind, count in kinds.items():
    print(f'{count:3d}  {kind}')
    for e in examples[kind][:5]:
        print('       ', e)
print()
print('total affected:', sum(kinds.values()))
