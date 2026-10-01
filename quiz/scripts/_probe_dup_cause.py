"""Confirm every 'duplicate option text' case is a distractor that equals the answer."""
import json
import pathlib

root = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((root / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))

bad = []
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
    dup = {t for t in texts if texts.count(t) > 1}
    bad.append((q['id'], correct, sorted(dup), sorted(set(texts) - dup)))

print(f'{len(bad)} affected questions; the duplicated text is the ANSWER in all of them?')
allmatch = all(set(c) & set(d) for _, c, d, _ in bad)
print('  every duplicate equals the correct answer:', allmatch)
print()
for qid, correct, dup, rest in bad[:8]:
    print(f'{qid}: answer={correct} duplicated={dup} other_distractors={rest}')
print('...')
for qid, correct, dup, rest in bad[-4:]:
    print(f'{qid}: answer={correct} duplicated={dup} other_distractors={rest}')
