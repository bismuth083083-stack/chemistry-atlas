import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(here, '..', 'structures-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const make = (item) => ({
  id: item.id,
  chinese_name: item.chinese_name,
  english_name: item.english_name,
  structure: { format: 'smiles', value: item.smiles },
  protonation: item.protonation || 'Neutral educational form; charge 0',
  stereochemistry: item.stereochemistry || 'explicit',
  image_type: 'neutral',
  show_carbon_numbers: false,
  show_lone_pairs: false,
  group: null,
  background: 'transparent',
  size: item.size || [520, 280],
  png_scale: 4,
  source: { type: 'authored-educational-structure', reference: item.reference, accessed: '2026-09-20' },
  expected: { formula: item.formula, net_charge: item.net_charge ?? 0 }
});

const additions = [
  make({ id: 'org-2-4-dimethylpentane', chinese_name: '2,4-二甲基戊烷', english_name: '2,4-dimethylpentane', smiles: 'CC(C)CC(C)C', formula: 'C7H16', reference: 'Chemistry Atlas Organic Chemistry chapter 04, branched-chain naming' }),
  make({ id: 'org-3-ethyl-2-methylpentane', chinese_name: '3-乙基-2-甲基戊烷', english_name: '3-ethyl-2-methylpentane', smiles: 'CC(C)C(CC)CC', formula: 'C8H18', reference: 'Chemistry Atlas Organic Chemistry chapter 04, parent-chain and substituent naming' }),
  make({ id: 'org-2-5-7-9-tetramethyldecane', chinese_name: '2,5,7,9-四甲基癸烷', english_name: '2-5-7-9-tetramethyldecane', smiles: 'CC(C)CCC(C)CC(C)CC(C)C', formula: 'C14H30', stereochemistry: 'unspecified-approved', reference: 'Chemistry Atlas Organic Chemistry chapter 04, long-chain branched-alkane naming' }),
  make({ id: 'org-4-cyclohexylheptane', chinese_name: '4-环己基庚烷', english_name: '4-cyclohexylheptane', smiles: 'CCCC(C1CCCCC1)CCC', formula: 'C13H26', stereochemistry: 'unspecified-approved', reference: 'Chemistry Atlas Organic Chemistry chapter 04, cycloalkyl substituent naming' }),
  make({ id: 'org-bicyclo-4-4-0-decane', chinese_name: '双环[4.4.0]癸烷', english_name: 'bicyclo-4-4-0-decane', smiles: 'C1CCC2CCCCC2C1', formula: 'C10H18', stereochemistry: 'unspecified-approved', reference: 'Chemistry Atlas Organic Chemistry chapter 04, fused bicyclic nomenclature' }),
  make({ id: 'org-spiro-4-5-decane', chinese_name: '螺[4.5]癸烷', english_name: 'spiro-4-5-decane', smiles: 'C1CC2(CC1)CCCCC2', formula: 'C10H18', stereochemistry: 'unspecified-approved', reference: 'Chemistry Atlas Organic Chemistry chapter 04, spiro nomenclature' }),
  make({ id: 'org-adamantane', chinese_name: '金刚烷', english_name: 'adamantane', smiles: 'C1C2CC3CC1CC(C2)C3', formula: 'C10H16', stereochemistry: 'unspecified-approved', reference: 'Chemistry Atlas Organic Chemistry chapter 04, bridged polycyclic nomenclature' }),
  make({ id: 'inorg-sulfur-dioxide', chinese_name: '二氧化硫', english_name: 'sulfur-dioxide', smiles: 'O=S=O', formula: 'O2S', reference: 'Chemistry Atlas Inorganic Chemistry chapter 03, Lewis structure and resonance' }),
  make({ id: 'inorg-nitrogen-dioxide', chinese_name: '二氧化氮', english_name: 'nitrogen-dioxide', smiles: '[O-][N+](=O)', formula: 'NO2', reference: 'Chemistry Atlas Inorganic Chemistry chapter 03, odd-electron molecule model' })
];

const ids = new Set(manifest.items.map((item) => item.id));
manifest.items.push(...additions.filter((item) => !ids.has(item.id)));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Structure manifest contains ${manifest.items.length} items.`);
