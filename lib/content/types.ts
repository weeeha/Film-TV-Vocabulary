export type Chapter = {
  id: string;
  number: number;
  title: string;
  source_path: string;
  entry_count: number;
  word_count: number;
  sha256: string;
};
export type Entry = {
  id: string;
  name: string;
  chapter_id: string;
  group: string;
  definition: string;
  use: string;
  example: string;
  source_path: string;
  anchor: string;
};
export type Catalog = {
  chapter_count: number;
  entry_count: number;
  chapters: Chapter[];
  entries: Entry[];
};
export type TermRecord = Entry & { chapterTitle: string; url: string };
export type SearchRecord = {
  id: string;
  title: string;
  context: string;
  text: string;
  url: string;
  kind: "term" | "section";
};
export type PreparedPage = {
  sourcePath: string;
  url: string;
  slug: string[];
  title: string;
  titleId: string;
  summary: string;
  markdown: string;
  anchors: string[];
  headingIds: string[];
  termAnchors: Record<string, string>;
  links: string[];
  sections: SearchRecord[];
};
export type PublicAsset = {
  sourcePath: string;
  url: string;
  sha256: string;
  width?: number;
  height?: number;
};
export type PreparedAtlas = {
  chapters: Chapter[];
  terms: TermRecord[];
  pages: PreparedPage[];
  search: SearchRecord[];
  assets: PublicAsset[];
  pilot: { included: boolean; reasons: string[] };
};
export type RouteRegistry = Map<string, string>;
