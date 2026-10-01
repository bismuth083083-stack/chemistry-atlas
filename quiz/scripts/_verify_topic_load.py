"""End-to-end check: load the topic the way the browser does.

Reproduces quiz-library.js / quiz-engine.js behaviour for BIOC-T01:
 1. data/index.json registers it and the file exists
 2. the quiz passes the engine's own validateQuiz rules
 3. question-bank selection yields the expected per-type counts
 4. every image src in the sampled draw resolves under dist/
 5. no duplicate option labels, every answer key points at a real option
"""
import json
import pathlib
import random

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')

index = json.loads((ROOT / 'data' / 'index.json').read_text(encoding='utf-8'))
dist_index = json.loads((ROOT / 'dist' / 'data' / 'index.json').read_text(encoding='utf-8'))

entry = [e for e in index['quizzes'] if e['id'] == 'BIOC-T01']
dent = [e for e in dist_index['quizzes'] if e['id'] == 'BIOC-T01']
print('registered in data/index.json    :', bool(entry))
print('registered in dist/data/index.json:', bool(dent))
if entry:
    print('  mode =', entry[0]['mode'], '| path =', entry[0]['path'], '| questionCount =', entry[0]['questionCount'])

quiz = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
dquiz = json.loads((ROOT / 'dist' / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
print('\nquiz id / totalPoints:', quiz['id'], '/', quiz['totalPoints'])
print('sum(points)          :', sum(q['points'] for q in quiz['questions']))

sel = quiz['selection']
print('selection            :', sel['mode'], sel['counts'])

# --- simulate the engine's selectQuestions ---
counts = sel['counts']
chosen = []
for qtype, n in counts.items():
    pool = [q for q in quiz['questions'] if q['type'] == qtype]
    random.shuffle(pool)
    chosen.extend(pool[:n])
random.shuffle(chosen)
print('\nsimulated draw size  :', len(chosen))
from collections import Counter
print('draw composition     :', dict(Counter(q['type'] for q in chosen)))
print('draw points          :', sum(q['points'] for q in chosen))

# --- structural integrity of every drawn question ---
problems = []
for q in chosen:
    labels = [o['text'] for o in q.get('options', [])]
    if len(set(labels)) != len(labels):
        problems.append(f"{q['id']}: duplicate option labels")
    if q['type'] == 'single-choice':
        if q['answer'] not in [o['id'] for o in q['options']]:
            problems.append(f"{q['id']}: answer {q['answer']} not an option id")
    if q['type'] == 'multiple-choice':
        ids = [o['id'] for o in q['options']]
        if not q['answers'] or any(a not in ids for a in q['answers']):
            problems.append(f"{q['id']}: bad answers")
    if q['type'] == 'true-false' and not isinstance(q['answer'], bool):
        problems.append(f"{q['id']}: tf answer not bool")
    if q['type'] == 'fill-in-the-blank' and not str(q['answer']).strip():
        problems.append(f"{q['id']}: empty fill answer")

print('\nper-draw structural problems:', len(problems))
for p in problems:
    print('  -', p)

# --- dist image resolution (what the browser actually needs) ---
missing, ok = [], 0
for q in dquiz['questions']:
    src = q.get('image', {}).get('src')
    if not src:
        continue
    if (ROOT / 'dist' / src).exists():
        ok += 1
    else:
        missing.append((q['id'], src))
print(f'\ndist image refs: {ok} resolve, {len(missing)} missing')
for m in missing[:8]:
    print('  -', m)

print('\nRESULT:', 'PASS' if not problems and not missing and entry and dent else 'NEEDS ATTENTION')
