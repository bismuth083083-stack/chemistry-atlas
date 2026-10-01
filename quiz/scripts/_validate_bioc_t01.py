"""Validate bioc-t01.json against the repo's own engine rules and the JSON schema."""
import json
import pathlib
import re

root = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
schema = json.loads((root / 'schema' / 'quiz.schema.json').read_text(encoding='utf-8'))
quiz = json.loads((root / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))

problems = []

allowed_top = set(schema['properties'])
extra_top = set(quiz) - allowed_top
missing_top = set(schema['required']) - set(quiz)
if extra_top:
    problems.append(f'top-level additionalProperties violation: {sorted(extra_top)}')
if missing_top:
    problems.append(f'top-level missing required: {sorted(missing_top)}')

sel = schema['$defs']['selection']
extra_sel = set(quiz['selection']) - set(sel['properties'])
if extra_sel:
    problems.append(f'selection extra keys: {sorted(extra_sel)}')

base = schema['$defs']['baseQuestion']
base_props = set(base['properties'])
# `type` lives on the composed #/$defs/question (oneOf branches), not on baseQuestion.
allowed_q = base_props | {'type', 'options', 'answer', 'answers', 'acceptableAnswers', 'grading'}
required_q = set(base['required'])

for q in quiz['questions']:
    qid = q['id']
    miss = required_q - set(q)
    if miss:
        problems.append(f'{qid}: missing required {sorted(miss)}')
    extra = set(q) - allowed_q
    if extra:
        problems.append(f'{qid}: extra keys {sorted(extra)}')
    if 'image' in q:
        img = q['image']
        if set(img) - {'src', 'alt', 'caption'}:
            problems.append(f'{qid}: image extra keys {sorted(set(img) - {"src", "alt", "caption"})}')
        if not img.get('src', '').strip() or not img.get('alt', '').strip():
            problems.append(f'{qid}: image src/alt must be nonempty')
    if q['type'] == 'single-choice':
        ids = [o['id'] for o in q['options']]
        if q['answer'] not in ids:
            problems.append(f'{qid}: answer {q["answer"]!r} not among option ids {ids}')
    if q['type'] == 'multiple-choice':
        ids = [o['id'] for o in q['options']]
        if not q['answers'] or any(a not in ids for a in q['answers']):
            problems.append(f'{qid}: bad answers {q["answers"]} vs {ids}')
        if len(set(q['answers'])) != len(q['answers']):
            problems.append(f'{qid}: duplicate answers')
    if q['type'] == 'true-false' and not isinstance(q['answer'], bool):
        problems.append(f'{qid}: true-false answer must be bool')
    if q['type'] == 'fill-in-the-blank':
        if not isinstance(q['answer'], str) or not q['answer'].strip():
            problems.append(f'{qid}: fill answer must be nonempty string')
        acc = q.get('acceptableAnswers')
        if acc is not None:
            if not isinstance(acc, list):
                problems.append(f'{qid}: acceptableAnswers must be an array')
            else:
                # the canonical answer must be reachable by exact (normalized) match
                if q['answer'] not in acc:
                    problems.append(f'{qid}: answer missing from acceptableAnswers')

if quiz['totalPoints'] != sum(q['points'] for q in quiz['questions']):
    problems.append('totalPoints != sum of question points')

counts = quiz['selection']['counts']
from collections import Counter
pool = Counter(q['type'] for q in quiz['questions'])
for t, c in counts.items():
    if pool[t] < c:
        problems.append(f'selection wants {c} of {t} but pool has {pool[t]}')

# only one correct answer among single-choice options (no duplicate option text)
for q in quiz['questions']:
    if q['type'] in ('single-choice', 'multiple-choice'):
        texts = [o['text'] for o in q['options']]
        if len(set(texts)) != len(texts):
            problems.append(f'{q["id"]}: duplicate option text')

print(f'questions: {len(quiz["questions"])}')
print(f'pool: {dict(pool)}   selection counts: {counts}')
if problems:
    print(f'\n{len(problems)} PROBLEM(S):')
    for p in problems[:60]:
        print(' -', p)
else:
    print('\nAll checks passed: schema-conformant and self-consistent.')
