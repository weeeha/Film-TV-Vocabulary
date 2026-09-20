# Film & TV Atlas release verification

Date: 2026-09-20. Application snapshot: `7de8945`; later commits contain test evidence and documentation only.

## Published release

- Public site: https://film-tv-atlas.vercel.app
- Verified preview: https://film-tv-atlas-dgw4j1lur-nick-vyhouskis-projects.vercel.app
- Preview deployment: `dpl_LhsyXzL9MioyjhLthbAAZTPTX6ko`
- Production deployment: `dpl_4y2a8ecZY5ZZapLMWjhCFHdhtL3F`
- Production build URL: https://film-tv-atlas-deqpg5g3e-nick-vyhouskis-projects.vercel.app
- Vercel project: `film-tv-atlas`, in Nick Vyhouski's projects.

Vercel automatically assigned the first project upload to production despite the requested preview target. The final corrected upload was a preview, passed hosted checks, and was then promoted. Promotion created the production deployment listed above; the public alias was confirmed against that deployment before accepting the final suite.

The preview used Vercel's authenticated testing mechanism. Production was tested in new browser contexts without authentication or saved state. No deployment protection was disabled.

## Verified content and behavior

The content snapshot contains 22 chapters, 643 contextual terms, 58,543 chapter words, and 29 published content pages, plus home and A–Z. The 12 lighting images remain explicitly labelled candidate illustrations with all original limitations and provenance links.

- Every prepared page's complete set of declared heading and persistent term anchors exists in its server-rendered HTML; no duplicate IDs.
- Search: name, definition text, guide section, no results, delayed loading, failed-load retry, keyboard navigation, close, and focus restoration.
- A–Z: all contextual IDs, combined filters, invalid/repeated parameters, shareable URLs, Back, stable destinations, and slow-response typing regression.
- Without JavaScript: chapter prose/navigation, initial filtered index, clear filters, and Mermaid text fallback.
- All 12 images load with alternatives and corresponding captions. Mermaid produces an SVG for the guide; invalid syntax preserves a readable fallback.
- All seven allowlisted JSON downloads parse; unknown paths and unallowlisted downloads return 404.
- Desktop and phone layouts have one main landmark and no page-level horizontal overflow. Wide reference tables and diagrams scroll within their own regions.

## Actual checks

Runtime: Node 24.21.0. Next.js 16.3.5, React 19.3.0, Fumadocs UI/Core 16.15.12, Fumadocs MDX 15.4.3, Mermaid 11.17.2. Versions and transitive dependencies are locked.

| Check | Result |
| --- | --- |
| Clean `npm ci` and audit | Passed; zero known vulnerabilities at installation |
| `npm run content:check` | Passed, 22 chapters / 643 entries |
| Python checker regression | 1 passed |
| `npm run test:unit` | 11 passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| Final local browser suite | 42 passed |
| Protected hosted preview | 42 passed, plus 2 body/guide search journeys |
| Public production browser suite | 44 passed, signed out |

The independent whole-branch reviewer found a slow-filter race and an inert no-JavaScript clear control. Both were reproduced with failing tests and fixed; the suite passed afterward. Rendered inspection then caught a narrow mobile 404 layout; its width regression failed before the fix and passed afterward. No review findings remain deferred.

## Rendered checks

Inspected home, chapter, A–Z, guide, lighting, 404, and search loading/results/empty/error at 1440 × 1000 and 390 × 844. A separate 768 × 1024 tablet check reported no page overflow. Native Chrome's zoom control confirmed 200% while inspecting the A–Z filters and a deep-linked lighting definition; text and controls remained readable. Zoom was restored after testing.

Saved screenshots are in [site-evidence](site-evidence/). They document rendered states; interaction and route checks above are separate evidence.

## Decisions and repository integration

1. Mermaid 11.17.2 replaces the planned version 12 dependency chain to remove high-severity dependency findings. Compatibility was checked by rendering the actual guide and invalid fallback.
2. The existing pilot's generation receipts are an allowlisted download because the completed source page links them. They contain generation identifiers and provider filenames.
3. Client-only A–Z filters update Next-supported native browser history to avoid stale network responses overwriting typing. Revisit this choice if filtering later requires server data.

After explicit user approval on 2026-09-20, the reviewed code through `87480f7` was pushed to GitHub `weeeha/Film-TV-Vocabulary` with a normal non-force push. The Vercel project API confirms the GitHub connection, production branch `main`, Next.js framework, and Node 24 runtime. A subsequent documentation push exercises the automatic publishing path; its deployment and hosted checks will be recorded here after completion.

The main workspace also passed a fresh `npm ci`, all 11 unit tests without prior generated site state, content validation, and type checking after the local fast-forward merge.
