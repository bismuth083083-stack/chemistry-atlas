# Content update contract

Each updated course DOCX is processed as an incremental source.

## Notes

- Preserve the lecture order and the user's original wording as source text.
- Publish a corrected and expanded reading version separately.
- Mark uncertain interpretations for review rather than silently guessing.
- Keep source references to the DOCX paragraph and, when used, textbook page.

## Terms

Every term record supports: slug, Chinese name, English name, aliases, category,
concise definition, expanded explanation, properties, common confusions,
related reactions, related term slugs, source references, and last updated date.

Known terms in note prose are linked to term.html?slug=<slug>. New uploads update
existing records by slug or aliases and create only genuinely new records.

## Figures, formulas, and inline prompts

- Treat phrases such as “补图”, “补公式”, “见 PPT”, “截图”, “待补” and their English equivalents as editorial instructions, not publishable prose.
- Resolve them against sources in this order: the user's notes, course PPT/PDF, then the assigned textbook. Preserve scientific labels and cite the page or slide.
- Prefer a faithful crop from supplied course material over a hand-made illustration. Optimize web copies while retaining readable labels; dark-mode inversion is presentation only.
- Every organic-chemistry term detail page must contain at least one relevant figure. Closely related terms may share a source figure when it genuinely explains both.
- Use semantic HTML and KaTeX-compatible notation for equations. Never replace an exact plot or molecular diagram with generative artwork.

## Shared site behavior

Navigation, search, bilingual term-page structure, cross-linking, theme controls,
accessibility, and offline/PWA behavior form a shared five-site feature layer.
Changes to that layer are propagated to all chemistry sites; subject content and
theme colors remain independent.
