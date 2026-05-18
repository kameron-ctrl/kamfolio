import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/lenis-provider/LenisProvider";
import MoonSceneClient from "@/components/canvas/MoonScene.client";

export const metadata: Metadata = {
  title: "Kameron Benjamin",
  description: "Full-stack developer with a strong creative tech focus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <MoonSceneClient />
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </LenisProvider>
      </body>
    </html>
  );
}
