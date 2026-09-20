import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Film & TV Atlas", template: "%s · Film & TV Atlas" },
  description:
    "An illustrated vocabulary for describing stories, performances, images, and sound.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <a className="skip-link" href="#nd-page">
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
