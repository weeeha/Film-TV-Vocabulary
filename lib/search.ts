import type { SearchRecord } from "./content/types";
export const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en")
    .trim()
    .replace(/\s+/g, " ");
export function searchRecords(
  records: SearchRecord[],
  query: string,
  limit = 30,
): SearchRecord[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ");
  const score = (r: SearchRecord) => {
    const title = normalize(r.title);
    return title === q
      ? 0
      : title.startsWith(q)
        ? 1
        : tokens.some((t) => title.includes(t))
          ? 2
          : 3;
  };
  return records
    .filter((r) => {
      const text = normalize(r.title + " " + r.context + " " + r.text);
      return tokens.every((t) => text.includes(t));
    })
    .sort(
      (a, b) =>
        score(a) - score(b) ||
        a.title.localeCompare(b.title) ||
        a.context.localeCompare(b.context) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, Math.max(0, limit));
}
let cached: Promise<SearchRecord[]> | undefined;
export function loadSearchRecords(): Promise<SearchRecord[]> {
  if (!cached)
    cached = fetch("/generated/search.json")
      .then(async (response) => {
        if (!response.ok) throw new Error("Search unavailable");
        const data: unknown = await response.json();
        if (
          !Array.isArray(data) ||
          !data.every(
            (r) =>
              r &&
              ["id", "title", "context", "text", "url"].every(
                (k) => typeof r[k] === "string",
              ) &&
              ["term", "section"].includes(r.kind) &&
              r.url.startsWith("/") &&
              !r.url.startsWith("//"),
          )
        )
          throw new Error("Invalid search index");
        return data as SearchRecord[];
      })
      .catch((error) => {
        cached = undefined;
        throw error;
      });
  return cached;
}
