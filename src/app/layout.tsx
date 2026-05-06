import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/lenis-provider/LenisProvider";
import ScrollDebugHUD from "@/components/debug/ScrollDebugHUD";

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
          {children}
          <ScrollDebugHUD />
        </LenisProvider>
      </body>
    </html>
  );
}
