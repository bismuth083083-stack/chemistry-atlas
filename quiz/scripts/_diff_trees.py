"""Prove dist/data/bioc-t01.json differs from data/bioc-t01.json ONLY by the
structure-renders -> structures path rewrite.
"""
import json
import pathlib

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
dev = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))
dist = json.loads((ROOT / 'dist' / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))

dev_s = json.dumps(dev, ensure_ascii=False, sort_keys=True)
dist_s = json.dumps(dist, ensure_ascii=False, sort_keys=True)
rewritten = dist_s.replace('assets/structures/', 'assets/structure-renders/')
print('dist == dev after reversing the path rewrite:', rewritten == dev_s)

if rewritten != dev_s:
    # locate the first divergence
    for i, (a, b) in enumerate(zip(rewritten, dev_s)):
        if a != b:
            print('first divergence at char', i)
            print('  dist:', repr(rewritten[max(0, i - 80):i + 80]))
            print('  dev :', repr(dev_s[max(0, i - 80):i + 80]))
            break
    else:
        print('lengths differ:', len(rewritten), len(dev_s))
