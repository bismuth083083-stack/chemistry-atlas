import json
import pathlib

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
man = json.loads((ROOT / 'scripts' / '_aa-manifest.json').read_text(encoding='utf-8'))

print('--- image src samples ---')
seen = 0
for q in quiz['questions']:
    if 'image' in q:
        print(q['id'], '->', q['image']['src'])
        seen += 1
        if seen >= 6:
            break

print('\n--- manifest items ---')
for i in man['items']:
    print(i['id'], '|', i['english_name'], '|', i['image_type'])
