# Maintaining the Film & TV Atlas

The website reads the existing Markdown and committed vocabulary catalog. Visitors can read, search, and browse without an account. Editing stays in this repository.

Use Node 24 and Python 3 locally. Install the locked dependencies with `npm ci`.

1. Edit chapters in `wiki/`, guides in `guides/`, or the worked example in `examples/`.
2. Keep persistent `term-id` comments when renaming entries. For new entries, run `python3 scripts/build_catalog.py --assign-ids` once.
3. Run `npm run content:build` and review the catalog, index, and coverage changes.
4. Run `npm run content:check`, `npm run test:unit`, `npm run typecheck`, `npm run build`, and `npm run test:e2e`.
5. Start a local preview with `npm run dev`. Restart it after source Markdown edits: preparation runs at startup, not on each source edit.
6. Review and commit source and generated editorial files. Never edit `.generated/` or `public/generated/`; these are disposable build outputs.

Vercel runs the Node-based content validator and builder, without requiring Python. Stale chapter hashes or broken published links fail the build. If the optional lighting pilot is incomplete, its page and promotion links are omitted; the chapter remains available.

The Vercel project is connected to GitHub `weeeha/Film-TV-Vocabulary`, with `main` as its production branch. Push a feature branch to create a preview, verify it, then merge the reviewed change into `main` to publish automatically. Changes pushed directly to `main` also publish automatically. Verify production after release. The public site is https://film-tv-atlas.vercel.app; see [release verification](site-verification.md) for deployment evidence. For manual publishing, use `vercel deploy` for a preview, verify it, then `vercel promote <preview-url>` and verify production.

The atlas uses open-source Next.js, React, Fumadocs, Tailwind CSS, Mermaid, and their dependencies. Their license notices remain with the packages. Lighting images are generated candidates with provenance and caveats; simulators and generation tools described in the source are proposals.
