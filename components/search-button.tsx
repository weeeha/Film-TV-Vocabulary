"use client";
import { useSearchContext } from "fumadocs-ui/contexts/search";
export function SearchButton() {
  const { setOpenSearch } = useSearchContext();
  return (
    <button className="primary-link" onClick={() => setOpenSearch(true)}>
      Search the atlas
    </button>
  );
}
