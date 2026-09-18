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
