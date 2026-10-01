"""Human-readable spot check of representative questions from each family."""
import json
import pathlib

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
byid = {q['id']: q for q in quiz['questions']}

picks = ['q001', 'q003', 'q022', 'q029', 'q067', 'q068', 'q128', 'q164',
         'q165', 'q174', 'q180', 'q200', 'q218']

for qid in picks:
    q = byid.get(qid)
    if not q:
        continue
    print(f"=== {qid}  [{q['type']}]  {q['difficulty']}  {q['points']}pt")
    print(f"  Q: {q['question']}")
    if q.get('image'):
        print(f"  IMG: {q['image']['src']}")
        print(f"       alt: {q['image']['alt']}")
    for o in q.get('options', []):
        mark = ''
        if q['type'] == 'single-choice' and o['id'] == q['answer']:
            mark = '  <-- ANSWER'
        if q['type'] == 'multiple-choice' and o['id'] in q.get('answers', []):
            mark = '  <-- ANSWER'
        print(f"    {o['id']}. {o['text']}{mark}")
    if q['type'] == 'true-false':
        print(f"  ANSWER: {q['answer']}")
    if q['type'] == 'fill-in-the-blank':
        print(f"  ANSWER: {q['answer']!r}   acceptable: {q.get('acceptableAnswers')}")
    print(f"  EXPL: {q['explanation'][:150]}")
    print()
