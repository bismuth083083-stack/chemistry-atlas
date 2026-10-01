"""Generate the amino-acid structure manifest for the chemical-structure-renderer skill.

Data source: IUPAC-IUBMB amino-acid nomenclature, standard L-configuration free amino acids.
All stereocentres are declared explicitly (skill default `stereochemistry: explicit`).
"""
import json
import pathlib

OUT = pathlib.Path(r"D:\Deepseek Workspace\笔记总结与导入\repo\quiz\scripts\_aa-manifest.json")

# key, chinese_name, english_name, smiles, formula, protonation, reference, size
AA = [
    ("glycine", "甘氨酸", "glycine", "NCC(=O)O", "C2H5NO2",
     "Neutral free amino acid; alpha-amino and alpha-carboxyl groups uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("alanine", "丙氨酸", "alanine", "N[C@@H](C)C(=O)O", "C3H7NO2",
     "Neutral free amino acid; alpha-amino and alpha-carboxyl groups uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("serine", "丝氨酸", "serine", "N[C@@H](CO)C(=O)O", "C3H7NO3",
     "Neutral free amino acid; side-chain hydroxyl uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("cysteine", "半胱氨酸", "cysteine", "N[C@@H](CS)C(=O)O", "C3H7NO2S",
     "Neutral free amino acid; side-chain thiol uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("threonine", "苏氨酸", "threonine", "N[C@@H]([C@@H](C)O)C(=O)O", "C4H9NO3",
     "Neutral free amino acid; side-chain hydroxyl uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("valine", "缬氨酸", "valine", "N[C@@H](C(C)C)C(=O)O", "C5H11NO2",
     "Neutral free amino acid; alpha-amino and alpha-carboxyl groups uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("leucine", "亮氨酸", "leucine", "N[C@@H](CC(C)C)C(=O)O", "C6H13NO2",
     "Neutral free amino acid; alpha-amino and alpha-carboxyl groups uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("isoleucine", "异亮氨酸", "isoleucine", "N[C@@H]([C@@H](C)CC)C(=O)O", "C6H13NO2",
     "Neutral free amino acid; alpha-amino and alpha-carboxyl groups uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("methionine", "甲硫氨酸", "methionine", "N[C@@H](CCSC)C(=O)O", "C5H11NO2S",
     "Neutral free amino acid; side-chain thioether uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("proline", "脯氨酸", "proline", "OC(=O)[C@@H]1CCCN1", "C5H9NO2",
     "Neutral free amino acid; secondary amine and carboxyl uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("phenylalanine", "苯丙氨酸", "phenylalanine", "N[C@@H](Cc1ccccc1)C(=O)O", "C9H11NO2",
     "Neutral free amino acid; aromatic side chain uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [520, 280]),
    ("tyrosine", "酪氨酸", "tyrosine", "N[C@@H](Cc1ccc(O)cc1)C(=O)O", "C9H11NO3",
     "Neutral free amino acid; phenolic hydroxyl uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [520, 280]),
    ("tryptophan", "色氨酸", "tryptophan", "N[C@@H](Cc1c[nH]c2ccccc12)C(=O)O", "C11H12N2O2",
     "Neutral free amino acid; indole NH uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [520, 280]),
    ("asparagine", "天冬酰胺", "asparagine", "N[C@@H](CC(N)=O)C(=O)O", "C4H8N2O3",
     "Neutral free amino acid; side-chain amide uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("glutamine", "谷氨酰胺", "glutamine", "N[C@@H](CCC(N)=O)C(=O)O", "C5H10N2O3",
     "Neutral free amino acid; side-chain amide uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; standard amino acid set", [420, 280]),
    ("aspartic-acid", "天冬氨酸", "aspartic-acid", "N[C@@H](CC(=O)O)C(=O)O", "C4H7NO4",
     "Neutral free amino acid drawn with both carboxyls protonated (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; acidic side chain shown in its neutral diacid form", [420, 280]),
    ("glutamic-acid", "谷氨酸", "glutamic-acid", "N[C@@H](CCC(=O)O)C(=O)O", "C5H9NO4",
     "Neutral free amino acid drawn with both carboxyls protonated (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; acidic side chain shown in its neutral diacid form", [420, 280]),
    ("lysine", "赖氨酸", "lysine", "N[C@@H](CCCCN)C(=O)O", "C6H14N2O2",
     "Neutral free amino acid; both amino groups uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; basic side chain shown in its neutral form", [420, 280]),
    ("arginine", "精氨酸", "arginine", r"N[C@@H](CCC/N=C(\N)N)C(=O)O", "C6H14N4O2",
     "Neutral free amino acid; guanidine group drawn neutral as the E-imine tautomer (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; basic side chain shown in its neutral form", [520, 280]),
    ("histidine", "组氨酸", "histidine", "N[C@@H](Cc1c[nH]cn1)C(=O)O", "C6H9N3O2",
     "Neutral free amino acid; imidazole drawn with N1-H tautomer (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; imidazole N1-H tautomer", [420, 280]),
    ("selenocysteine", "硒代半胱氨酸", "selenocysteine", "N[C@@H](C[SeH])C(=O)O", "C3H7NO2Se",
     "Neutral free amino acid; selenol uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; 21st proteinogenic amino acid", [420, 280]),
    ("pyrrolysine", "吡咯赖氨酸", "pyrrolysine", "N[C@@H](CCCCNC(=O)[C@H]1N=C(C)CC1)C(=O)O", "C12H21N3O3",
     "Neutral free amino acid; pyrroline imine and amide uncharged (charge 0)",
     "IUPAC-IUBMB amino acid nomenclature; 22nd proteinogenic amino acid", [520, 320]),
]

items = []
for key, cn, en, smiles, formula, protonation, reference, size in AA:
    items.append({
        "id": "aa-" + key,
        "chinese_name": cn,
        "english_name": en,
        "structure": {"format": "smiles", "value": smiles},
        "protonation": protonation,
        "stereochemistry": "explicit",
        "image_type": "neutral",
        "show_carbon_numbers": False,
        "show_lone_pairs": False,
        "group": None,
        "background": "transparent",
        "size": size,
        "png_scale": 4,
        "source": {
            "type": "authored-educational-structure",
            "reference": reference,
            "accessed": "2026-09-20",
        },
        "expected": {"formula": formula, "net_charge": 0},
    })

OUT.write_text(json.dumps({"version": 1, "items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {len(items)} items to {OUT}")
