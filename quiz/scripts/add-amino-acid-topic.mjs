/**
 * Register the BIOC-T01 amino-acid identification topic:
 *  - writes data/bioc-t01.json and dist/data/bioc-t01.json
 *  - adds the aa-* structures to structures-manifest.json
 *  - registers the topic in data/index.json and dist/data/index.json
 *
 * Structures are rendered separately by the skill:
 *   python scripts/render_manifest.py scripts/_aa-manifest.json --output scripts/_aa-render-v2
 * then copied into dist/assets/structures/ (see the copy step at the bottom).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aaQuestions } from './amino-acid-questions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = path.join(root, 'data');
const distDataRoot = path.join(root, 'dist', 'data');
const manifestPath = path.join(root, 'structures-manifest.json');
const renderManifestPath = path.join(root, 'scripts', '_aa-manifest.json');

const questions = aaQuestions;

const quiz = {
  id: 'BIOC-T01',
  title: '生物化学专题：21+ 种氨基酸的五个身份',
  description:
    '以氨基酸的五种身份（中文名、英文名、三字母缩写、单字母缩写、结构图）互相转换为主线：给出其中一种，答出另一种并判定正误。题库共 ' +
    questions.length +
    ' 题，每次随机抽取 22 题；结构图由 Chemical Structure Renderer 依据显式 L-构型 SMILES 渲染。',
  subject: 'biochemistry',
  chapter: 'Topic · Amino acid identifiers and structures',
  version: '1.0.0',
  totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
  selection: {
    mode: 'question-bank',
    counts: { 'single-choice': 10, 'multiple-choice': 4, 'true-false': 4, 'fill-in-the-blank': 4 }
  },
  sources: [
    {
      title: 'IUPAC-IUBMB Joint Commission on Biochemical Nomenclature — amino acid abbreviations',
      url: 'https://iupac.qmul.ac.uk/AminoAcid/',
      role: '三字母/单字母缩写与命名依据；仅作对照，未批量复制'
    },
    {
      title: 'Chemical Structure Renderer (RDKit) — local skill',
      url: 'https://www.rdkit.org/',
      role: '结构图由显式 SMILES 经本地 RDKit 渲染，保留 SVG/PNG/MOL 与 metadata 溯源'
    }
  ],
  scopeNote:
    'This is an independently authored educational bank. All 22 structures were rendered from explicit L-configuration SMILES by the local chemical-structure-renderer skill; every item declares formula, net charge, and stereochemistry so the identifier drills can be cross-checked against machine-verified structures rather than hand-drawn art. The bank covers the 20 canonical amino acids plus selenocysteine (Sec/U) and pyrrolysine (Pyl/O).',
  questions
};

const manifestEntry = {
  id: 'BIOC-T01',
  title: quiz.title,
  description: quiz.description,
  subject: 'biochemistry',
  type: 'topic',
  lessonNumber: null,
  topicNumber: 1,
  examNumber: null,
  chapter: quiz.chapter,
  lesson: 'Amino acid identifiers: name, English name, three-letter and one-letter codes, structure',
  topic: 'Randomized amino-acid identification bank',
  questionCount: questions.length,
  difficulty: 'intermediate',
  tags: ['amino acids', 'nomenclature', 'three-letter code', 'one-letter code', 'structure', 'stereochemistry'],
  knowledgePoints: [
    'Chinese and English names of the 22 proteinogenic amino acids',
    'three-letter codes',
    'one-letter codes',
    'side-chain functional groups',
    'L-configuration and CIP assignment',
    'non-standard amino acids (selenocysteine, pyrrolysine)'
  ],
  createdAt: '2026-10-01',
  updatedAt: '2026-10-01',
  relatedNotes: ['/biochem/dist/chapter-02.html'],
  path: 'bioc-t01.json',
  mode: 'question-bank'
};

/* ---- 1. add aa-* structures to the render manifest ---- */
const renderManifest = JSON.parse(fs.readFileSync(renderManifestPath, 'utf8'));
const structureManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
structureManifest.items = structureManifest.items.filter((item) => !String(item.id).startsWith('aa-'));
structureManifest.items.push(...renderManifest.items);
fs.writeFileSync(manifestPath, JSON.stringify(structureManifest, null, 2) + '\n', 'utf8');

/* ---- 2. write the quiz, registering image paths per tree ---- */
const body = JSON.stringify(quiz, null, 2) + '\n';
fs.writeFileSync(path.join(dataRoot, 'bioc-t01.json'), body, 'utf8');
fs.writeFileSync(
  path.join(distDataRoot, 'bioc-t01.json'),
  body.replaceAll('assets/structure-renders/', 'assets/structures/'),
  'utf8'
);

/* ---- 3. register in both index files ---- */
for (const target of [path.join(dataRoot, 'index.json'), path.join(distDataRoot, 'index.json')]) {
  const manifest = JSON.parse(fs.readFileSync(target, 'utf8'));
  manifest.quizzes = [...manifest.quizzes.filter((entry) => entry.id !== manifestEntry.id), manifestEntry];
  fs.writeFileSync(target, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

console.log(`Added ${manifestEntry.id} with ${questions.length} questions and ${renderManifest.items.length} render manifest entries.`);
