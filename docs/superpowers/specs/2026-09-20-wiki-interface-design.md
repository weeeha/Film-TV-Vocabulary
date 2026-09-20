# Creative Vocabulary wiki interface

Date: 2026-09-20
Status: Approved by the user on 2026-09-20. The implementation plan is written and awaiting review; product implementation has not started.

## Purpose and proposed baseline

Turn the existing Film & TV Atlas into a public, searchable reference website on Vercel. Readers should be able to find a filmmaking term, understand its definition and practical example, and continue to related topics without navigating repository files.

The user requested an open-source foundation, planning, implementation, and Vercel publishing. The preceding proposal recommended Fumadocs, chapter navigation, search, an A–Z browser, related topics, and responsive reading pages.

This design assumes that Nick and Codex maintain the existing Markdown files. Visitors read the site without signing in. An editor inside the website is a separate scope choice; the user can change this assumption during design review. No database, paid search service, or application account is required for this baseline.

Success means a working deployed reference, with accurate navigation and search across the existing vocabulary, readable pages on desktop and mobile, and a repeatable content-update workflow.

## Existing content and constraints

- There are 22 chapters and 643 contextual entries in the current catalog. Identically named terms in different chapters remain separate entries.
- `wiki/*.md` is the editorial source of truth. Each term has a persistent ID, definition, use, and example.
- `scripts/build_catalog.py` generates the catalog, alphabetical index, coverage report, and seed mapping. Preserve that authoring workflow.
- Chapters also contain distinctions, proposed controls, related chapters, and sources. Preserve the distinction between written proposals and implemented features.
- Guides and a worked discovery scene are part of the reading experience.
- At original inspection, uncommitted changes included README and lighting-chapter edits, an illustration page, and image assets. That work is now committed as `d3f5ba0`; preserve it and recheck for newer changes before integration.
- At inspection, the content checker found stale catalog/coverage outputs and eight missing lighting images plus a missing manifest. These are baseline findings, not failures caused by the new application. The pilot is changing, so recheck its actual state before implementation and publication.
- Planning refresh: all 12 images and the manifest are now present, and the existing content checker passes for 22 chapters and 643 entries. Include the pilot in the implementation baseline, retaining the publication checks below.

## Foundation and alternatives

Use Next.js with Fumadocs UI and its content-processing integration, with TypeScript and a committed dependency lockfile. Add the application to this repository so source material and website updates can be reviewed together. Choose mutually compatible, supported package versions when writing the implementation plan.

Fumadocs supplies established reading layouts and navigation while allowing later interactive teaching components. Nextra is a good alternative for a conventional documentation site. Quartz is a good alternative if backlinks and a relationship graph become the main experience. Fumadocs best fits the current proposal and the atlas's planned visual examples.

This release contains a reader, search, and navigation. Accounts, browser-based editing, comments, a relationship graph, saved creative briefs, AI generation, and lighting simulators are outside its scope.

## Reading experience

### Home and navigation

The home page introduces the atlas in one short paragraph, offers prominent search and A–Z access, and lists all chapters under the three existing families: story and characters; world, scenes, and performance; image, sound, and construction. Chapter summaries explain what each area helps describe. Counts come from content data rather than duplicated constants.

The desktop reading layout has a persistent chapter sidebar, a comfortable central reading column, and a page contents panel on wider screens. The sidebar follows the existing chapter order and includes the reading guides and worked example. Mobile uses a menu drawer and compact page contents control.

### Chapter pages

Render every chapter's complete prose, grouped vocabulary, distinctions, sources, and related topics. Visually distinguish definition, use, and example while keeping the original text intact. Use clear headings and shareable term links. Sources remain clickable.

Keep existing heading fragments usable and add anchors based on persistent term IDs. Search and the A–Z browser use the persistent anchors; a label change should not break these links. Duplicate display names always retain chapter context.

The reading guide's existing Mermaid diagram should render as a diagram, with a readable fallback if its renderer fails. Large tables may scroll within the reading column without overflowing the whole page.

### Search and A–Z browser

The search control is available throughout the site, supports Cmd/Ctrl+K, and can be operated with a keyboard. Search term names, definitions, uses, and examples; also include useful chapter and guide sections. Prioritize exact term names, then name prefixes, then body matches. Results show the term or section name, chapter/page context, and a short excerpt.

Selecting a term result opens its chapter at the term. Include clear initial, no-results, loading, and retry states. Load the search index on demand. Use a locally generated index and a compatible Fumadocs search integration; do not introduce an external search account.

The A–Z page lists every contextual entry, grouped alphabetically, with text and chapter filters. Repeated names remain distinguishable by chapter. Filter state is represented in the URL so filtered views can be shared and browser Back restores the previous view. Show a result count and a way to clear filters.

### Visual direction and accessibility

Use a restrained reference-book appearance: a light reading surface, dark legible text, subtle borders, and one muted accent for links and selected navigation. Keep images central to teaching rather than decoration. Use local/system fonts to avoid a build-time dependency on a font service. Include a dark appearance using the framework's supported theme mechanism.

Provide a skip link, visible focus, semantic headings, descriptive image alternatives, adequate contrast, and reduced-motion support. Search and navigation dialogs must manage focus and return it to their trigger on close. The first release must work at phone, tablet, and desktop widths and at 200% text zoom.

## Content and application boundaries

The source Markdown remains where it is. A build-time adapter prepares the framework's content and metadata without creating a second editable copy. Generated content and copied public assets are ignored by Git.

The adapter has four responsibilities: derive page metadata from the existing content/catalog; preserve heading and persistent-ID anchors; map repository-relative links to website routes; and prepare explicitly selected public assets/downloads. It must not silently rewrite definitions or invent missing media.

Use one source-path-to-route registry for links, navigation, search, and downloads. Proposed routes are:

| Route | Content |
|---|---|
| `/` | Atlas introduction and chapter browser |
| `/terms` | Filterable A–Z vocabulary |
| `/wiki/<chapter-id>` | Complete chapter, with heading and stable term anchors |
| `/guides/<guide-slug>` | Reading, entry-authoring, and agent-representation guides |
| `/examples/discovery-scene` | Worked example |
| `/reference/coverage` | Content coverage |
| `/reference/initial-outline` | Original outline, linked as background material |
| `/illustrations/lighting` | Existing pilot when its publication checks pass |
| `/downloads/<file>` | Explicitly allowlisted catalog/schema/example JSON files |

Map README links to `/` and INDEX links to `/terms`. Resolve Markdown links relative to their original source file, preserving fragments. External source links remain external. Internal planning documents are not reader pages or search results.

Keep the application boundaries small: content preparation and validation; route/source registry; reading layout and rendered content; search; and the A–Z browser. Components should consume the same prepared data rather than parse Markdown independently.

## Illustration pilot

Include the existing lighting pilot once its images, links, captions, and provenance manifest are complete. Preserve its candidate-illustration status and explanatory limitations. Display image comparisons with captions in a responsive layout, retaining alternative text and term links.

Do not generate additional images as part of building the wiki. If the pilot remains incomplete at release time, exclude that page from the published route set and omit its navigation/intro links in generated web content. Preserve the source work. Report the exclusion explicitly; do not render broken images or describe the complete pilot as available.

## Build validation and failure handling

Before building the website, verify catalog/source agreement, duplicate IDs, route collisions, link targets, fragments, and required published assets. A missing chapter, malformed entry, or unresolved link in published content fails the build with a useful source location.

Rebuild stale generated editorial files with the existing Python workflow. Vercel's application build should use Node-based validation of the committed catalog's source hashes and the published route/asset set; it should not depend on Python being installed in the hosting environment.

The current repository-wide Markdown checker scans arbitrary subfolders. Narrow its scanning to authored content and explicitly exclude installed dependencies, build output, and planning documents when introducing the web application. Continue to report incomplete source-pilot links separately from the published site's validation; do not suppress other link errors to make the check appear clean.

Unknown URLs return a helpful 404 with links to search and the atlas. Search failure should leave chapter navigation and reading functional. Static content pages should remain readable without client-side JavaScript.

## Publishing and maintenance

Deploy this repository as a Next.js project on Vercel. Start with a preview deployment, verify the hosted result, then promote the validated release to production under a Vercel-provided URL. A custom domain is optional follow-up work. Deployment is within the user's requested scope; account access is verified when implementation reaches that step.

For subsequent updates: edit source content, regenerate the catalog, run content and website checks, review the changes, and publish through the connected repository. Keep planning documents and unrelated local files out of the public asset set. Preserve upstream open-source license notices.

## Acceptance evidence

1. Every one of the current 22 chapters and 643 contextual entries is accessible through the site. Checks should derive current counts and IDs from the catalog rather than freeze future growth at these numbers.
2. Search finds representative names and body text, handles an unknown query, distinguishes repeated names, and lands on the intended entry. Keyboard open, selection, close, and focus restoration work.
3. A–Z grouping, filters, shareable URLs, clear filters, and Back navigation work.
4. Internal routes, existing heading links, stable ID links, sources, and selected downloads resolve correctly.
5. Published images load with captions and alternatives, or the incomplete pilot is explicitly excluded without broken public links.
6. Production build and type checks pass. Focused automated tests cover link/anchor mapping, source validation, and search/navigation behaviors; a browser pass verifies the key reader journeys.
7. Inspect rendered home, chapter, search, A–Z, guide/diagram, and illustration states at desktop and phone widths; verify long titles, tables, no-results, and a 404. Check keyboard access and 200% zoom.
8. Repeat the main reading/search/deep-link checks on the Vercel preview and production URLs. Report local validation and hosted verification separately.

## Workflow status

- [x] Inspect repository, content model, local changes, and existing validation.
- [x] Compare open-source foundations and document the proposed experience.
- [x] Draft and self-review this design.
- [x] User review of the written design, including the editing assumption.
- [x] Write the implementation plan using the Superpowers writing-plans skill: [implementation plan](../plans/2026-09-20-wiki-interface.md).
- [ ] User review of the written plan and selection of execution method.
- [ ] Implement, verify locally, publish, and verify the hosted site.

## References

- [Fumadocs UI](https://www.fumadocs.dev/docs/ui): layouts and interface foundation.
- [Fumadocs Markdown content](https://www.fumadocs.dev/docs/mdx): content-processing layer.
- [Fumadocs search](https://www.fumadocs.dev/docs/search): supported search integrations.
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs): deployment support.
