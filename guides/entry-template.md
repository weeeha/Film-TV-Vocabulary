# Writing and extending an entry

[Wiki home](../README.md) · [How to use the atlas](how-to-use.md)

Chapter Markdown is the editorial source of truth. The alphabetical index and JSON catalog are generated from it. This keeps the prose used by people and the descriptions available to agents aligned without maintaining two independently edited dictionaries.

## Required format

Use a level-three heading for each vocabulary term and level-two headings for groups and non-glossary material. The builder reads the three labeled paragraphs below. A term-ID comment, when present, preserves the identifier independently of the display name.

```markdown
### Term name
<!-- term-id: chapter-slug.term-slug -->

**Definition.** Explain what the term means and what distinguishes it from nearby concepts.

**Use.** Explain a practical reason to choose or examine it, including a relevant limitation.

**Example.** Describe a specific original hypothetical moment showing the concept in action.
```

The example above is a format sample, not a vocabulary entry. New IDs must be unique and consist of lowercase letters, digits, hyphens, and a period between chapter and term. Once published, preserve an existing ID even if the term's label changes. An anchor may change with its heading; regenerate links after renaming.

## What makes an entry useful

Aim for enough detail that a reader can recognize the technique and distinguish it from an alternative. Most entries need roughly 45–100 words across definition, use, and example; a contested or technical term may need more.

The definition should avoid circular phrasing. “A reaction shot shows a reaction” is insufficient unless it explains the shot's relationship to an event and what kinds of responses qualify. The use paragraph should avoid promises such as “this always creates fear.” The example should include an observable action or decision instead of repeating the definition abstractly.

## Naming and overlap

Use familiar names and preserve important aliases in the text. Combine exact synonyms if it aids reading; separate terms that often get confused. Multiple chapters may discuss the same name from different contexts. The catalog qualifies those entries by chapter instead of assuming identical spelling means identical scope.

For an ambiguous term such as “theme,” distinguish thematic subject in storytelling from a recurring musical idea. For a broad term such as “contrast,” identify whether the discussion concerns lighting, image processing, composition, or narrative comparison.

## Evidence and examples

Use original hypothetical examples freely and label the wiki's editorial conventions. For examples from released works, verify the title, scene, relevant technique, and timestamp where available. Cite the specific source or asset supporting the claim. A remembered scene description is not enough to supply a precise shot or technical setup.

Attribute named analytical frameworks. Explain when definitions vary by tradition or production. Primary sources and established teaching references are preferred for technical claims. Keep extracts short; teach in original language rather than reproducing another glossary.

Media records should capture source, creator, URL or local path, relevant time range, and known permission or license information. A source link is not itself a media license. Until an asset is included, describe it as a suggested illustration rather than a completed visual example.

## Chapter-level requirements

Each chapter contains an overview, grouped term entries, practical distinctions, a visual-interaction/data-field table, related chapters, and source notes. Suggested controls describe how a future interface could work. They are not evidence that a preview, simulator, or generation backend currently exists.

## Rebuild and check

From the repository directory, run:

```sh
python3 scripts/build_catalog.py
python3 scripts/build_catalog.py --check
```

The first command refreshes the generated index, catalog, and coverage report. The second verifies that they match the Markdown and checks entries, identifiers, local links, and the structured example. Review the prose and source claims as well: a successful mechanical check cannot establish that an explanation is correct or a creative choice works.
