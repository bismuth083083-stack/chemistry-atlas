"""Find which amino acid item trips the unspecified-stereochemistry validation."""
import json
import pathlib
import sys

sys.path.insert(0, r"D:\Deepseek Workspace\chemical-structure-renderer\scripts")
from rdkit import Chem
from validate_structure import parse_structure, validate

man = json.loads(pathlib.Path(r"D:\Deepseek Workspace\笔记总结与导入\repo\quiz\scripts\_aa-manifest.json").read_text(encoding="utf-8"))
base = pathlib.Path(r"D:\Deepseek Workspace\笔记总结与导入\repo\quiz\scripts")

# Replicate the potential_stereo report without failing fast.
from rdkit.Chem import FindMolChiralCenters  # noqa: E402

for item in man["items"]:
    m, _raw = parse_structure(item["structure"], base)
    centers = Chem.FindMolChiralCenters(m, includeUnassigned=True, useLegacyImplementation=False)
    unassigned = [c for c in centers if c[1] == "?"]
    tag = "UNASSIGNED" if unassigned else "ok"
    print(f"{tag:11s} {item['id']:24s} {centers}")
