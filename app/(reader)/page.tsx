import Link from "next/link";
import { DocsPage } from "fumadocs-ui/layouts/docs/page";
import { atlas } from "@/lib/atlas";
import { families } from "@/lib/navigation";
export default function Home() {
  return (
    <DocsPage full breadcrumb={{ enabled: false }} footer={{ enabled: false }}>
      <header className="home-hero">
        <p className="eyebrow">A field guide to film & television</p>
        <h1>
          Find the words.
          <br />
          Shape the scene.
        </h1>
        <p className="hero-copy">
          A shared vocabulary for the stories we tell and the choices that bring
          them to life. Explore the craft, one idea at a time.
        </p>
        <div className="hero-actions">
          <Link className="primary-link" href="/terms">
            Explore the A–Z index <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/guides/how-to-use">How to use the atlas →</Link>
        </div>
        <p className="atlas-counts">
          {atlas.terms.length} terms <span>•</span> {atlas.chapters.length}{" "}
          chapters <span>•</span> One connected craft
        </p>
      </header>
      {atlas.pilot.included && (
        <Link href="/illustrations/lighting" className="pilot-feature">
          <div>
            <p className="eyebrow">Visual field notes · 01</p>
            <h2>One subject. Twelve ways to light it.</h2>
            <p>
              Compare the lighting pilot’s illustrated candidates, from key
              light to silhouette.
            </p>
            <span>Explore the lighting study →</span>
          </div>
          <img
            src={
              atlas.assets.find((a) => a.url.endsWith("/key-light.png"))?.url ??
              atlas.assets.find((a) => a.width)?.url
            }
            width="220"
            height="160"
            alt="Neutral bust demonstrating directional lighting"
          />
        </Link>
      )}
      <div className="chapter-browser">
        {families.map((f, i) => (
          <section key={f.title}>
            <div className="family-heading">
              <span>0{i + 1}</span>
              <h2>{f.title}</h2>
            </div>
            {atlas.chapters
              .filter((c) => c.number >= f.start && c.number <= f.end)
              .map((c) => (
                <Link className="chapter-row" key={c.id} href={"/wiki/" + c.id}>
                  <span className="chapter-number">
                    {String(c.number).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{c.title.replace(/^\d+ · /, "")}</h3>
                    <p>
                      {
                        atlas.pages.find((p) => p.url === "/wiki/" + c.id)
                          ?.summary
                      }
                    </p>
                  </div>
                  <span className="chapter-count">
                    {c.entry_count} terms <span aria-hidden="true">↗</span>
                  </span>
                </Link>
              ))}
          </section>
        ))}
      </div>
      <footer className="home-footer">
        A living reference for curious filmmakers.{" "}
        <Link href="/reference/coverage">Explore the coverage</Link>
      </footer>
    </DocsPage>
  );
}
