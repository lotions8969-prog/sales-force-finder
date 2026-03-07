import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "営業強み診断ツール | Sales Force Finder",
  description: "営業チームのメンバーの強み・弱みを可視化し、役割適性と育成施策を提案する診断ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
