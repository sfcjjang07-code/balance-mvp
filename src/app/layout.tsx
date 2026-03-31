import type { ReactNode } from "react";
import type { Metadata } from "next";

import Header from "@/components/Header";
import SiteEntryTracker from "@/components/SiteEntryTracker";
import SiteFooter from "@/components/SiteFooter";

import "./globals.css";

export const metadata: Metadata = {
  title: "BALANCE LAB",
  description: "검색하고 바로 즐기는 심플한 밸런스게임 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="page-bg" />
        <SiteEntryTracker />
        <Header />
        <main className="page-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
