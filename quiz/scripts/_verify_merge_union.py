"""Verify the union-merged BIOC-T01 state after the rebase.

Checks that both the remote's additions (ORG-L08 and its structures) and ours
(BIOC-T01 and the 22 amino-acid structures) survived the merge intact, and that
the two quiz trees stay byte-identical modulo the documented path rewrite.
"""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path

QUIZ = Path(r"D:\Deepseek Workspace\笔记总结与导入\repo\quiz")
failures: list[str] = []


def check(label: str, ok: bool, detail: str = "") -> None:
    print(f"  [{'OK ' if ok else 'FAIL'}] {label}{(' -> ' + detail) if detail else ''}")
    if not ok:
        failures.append(label)


print("=== index registration (both trees) ===")
for rel in ("data/index.json", "dist/data/index.json"):
    doc = json.loads(io.open(QUIZ / rel, encoding="utf-8").read())
    ids = [q["id"] for q in doc["quizzes"]]
    check(f"{rel}: BIOC-T01 present", "BIOC-T01" in ids)
    check(f"{rel}: ORG-L08 present (remote change kept)", "ORG-L08" in ids, f"{len(ids)} quizzes")
    check(f"{rel}: no duplicate ids", len(ids) == len(set(ids)))
    bioc = next((q for q in doc["quizzes"] if q["id"] == "BIOC-T01"), None)
    if bioc:
        check(
            f"{rel}: BIOC-T01 metadata",
            bioc["mode"] == "question-bank"
            and bioc["path"] == "bioc-t01.json"
            and bioc["questionCount"] == 218,
            f"mode={bioc['mode']} path={bioc['path']} count={bioc['questionCount']}",
        )

print("=== quiz payloads ===")
for rel in ("data/bioc-t01.json", "dist/data/bioc-t01.json"):
    doc = json.loads(io.open(QUIZ / rel, encoding="utf-8").read())
    pts = sum(q["points"] for q in doc["questions"])
    check(
        f"{rel}: {len(doc['questions'])} questions / {pts} points",
        len(doc["questions"]) == 218 and pts == 343 and doc["totalPoints"] == 343,
    )
    check(f"{rel}: no aaCatalog key", "aaCatalog" not in doc)

print("=== structures manifest ===")
man = json.loads(io.open(QUIZ / "structures-manifest.json", encoding="utf-8").read())
items = man["items"] if isinstance(man, dict) and "items" in man else man
ids = [i["id"] for i in items]
aa = [i for i in ids if i.startswith("aa-")]
og08 = [i for i in ids if i.startswith("og08-")]
check("manifest: 22 aa-* entries", len(aa) == 22, f"{len(aa)}")
check("manifest: og08-* entries kept from remote", len(og08) > 0, f"{len(og08)}")
check("manifest: no duplicate ids", len(ids) == len(set(ids)), f"{len(ids)} total")

print("=== two trees byte-identical modulo path rewrite ===")
dev = io.open(QUIZ / "data/bioc-t01.json", encoding="utf-8").read()
dis = io.open(QUIZ / "dist/data/bioc-t01.json", encoding="utf-8").read()
check(
    "dist == dev after reversing assets path rewrite",
    dis.replace("assets/structures/", "assets/structure-renders/") == dev,
)

print("=== image references resolve on disk (simulated 404 check) ===")
doc = json.loads(dev)
refs = [q["image"]["src"] for q in doc["questions"] if q.get("image")]
missing = [r for r in refs if not (QUIZ / r).exists()]
check(f"dev tree: {len(refs)} image refs", not missing, f"{len(missing)} missing")

doc_d = json.loads(io.open(QUIZ / "dist/data/bioc-t01.json", encoding="utf-8").read())
refs_d = [q["image"]["src"] for q in doc_d["questions"] if q.get("image")]
missing_d = [r for r in refs_d if not (QUIZ / "dist" / r).exists()]
check(f"dist tree: {len(refs_d)} image refs", not missing_d, f"{len(missing_d)} missing")

print()
if failures:
    print(f"RESULT: FAIL ({len(failures)} problem(s))")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("RESULT: PASS")
