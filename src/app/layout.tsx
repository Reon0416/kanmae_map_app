import type { Metadata, Viewport } from "next";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "KANMAE",
  description: "関大前周辺の飲食店の入りやすさを確認できるマップアプリ"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <AppChrome />
        {children}
      </body>
    </html>
  );
}
