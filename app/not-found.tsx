import { SearchButton } from "@/components/search-button";
import Link from "next/link";
export default function NotFound() {
  return (
    <main id="nd-page" className="not-found">
      <p className="eyebrow">404 · Off the page</p>
      <h1>That page isn’t in the atlas.</h1>
      <p>Try the chapter browser or find a term in the alphabetical index.</p>
      <div className="hero-actions">
        <SearchButton />
        <Link className="primary-link" href="/">
          Back to the atlas
        </Link>
        <Link href="/terms">Browse the A–Z index →</Link>
      </div>
    </main>
  );
}
