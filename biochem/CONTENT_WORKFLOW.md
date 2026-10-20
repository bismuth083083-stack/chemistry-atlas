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


## Formula typography (all future imports)

Follow [the shared formula typography standard](../FORMULA_STYLE.md). All authored divisions, including inline formulas, tables, glossary explanations and fractional powers, use stacked fractions rather than `/` or `÷`. Preserve full numerator/denominator grouping and use serif math with italic variables. URLs, units, dates, exercise identifiers and chemical-pair labels retain their original notation.
