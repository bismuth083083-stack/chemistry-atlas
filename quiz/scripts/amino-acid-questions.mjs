/**
 * Amino-acid identification topic bank (BIOC-T01).
 *
 * Design: 22 proteinogenic amino acids (20 standard + selenocysteine + pyrrolysine).
 * Every question drills the mapping between the five identifiers:
 *   Chinese name · English name · three-letter code · one-letter code · structure image
 * The four pairing families the learner asked for are all covered:
 *   1. structure image -> Chinese/English name
 *   2. Chinese name    -> three-letter / one-letter code
 *   3. three-letter    -> Chinese name / one-letter code
 *   4. one-letter      -> three-letter code / Chinese name / structure
 *
 * Structures were rendered from explicit L-configuration SMILES by
 * chemical-structure-renderer (scripts/render_manifest.py); see
 * scripts/_make_aa_manifest.py and the aa-* entries in structures-manifest.json.
 */

const image = (file, alt, caption) => ({
  src: `assets/structure-renders/${file}`,
  alt,
  caption: caption || 'L-构型游离氨基酸骨架式；由 Chemical Structure Renderer 依据显式 SMILES 渲染。'
});

// file stem, chinese, english, three-letter, one-letter, side-chain class
const AA = [
  ['glycine', '甘氨酸', 'glycine', 'Gly', 'G', '非极性'],
  ['alanine', '丙氨酸', 'alanine', 'Ala', 'A', '非极性'],
  ['valine', '缬氨酸', 'valine', 'Val', 'V', '非极性'],
  ['leucine', '亮氨酸', 'leucine', 'Leu', 'L', '非极性'],
  ['isoleucine', '异亮氨酸', 'isoleucine', 'Ile', 'I', '非极性'],
  ['proline', '脯氨酸', 'proline', 'Pro', 'P', '非极性'],
  ['phenylalanine', '苯丙氨酸', 'phenylalanine', 'Phe', 'F', '芳香'],
  ['tryptophan', '色氨酸', 'tryptophan', 'Trp', 'W', '芳香'],
  ['tyrosine', '酪氨酸', 'tyrosine', 'Tyr', 'Y', '芳香'],
  ['serine', '丝氨酸', 'serine', 'Ser', 'S', '极性不带电'],
  ['threonine', '苏氨酸', 'threonine', 'Thr', 'T', '极性不带电'],
  ['cysteine', '半胱氨酸', 'cysteine', 'Cys', 'C', '极性不带电'],
  ['methionine', '甲硫氨酸', 'methionine', 'Met', 'M', '非极性'],
  ['asparagine', '天冬酰胺', 'asparagine', 'Asn', 'N', '极性不带电'],
  ['glutamine', '谷氨酰胺', 'glutamine', 'Gln', 'Q', '极性不带电'],
  ['aspartic-acid', '天冬氨酸', 'aspartic-acid', 'Asp', 'D', '酸性'],
  ['glutamic-acid', '谷氨酸', 'glutamic-acid', 'Glu', 'E', '酸性'],
  ['lysine', '赖氨酸', 'lysine', 'Lys', 'K', '碱性'],
  ['arginine', '精氨酸', 'arginine', 'Arg', 'R', '碱性'],
  ['histidine', '组氨酸', 'histidine', 'His', 'H', '碱性'],
  ['selenocysteine', '硒代半胱氨酸', 'selenocysteine', 'Sec', 'U', '极性不带电'],
  ['pyrrolysine', '吡咯赖氨酸', 'pyrrolysine', 'Pyl', 'O', '碱性']
];

const by = (key) => {
  const row = AA.find((entry) => entry[0] === key);
  if (!row) throw new Error('unknown amino acid: ' + key);
  return { file: `${key}-${key}-neutral.png`, chinese: row[1], english: row[2], three: row[3], one: row[4], cls: row[5] };
};

const pic = (key, alt) => {
  const a = by(key);
  return image(a.file, alt || `${a.chinese}（${a.english}）的骨架结构式`);
};

// —— question constructors (mirror the house style used by add-symmetry-topic.mjs) ——
const points = (difficulty) => (difficulty === 'challenging' ? 3 : difficulty === 'hard' ? 2 : 1);
const one = (id, question, options, answer, explanation, difficulty, tags, picture) => ({
  id, type: 'single-choice', question,
  options: options.map(([optionId, text]) => ({ id: optionId, text })),
  answer, points: points(difficulty), explanation, difficulty, tags, ...(picture ? { image: picture } : {})
});
const many = (id, question, options, answers, explanation, difficulty, tags, picture) => ({
  id, type: 'multiple-choice', question,
  options: options.map(([optionId, text]) => ({ id: optionId, text })),
  answers, points: points(difficulty), explanation, difficulty, tags, ...(picture ? { image: picture } : {})
});
const tf = (id, question, answer, explanation, difficulty, tags, picture) => ({
  id, type: 'true-false', question, answer, points: points(difficulty), explanation, difficulty, tags, ...(picture ? { image: picture } : {})
});
const fill = (id, question, answer, acceptableAnswers, explanation, difficulty, tags, picture) => ({
  id, type: 'fill-in-the-blank', question, answer,
  // dedupe: for single-letter codes the canonical form and its upper-case
  // variant coincide, which would otherwise store the same entry twice.
  acceptableAnswers: [...new Set(acceptableAnswers)],
  grading: { caseSensitive: false, collapseWhitespace: true },
  points: points(difficulty), explanation, difficulty, tags, ...(picture ? { image: picture } : {})
});

// Build a 4-option set and report where the correct answer actually landed.
// `rot(all, k)` moves the element at index 0 to index (len - k) % len, so the
// answer letter cannot be derived from `shift` alone -- it must be read back
// from the rotated array, otherwise the stored key points at a distractor.
const rot = (arr, n) => arr.slice(n).concat(arr.slice(0, n));
const buildOptions = (correct, distractors, shift) => {
  const seen = new Set([correct]);
  const unique = [];
  for (const d of distractors) {
    if (seen.has(d)) continue;
    seen.add(d);
    unique.push(d);
  }
  if (unique.length !== 3) {
    throw new Error(`need 3 distinct distractors for "${correct}", got ${unique.length}: ${JSON.stringify(distractors)}`);
  }
  const all = [correct, ...unique];
  const rotated = rot(all, shift % all.length);
  const options = rotated.map((text, index) => [String.fromCharCode(65 + index), text]);
  const answer = String.fromCharCode(65 + rotated.indexOf(correct));
  return { options, answer };
};
// Back-compat helper for call sites that only need the option list.
const opts = (correct, distractors, shift) => buildOptions(correct, distractors, shift).options;

const questions = [];
let n = 0;
const qid = () => 'q' + String(++n).padStart(3, '0');

/* ------------------------------------------------------------------ *
 * Family 1 — structure image -> Chinese / English name
 * ------------------------------------------------------------------ */
const structToChinese = [
  ['alanine', ['甘氨酸', '缬氨酸', '丝氨酸'], 1, 'easy'],
  ['glycine', ['丙氨酸', '丝氨酸', '半胱氨酸'], 12, 'easy'],
  ['valine', ['亮氨酸', '异亮氨酸', '苏氨酸'], 2, 'medium'],
  ['leucine', ['异亮氨酸', '缬氨酸', '甲硫氨酸'], 5, 'medium'],
  ['serine', ['苏氨酸', '半胱氨酸', '丙氨酸'], 3, 'medium'],
  ['threonine', ['丝氨酸', '缬氨酸', '半胱氨酸'], 7, 'hard'],
  ['cysteine', ['丝氨酸', '甲硫氨酸', '硒代半胱氨酸'], 4, 'medium'],
  ['methionine', ['半胱氨酸', '赖氨酸', '亮氨酸'], 9, 'medium'],
  ['proline', ['组氨酸', '色氨酸', '赖氨酸'], 6, 'medium'],
  ['phenylalanine', ['酪氨酸', '色氨酸', '组氨酸'], 8, 'medium'],
  ['tyrosine', ['苯丙氨酸', '组氨酸', '色氨酸'], 11, 'medium'],
  ['tryptophan', ['酪氨酸', '苯丙氨酸', '组氨酸'], 13, 'hard'],
  ['asparagine', ['谷氨酰胺', '天冬氨酸', '谷氨酸'], 10, 'hard'],
  ['glutamine', ['天冬酰胺', '谷氨酸', '天冬氨酸'], 14, 'hard'],
  ['aspartic-acid', ['谷氨酸', '天冬酰胺', '丙氨酸'], 15, 'hard'],
  ['glutamic-acid', ['天冬氨酸', '谷氨酰胺', '甘氨酸'], 17, 'hard'],
  ['lysine', ['精氨酸', '组氨酸', '天冬酰胺'], 16, 'medium'],
  ['arginine', ['赖氨酸', '组氨酸', '脯氨酸'], 19, 'hard'],
  ['histidine', ['色氨酸', '赖氨酸', '精氨酸'], 18, 'hard'],
  ['selenocysteine', ['半胱氨酸', '甲硫氨酸', '丝氨酸'], 6, 'challenging'],
  ['pyrrolysine', ['赖氨酸', '精氨酸', '组氨酸'], 8, 'challenging']
];

for (const [key, distractors, shift, difficulty] of structToChinese) {
  const a = by(key);
  const { options, answer } = buildOptions(a.chinese, distractors, shift);
  questions.push(one(
    qid(),
    '下图给出的是哪种氨基酸的骨架结构？',
    options,
    answer,
    `该结构是 ${a.chinese}（${a.english}，${a.three}，${a.one}）。区分要点：先看侧链官能团，再核对侧链碳数。`,
    difficulty,
    ['amino acid', 'structure', a.english],
    pic(key)
  ));
}

// structure -> English name
const structToEnglish = [
  ['alanine', ['Glycine', 'Valine', 'Serine'], 0, 'easy'],
  ['cysteine', ['Serine', 'Methionine', 'Selenocysteine'], 3, 'medium'],
  ['proline', ['Histidine', 'Tryptophan', 'Lysine'], 1, 'medium'],
  ['tryptophan', ['Tyrosine', 'Phenylalanine', 'Histidine'], 5, 'hard'],
  ['aspartic-acid', ['Glutamic acid', 'Asparagine', 'Alanine'], 2, 'hard'],
  ['arginine', ['Lysine', 'Histidine', 'Proline'], 6, 'hard'],
  ['selenocysteine', ['Cysteine', 'Methionine', 'Serine'], 4, 'challenging']
];

for (const [key, distractors, shift, difficulty] of structToEnglish) {
  const a = by(key);
  const { options, answer } = buildOptions(a.english, distractors, shift);
  questions.push(one(
    qid(),
    'Which amino acid is shown in the structure below?',
    options,
    answer,
    `结构对应 ${a.english}（${a.chinese}，${a.three}，${a.one}）。`,
    difficulty,
    ['amino acid', 'structure', 'English name', a.english],
    pic(key)
  ));
}

// structure -> one-letter code
const structToOneLetter = [
  ['glycine', ['A', 'S', 'C'], 5, 'easy'],
  ['tryptophan', ['Y', 'F', 'H'], 1, 'medium'],
  ['lysine', ['R', 'H', 'Q'], 2, 'medium'],
  ['cysteine', ['S', 'M', 'T'], 4, 'medium'],
  ['proline', ['H', 'W', 'F'], 0, 'medium'],
  ['phenylalanine', ['Y', 'W', 'H'], 3, 'hard'],
  ['glutamine', ['N', 'E', 'D'], 6, 'hard'],
  ['histidine', ['K', 'R', 'W'], 7, 'hard'],
  ['selenocysteine', ['C', 'S', 'O'], 2, 'challenging'],
  ['pyrrolysine', ['K', 'U', 'R'], 5, 'challenging']
];

for (const [key, distractors, shift, difficulty] of structToOneLetter) {
  const a = by(key);
  const { options, answer } = buildOptions(a.one, distractors, shift);
  questions.push(one(
    qid(),
    '下图所示氨基酸的单字母缩写是……',
    options,
    answer,
    `${a.chinese}的单字母缩写为 ${a.one}，三字母缩写为 ${a.three}。`,
    difficulty,
    ['amino acid', 'structure', 'one-letter code', a.english],
    pic(key)
  ));
}

/* ------------------------------------------------------------------ *
 * Family 2 — Chinese name -> three-letter / one-letter code
 * ------------------------------------------------------------------ */
const chineseToThree = [
  ['甘氨酸', ['Gly', 'Ala', 'Glu'], 0, 'easy'],
  ['丙氨酸', ['Ala', 'Arg', 'Asp'], 3, 'easy'],
  ['丝氨酸', ['Ser', 'Thr', 'Cys'], 1, 'medium'],
  ['苏氨酸', ['Thr', 'Ser', 'Tyr'], 4, 'medium'],
  ['半胱氨酸', ['Cys', 'Ser', 'Met'], 2, 'medium'],
  ['赖氨酸', ['Lys', 'Arg', 'His'], 5, 'medium'],
  ['脯氨酸', ['Pro', 'Phe', 'Trp'], 6, 'medium'],
  ['天冬酰胺', ['Asn', 'Asp', 'Gln'], 7, 'hard'],
  ['谷氨酰胺', ['Gln', 'Glu', 'Asn'], 9, 'hard'],
  ['苯丙氨酸', ['Phe', 'Tyr', 'Trp'], 8, 'medium'],
  ['色氨酸', ['Trp', 'Tyr', 'Phe'], 10, 'hard'],
  ['精氨酸', ['Arg', 'Lys', 'His'], 11, 'hard'],
  ['组氨酸', ['His', 'Lys', 'Arg'], 12, 'hard'],
  ['硒代半胱氨酸', ['Sec', 'Cys', 'Ser'], 1, 'challenging'],
  ['吡咯赖氨酸', ['Pyl', 'Lys', 'Arg'], 3, 'challenging']
];

for (const [cn, distractors, shift, difficulty] of chineseToThree) {
  const a = AA.find((row) => row[1] === cn);
  questions.push(fill(
    qid(),
    `氨基酸「${cn}」的三字母缩写是____。`,
    a[3],
    [a[3], a[3].toUpperCase(), a[3].toLowerCase()],
    `${cn}的英文名是 ${a[2]}，三字母缩写 ${a[3]}，单字母缩写 ${a[4]}。`,
    difficulty,
    ['amino acid', 'three-letter code', cn]
  ));
}

const chineseToOne = [
  ['甘氨酸', 'G', 'easy'],
  ['缬氨酸', 'V', 'easy'],
  ['亮氨酸', 'L', 'medium'],
  ['异亮氨酸', 'I', 'medium'],
  ['甲硫氨酸', 'M', 'medium'],
  ['酪氨酸', 'Y', 'medium'],
  ['天冬氨酸', 'D', 'hard'],
  ['谷氨酸', 'E', 'hard'],
  ['赖氨酸', 'K', 'medium'],
  ['精氨酸', 'R', 'hard'],
  ['组氨酸', 'H', 'hard'],
  ['硒代半胱氨酸', 'U', 'challenging'],
  ['吡咯赖氨酸', 'O', 'challenging']
];

for (const [cn, letter, difficulty] of chineseToOne) {
  const a = AA.find((row) => row[1] === cn);
  questions.push(fill(
    qid(),
    `氨基酸「${cn}」的单字母缩写是____。`,
    letter,
    [letter, letter.toUpperCase(), letter.toLowerCase()],
    `${cn}（${a[2]}，${a[3]}）的单字母缩写是 ${letter}。`,
    difficulty,
    ['amino acid', 'one-letter code', cn]
  ));
}

/* ------------------------------------------------------------------ *
 * Family 3 — three-letter -> Chinese name / one-letter code
 * ------------------------------------------------------------------ */
const threeToChinese = [
  ['Ala', 'A', '丙氨酸', ['甘氨酸', '缬氨酸', '丝氨酸'], 1, 'easy'],
  ['Gly', 'G', '甘氨酸', ['丙氨酸', '谷氨酸', '谷氨酰胺'], 2, 'easy'],
  ['Ser', 'S', '丝氨酸', ['苏氨酸', '半胱氨酸', '缬氨酸'], 3, 'medium'],
  ['Cys', 'C', '半胱氨酸', ['丝氨酸', '甲硫氨酸', '酪氨酸'], 0, 'medium'],
  ['Pro', 'P', '脯氨酸', ['苯丙氨酸', '组氨酸', '色氨酸'], 4, 'medium'],
  ['Lys', 'K', '赖氨酸', ['精氨酸', '组氨酸', '天冬酰胺'], 5, 'medium'],
  ['Phe', 'F', '苯丙氨酸', ['酪氨酸', '色氨酸', '组氨酸'], 6, 'hard'],
  ['Trp', 'W', '色氨酸', ['酪氨酸', '苯丙氨酸', '组氨酸'], 7, 'hard'],
  ['Asn', 'N', '天冬酰胺', ['天冬氨酸', '谷氨酰胺', '谷氨酸'], 8, 'hard'],
  ['Gln', 'Q', '谷氨酰胺', ['谷氨酸', '天冬酰胺', '天冬氨酸'], 9, 'hard'],
  ['Asp', 'D', '天冬氨酸', ['谷氨酸', '天冬酰胺', '丙氨酸'], 10, 'hard'],
  ['Glu', 'E', '谷氨酸', ['天冬氨酸', '谷氨酰胺', '甘氨酸'], 11, 'hard'],
  ['Arg', 'R', '精氨酸', ['赖氨酸', '组氨酸', '脯氨酸'], 12, 'hard'],
  ['His', 'H', '组氨酸', ['赖氨酸', '精氨酸', '色氨酸'], 13, 'hard'],
  ['Met', 'M', '甲硫氨酸', ['半胱氨酸', '丝氨酸', '亮氨酸'], 14, 'medium'],
  ['Sec', 'U', '硒代半胱氨酸', ['半胱氨酸', '丝氨酸', '甲硫氨酸'], 15, 'challenging'],
  ['Pyl', 'O', '吡咯赖氨酸', ['赖氨酸', '精氨酸', '组氨酸'], 16, 'challenging']
];

for (const [three, letter, cn, distractors, shift, difficulty] of threeToChinese) {
  const { options, answer } = buildOptions(cn, distractors, shift);
  questions.push(one(
    qid(),
    `三字母缩写 ${three} 对应的氨基酸是……`,
    options,
    answer,
    `${three} 是 ${cn}，单字母缩写 ${letter}。`,
    difficulty,
    ['amino acid', 'three-letter code', three]
  ));
}

const threeToOne = [
  ['Gly', 'G'], ['Ala', 'A'], ['Val', 'V'], ['Leu', 'L'], ['Ile', 'I'],
  ['Pro', 'P'], ['Phe', 'F'], ['Trp', 'W'], ['Tyr', 'Y'], ['Ser', 'S'],
  ['Thr', 'T'], ['Cys', 'C'], ['Met', 'M'], ['Asn', 'N'], ['Gln', 'Q'],
  ['Asp', 'D'], ['Glu', 'E'], ['Lys', 'K'], ['Arg', 'R'], ['His', 'H'],
  ['Sec', 'U'], ['Pyl', 'O']
];

for (const [three, letter] of threeToOne) {
  const a = AA.find((row) => row[3] === three);
  questions.push(fill(
    qid(),
    `三字母缩写 ${three} 对应的单字母缩写是____。`,
    letter,
    [letter, letter.toUpperCase(), letter.toLowerCase()],
    `${three} 是 ${a[1]}（${a[2]}），单字母缩写 ${letter}。`,
    ['Sec', 'Pyl'].includes(three) ? 'challenging' : 'medium',
    ['amino acid', 'three-letter code', 'one-letter code', three]
  ));
}

/* ------------------------------------------------------------------ *
 * Family 4 — one-letter -> three-letter code / Chinese name / structure
 * ------------------------------------------------------------------ */
const oneToThree = [
  ['G', 'Gly'], ['A', 'Ala'], ['V', 'Val'], ['L', 'Leu'], ['I', 'Ile'],
  ['P', 'Pro'], ['F', 'Phe'], ['W', 'Trp'], ['Y', 'Tyr'], ['S', 'Ser'],
  ['T', 'Thr'], ['C', 'Cys'], ['M', 'Met'], ['N', 'Asn'], ['Q', 'Gln'],
  ['D', 'Asp'], ['E', 'Glu'], ['K', 'Lys'], ['R', 'Arg'], ['H', 'His'],
  ['U', 'Sec'], ['O', 'Pyl']
];

for (const [letter, three] of oneToThree) {
  const a = AA.find((row) => row[4] === letter);
  questions.push(fill(
    qid(),
    `单字母缩写 ${letter} 对应的三字母缩写是____。`,
    three,
    [three, three.toUpperCase(), three.toLowerCase()],
    `${letter} 是 ${a[1]}（${a[2]}），三字母缩写 ${three}。`,
    ['U', 'O'].includes(letter) ? 'challenging' : 'medium',
    ['amino acid', 'one-letter code', 'three-letter code', three]
  ));
}

// one-letter -> structure (match the picture to the code)
const oneToStructure = [
  ['A', ['G', 'V', 'S'], 1, 'easy'],
  ['G', ['A', 'S', 'C'], 2, 'easy'],
  ['W', ['Y', 'F', 'H'], 1, 'medium'],
  ['K', ['R', 'H', 'Q'], 3, 'medium'],
  ['C', ['S', 'M', 'T'], 2, 'medium'],
  ['P', ['H', 'W', 'F'], 0, 'medium'],
  ['F', ['Y', 'W', 'H'], 4, 'hard'],
  ['H', ['K', 'R', 'W'], 5, 'hard'],
  ['N', ['Q', 'D', 'E'], 6, 'hard'],
  ['U', ['C', 'S', 'O'], 2, 'challenging'],
  ['O', ['K', 'R', 'U'], 4, 'challenging']
];

for (const [letter, distractors, shift, difficulty] of oneToStructure) {
  const a = AA.find((row) => row[4] === letter);
  const { options, answer } = buildOptions(`${a[3]}（${a[1]}）`, distractors.map((d) => {
    const row = AA.find((r) => r[4] === d);
    return `${row[3]}（${row[1]}）`;
  }), shift);
  questions.push(one(
    qid(),
    `下列结构中，哪一个是单字母缩写为 ${letter} 的氨基酸？`,
    options,
    answer,
    `${letter} 对应 ${a[1]}（${a[2]}，${a[3]}）。`,
    difficulty,
    ['amino acid', 'one-letter code', 'structure', a.english],
    pic(a[0])
  ));
}

/* ------------------------------------------------------------------ *
 * Discriminating the look-alike pairs (still identifier drills)
 * ------------------------------------------------------------------ */
const lookAlike = [
  ['leucine', 'isoleucine', '亮氨酸与异亮氨酸', '两者侧链都是 C4 烷基，但亮氨酸是 –CH₂CH(CH₃)₂，异亮氨酸是 –CH(CH₃)CH₂CH₃，后者有两个手性中心。'],
  ['valine', 'threonine', '缬氨酸与苏氨酸', '缬氨酸侧链是 –CH(CH₃)₂（C5H11NO2），苏氨酸侧链是 –CH(OH)CH₃（C4H9NO3），苏氨酸多一个羟基。'],
  ['asparagine', 'aspartic-acid', '天冬酰胺与天冬氨酸', '天冬酰胺侧链末端是酰胺 –CH₂CONH₂，天冬氨酸是羧基 –CH₂COOH。'],
  ['glutamine', 'glutamic-acid', '谷氨酰胺与谷氨酸', '谷氨酰胺侧链末端为酰胺，谷氨酸为羧基；两者侧链都比对应的天冬氨酸系列多一个 CH₂。'],
  ['cysteine', 'serine', '半胱氨酸与丝氨酸', '半胱氨酸侧链含巯基 –SH，丝氨酸含羟基 –OH；硫的原子序数更大、极化率更高。'],
  ['cysteine', 'selenocysteine', '半胱氨酸与硒代半胱氨酸', '硒代半胱氨酸把巯基换成硒醇 –SeH，是第 21 种蛋白质氨基酸，三字母 Sec、单字母 U。'],
  ['phenylalanine', 'tyrosine', '苯丙氨酸与酪氨酸', '酪氨酸在苯环对位多一个酚羟基；两者都是芳香族氨基酸。'],
  ['histidine', 'tryptophan', '组氨酸与色氨酸', '组氨酸侧链是咪唑环，色氨酸是稠合的吲哚环；两者都是芳香杂环侧链。'],
  ['lysine', 'arginine', '赖氨酸与精氨酸', '赖氨酸侧链末端为氨基 –NH₂，精氨酸为胍基 –NH–C(=NH)–NH₂，碱性更强。'],
  ['glycine', 'alanine', '甘氨酸与丙氨酸', '甘氨酸侧链只有一个氢、没有手性中心；丙氨酸侧链为甲基，α 碳为手性中心。']
];

for (const [keyA, keyB, label, hint] of lookAlike) {
  const a = by(keyA);
  questions.push(tf(
    qid(),
    `下面这幅结构式画的是${label.split('与')[1]}。`,
    false,
    `图中实际是${label.split('与')[0]}。${hint}`,
    'hard',
    ['amino acid', 'structure', 'discrimination', keyA, keyB],
    pic(keyA, `${label}辨析用的结构式`)
  ));
}

/* ------------------------------------------------------------------ *
 * Naming / coding facts (true-false and multiple-choice)
 * ------------------------------------------------------------------ */
const factsTf = [
  ['甘氨酸的侧链只有一个氢原子，因此它的 α 碳不是手性中心。', true, '甘氨酸 α 碳连有两个氢，不是手性中心；它是 20 种标准氨基酸中唯一无手性的成员。', 'easy', ['glycine', 'chirality']],
  ['所有标准蛋白质氨基酸都是 L-构型。', true, '除甘氨酸外，标准氨基酸的 α 碳均为 L-构型（S 构型，半胱氨酸因硫的优先次序为 R）。', 'medium', ['L-configuration', 'stereochemistry']],
  ['半胱氨酸的 α 碳在 CIP 规则下也标记为 S 构型。', false, '半胱氨酸侧链含硫，硫的优先次序高于羧基碳，因此其 α 碳为 R 构型，但仍是 L-氨基酸。', 'challenging', ['cysteine', 'CIP', 'R/S']],
  ['脯氨酸是唯一侧链与 α 氨基成环的标准氨基酸。', true, '脯氨酸的侧链与 α 氮形成五元吡咯烷环，属于亚氨基酸，其 α 氮是仲胺。', 'medium', ['proline', 'secondary amine']],
  ['一字母缩写 G 对应谷氨酸（glutamate）。', false, 'G 是甘氨酸（glycine）；谷氨酸的三字母缩写是 Glu、单字母是 E。', 'easy', ['one-letter code', 'glycine', 'glutamate']],
  ['三字母缩写 Asn 与 Asp 的区别在于侧链末端是酰胺还是羧基。', true, 'Asn 是天冬酰胺（酰胺侧链），Asp 是天冬氨酸（羧基侧链）。', 'medium', ['Asn', 'Asp']],
  ['单字母缩写 K 与三字母缩写 Lys 指同一个氨基酸。', true, 'K 是赖氨酸 lysine 的单字母缩写，不能与 His 的 H 混淆。', 'medium', ['Lys', 'K']],
  ['单字母缩写 W 对应酪氨酸。', false, 'W 是色氨酸（tryptophan）；酪氨酸是 Y。', 'medium', ['Trp', 'W', 'Tyr']],
  ['硒代半胱氨酸与吡咯赖氨酸都是通过终止密码子重编码插入到蛋白质中的。', true, '硒代半胱氨酸由 UGA 密码子重编码插入，吡咯赖氨酸由 UAG 重编码插入，二者都不属于 20 种标准氨基酸。', 'challenging', ['selenocysteine', 'pyrrolysine', 'recoding']],
  ['甲硫氨酸与半胱氨酸都含硫，但甲硫氨酸的硫在硫醚中而半胱氨酸的硫在巯基中。', true, '甲硫氨酸侧链是 –CH₂CH₂SCH₃（硫醚），半胱氨酸是 –CH₂SH（巯基）；只有巯基容易氧化成二硫键。', 'hard', ['methionine', 'cysteine', 'sulfur']],
  ['20 种标准氨基酸都具有相同的三字母与单字母缩写体系，且没有例外。', true, 'IUPAC-IUBMB 为 20 种标准氨基酸各规定了唯一的三字母和单字母缩写；Sec（U）与 Pyl（O）是后来为第 21、22 种氨基酸补充的。', 'medium', ['nomenclature', 'IUPAC']],
  ['组氨酸的单字母缩写 H 与元素氢的符号含义相同，因此可以混用。', false, 'H 在氨基酸序列语境中代表组氨酸，与化学元素符号 H（氢）语义不同；书写氨基酸序列时不应混淆。', 'hard', ['histidine', 'H']],
  ['天冬氨酸与谷氨酸的侧链都带羧基，在生理 pH 下通常带负电。', true, 'Asp 与 Glu 侧链羧基的 pKa 约为 3.9 和 4.1，在 pH 7 时基本去质子化，带负电。', 'medium', ['Asp', 'Glu', 'charge']],
  ['赖氨酸与精氨酸的侧链都是含氮碱基，在生理 pH 下通常带正电。', true, 'Lys 侧链氨基 pKa 约 10.5，Arg 胍基 pKa 约 12.5，在 pH 7 时都质子化带正电。', 'medium', ['Lys', 'Arg', 'charge']],
  ['图中给出的是 L-丙氨酸，因为楔线表示甲基指向纸面外。', false, '判断 L/D 要看 α 碳四个取代基的空间排布（如 Fischer 投影中氨基在左），不能只看某一条楔线的方向。', 'challenging', ['alanine', 'wedge', 'L/D']]
];

for (const [question, answer, explanation, difficulty, tags] of factsTf) {
  questions.push(tf(qid(), question, answer, explanation, difficulty, tags));
}

/* multiple-choice identifier questions */
const mcQuestions = [
  {
    q: '关于甘氨酸（Gly，G），下列叙述正确的是……',
    options: [['A', '它是 20 种标准氨基酸中唯一没有手性中心的'], ['B', '它的侧链是一个甲基'], ['C', '它的单字母缩写是 G'], ['D', '它的三字母缩写是 Glu']],
    answers: ['A', 'C'],
    explanation: '甘氨酸侧链只有一个氢，没有手性中心；缩写为 Gly / G。侧链是甲基的是丙氨酸，Glu 是谷氨酸。',
    difficulty: 'medium', tags: ['glycine', 'chirality', 'code']
  },
  {
    q: '下列哪些氨基酸的侧链含硫或硒？',
    options: [['A', '半胱氨酸 Cys'], ['B', '甲硫氨酸 Met'], ['C', '硒代半胱氨酸 Sec'], ['D', '丝氨酸 Ser']],
    answers: ['A', 'B', 'C'],
    explanation: 'Cys 含巯基 –SH，Met 含硫醚 –SCH₃，Sec 含硒醇 –SeH。丝氨酸侧链是羟基 –OH，不含硫或硒。',
    difficulty: 'hard', tags: ['cysteine', 'methionine', 'selenocysteine', 'sulfur']
  },
  {
    q: '下列配对中，缩写与中文名对应正确的有……',
    options: [['A', 'Asn — 天冬酰胺'], ['B', 'Gln — 谷氨酰胺'], ['C', 'Tyr — 色氨酸'], ['D', 'Pro — 脯氨酸']],
    answers: ['A', 'B', 'D'],
    explanation: 'Tyr 是酪氨酸，色氨酸的三字母缩写是 Trp；其余三项都正确。',
    difficulty: 'hard', tags: ['three-letter code', 'Asn', 'Gln', 'Pro']
  },
  {
    q: '下列配对中，单字母缩写与三字母缩写对应正确的有……',
    options: [['A', 'K — Lys'], ['B', 'W — Trp'], ['C', 'D — Asp'], ['D', 'N — Asn']],
    answers: ['A', 'B', 'C', 'D'],
    explanation: '四项都正确：K/Lys、W/Trp、D/Asp、N/Asn。注意 N 是天冬酰胺而不是天冬氨酸（Asp 为 D）。',
    difficulty: 'hard', tags: ['one-letter code', 'three-letter code']
  },
  {
    q: '下列关于脯氨酸（Pro，P）的叙述，正确的有……',
    options: [['A', '它的侧链与 α 氨基成环'], ['B', '它的 α 氮是仲胺'], ['C', '它的单字母缩写是 P'], ['D', '它的侧链是芳香性的']],
    answers: ['A', 'B', 'C'],
    explanation: '脯氨酸侧链与 α 氨基构成五元吡咯烷环，α 氮为仲胺，缩写 Pro / P；侧链饱和、无芳香性。',
    difficulty: 'hard', tags: ['proline', 'ring', 'code']
  },
  {
    q: '关于芳香族氨基酸，下列叙述正确的有……',
    options: [['A', '苯丙氨酸 Phe 的侧链是苄基'], ['B', '酪氨酸 Tyr 的侧链含酚羟基'], ['C', '色氨酸 Trp 的侧链是吲哚环'], ['D', '组氨酸 His 的侧链是苯环']],
    answers: ['A', 'B', 'C'],
    explanation: 'Phe 为 –CH₂C₆H₅，Tyr 在此基础上对位带 –OH，Trp 为 –CH₂-吲哚。组氨酸侧链是咪唑环，不是苯环。',
    difficulty: 'hard', tags: ['Phe', 'Tyr', 'Trp', 'His', 'aromatic']
  },
  {
    q: '下列哪些氨基酸在生理 pH 下侧链带正电？',
    options: [['A', '赖氨酸 Lys'], ['B', '精氨酸 Arg'], ['C', '组氨酸 His'], ['D', '谷氨酸 Glu']],
    answers: ['A', 'B', 'C'],
    explanation: 'Lys、Arg 侧链在 pH 7 时几乎完全质子化；His 咪唑 pKa 约 6.0，部分质子化、常计入碱性氨基酸。Glu 侧链带负电。',
    difficulty: 'challenging', tags: ['Lys', 'Arg', 'His', 'charge']
  },
  {
    q: '关于一字母缩写容易混淆的组合，下列判断正确的有……',
    options: [['A', 'G 是甘氨酸，不是谷氨酸'], ['B', 'E 是谷氨酸'], ['C', 'Q 是谷氨酰胺'], ['D', 'Y 是色氨酸']],
    answers: ['A', 'B', 'C'],
    explanation: 'G/Gly 甘氨酸、E/Glu 谷氨酸、Q/Gln 谷氨酰胺。Y 是酪氨酸，色氨酸是 W。',
    difficulty: 'hard', tags: ['one-letter code', 'confusable pairs']
  },
  {
    q: '下列结构中侧链含有羟基（–OH）的氨基酸有……',
    options: [['A', '丝氨酸 Ser'], ['B', '苏氨酸 Thr'], ['C', '酪氨酸 Tyr'], ['D', '丙氨酸 Ala']],
    answers: ['A', 'B', 'C'],
    explanation: 'Ser、Thr 的脂肪族侧链带羟基，Tyr 的酚羟基也属于羟基；丙氨酸侧链是甲基。',
    difficulty: 'hard', tags: ['Ser', 'Thr', 'Tyr', 'hydroxyl']
  },
  {
    q: '关于硒代半胱氨酸（Sec，U）与吡咯赖氨酸（Pyl，O），下列叙述正确的有……',
    options: [['A', '它们不属于 20 种标准氨基酸'], ['B', 'Sec 常被称为第 21 种蛋白质氨基酸'], ['C', 'Pyl 常被称为第 22 种蛋白质氨基酸'], ['D', '它们的单字母缩写分别是 U 和 O']],
    answers: ['A', 'B', 'C', 'D'],
    explanation: '二者都是通过终止密码子重编码插入的额外蛋白质氨基酸，缩写分别为 Sec/U 与 Pyl/O。',
    difficulty: 'challenging', tags: ['selenocysteine', 'pyrrolysine', 'recoding']
  }
];

for (const item of mcQuestions) {
  questions.push(many(qid(), item.q, item.options, item.answers, item.explanation, item.difficulty, item.tags));
}

/* ------------------------------------------------------------------ *
 * Structure -> three-letter code (image drill)
 * ------------------------------------------------------------------ */
const structToThree = [
  ['serine', ['Thr', 'Cys', 'Ala'], 1, 'medium'],
  ['lysine', ['Arg', 'His', 'Asn'], 2, 'medium'],
  ['asparagine', ['Asp', 'Gln', 'Glu'], 3, 'hard'],
  ['tryptophan', ['Tyr', 'Phe', 'His'], 0, 'hard'],
  ['histidine', ['Lys', 'Trp', 'Arg'], 4, 'hard'],
  ['selenocysteine', ['Cys', 'Ser', 'Met'], 5, 'challenging']
];

for (const [key, distractors, shift, difficulty] of structToThree) {
  const a = by(key);
  const { options, answer } = buildOptions(a.three, distractors, shift);
  questions.push(one(
    qid(),
    '下图所示氨基酸的三字母缩写是……',
    options,
    answer,
    `${a.chinese}的三字母缩写是 ${a.three}，单字母缩写是 ${a.one}。`,
    difficulty,
    ['amino acid', 'structure', 'three-letter code', a.english],
    pic(key)
  ));
}

/* ------------------------------------------------------------------ *
 * Final identifier-recall fill-ins tying the five fields together
 * ------------------------------------------------------------------ */
const recall = [
  ['丙氨酸', 'alanine', 'Ala', 'A', 'easy'],
  ['缬氨酸', 'valine', 'Val', 'V', 'easy'],
  ['亮氨酸', 'leucine', 'Leu', 'L', 'medium'],
  ['异亮氨酸', 'isoleucine', 'Ile', 'I', 'medium'],
  ['脯氨酸', 'proline', 'Pro', 'P', 'medium'],
  ['苯丙氨酸', 'phenylalanine', 'Phe', 'F', 'medium'],
  ['色氨酸', 'tryptophan', 'Trp', 'W', 'hard'],
  ['酪氨酸', 'tyrosine', 'Tyr', 'Y', 'medium'],
  ['丝氨酸', 'serine', 'Ser', 'S', 'easy'],
  ['苏氨酸', 'threonine', 'Thr', 'T', 'medium'],
  ['半胱氨酸', 'cysteine', 'Cys', 'C', 'medium'],
  ['甲硫氨酸', 'methionine', 'Met', 'M', 'medium'],
  ['天冬酰胺', 'asparagine', 'Asn', 'N', 'hard'],
  ['谷氨酰胺', 'glutamine', 'Gln', 'Q', 'hard'],
  ['天冬氨酸', 'aspartic-acid', 'Asp', 'D', 'hard'],
  ['谷氨酸', 'glutamic-acid', 'Glu', 'E', 'hard'],
  ['赖氨酸', 'lysine', 'Lys', 'K', 'medium'],
  ['精氨酸', 'arginine', 'Arg', 'R', 'hard'],
  ['组氨酸', 'histidine', 'His', 'H', 'hard']
];

for (const [cn, en, three, letter, difficulty] of recall) {
  questions.push(fill(
    qid(),
    `写出「${cn}」（${en}）的单字母缩写：____。`,
    letter,
    [letter, letter.toUpperCase(), letter.toLowerCase()],
    `${cn}（${en}）的三字母缩写为 ${three}，单字母缩写为 ${letter}。`,
    difficulty,
    ['amino acid', 'identifier recall', en]
  ));
}

/* English-name recall from the three-letter code */
const englishRecall = [
  ['Ala', 'alanine', 'medium'],
  ['Val', 'valine', 'medium'],
  ['Leu', 'leucine', 'hard'],
  ['Ile', 'isoleucine', 'hard'],
  ['Pro', 'proline', 'medium'],
  ['Phe', 'phenylalanine', 'hard'],
  ['Trp', 'tryptophan', 'hard'],
  ['Tyr', 'tyrosine', 'hard'],
  ['Ser', 'serine', 'medium'],
  ['Thr', 'threonine', 'hard'],
  ['Cys', 'cysteine', 'medium'],
  ['Met', 'methionine', 'medium'],
  ['Asn', 'asparagine', 'challenging'],
  ['Gln', 'glutamine', 'challenging'],
  ['Asp', 'aspartic acid', 'challenging'],
  ['Glu', 'glutamic acid', 'challenging'],
  ['Lys', 'lysine', 'medium'],
  ['Arg', 'arginine', 'hard'],
  ['His', 'histidine', 'hard'],
  ['Gly', 'glycine', 'easy']
];

for (const [three, english, difficulty] of englishRecall) {
  const spaced = english.replace(' ', '');
  questions.push(fill(
    qid(),
    `写出三字母缩写 ${three} 对应的英文全名（不含空格）：____。`,
    english.replace(' ', ''),
    [spaced, english, english.replace(/^./, (c) => c.toUpperCase())],
    `${three} 的英文名是 ${english}。`,
    difficulty,
    ['amino acid', 'English name', three]
  ));
}

export const aaQuestions = questions;
export const aaCatalog = AA.map(([key, chinese, english, three, one, cls]) => ({ key, chinese, english, three, one, sideChainClass: cls }));
