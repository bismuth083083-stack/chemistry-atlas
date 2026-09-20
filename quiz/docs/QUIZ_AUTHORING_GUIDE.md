# Chemistry Atlas Quiz Authoring Guide

This guide is the contract between quiz content and the Quiz Engine. To add or update a quiz, create or edit a JSON file in `quiz/data/`. Do not modify `quiz-engine.js` for normal content changes.

## 1. File workflow

1. Copy `quiz/data/demo.json` as a starting point.
2. Give the quiz a unique kebab-case `id`, for example `biochem-ch04`.
3. Keep question IDs unique inside the file (`q001`, `q002`, …).
4. Add the file to `quiz/data/`.
5. Add one entry to `quiz/data/index.json` with the matching `id`, `title`, `path`, and `mode`.
6. Validate the JSON against `quiz/schema/quiz.schema.json`, then open `/quiz/index.html?quiz=your-id`.

The current demo is available at `/quiz/index.html?quiz=demo`. Run the site through a local HTTP server; `fetch()` cannot load quiz JSON reliably from a `file://` URL.

## 2. Required quiz fields

```json
{
  "id": "biochem-ch04",
  "title": "Protein structure",
  "description": "A focused retrieval set for chapter four.",
  "subject": "Biochemistry",
  "chapter": "Chapter 04",
  "version": "1.0.0",
  "totalPoints": 4,
  "selection": { "mode": "fixed" },
  "questions": []
}
```

`totalPoints` must equal the sum of every question's `points`. The current runtime also checks this and shows a readable error panel instead of a blank page.

## 3. Question formats

### Single choice

```json
{
  "id": "q001",
  "type": "single-choice",
  "question": "Which level describes the amino-acid sequence?",
  "options": [
    { "id": "A", "text": "Primary structure" },
    { "id": "B", "text": "Secondary structure" }
  ],
  "answer": "A",
  "points": 1,
  "explanation": "Primary structure is the linear sequence of amino acids.",
  "difficulty": "easy",
  "tags": ["protein structure"]
}
```

### Multiple choice

Use `answers` (plural) with an array. The learner must select the complete set to receive the points; partial credit is not awarded in this version.

```json
{
  "id": "q002",
  "type": "multiple-choice",
  "question": "Which interactions can stabilize a protein?",
  "options": [
    { "id": "A", "text": "Hydrogen bonds" },
    { "id": "B", "text": "Disulfide bonds" },
    { "id": "C", "text": "Random noise" }
  ],
  "answers": ["A", "B"],
  "points": 2,
  "explanation": "Hydrogen bonds and disulfide bonds can stabilize protein structure.",
  "difficulty": "medium",
  "tags": ["protein structure", "interactions"]
}
```

### True / false

Use a JSON boolean, not a string: `"answer": true` or `"answer": false`.

```json
{
  "id": "q003",
  "type": "true-false",
  "question": "Peptide bonds connect amino acids.",
  "answer": true,
  "points": 1,
  "explanation": "A peptide bond forms between the carboxyl group of one amino acid and the amino group of another.",
  "difficulty": "easy",
  "tags": ["peptide bond"]
}
```

### Fill in the blank

`answer` is the standard answer. `acceptableAnswers` is optional and should only contain scientifically equivalent answers you explicitly want to accept. Matching trims leading/trailing spaces, can collapse repeated internal whitespace, and is case-insensitive by default.

```json
{
  "id": "q004",
  "type": "fill-in-the-blank",
  "question": "The bond between two amino acids is a ____ bond.",
  "answer": "peptide",
  "acceptableAnswers": ["peptide bond"],
  "grading": { "caseSensitive": false, "collapseWhitespace": true },
  "points": 1,
  "explanation": "A peptide bond links amino acids in a polypeptide chain.",
  "difficulty": "easy",
  "tags": ["peptide bond"]
}
```

Do not use fuzzy matching. For example, `SN2` and `S_N2` are different unless both are explicitly listed. `numericalTolerance` is reserved for a future numerical question type and is not active in the current engine.

## 4. Content and media

Unicode is safe and encouraged for chemistry: `H₃O⁺`, `PO₄³⁻`, `α-helix`, and `25 °C`. Keep explanations concise but complete: state why the answer is correct, not only the answer itself.

Questions may include an optional image object for a structure diagram or other verified course visual:

```json
"image": {
  "src": "assets/structures/org-acetate-resonance.png",
  "alt": "乙酸根的两种共振贡献式",
  "caption": "由 Chemical Structure Renderer 根据明确结构输入渲染"
}
```

Use relative static paths for local assets; do not embed large images as Base64 in JSON. Prefer the PNG output from Chemical Structure Renderer for browser-facing question stems; keep the accompanying SVG/MOL/SDF outputs for provenance and editing. Chemical structures must be rendered from an explicit SMILES/CXSMILES/InChI/MOL/SDF input with the Chemical Structure Renderer workflow. Do not use general image generation for atoms, bonds, charges, stereochemistry, or reaction arrows. If a name has unresolved stereochemical, protonation, salt, or tautomer ambiguity, do not guess the structure. The first version renders text safely and does not interpret arbitrary HTML from quiz data.

Course practice sets use 22 questions in a fixed difficulty progression: 5 `easy`, 10 `medium`, 4 `hard`, then 3 `challenging` extension questions. `challenging` is intentionally distinct from `hard` so the final three questions can be labeled and scored separately.

## 5. Fixed exams and question banks

Use the default fixed mode for a curated sequence:

```json
"selection": { "mode": "fixed" }
```

The engine also supports the first version of a question bank:

```json
"selection": {
  "mode": "question-bank",
  "counts": {
    "single-choice": 10,
    "multiple-choice": 5,
    "true-false": 5,
    "fill-in-the-blank": 5
  },
  "difficulty": "medium",
  "tags": ["enzyme kinetics"]
}
```

The engine filters first, samples without replacement, and never selects the same question twice in one attempt. If a bank is under-populated, it falls back to the full question list; for production content, make sure each requested type has enough candidates.

## 6. Validation and common mistakes

The browser performs runtime validation when it loads a quiz. Typical errors are:

- using `answer` for multiple-choice instead of `answers`;
- writing true/false values as strings (`"true"`);
- duplicate question or option IDs;
- a `totalPoints` value that does not equal the sum of question points;
- missing `explanation`, `difficulty`, or `tags`;
- an answer ID that is not present in `options`;
- putting a file in `quiz/data/` but forgetting `quiz/data/index.json`.

For CI or editor validation, use any JSON Schema 2020-12 validator with `quiz/schema/quiz.schema.json`. A lightweight project intentionally has no runtime dependency on a validation package; the same core checks are built into the engine so a bad content file produces an actionable error screen.

## 7. State and grading limits

Answers, current question, and submitted result are saved in `localStorage` under a quiz-specific key. The learner can refresh and continue before submission. Submission locks the attempt until “Retake quiz” is selected. Answers are present in the client payload, so this is a self-assessment tool, not a secure proctored exam.

Current limitations: no accounts or server history, no timer, no partial credit, no numerical tolerance grading, and no AI grading for free response. These are deliberate extension points for later versions.
