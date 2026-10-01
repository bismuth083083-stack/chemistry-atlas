"""Semantic answer-key audit: is every stored answer actually correct?

This does not trust the generator. It re-derives the expected mapping from the
INDEPENDENT source of truth (the SMILES manifest + rendered filenames + the
standard IUPAC one-letter code assignment) and checks each question.
"""
import json
import pathlib
import re

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
manifest = json.loads((ROOT / 'scripts' / '_aa-manifest.json').read_text(encoding='utf-8'))
src = (ROOT / 'scripts' / 'amino-acid-questions.mjs').read_text(encoding='utf-8')

# --- independent truth table, typed by hand from IUPAC-IUBMB nomenclature ---
TRUTH = {
    '甘氨酸':   ('glycine',       'Gly', 'G'),
    '丙氨酸':   ('alanine',       'Ala', 'A'),
    '缬氨酸':   ('valine',        'Val', 'V'),
    '亮氨酸':   ('leucine',       'Leu', 'L'),
    '异亮氨酸': ('isoleucine',    'Ile', 'I'),
    '脯氨酸':   ('proline',       'Pro', 'P'),
    '苯丙氨酸': ('phenylalanine', 'Phe', 'F'),
    '色氨酸':   ('tryptophan',    'Trp', 'W'),
    '酪氨酸':   ('tyrosine',      'Tyr', 'Y'),
    '丝氨酸':   ('serine',        'Ser', 'S'),
    '苏氨酸':   ('threonine',     'Thr', 'T'),
    '半胱氨酸': ('cysteine',      'Cys', 'C'),
    '甲硫氨酸': ('methionine',    'Met', 'M'),
    '天冬酰胺': ('asparagine',    'Asn', 'N'),
    '谷氨酰胺': ('glutamine',     'Gln', 'Q'),
    '天冬氨酸': ('aspartic acid', 'Asp', 'D'),
    '谷氨酸':   ('glutamic acid', 'Glu', 'E'),
    '赖氨酸':   ('lysine',        'Lys', 'K'),
    '精氨酸':   ('arginine',      'Arg', 'R'),
    '组氨酸':   ('histidine',     'His', 'H'),
    '硒代半胱氨酸': ('selenocysteine', 'Sec', 'U'),
    '吡咯赖氨酸':   ('pyrrolysine',    'Pyl', 'O'),
}
cn2three = {k: v[1] for k, v in TRUTH.items()}
cn2one = {k: v[2] for k, v in TRUTH.items()}
three2cn = {v[1]: k for k, v in TRUTH.items()}
three2one = {v[1]: v[2] for k, v in TRUTH.items()}
one2three = {v[2]: v[1] for k, v in TRUTH.items()}
one2cn = {v[2]: k for k, v in TRUTH.items()}

# image filename -> key, from the render manifest
img2key = {}
for item in manifest['items']:
    stem = f"{item['id']}-{item['english_name']}-{item['image_type']}.png"
    img2key[stem] = item['id']             # e.g. aa-alanine-alanine-neutral.png
    img2key.setdefault('@' + item['id'], item['id'])

# key -> chinese/three/one via the render manifest's own english name + TRUTH
key2row = {}
for item in manifest['items']:
    key = item['id']
    en = item['english_name'].lower().replace('-', ' ')
    for cn, (en2, three, one) in TRUTH.items():
        if en2.replace('-', ' ') == en or en2 == item['english_name'].lower():
            key2row[key] = (cn, three, one)
            break

print('manifest keys resolved:', len(key2row), '/', len(manifest['items']))
missing = [i['id'] for i in manifest['items'] if i['id'] not in key2row]
if missing:
    print('UNRESOLVED:', missing)

def img_key(q):
    src_ = q.get('image', {}).get('src', '')
    m = re.search(r'(aa-[a-z\-]+?)-[a-z\-]+-neutral\.png$', src_)
    return m.group(1) if m else None

errors = []
checked = 0

for q in quiz['questions']:
    qid, qtype = q['id'], q['type']
    text = q['question']

    if qtype == 'single-choice':
        correct = [o['text'] for o in q['options'] if o['id'] == q['answer']]
        assert len(correct) == 1, qid
        correct = correct[0]
    elif qtype == 'multiple-choice':
        correct = [o['text'] for o in q['options'] if o['id'] in q['answers']]
    else:
        continue

    key = img_key(q)
    if key and key in key2row:
        cn, three, one = key2row[key]

        # structure -> Chinese name
        if '哪种氨基酸' in text and '骨架' in text:
            checked += 1
            if correct != cn:
                errors.append(f'{qid}: structure->中文 expected {cn!r} got {correct!r}')

        # structure -> English name
        elif 'Which amino acid is shown' in text:
            checked += 1
            exp = TRUTH[cn][0]
            if correct.lower().replace('-', ' ') != exp.replace('-', ' '):
                errors.append(f'{qid}: structure->English expected {exp!r} got {correct!r}')

        # structure -> one-letter
        elif '单字母缩写是' in text and '下图' in text:
            checked += 1
            if correct != one:
                errors.append(f'{qid}: structure->1letter expected {one!r} got {correct!r}')

        # structure -> three-letter
        elif '三字母缩写是' in text and '下图' in text:
            checked += 1
            if correct != three:
                errors.append(f'{qid}: structure->3letter expected {three!r} got {correct!r}')

        # one-letter -> structure
        elif '下列结构中' in text:
            checked += 1
            m = re.match(r'下列结构中，哪一个是单字母缩写为 (\w) 的氨基酸', text)
            if m:
                letter = m.group(1)
                exp_cn = one2cn[letter]
                if correct != f'{one2three[letter]}（{exp_cn}）':
                    errors.append(f'{qid}: letter({letter})->structure expected {one2three[letter]}（{exp_cn}） got {correct!r}')

    # three-letter -> Chinese
    m = re.match(r'三字母缩写 (\w+) 对应的氨基酸是', text)
    if m and qtype == 'single-choice':
        checked += 1
        exp = three2cn.get(m.group(1))
        if exp is None:
            errors.append(f'{qid}: unknown three-letter {m.group(1)}')
        elif correct != exp:
            errors.append(f'{qid}: three({m.group(1)})->中文 expected {exp!r} got {correct!r}')

    # Chinese -> three-letter (single choice variant, if any)
    m = re.match(r'氨基酸「(.+?)」的三字母缩写是……', text)
    if m and qtype == 'single-choice':
        checked += 1
        exp = cn2three.get(m.group(1))
        if exp and correct != exp:
            errors.append(f'{qid}: 中文({m.group(1)})->3letter expected {exp!r} got {correct!r}')

    # Chinese -> one-letter (single choice variant)
    m = re.match(r'氨基酸「(.+?)」的单字母缩写是……', text)
    if m and qtype == 'single-choice':
        checked += 1
        exp = cn2one.get(m.group(1))
        if exp and correct != exp:
            errors.append(f'{qid}: 中文({m.group(1)})->1letter expected {exp!r} got {correct!r}')

print(f'\nsemantically re-derived {checked} choice-answer keys')
print(f'{len(errors)} MISMATCH(ES)')
for e in errors:
    print('  -', e)
