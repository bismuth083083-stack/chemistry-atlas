# Formula typography standard

All future Chemistry Atlas formulas use stacked numerator/denominator fractions for division, including inline calculations, tables, glossary fields, powers and nested expressions. Do not write division with a slash or a division sign in authored equations.

- Use semantic HTML with a two-child fraction span (`math-frac`, `frac`, or the subject's existing equivalent), or `\frac{numerator}{denominator}` when a configured TeX renderer is available.
- Preserve the complete numerator and denominator. Group polynomial sums, scientific-notation factors, and nested quotients explicitly.
- Use serif mathematics and italic variables; keep unit symbols and operators upright where supported.
- A slash in a URL, date, source/exercise number, unit label, method abbreviation or named chemical pair is not an arithmetic division and retains its meaning.
- Source images remain faithful to supplied material. Typeset transcribed formulas with stacked fractions.
- Before publishing, review formula blocks and inline calculations for remaining arithmetic slashes and verify denominator grouping. Do not use a runtime slash-replacement heuristic.
