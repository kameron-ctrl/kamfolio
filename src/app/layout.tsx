import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kameron Benjamin",
  description: "Full-stack developer with a strong creative tech focus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
