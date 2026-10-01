"""Exhaustive answer-key audit for every single-choice / multiple-choice item.

Re-derives the expected answer from an independent truth table rather than
trusting the generator. Anything not classifiable is reported so it cannot
silently pass.
"""
import json
import pathlib
import re

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
manifest = json.loads((ROOT / 'scripts' / '_aa-manifest.json').read_text(encoding='utf-8'))

TRUTH = {
    '甘氨酸': ('glycine', 'Gly', 'G'), '丙氨酸': ('alanine', 'Ala', 'A'),
    '缬氨酸': ('valine', 'Val', 'V'), '亮氨酸': ('leucine', 'Leu', 'L'),
    '异亮氨酸': ('isoleucine', 'Ile', 'I'), '脯氨酸': ('proline', 'Pro', 'P'),
    '苯丙氨酸': ('phenylalanine', 'Phe', 'F'), '色氨酸': ('tryptophan', 'Trp', 'W'),
    '酪氨酸': ('tyrosine', 'Tyr', 'Y'), '丝氨酸': ('serine', 'Ser', 'S'),
    '苏氨酸': ('threonine', 'Thr', 'T'), '半胱氨酸': ('cysteine', 'Cys', 'C'),
    '甲硫氨酸': ('methionine', 'Met', 'M'), '天冬酰胺': ('asparagine', 'Asn', 'N'),
    '谷氨酰胺': ('glutamine', 'Gln', 'Q'), '天冬氨酸': ('aspartic acid', 'Asp', 'D'),
    '谷氨酸': ('glutamic acid', 'Glu', 'E'), '赖氨酸': ('lysine', 'Lys', 'K'),
    '精氨酸': ('arginine', 'Arg', 'R'), '组氨酸': ('histidine', 'His', 'H'),
    '硒代半胱氨酸': ('selenocysteine', 'Sec', 'U'), '吡咯赖氨酸': ('pyrrolysine', 'Pyl', 'O'),
}
cn2three = {k: v[1] for k, v in TRUTH.items()}
cn2one = {k: v[2] for k, v in TRUTH.items()}
three2cn = {v[1]: k for k, v in TRUTH.items()}
one2cn = {v[2]: k for k, v in TRUTH.items()}
one2three = {v[2]: v[1] for k, v in TRUTH.items()}

# image stem -> amino acid key. The question src is "assets/structure-renders/
# <key>-<key>-neutral.png" (no "aa-" prefix; the manifest id carries that).
key2row = {}
for item in manifest['items']:
    en = item['english_name'].lower()
    for cn, (en2, three, one) in TRUTH.items():
        if en2.replace(' ', '-') == en or en2 == en:
            key2row[en] = (cn, three, one)
            break

def img_key(q):
    # "aspartic-acid"/"glutamic-acid" stems are hyphenated; strip a trailing
    # "-<same>" duplication by splitting on the repeated stem.
    src = q.get('image', {}).get('src', '')
    m = re.search(r'structure-renders/(.+?)-neutral\.png$', src)
    if not m:
        return None
    stem = m.group(1)                       # e.g. "aspartic-acid-aspartic-acid"
    half = len(stem) // 2
    if len(stem) % 2 == 1 and stem[:half] == stem[half + 1:]:
        return stem[:half]                  # "aspartic-acid"
    if stem[:half] == stem[half:]:
        return stem[:half]
    return stem

errors, unclassified = [], []
checked = 0
manual = set()

for q in quiz['questions']:
    if q['type'] not in ('single-choice', 'multiple-choice'):
        continue
    qid, text = q['id'], q['question']
    if q['type'] == 'single-choice':
        correct = [o['text'] for o in q['options'] if o['id'] == q['answer']]
        correct = correct[0] if len(correct) == 1 else None
    else:
        correct = [o['text'] for o in q['options'] if o['id'] in q['answers']]

    k = img_key(q)
    row = key2row.get(k) if k else None
    exp = None

    if row:
        cn, three, one = row
        if '骨架结构' in text:
            exp = cn
        elif 'Which amino acid is shown' in text:
            exp = TRUTH[cn][0]
        elif '单字母缩写是' in text:
            exp = one
        elif '三字母缩写是' in text:
            exp = three
        elif '下列结构中' in text:
            m = re.search(r'单字母缩写为 (\w)', text)
            exp = f'{one2three[m.group(1)]}（{one2cn[m.group(1)]}）' if m else None

    if exp is None:
        m = re.match(r'三字母缩写 (\w+) 对应的氨基酸是', text)
        if m:
            exp = three2cn.get(m.group(1))

    if exp is None:
        unclassified.append((qid, text[:60], correct))
        continue

    checked += 1
    norm = lambda s: str(s).lower().replace('-', ' ').replace('  ', ' ').strip()
    if q['type'] == 'single-choice':
        if norm(correct) != norm(exp):
            errors.append(f'{qid}: expected {exp!r} got {correct!r}  | {text[:50]}')
    else:
        if exp not in correct:
            errors.append(f'{qid}: expected {exp!r} among {correct!r}')

print(f'choice questions total: {sum(1 for q in quiz["questions"] if q["type"] in ("single-choice","multiple-choice"))}')
print(f're-derived from truth table: {checked}')
print(f'MISMATCHES: {len(errors)}')
for e in errors:
    print('  -', e)
print(f'\nnot classifiable (need manual review): {len(unclassified)}')
for qid, t, c in unclassified:
    print(f'  {qid}  ans={c!r}  {t}')
