# Creative Vocabulary Wiki Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing Film & TV Atlas as a readable, searchable wiki on Vercel, including its 22 chapters, A–Z vocabulary, guides, and lighting illustrations.

**Architecture:** Preserve the existing Markdown and Python catalog workflow. A build-time TypeScript adapter validates that source, maps its links, and prepares Fumadocs content plus small shared data exports. Next.js serves the reading pages, while search and A–Z filters add client-side interaction without a database.

**Tech Stack:** Node 24.x; Next.js 16.3.5; React/React DOM 19.3.0; Fumadocs UI/Core 16.15.12; Fumadocs MDX 15.4.3; TypeScript 7.0.2; Tailwind/PostCSS integration 4.3.3; tsx 4.23.15; Playwright 1.63.0; Mermaid 12.0.0. Main package versions and peer ranges were read from the public npm registry on 2026-09-20. These ranges agree; installation and runtime compatibility still need the checks below.

**Spec:** [Approved wiki design](../specs/2026-09-20-wiki-interface-design.md). Read both documents before execution.

**Status:** Approved and implemented on 2026-09-20 using Native execution, followed by independent review and verified fixes. The reader is published, and GitHub is connected to Vercel. See [release verification](../../site-verification.md) for actual checks and publishing evidence. The steps below retain the implementation instructions used during the work.

## Global Constraints

The following requirements are copied from the approved spec:

- `wiki/*.md` is the editorial source of truth. Each term has a persistent ID, definition, use, and example.
- Visitors read the site without signing in.
- No database, paid search service, or application account is required for this baseline.
- Keep existing heading fragments usable and add anchors based on persistent term IDs.
- Internal planning documents are not reader pages or search results.
- Static content pages should remain readable without client-side JavaScript.
- Do not generate additional images as part of building the wiki.
- Preserve upstream open-source license notices.

Use the approved route table and retain every chapter's definitions, uses, examples, sources, and related links. The production runtime is Node 24.x, which Vercel supports; the machine's current default is Node 26, so local release checks must explicitly use Node 24. Install exact versions and commit the npm lockfile. Use system fonts. No secrets or external API keys are needed by the application.

## Review Focus

1. Renamed or identically named entries: persistent links still reach the correct contextual term, and results show the chapter. Tests: Tasks 1 and 3.
2. Relative Markdown links containing fragments, encoded characters, or links to downloads: resolve against the original source, preserve the intended target, and reject unpublished/missing targets. Tests: Task 1.
3. First-use search on a slow or failed connection: show loading, allow retry, and keep chapter reading/navigation usable. Tests: Task 3.
4. Shared A–Z URLs, malformed filters, and browser Back: show the correct entries and controls without losing navigation history or making an empty state look like missing content. Tests: Task 4.
5. Incomplete or mismatched illustration files: preserve candidate labels, exclude an incomplete pilot cleanly, and never publish broken image references. Tests: Tasks 1 and 5.

## Baseline and execution boundaries

Working repository: `/Users/nickv/Documents/ChatGPT/Creative Vocabulary`; remote: `https://github.com/weeeha/Film-TV-Vocabulary.git`.

The existing content check passed during planning: 22 chapters, 643 contextual entries, 58,543 chapter words. All 12 PNGs, captions, prompts, and the provenance manifest are present. The manifest retains candidate status, three visual caveats, and no user-selection claim.

The pre-existing illustration work was committed during planning as `d3f5ba0` (`Add twelve lighting illustrations and comparison gallery`). Use a baseline containing that commit. Inspect status and diffs immediately before execution, preserve any newer changes, and distinguish them from application work. Do not reset, stash, or stage the whole working tree blindly. If an isolated checkout is used, follow the using-git-worktrees skill and include the current content snapshot so the implementation does not silently lose the pilot. Use a `codex/wiki-interface` branch for application work. Source assets needed by the deployment must be included in its reviewed snapshot; report any additional content integration as pre-existing material.

Commands below are run from the repository root unless stated otherwise. Test snippets describe expected behavior; they have not been executed against a new application yet. Do not claim the new site is verified until its actual checks pass.

## File map

| Files | Responsibility |
|---|---|
| `package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`, `.gitignore` | Runtime, dependency versions, scripts, generated-file exclusions |
| `lib/content/types.ts`, `catalog.ts`, `routes.ts`, `markdown.ts`, `pilot.ts`, `prepare.ts` | Shared contracts, source validation, link/anchor mapping, prepared content |
| `scripts/prepare-site.ts` | Write generated site inputs and allowlisted public files |
| `scripts/build_catalog.py` | Existing editorial builder; restrict link-check traversal to authored content |
| `next.config.mjs`, `postcss.config.mjs`, `source.config.ts` | Next/Fumadocs/Tailwind integration |
| `lib/source.ts`, `lib/navigation.ts`, `lib/atlas.ts` | Framework source, chapter grouping, prepared reader data |
| `app/layout.tsx`, `app/providers.tsx`, `app/globals.css` | Global shell, theme, search provider, reference-book styling |
| `app/(reader)/layout.tsx`, `app/(reader)/page.tsx`, `app/(reader)/[...slug]/page.tsx`, `app/not-found.tsx` | Sidebar layout, home, published content routes, helpful 404 |
| `components/mdx.tsx`, `components/term-heading.tsx` | Safe Markdown rendering, legacy and stable heading anchors |
| `lib/search.ts`, `components/search-dialog.tsx`, `tests/e2e/search.spec.ts` | Local search ranking and loading/error/focus behavior |
| `lib/terms.ts`, `app/(reader)/terms/page.tsx`, `components/term-browser.tsx` | A–Z grouping and URL-backed filters |
| `components/mermaid-diagram.tsx`, `components/illustration.tsx` | Existing diagram and responsive image presentation |
| `tests/unit/*.test.ts`, `tests/python/test_content_links.py`, `tests/e2e/*.spec.ts`, `playwright.config.ts` | Content contracts and reader journeys |
| `docs/site-maintenance.md`, `docs/site-verification.md`, `vercel.json`, `.vercelignore`, `README.md` | Publishing configuration, actual evidence, update instructions |

Generated, ignored outputs: `.generated/content/`, `.generated/atlas.json`, `.source/`, `public/generated/`, `.next/`, `test-results/`, and `playwright-report/`. Generate public assets only from the explicit allowlist. Do not copy the whole repository to `public/`.

## Shared interfaces

Task 1 defines these types in `lib/content/types.ts`. Later tasks import them instead of re-declaring them:

```ts
export type Chapter = {
  id: string; number: number; title: string; source_path: string;
  entry_count: number; word_count: number; sha256: string;
};
export type Entry = {
  id: string; name: string; chapter_id: string; group: string;
  definition: string; use: string; example: string;
  source_path: string; anchor: string;
};
export type Catalog = {
  chapter_count: number; entry_count: number;
  chapters: Chapter[]; entries: Entry[];
};
export type TermRecord = Entry & { chapterTitle: string; url: string };
export type SearchRecord = {
  id: string; title: string; context: string; text: string;
  url: string; kind: 'term' | 'section';
};
export type PreparedPage = {
  sourcePath: string; url: string; slug: string[]; title: string;
  markdown: string; anchors: string[];
  termAnchors: Record<string, string>;
};
export type PublicAsset = {
  sourcePath: string; url: string; sha256: string;
  width?: number; height?: number;
};
export type PreparedAtlas = {
  chapters: Chapter[]; terms: TermRecord[]; pages: PreparedPage[];
  search: SearchRecord[]; assets: PublicAsset[];
  pilot: { included: boolean; reasons: string[] };
};
export type RouteRegistry = Map<string, string>;
```

`PreparedPage.termAnchors` maps a legacy heading fragment to the persistent term ID. A term URL is `/wiki/<chapter-id>#<persistent-id>`. `anchors` includes both legacy heading fragments and persistent IDs. Every URL has a single canonical registry entry.

---

### Task 1: Prepare and validate the existing atlas for the web

**Files:** Create the runtime files and every `lib/content/` module in the file map, `scripts/prepare-site.ts`, `tests/unit/content.test.ts`, `tests/unit/routes.test.ts`, `tests/unit/pilot.test.ts`, and `tests/python/test_content_links.py`. Modify `.gitignore` and `scripts/build_catalog.py` only as needed for authored-file traversal.

**Interfaces:** Consume the existing catalog/Markdown/manifest. Produce `loadCatalog(root: string): Promise<Catalog>`, `buildRegistry(catalog: Catalog, includePilot: boolean): RouteRegistry`, `resolveLink(sourcePath: string, href: string, routes: RouteRegistry): string`, `prepareDocument(sourcePath: string, markdown: string, catalog: Catalog, routes: RouteRegistry): PreparedPage`, `validatePilot(root: string, catalog: Catalog): Promise<{ included: boolean; reasons: string[]; assets: PublicAsset[] }>`, and `prepareAtlas(root: string): Promise<PreparedAtlas>`.

- [ ] **Step 1: Establish the runtime and test scripts as part of the content adapter.** Use an existing Node 24 installation or a version manager; do not replace the system Node. Put `24` in `.nvmrc`, `"24.x"` in `engines.node`, and `"type": "module"` in `package.json`. Install only after plan approval:

```sh
npm install --save-exact next@16.3.5 react@19.3.0 react-dom@19.3.0 fumadocs-ui@16.15.12 fumadocs-core@16.15.12 fumadocs-mdx@15.4.3 mermaid@12.0.0 unified remark-parse remark-gfm remark-stringify unist-util-visit mdast-util-to-string hast-util-to-string zod lucide-react
npm install --save-dev --save-exact typescript@7.0.2 tsx@4.23.15 tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 @playwright/test@1.63.0 @types/node@24 @types/react@19 @types/react-dom@19 @types/mdx @types/mdast @types/hast
```

`--save-exact` records resolved versions for the small support packages as well. Check `npm ls` for peer errors; do not use force or legacy-peer-deps to hide incompatibility. Add initial scripts:

```json
{
  "scripts": {
    "test:unit": "node --import tsx --test tests/unit/*.test.ts",
    "content:check": "python3 scripts/build_catalog.py --check",
    "content:build": "python3 scripts/build_catalog.py",
    "site:prepare": "tsx scripts/prepare-site.ts"
  }
}
```

- [ ] **Step 2: Pin link and identity behavior with failing tests.** Use actual catalog data for integration assertions and independent minimal fixtures for invalid input. At minimum:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRegistry, resolveLink } from '../../lib/content/routes';
import { prepareAtlas } from '../../lib/content/prepare';
import type { Catalog } from '../../lib/content/types';

test('relative links keep chapter and fragment', async () => {
  const catalog: Catalog = JSON.parse(await readFile('data/catalog.json', 'utf8'));
  const routes = buildRegistry(catalog, true);
  assert.equal(resolveLink('guides/how-to-use.md',
    '../wiki/17-lighting-and-color.md#key-light', routes),
    '/wiki/lighting-and-color#key-light');
  routes.set('guides/encoded name.md', '/guides/encoded-name');
  assert.equal(resolveLink('README.md', 'guides/encoded%20name.md#detail', routes),
    '/guides/encoded-name#detail');
  assert.throws(() => resolveLink('README.md', 'private/missing.md', routes));
});

test('all entries have stable destinations alongside legacy anchors', async () => {
  const atlas = await prepareAtlas(process.cwd());
  const catalog: Catalog = JSON.parse(await readFile('data/catalog.json', 'utf8'));
  assert.equal(atlas.terms.length, catalog.entry_count);
  for (const term of atlas.terms) {
    const page = atlas.pages.find(p => p.sourcePath === term.source_path)!;
    assert.ok(page.anchors.includes(term.id));
    assert.ok(page.anchors.includes(term.anchor));
    assert.equal(term.url, `${page.url}#${term.id}`);
  }
});
```

Add a fixture which changes a term's display name and heading anchor while keeping its ID; assert its stable URL is unchanged. Add malformed catalog fixtures for duplicate IDs, missing required fields, stale SHA-256, and a route collision. Run `npm run test:unit`; expect missing-module failures first, followed by assertion failures while implementing.

- [ ] **Step 3: Implement catalog and route validation.** Validate schema and counts with Zod, recompute each chapter hash from raw file bytes, check unique IDs and chapter membership, and give errors with source paths. Match the Python builder's legacy anchor behavior, including repeated headings. Fail on catalog disagreement with a message to regenerate it; do not automatically rewrite source files during a hosting build.

Use a fixed registry for guides, examples, reference pages, README, INDEX, and downloads; derive chapter entries from the catalog. Include seed coverage JSON because the coverage page links to it. Include pilot prompts and manifest only when the pilot is complete; generation receipts are not public assets. URL resolution must preserve external `https:`, `http:`, and `mailto:` links, resolve fragment-only links against the same page, and reject unsafe schemes and traversal outside the authored tree.

```ts
// Chapter records added by buildRegistry, with collision checks before insertion.
const url = `/wiki/${chapter.id}`;
// Stable destinations used by every consumer.
const term: TermRecord = {
  ...entry,
  chapterTitle: chapter.title.replace(/^\d+\s*·\s*/, ''),
  url: `/wiki/${entry.chapter_id}#${entry.id}`,
};
```

- [ ] **Step 4: Prepare Markdown with syntax-aware transforms.** Parse with unified/remark-parse/remark-gfm; resolve link/image nodes and reference definitions, not arbitrary regular-expression substitutions. Derive the page title from H1, remove that H1 from the generated body because DocsTitle renders it, omit duplicate source-only home/index navigation in generated pages, and retain all substantive prose. Record legacy heading IDs and term-ID associations before removing HTML comments. Serialize generated Markdown with safely quoted frontmatter. Use `.md` input in Fumadocs; in Task 2, set explicit heading IDs through a compiler plugin and render persistent anchors through the heading component. Reject unsupported executable source content; existing teaching code fences remain literal.

README and INDEX are route aliases, not generated Fumadocs pages: the application owns `/` and `/terms`. Keep their legacy section destinations meaningful: chapter-family links map to the home sections; alphabetical letters map to lowercase IDs on the A–Z page. Use each chapter's existing opening paragraph for its home summary, so `PreparedPage` needs no additional home-summary field. Preserve the source H1 fragment as an anchor on the reader's DocsTitle when a source link targets it.

Search records contain plain text extracted from the same AST: one per term plus non-term chapter/guide sections, avoiding a second copy of each term in section results. `prepareAtlas` returns data without writes so fixtures can test it. `scripts/prepare-site.ts` writes only generated directories after all validation succeeds:

```ts
import { prepareAtlas } from '../lib/content/prepare';
import { mkdir, writeFile } from 'node:fs/promises';
const atlas = await prepareAtlas(process.cwd());
await mkdir('.generated', { recursive: true });
await writeFile('.generated/atlas.json', JSON.stringify(atlas));
```

The writer also emits `.generated/content/<slug>.md`, navigation metadata, `/public/generated/search.json`, and the allowlisted asset/download copies, resolving each target inside its generated root. Create new output in a temporary sibling directory and replace the previous generated snapshot only after validation and writes succeed.

- [ ] **Step 5: Make the illustration gate and editorial checker precise.** `validatePilot` checks that the manifest parses, IDs and term references are valid, all twelve declared files match size/hash/dimensions, and captions/links resolve. Return `included: false` with explicit reasons when the optional pilot is absent or incomplete. In that case remove only the dedicated illustrated-pilot promo paragraph from generated README/chapter content and exclude the pilot route/search/navigation; do not alter source Markdown. A new unresolved reference elsewhere remains a build error.

Test the failure path in a temporary copy of authored input, without touching the user's source:

```ts
import { mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
test('missing pilot asset excludes its page without broken public links', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-pilot-'));
  try {
    for (const path of ['README.md', 'INDEX.md', 'wiki', 'guides', 'examples', 'data', 'docs', 'assets'])
      await cp(path, join(root, path), { recursive: true });
    await rm(join(root, 'assets/lighting-pilot/2026-09-20/05-hard-light.png'));
    const atlas = await prepareAtlas(root);
    assert.equal(atlas.pilot.included, false);
    assert.ok(atlas.pilot.reasons.length > 0);
    assert.equal(atlas.pages.some(p => p.url === '/illustrations/lighting'), false);
    assert.equal(atlas.pages.some(p => p.markdown.includes('/illustrations/lighting')), false);
  } finally { await rm(root, { recursive: true, force: true }); }
});
```

In Python, extract `authored_markdown_paths(root: Path)` returning root README/INDEX and Markdown under `wiki`, `guides`, `examples`, and explicitly selected editorial docs (`coverage`, `initial-outline`, `pilots`). Test that a broken link in `wiki/` still fails and a fake `node_modules/package/README.md` is ignored. Preserve the existing strict source-pilot checks.

- [ ] **Step 6: Verify and commit the independently usable content adapter.** Run `npm run test:unit`, `python3 -m unittest discover -s tests/python`, `npm run content:check`, and `npm run site:prepare`. Expect exact catalog parity, all source and public links valid, and the current pilot included. Inspect generated output for raw `.md` links and accidental planning content. Commit only the task's reviewed files with message `feat: prepare validated atlas content for the web`.

### Task 2: Render the atlas with the Fumadocs reading layout

**Files:** Create the Next/Fumadocs config, global layout/provider/styles, source/navigation adapters, reader routes, Markdown/heading components, `playwright.config.ts`, and `tests/e2e/reader.spec.ts` from the file map. Add `lib/content/heading-plugin.ts` for the compilation hook that preserves legacy IDs.

**Interfaces:** Consume `PreparedAtlas` from Task 1. `lib/atlas.ts` exports `atlas: PreparedAtlas`; `lib/navigation.ts` exports `buildNavigation(atlas: PreparedAtlas): Root` using Fumadocs's page-tree `Root` type. `lib/source.ts` exports the Fumadocs loader `source`. `getMDXComponents(page: PreparedPage)` returns the MDX component map with both anchor forms. `rehypeAtlasHeadings()` returns the compiler transformer `(tree: hast.Root, file: VFile) => void`, which assigns the original legacy IDs in document order and checks its output against the prepared page's anchors. No browser component imports filesystem code.

- [ ] **Step 1: Add the first reader journey before implementation.** Create a Playwright config with `baseURL` from `ATLAS_BASE_URL` or `http://127.0.0.1:3000`. When that variable is absent, start the built app with `npm run start -- --hostname 127.0.0.1`; when present, use the provided hosted URL and do not start a local server. Add desktop Chromium and a 390px-wide phone project.

```ts
import { test, expect } from '@playwright/test';
test('read a term through its stable address', async ({ page }) => {
  await page.goto('/wiki/lighting-and-color#lighting-and-color.key-light');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Lighting and color');
  await expect(page.locator('[id="lighting-and-color.key-light"]')).toBeAttached();
  await expect(page.locator('[id="key-light"]')).toBeAttached();
  await expect(page.getByText('The principal source or contribution', { exact: false })).toBeVisible();
});
```

Run this journey after configuring the root layout; expect the chapter route to fail until Step 3. Task 4 adds a separate reader-to-A–Z journey when that route exists. Do not commit skipped or knowingly failing tests.

- [ ] **Step 2: Configure Fumadocs, scripts, and theme.** Use the config API so generated content is scanned deterministically after preparation:

```ts
// source.config.ts
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
export const docs = defineDocs({ dir: '.generated/content' });
export default defineConfig();
```

```js
// next.config.mjs
import { createMDX } from 'fumadocs-mdx/next';
export default createMDX()({ reactStrictMode: true });
// postcss.config.mjs
export default { plugins: { '@tailwindcss/postcss': {} } };
```

Use `docs` from the package-generated `.source/server` entry and `loader` from `fumadocs-core/source` with `baseUrl: '/'`. Consult the installed package's generated types for the precise server entry export; do not substitute an older Fumadocs API. Register `rehypeAtlasHeadings` after slug creation so its IDs remain the final IDs. Resolve the generated input's path back to `PreparedPage.slug`; ignore generated frontmatter and the removed H1 when pairing body headings. Import `VFile` from the framework's vfile dependency or pin it as a direct development dependency if needed. Extend scripts:

```json
{
  "dev": "npm run site:prepare && next dev",
  "build": "npm run site:prepare && next build",
  "start": "next start",
  "typecheck": "npm run site:prepare && fumadocs-mdx && next typegen && tsc --noEmit",
  "test:e2e": "playwright test"
}
```

Use strict TypeScript with Next's documented configuration and `@/*` resolving to the repository root. RootProvider comes from `fumadocs-ui/provider/next`. Load Tailwind, Fumadocs neutral/preset CSS, then atlas overrides. Set system sans for controls, a readable system serif for article headings if visually successful, a muted green accent, 65–75-character article measure, visible focus, scroll margin on anchor targets, and reduced-motion rules. Keep normal/dark themes legible.

- [ ] **Step 3: Implement home and content routes.** `DocsLayout` consumes the shared navigation tree; group chapters 1–8, 9–13, and 14–22 under the approved families. Add visible home, Alphabetical index, and reading-guide links. Home summaries come from the existing README chapter table, extracted in Task 1, or from each chapter's first paragraph; do not invent content descriptions. Home counts use `atlas.chapters.length` and `atlas.terms.length`.

The catch-all reader route looks up only published pages and uses static params:

```tsx
export function generateStaticParams() {
  return source.getPages().map(page => ({ slug: page.slugs }));
}
export default async function Page({ params }: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const prepared = atlas.pages.find(item => item.url === page.url)!;
  const Body = page.data.body;
  return <DocsPage toc={page.data.toc}>
    <DocsTitle>{page.data.title}</DocsTitle>
    <DocsBody><Body components={getMDXComponents(prepared)} /></DocsBody>
  </DocsPage>;
}
```

Imports are `notFound` from `next/navigation`, `DocsPage/DocsTitle/DocsBody` from `fumadocs-ui/layouts/docs/page`, and project `source`, `atlas`, `getMDXComponents`. Confirm these exports against installed types. Add page metadata with its real title and first prose description. The 404 offers home and A–Z links plus search after Task 3.

- [ ] **Step 4: Preserve anchor and reading semantics.** Render the legacy ID on the actual heading and a persistent ID span inside it. Keep the same ID available on both initial load and client navigation:

```tsx
// components/term-heading.tsx
export function TermHeading({ legacyId, stableId, children }: {
  legacyId: string; stableId?: string; children: React.ReactNode;
}) {
  return <h3 id={legacyId}>
    {stableId && <span id={stableId} className="term-anchor" />}
    {children}
    {stableId && <a href={`#${stableId}`} aria-label="Link to this term">#</a>}
  </h3>;
}
```

Render emphasis labels from existing content, preserve external citations, wrap wide tables in a labeled horizontal-scroll region, and use the Fumadocs layout's responsive menu/contents controls. Include one main landmark, a functional skip link, and a textual contents fallback for no-JavaScript reading.

- [ ] **Step 5: Verify and commit the reader.** Run `npm run typecheck`, `npm run build`, and the chapter/home/404 portions of the reader suite. Add a no-JavaScript browser context and assert chapter prose and ordinary chapter links are still available. Check legacy and persistent fragment targets are within the viewport after direct navigation. Inspect home and chapter screens at both configured widths, including long headings and wide tables. Commit as `feat: add the atlas reading interface`.

### Task 3: Add term and section search with reliable recovery

**Files:** Create `lib/search.ts`, `components/search-dialog.tsx`, `tests/unit/search.test.ts`, and `tests/e2e/search.spec.ts`. Modify `app/providers.tsx` and the not-found page to expose the same search control.

**Interfaces:** Consume `SearchRecord[]` from `/generated/search.json`. Export `searchRecords(records: SearchRecord[], query: string, limit = 30): SearchRecord[]` and `loadSearchRecords(): Promise<SearchRecord[]>`. Export the default `AtlasSearchDialog` component with Fumadocs `SharedProps`. Keep source loading and query ranking independently testable.

- [ ] **Step 1: Test ranking, context, and empty input.** Create a small independent set of records before implementing ranking:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { searchRecords } from '../../lib/search';
import type { SearchRecord } from '../../lib/content/types';
const records: SearchRecord[] = [
  { id: 'sound.theme', title: 'Theme', context: 'Sound', text: 'Recurring music', url: '/wiki/sound#sound.theme', kind: 'term' },
  { id: 'story.theme', title: 'Theme', context: 'Story', text: 'Underlying meaning', url: '/wiki/story#story.theme', kind: 'term' },
  { id: 'story.motif', title: 'Motif', context: 'Story', text: 'Supports a theme', url: '/wiki/story#story.motif', kind: 'term' },
];
test('exact matches keep both contexts ahead of body matches', () => {
  const found = searchRecords(records, '  THEME  ');
  assert.deepEqual(new Set(found.slice(0, 2).map(r => r.context)), new Set(['Sound', 'Story']));
  assert.equal(found.at(-1)?.id, 'story.motif');
  assert.deepEqual(searchRecords(records, '   '), []);
  assert.deepEqual(searchRecords(records, 'zzzxunknown'), []);
});
```

Run `npm run test:unit` and observe this new test fail before implementing the function.

- [ ] **Step 2: Implement small deterministic search.** For this corpus, a normalized in-memory scan avoids another search engine dependency and provides predictable ranking. Normalize whitespace, Unicode diacritics, and case; match all query tokens across title/context/body. Rank exact full-title matches first, full-title prefixes next, other title matches next, and body matches last. Break ties by title, context, and ID. Keep URLs untouched. Return up to the requested limit.

```ts
const normalize = (value: string) => value.normalize('NFKD')
  .replace(/\p{M}/gu, '').toLocaleLowerCase('en')
  .trim().replace(/\s+/g, ' ');
```

`loadSearchRecords` fetches only on dialog opening, checks HTTP status and JSON shape, and caches successful results. A rejected request clears the cached promise so Retry can start a fresh fetch. Do not silently turn network errors into no results.

- [ ] **Step 3: Integrate the Fumadocs dialog.** Use the documented `SearchDialog`, overlay, content, input, close, and list primitives from `fumadocs-ui/components/dialog/search`. Derive list item types from the installed component's props. Adapt `SearchRecord` to the component's supported result shape and render name, chapter context, and a plain-text excerpt. Avoid unsafe HTML for excerpts.

Use a discriminated loading state, preventing late responses from updating an unmounted dialog:

```ts
type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; records: SearchRecord[] }
  | { status: 'error'; message: string };
```

Idle copy: `Search terms, definitions, and examples.` Loading copy: `Loading search…` Empty-query guidance stays distinct from `No results for “…”`. Error copy: `Search could not load. Try again or browse a chapter.` Provide a Retry button and a chapter-browser link. Keep Cmd/Ctrl+K behavior through RootProvider, trap focus, support arrows/Enter/Escape, and restore focus to the initiating control.

- [ ] **Step 4: Test the failed-load/retry journey and stable destination.** Use a fresh browser page so cached data cannot mask failure:

```ts
import { test, expect } from '@playwright/test';
test('failed search can retry without losing reading', async ({ page }) => {
  await page.route('**/generated/search.json', route => route.abort());
  await page.goto('/wiki/lighting-and-color');
  await page.getByRole('button', { name: /search/i }).first().click();
  await expect(page.getByText('Search could not load.', { exact: false })).toBeVisible();
  await page.unroute('**/generated/search.json');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('key light');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#lighting-and-color\.key-light$/);
});
```

Add a delayed response test for the loading state and a close-with-Escape test that checks the opener regains focus. On mobile use the visible trigger; on desktop exercise the keyboard shortcut. Exact accessible names may be aligned with the final UI; retain behavioral assertions.

- [ ] **Step 5: Verify and commit search.** Run unit checks, build, and `npm run test:e2e -- tests/e2e/search.spec.ts`. Test representative name and body queries against real atlas content and verify both term and guide-section destinations. Commit as `feat: add searchable vocabulary and guide sections`.

### Task 4: Add the A–Z vocabulary browser

**Files:** Create `lib/terms.ts`, `components/term-browser.tsx`, `app/(reader)/terms/page.tsx`, `tests/unit/terms.test.ts`, and `tests/e2e/terms.spec.ts`. Add a reader-to-index journey in the reader suite.

**Interfaces:** Define `TermListItem = Pick<TermRecord, 'id' | 'name' | 'chapter_id' | 'chapterTitle' | 'url'>`, `TermFilters = { q: string; chapter: string }`, `parseFilters(params: URLSearchParams, chapterIds: string[]): TermFilters`, and `filterTerms(terms: TermListItem[], filters: TermFilters): TermListItem[]`. The component receives lightweight terms, chapter options, and initial URL filters; never send the entire prepared Markdown bundle to the client.

- [ ] **Step 1: Test shared filter behavior before implementing it.** Use actual catalog-derived terms for count checks, plus a compact fixture for unknown chapter IDs:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFilters } from '../../lib/terms';
test('invalid chapter falls back to all chapters while preserving the query', () => {
  assert.deepEqual(parseFilters(new URLSearchParams('q=light&chapter=missing'),
    ['lighting-and-color']), { q: 'light', chapter: '' });
});
```

Add repeated query parameters (first value wins), blank query, case-insensitive matching, and repeated labels with distinct IDs. Alphabetize by display name with context and ID tie-breakers. Group initial non-letters under `0–9`, with non-empty letter groups only. Run unit tests and observe the new cases fail first.

- [ ] **Step 2: Implement URL-derived filters and a server-rendered initial list.** The Next page reads `searchParams` and prepares initial results, so the first page is useful without hydration. Use `q` and `chapter` as the only query keys. In the interactive component, derive active filters from `useSearchParams`; update the URL with the router and keep focus in the input. Debounced typing uses replace; deliberate chapter and clear actions use push so Back restores meaningful states.

```ts
const params = new URLSearchParams();
if (filters.q.trim()) params.set('q', filters.q.trim());
if (filters.chapter) params.set('chapter', filters.chapter);
const nextUrl = `/terms${params.size ? `?${params.toString()}` : ''}`;
router.push(nextUrl, { scroll: false });
```

Provide `Filter terms`, `Chapter`, `Clear filters`, a polite result-count status, letter jump links, and ordinary term anchors. The unfiltered initial HTML includes all terms; hide empty groups only after deriving results. Empty-state copy suggests clearing filters and includes the action.

- [ ] **Step 3: Test shareable URLs and Back navigation.** Keep assertions grounded in page roles and resolved state:

```ts
import { test, expect } from '@playwright/test';
test('shared filters and Back restore the same result set', async ({ page }) => {
  await page.goto('/terms?q=light&chapter=lighting-and-color');
  await expect(page.getByLabel('Filter terms')).toHaveValue('light');
  await expect(page.getByLabel('Chapter')).toHaveValue('lighting-and-color');
  const count = await page.getByRole('status').textContent();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await page.goBack();
  await expect(page.getByLabel('Chapter')).toHaveValue('lighting-and-color');
  await expect(page.getByRole('status')).toHaveText(count!);
});
```

Verify a result leads to the stable term anchor and an invalid chapter URL displays all chapters rather than a false empty result. Add the cross-page journey:

```ts
test('chapter navigation opens the vocabulary index', async ({ page }) => {
  await page.goto('/wiki/lighting-and-color');
  await page.getByRole('link', { name: 'Alphabetical index', exact: true }).first().click();
  await expect(page).toHaveURL(/\/terms/);
  await expect(page.getByLabel('Filter terms')).toBeVisible();
});
```

- [ ] **Step 4: Verify and commit the A–Z browser.** Run unit checks, build, the terms suite, and the completed reader-to-index test. Compare unfiltered result count and IDs with the current catalog. Inspect filters, letter links, and repeated labels at phone width. Commit as `feat: add the filterable A-Z vocabulary browser`.

### Task 5: Present the existing illustrations and diagram

**Files:** Create `components/illustration.tsx`, `components/mermaid-diagram.tsx`, and `tests/e2e/media.spec.ts`. Update `components/mdx.tsx` and scoped styles; extend the Task 1 asset copier to preserve dimensions and public download mappings.

**Interfaces:** `Illustration` receives `{ src: string; alt: string; width: number; height: number }`. `MermaidDiagram` receives `{ code: string }`. Resolve dimensions and allowed image URLs from `atlas.assets`. Candidate status and caveat text remain in the page's original Markdown.

- [ ] **Step 1: Test the real pilot route and absence of broken images.** Build on Task 1's incomplete-pilot fixture; this browser test uses the complete current source:

```ts
import { test, expect } from '@playwright/test';
test('lighting comparisons show all declared images and their status', async ({ page }) => {
  await page.goto('/illustrations/lighting');
  await expect(page.getByText('Status: candidate illustrations.', { exact: false })).toBeVisible();
  const images = page.locator('main img');
  await expect(images).toHaveCount(12);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) =>
      img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await image.getAttribute('alt')).not.toBe('');
  }
});
```

- [ ] **Step 2: Render responsive comparisons and downloads.** Use Next Image for allowlisted raster images, with source dimensions, an accurate `sizes` rule, lazy loading below the fold, and no image generation. Keep captions as text and preserve their relationship to the image; use the pilot's table structure as the grouping source. On narrow viewports stack image/caption pairs, or keep a locally scrollable comparison where stacking would disconnect the captions. Do not label candidates as approved or physically calibrated.

```tsx
import Image from 'next/image';
export function Illustration(props: {
  src: string; alt: string; width: number; height: number;
}) {
  return <Image {...props} sizes="(max-width: 768px) 90vw, 420px"
    className="h-auto w-full rounded-md" />;
}
```

Copy allowlisted JSON to `public/generated/downloads/`. Add a Next rewrite from `/downloads/:file` to `/generated/downloads/:file` so the spec's download URLs remain stable. The registry must include catalog, decision schema, seed coverage, worked-scene JSON, and the included pilot's prompts/manifest. Test response status, content type, and JSON parsing, and ensure generation receipts and planning files are not accessible through this route.

- [ ] **Step 3: Render Mermaid safely with a readable fallback.** Dynamically import Mermaid only when a Mermaid block is mounted. Set `startOnLoad: false`, `securityLevel: 'strict'`, and use a unique render ID. Show the original fenced diagram text until rendering succeeds and keep it as the accessible fallback if rendering fails. Set the wrapper's accessible name to `Atlas relationships diagram`. Respect reduced motion. Mermaid's sanitized render result is the only HTML inserted through this component.

```ts
const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
const { svg } = await mermaid.render(renderId, code);
```

Guard asynchronous completion on unmount and catch errors to preserve the fallback. Use a component test fixture with an invalid diagram to confirm fallback text remains visible; the valid guide diagram must produce an SVG. Check that neither case prevents the surrounding guide prose from rendering.

- [ ] **Step 4: Verify and commit media support.** Run build and media/guide tests. Inspect all comparison groups at desktop and phone sizes; retain the three existing visual caveats. Open the guide with JavaScript disabled and confirm its diagram source and explanatory prose remain readable. Commit as `feat: present lighting illustrations and the atlas diagram`.

### Task 6: Verify the complete reader and publish on Vercel

**Files:** Create `vercel.json`, `.vercelignore`, `docs/site-maintenance.md`, and `docs/site-verification.md`; update README with actual commands and URL after deployment. Extend `tests/e2e/reader.spec.ts` with route/anchor coverage and accessibility journeys.

**Interfaces:** Consume the completed application and tests. Produce the actual preview and production URLs, a recorded tested commit/content snapshot, and maintenance instructions. Deployment configuration uses `framework: 'nextjs'`, `buildCommand: 'npm run build'`, `installCommand: 'npm ci'`; Node 24.x is selected through package.json.

- [ ] **Step 1: Run the release checks under Node 24.** The command set is:

```sh
npm ci
npm run content:check
python3 -m unittest discover -s tests/python
npm run test:unit
npm run typecheck
npm run build
npm run test:e2e
```

Expect a successful production build, all tests passing, and current catalog/source parity. Investigate actual failures; do not rerun an unchanged full suite repeatedly without a reason. Ensure no dependency code or generated files have entered the authored Markdown checker.

- [ ] **Step 2: Verify every published route and anchor.** Add a browser/API sweep driven by the generated atlas, not a hardcoded 22-page list. Fetch each published page once, parse its HTML with DOMParser in the browser, and check all declared anchors are present. Verify every term's stable ID and legacy heading ID on its chapter page. Check no duplicate IDs exist on a page. Sample source citations and verify every allowlisted download returns parseable JSON. Unknown page and unallowlisted download requests must return 404.

```ts
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { PreparedAtlas } from '../../lib/content/types';
const atlas: PreparedAtlas = JSON.parse(readFileSync('.generated/atlas.json', 'utf8'));
test('all term anchors are present in their chapter HTML', async ({ page }) => {
  await page.goto('/');
  for (const chapter of atlas.chapters) {
    const response = await page.request.get(`/wiki/${chapter.id}`);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const ids = await page.evaluate(markup => {
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      return [...doc.querySelectorAll('[id]')].map(el => el.id);
    }, html);
    for (const term of atlas.terms.filter(t => t.chapter_id === chapter.id)) {
      expect(ids).toContain(term.id);
      expect(ids).toContain(term.anchor);
    }
  }
});
```

Import the generated atlas on the test-runner side; do not expose test data routes in the application.

- [ ] **Step 3: Perform rendered and accessibility review.** Use the browser workflow required by the execution skill. Inspect home, a long chapter, search initial/results/empty/error, filtered A–Z, diagram, lighting comparisons, and 404 at 1440px and 390px widths. Check a tablet width and real browser zoom at 200%; a smaller viewport alone is not a zoom check. Test keyboard-only opening/closing of search and mobile navigation, skip link, link focus visibility, contents navigation, and theme switching. Confirm no page-level horizontal overflow, clipped controls, unreadable contrast, or broken image/caption relationships. Save evidence screenshots and observations; a screenshot is not a substitute for testing interactions.

- [ ] **Step 4: Complete the independent code review required by the selected execution skill.** Supply the approved spec, this plan, actual diff, and test evidence. Fix actionable findings and repeat the affected checks. Do not describe this review as completed until a reviewer has returned findings. Keep any baseline illustration changes separately attributable.

- [ ] **Step 5: Deploy a preview using the Vercel deployment skill.** At execution time load the applicable Vercel skill, inspect existing project/account linkage, and use the available authenticated connector or CLI. Reuse a project only if it clearly belongs to this atlas. Otherwise create the atlas project in the user's account. Never print tokens. Exclude caches, local configuration, `.git`, tests, and planning documents from deployment uploads while retaining every source file required by `site:prepare`. No custom domain purchase is part of this task.

Read-only account and build checks come before the deployment. With correct CLI project linkage, the preview command is:

```sh
vercel deploy --yes
```

Record the returned URL and deployment ID. Fetch build logs if deployment fails. If authentication is unavailable, finish local validation and report the exact required sign-in action; do not claim publication.

- [ ] **Step 6: Verify the preview, then production.** Run the reader, search, terms, and media tests against the preview using `ATLAS_BASE_URL` set to the returned URL. Use authenticated browser access when preview protection requires it; do not bypass access controls. Once the preview checks pass, promote that verified deployment through the supported Vercel workflow. If promotion requires a production rebuild, verify that build again before calling it released. The user already requested Vercel publication, so do not introduce another generic publishing approval.

Repeat the primary home → search → term, chapter → related topic, A–Z filter → term, lighting, and download checks against the production URL. Verify the intended public pages work in a signed-out browser. Record any difference between preview and production access or behavior.

Connect the atlas project to `weeeha/Film-TV-Vocabulary` for future repository-driven updates. Use `main` as its production branch once the reviewed application and required content snapshot are present there through the normal non-force Git workflow; respect any repository review requirements. Confirm this connection targets the atlas project only. A connection requiring user authentication is a specific external dependency to report, not a reason to claim automated publishing works prematurely.

- [ ] **Step 7: Save actual evidence and maintenance instructions, then finish.** `docs/site-verification.md` records date, commit/content snapshot, runtime/package versions, commands and results, tested routes/viewports, screenshots, image inclusion status, preview URL, production URL, and known remaining issues. Do not populate it with planned results. `docs/site-maintenance.md` documents editing Markdown, `npm run content:build`, `npm run content:check`, website preparation, local preview, checks, and redeployment. The current dev command prepares content once at startup, so document restarting it after source edits; do not imply live updates without adding a watcher.

Update the README's application-status paragraph accurately while retaining the distinction between a working reader, candidate illustrations, and unimplemented simulators/generation. Explain that website content still comes from the source files. Commit only the reviewed deployment/docs changes. Finish with the production link, implemented scope, actual validation, and any material limitation.

## Coverage and self-review

| Approved design requirement | Owning task |
|---|---|
| Existing content, one source of truth, schema/hash validation | 1 |
| Original relative links, persistent term IDs, duplicates | 1, 2 |
| Home, chapter families, full prose, related topics, source links | 2 |
| Search ranking, guide sections, keyboard use, retry | 3 |
| A–Z grouping, context, filters, shared URLs, Back | 4 |
| Lighting gate, candidate status, captions, dimensions, downloads | 1, 5 |
| Mermaid and readable fallback | 5 |
| Mobile/desktop, dark theme, no-JavaScript reading, 404 | 2, 6 |
| Focus, reduced motion, text zoom, rendered inspection | 2, 3, 6 |
| Preview, production, public access, update instructions | 6 |

Self-review completed on 2026-09-20: every spec section maps to an owning task, shared interfaces have named owners, and all five Review Focus cases have explicit tests. Corrections made during review include H1 duplication, reader tests depending on the later A–Z task, download URL mapping, and future repository-driven publishing. Steps and example code are instructions for implementation, not evidence of an existing build. The user reviews this plan and chooses Native or Subagent-driven execution before implementation starts.

## Primary references checked during planning

- [Fumadocs with Next.js](https://www.fumadocs.dev/docs/manual-installation/next): supported Next/Tailwind integration and UI providers.
- [Fumadocs MDX collections](https://www.fumadocs.dev/docs/mdx/collections): content collection configuration.
- [Fumadocs custom search](https://www.fumadocs.dev/docs/search/custom) and [search UI](https://www.fumadocs.dev/docs/ui/search): custom records and dialog integration.
- [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions): Node 24.x support and package.json selection.
- Public npm registry metadata for the exact primary package versions listed above; the installer must still validate the lockfile and build.
