"""Probe: verify L-amino-acid SMILES resolve to the expected formula, charge, and CIP (S) center."""
import json
import sys
from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors

# (key, smiles, expected_formula, expected_charge, expected_free_amine_CIP)
AA = [
    ("glycine",       "NCC(=O)O",                                        "C2H5NO2",  0, None),
    ("alanine",       "N[C@@H](C)C(=O)O",                                "C3H7NO2",  0, "S"),
    ("serine",        "N[C@@H](CO)C(=O)O",                               "C3H7NO3",  0, "S"),
    ("cysteine",      "N[C@@H](CS)C(=O)O",                               "C3H7NO2S", 0, "R"),
    ("threonine",     "N[C@@H]([C@@H](C)O)C(=O)O",                       "C4H9NO3",  0, "S"),
    ("valine",        "N[C@@H](C(C)C)C(=O)O",                            "C5H11NO2", 0, "S"),
    ("leucine",       "N[C@@H](CC(C)C)C(=O)O",                           "C6H13NO2", 0, "S"),
    ("isoleucine",    "N[C@@H]([C@@H](C)CC)C(=O)O",                      "C6H13NO2", 0, "S"),
    ("methionine",    "N[C@@H](CCSC)C(=O)O",                             "C5H11NO2S",0, "S"),
    ("proline",       "OC(=O)[C@@H]1CCCN1",                              "C5H9NO2",  0, "S"),
    ("phenylalanine", "N[C@@H](Cc1ccccc1)C(=O)O",                        "C9H11NO2", 0, "S"),
    ("tyrosine",      "N[C@@H](Cc1ccc(O)cc1)C(=O)O",                     "C9H11NO3", 0, "S"),
    ("tryptophan",    "N[C@@H](Cc1c[nH]c2ccccc12)C(=O)O",                "C11H12N2O2",0,"S"),
    ("asparagine",    "N[C@@H](CC(N)=O)C(=O)O",                          "C4H8N2O3", 0, "S"),
    ("glutamine",     "N[C@@H](CCC(N)=O)C(=O)O",                         "C5H10N2O3",0, "S"),
    ("aspartate",     "N[C@@H](CC(=O)O)C(=O)O",                          "C4H7NO4",  0, "S"),
    ("glutamate",     "N[C@@H](CCC(=O)O)C(=O)O",                         "C5H9NO4",  0, "S"),
    ("lysine",        "N[C@@H](CCCCN)C(=O)O",                            "C6H14N2O2",0, "S"),
    ("arginine",      "N[C@@H](CCCNC(=N)N)C(=O)O",                       "C6H14N4O2",0, "S"),
    ("histidine",     "N[C@@H](Cc1c[nH]cn1)C(=O)O",                      "C6H9N3O2", 0, "S"),
    ("selenocysteine","N[C@@H](C[SeH])C(=O)O",                           "C3H7NO2Se",0, "R"),
    ("pyrrolysine",   "N[C@@H](CCCCNC(=O)[C@H]1N=C(C)CC1)C(=O)O",         "C12H21N3O3",0,"S"),
]

fail = 0
for key, smi, formula, charge, want_cip in AA:
    m = Chem.MolFromSmiles(smi)
    if m is None:
        print(f"FAIL {key:15s} unparseable"); fail += 1; continue
    Chem.AssignStereochemistry(m, cleanIt=True, force=True)
    got_formula = rdMolDescriptors.CalcMolFormula(m)
    got_charge = Chem.GetFormalCharge(m)
    cips = sorted(a.GetProp("_CIPCode") for a in m.GetAtoms() if a.HasProp("_CIPCode"))
    problems = []
    if got_formula != formula: problems.append(f"formula {got_formula} != {formula}")
    if got_charge != charge: problems.append(f"charge {got_charge} != {charge}")
    if want_cip:
        aa_carbon = [a for a in m.GetAtoms() if a.GetSymbol() == "C"
                     and any(n.GetSymbol() == "N" for n in a.GetNeighbors())
                     and any(n.GetSymbol() == "C" and any(b.GetBondTypeAsDouble() == 2
                         and any(x.GetSymbol() == "O" for x in n.GetNeighbors()) for b in n.GetBonds())
                         for n in a.GetNeighbors())]
        got = aa_carbon[0].GetProp("_CIPCode") if aa_carbon and aa_carbon[0].HasProp("_CIPCode") else None
        if got != want_cip: problems.append(f"alpha-CIP {got} != {want_cip}")
    status = "ok" if not problems else "FAIL"
    if problems: fail += 1
    print(f"{status:4s} {key:15s} {got_formula:12s} q={got_charge:+d} CIP={','.join(cips) or '-':6s} {'; '.join(problems)}")

print(f"\n{len(AA)-fail}/{len(AA)} passed")
sys.exit(1 if fail else 0)
