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
  stereochemistry: 'explicit',
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
  make({ id: 'inorg-sulfur-dioxide', chinese_name: '二氧化硫', english_name: 'sulfur-dioxide', smiles: 'O=S=O', formula: 'O2S', reference: 'Chemistry Atlas Inorganic Chemistry chapter 03, Lewis structure and resonance' }),
  make({ id: 'inorg-nitrogen-dioxide', chinese_name: '二氧化氮', english_name: 'nitrogen-dioxide', smiles: '[O-][N+](=O)', formula: 'NO2', reference: 'Chemistry Atlas Inorganic Chemistry chapter 03, odd-electron molecule model' })
];

const ids = new Set(manifest.items.map((item) => item.id));
manifest.items.push(...additions.filter((item) => !ids.has(item.id)));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Structure manifest contains ${manifest.items.length} items.`);
