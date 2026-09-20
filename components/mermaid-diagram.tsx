"use client";
import { useEffect, useId, useState } from "react";
export function MermaidDiagram({ code }: { code: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    setSvg("");
    setFailed(false);
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
          suppressErrorRendering: true,
        });
        const rendered = await mermaid.render("atlasDiagram" + id, code);
        if (live) setSvg(rendered.svg);
      } catch {
        if (live) setFailed(true);
      }
    }
    void render();
    return () => {
      live = false;
    };
  }, [code, id]);
  return (
    <div className="mermaid-block">
      {svg ? (
        <>
          <div
            className="mermaid-svg"
            role="img"
            aria-label="Atlas relationships diagram"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <details>
            <summary>Read diagram source</summary>
            <pre>
              <code>{code}</code>
            </pre>
          </details>
        </>
      ) : (
        <>
          <p className="diagram-status">
            {failed
              ? "Diagram unavailable. The relationships are shown below."
              : "Atlas relationships diagram — text version"}
          </p>
          <pre>
            <code>{code}</code>
          </pre>
        </>
      )}
    </div>
  );
}
