import json
import pathlib

s = json.loads(pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz\schema\quiz.schema.json').read_text(encoding='utf-8'))
print('top keys:', sorted(s.keys()))
print()
print('questions ->', json.dumps(s['properties']['questions'], ensure_ascii=False)[:500])
print()
for k in ('$defs', 'definitions'):
    if k in s:
        for name, body in s[k].items():
            print(f'--- def {name} ---')
            print('  required:', body.get('required'))
            print('  additionalProperties:', body.get('additionalProperties'))
            print('  props:', sorted((body.get('properties') or {}).keys()))
