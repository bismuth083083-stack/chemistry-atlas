"""Resolve the BIOC-T01 rebase conflicts as a union merge.

All three conflicted files are JSON where both sides appended new entries to
the same array/object. Nothing actually contradicts, so the correct resolution
is to take both sides. Doing it structurally (parse each side, merge) is safer
than hand-editing hunk markers, because it re-validates the JSON at the end.
"""

from __future__ import annotations

import io
import json
import re
import sys
from pathlib import Path

REPO = Path(r"D:\Deepseek Workspace\笔记总结与导入\repo")
FILES = [
    REPO / "quiz" / "data" / "index.json",
    REPO / "quiz" / "dist" / "data" / "index.json",
    REPO / "quiz" / "structures-manifest.json",
]

START = re.compile(r"^<{7} ")
MID = re.compile(r"^={7}$")
END = re.compile(r"^>{7} ")


def parse_sides(text: str):
    """Return (ours, theirs) where each is the list of lines outside/inside conflicts.

    For a file with N conflict hunks, we split into: common prefix, then for each
    hunk the two alternatives interleaved with the shared lines between hunks.
    We reconstruct two full documents (ours / theirs) by picking one side per hunk.
    """
    lines = text.splitlines(keepends=True)
    ours, theirs = [], []
    i = 0
    conflicts = 0
    while i < len(lines):
        line = lines[i]
        if START.match(line):
            conflicts += 1
            j = i + 1
            while not MID.match(lines[j]):
                ours.append(lines[j])
                j += 1
            j += 1
            while not END.match(lines[j]):
                theirs.append(lines[j])
                j += 1
            i = j + 1
        else:
            ours.append(line)
            theirs.append(line)
            i += 1
    return "".join(ours), "".join(theirs), conflicts


def union_json(a_text: str, b_text: str):
    a = json.loads(a_text)
    b = json.loads(b_text)

    if isinstance(a, list) and isinstance(b, list):
        # keep order, drop exact duplicates by serialized form
        seen, out = set(), []
        for item in a + b:
            key = json.dumps(item, sort_keys=True, ensure_ascii=False)
            if key not in seen:
                seen.add(key)
                out.append(item)
        return out

    if isinstance(a, dict) and isinstance(b, dict):
        merged = dict(a)
        for key, value in b.items():
            if key in merged:
                if merged[key] == value:
                    continue
                if isinstance(merged[key], list) and isinstance(value, list):
                    seen, out = set(), []
                    for item in merged[key] + value:
                        k = json.dumps(item, sort_keys=True, ensure_ascii=False)
                        if k not in seen:
                            seen.add(k)
                            out.append(item)
                    merged[key] = out
                    continue
                raise SystemExit(f"cannot union key {key!r}: different types/values")
            merged[key] = value
        return merged

    raise SystemExit("top-level types differ; cannot union")


def main() -> int:
    for path in FILES:
        text = io.open(path, encoding="utf-8").read()
        if "<<<<<<<" not in text:
            print(f"{path.name}: no conflict markers, skipped")
            continue
        ours_text, theirs_text, n = parse_sides(text)
        merged = union_json(ours_text, theirs_text)
        out = json.dumps(merged, indent=2, ensure_ascii=False) + "\n"
        io.open(path, "w", encoding="utf-8", newline="\n").write(out)
        print(f"{path.relative_to(REPO)}: resolved {n} conflict hunk(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
