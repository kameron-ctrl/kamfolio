import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import LenisProvider from "@/components/lenis-provider/LenisProvider";
import MoonSceneClient from "@/components/canvas/MoonScene.client";
import HireMe from "@/components/rocket/HireMe";

// Share images (app/opengraph-image.jpg, app/twitter-image.jpg) need an absolute origin
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kameron-ctrl.com";

const TITLE = "Kameron Benjamin";
const DESCRIPTION = "Full-stack developer with a strong creative tech focus.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <LenisProvider>
          <MoonSceneClient />
          <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
          {/* Outside the content wrapper so its fixed positioning never inherits a transform */}
          <HireMe />
        </LenisProvider>
      </body>
    </html>
  );
}
