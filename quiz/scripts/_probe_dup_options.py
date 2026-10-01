import json
import pathlib
from collections import Counter

root = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((root / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
byid = {q['id']: q for q in quiz['questions']}

for qid in ('q002', 'q003', 'q029', 'q174'):
    q = byid[qid]
    print(f'=== {qid} [{q["type"]}] answer={q.get("answer")!r} answers={q.get("answers")!r}')
    print('  Q:', q['question'][:220].replace('\n', ' '))
    texts = [o['text'] for o in q.get('options', [])]
    dup = [t for t, c in Counter(texts).items() if c > 1]
    print('  option texts:', texts)
    print('  duplicated:', dup)
    print('  option images:', [o.get('image', {}).get('src', '-') if isinstance(o.get('image'), dict) else o.get('image', '-') for o in q.get('options', [])])
    print()

# how many single/multi choice have duplicate texts, and why
n_dup = 0
for q in quiz['questions']:
    if q['type'] in ('single-choice', 'multiple-choice'):
        t = [o['text'] for o in q['options']]
        if len(set(t)) != len(t):
            n_dup += 1
print('total choice questions with duplicate option text:', n_dup)
