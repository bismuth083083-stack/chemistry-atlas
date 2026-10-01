"""Check every family that uses the chr(65 + shift%4) hardcode against reality."""
import json
import pathlib
import re

ROOT = pathlib.Path(r'D:\Deepseek Workspace\笔记总结与导入\repo\quiz')
quiz = json.loads((ROOT / 'data' / 'bioc-t01.json').read_text(encoding='utf-8'))

pat = re.compile(r"chr\(65 \+ \(shift % 4\)\)")
# Determine per-question whether the stored answer letter points at the option
# that the family intends to be correct. We cannot know intent without re-running
# the module, so instead: for single-choice questions with an image, the correct
# option text must equal the expected label (checked in _audit_answer_keys.py).
# Here we just count how many families use the hardcode and list affected ids.

import subprocess
src = (ROOT / 'scripts' / 'amino-acid-questions.mjs').read_text(encoding='utf-8')
n_hard = len(pat.findall(src))
print('hardcoded answer-letter expressions:', n_hard)

# For each, find the enclosing family by scanning backwards for the family comment
lines = src.splitlines()
for i, line in enumerate(lines, 1):
    if pat.search(line):
        # find preceding loop header
        fam = None
        for j in range(i - 1, max(0, i - 30), -1):
            m = re.search(r'for \(const \[(.*?)\] of (\w+)\)', lines[j - 1])
            if m:
                fam = m.group(2)
                break
        print(f'  line {i}: family table = {fam}')
