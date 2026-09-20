"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  filterTerms,
  groupTerms,
  parseFilters,
  filtersUrl,
  type TermListItem,
  type TermFilters,
} from "@/lib/terms";
export function TermBrowser({
  terms,
  chapters,
  initialFilters,
}: {
  terms: TermListItem[];
  chapters: { id: string; title: string }[];
  initialFilters: TermFilters;
}) {
  const params = useSearchParams();
  const filters = params
    ? parseFilters(
        new URLSearchParams(params.toString()),
        chapters.map((c) => c.id),
      )
    : initialFilters;
  const [draft, setDraft] = useState(initialFilters.q);
  useEffect(() => setDraft(filters.q), [filters.q]);
  // Filters are local data; native history integrates with Next search params
  // without network navigations that can overwrite a newer draft.
  useEffect(() => {
    if (draft.trim() === filters.q) return;
    const timer = setTimeout(
      () =>
        window.history.replaceState(
          null,
          "",
          filtersUrl({ q: draft, chapter: filters.chapter }),
        ),
      300,
    );
    return () => clearTimeout(timer);
  }, [draft, filters.q, filters.chapter]);
  const found = filterTerms(terms, filters);
  const groups = groupTerms(found);
  function clear() {
    setDraft("");
    window.history.pushState(null, "", "/terms");
  }
  return (
    <>
      <form
        className="term-filters"
        action="/terms"
        method="get"
        onSubmit={(e) => {
          e.preventDefault();
          window.history.pushState(
            null,
            "",
            filtersUrl({ q: draft, chapter: filters.chapter }),
          );
        }}
      >
        <label>
          Filter terms
          <input
            name="q"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Find a word or phrase…"
          />
        </label>
        <label>
          Chapter
          <select
            aria-label="Chapter"
            name="chapter"
            value={filters.chapter}
            onChange={(e) =>
              window.history.pushState(
                null,
                "",
                filtersUrl({ q: draft, chapter: e.target.value }),
              )
            }
          >
            <option value="">All chapters</option>
            {chapters.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <noscript>
          <button type="submit" className="primary-link">
            Apply filters
          </button>
        </noscript>
      </form>
      <div className="terms-status">
        <p role="status" aria-live="polite">
          {found.length} {found.length === 1 ? "term" : "terms"}
        </p>
        {(filters.q || filters.chapter) && (
          <a
            href="/terms"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              clear();
            }}
          >
            Clear filters
          </a>
        )}
      </div>
      <nav className="letter-nav" aria-label="Jump to letter">
        {[...groups.keys()].map((letter) => (
          <a key={letter} href={"#letter-" + letter}>
            {letter}
          </a>
        ))}
      </nav>
      {found.length === 0 ? (
        <div className="terms-empty">
          <h2>No matching terms.</h2>
          <p>
            Try a broader phrase or clear the filters to explore the full atlas.
          </p>
        </div>
      ) : (
        [...groups].map(([letter, items]) => (
          <section
            className="term-group"
            key={letter}
            aria-labelledby={"letter-" + letter}
          >
            <h2 id={"letter-" + letter}>{letter}</h2>
            <ul>
              {items.map((t) => (
                <li key={t.id}>
                  <Link href={t.url}>
                    <span>{t.name}</span>
                    <span>{t.chapterTitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
