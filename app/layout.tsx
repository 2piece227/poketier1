import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "poketier | 포켓티어",
  description: "포켓몬 챔피언스 티어리스트와 순위표를 한눈에",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 테마 깜빡임 방지 — body 렌더 전에 실행 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k="poketier-theme";var s=localStorage.getItem(k);document.documentElement.setAttribute("data-theme",s==="dark"?"dark":"light");})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
