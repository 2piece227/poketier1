import type { Metadata } from "next";
import NewsBoard from "@/components/NewsBoard";
import "@/styles/news.css";

export const metadata: Metadata = {
  title: "poketier | 최신 정보",
  description: "업데이트·대회·공략·가이드 등 포켓몬 최신 정보",
};

export default function NewsPage() {
  return (
    <main className="news-page">
      <div className="news-hero">
        <p className="section-label">NEWS &amp; UPDATES</p>
        <h1>최신 정보</h1>
        <p className="news-lead">
          패치·이벤트·대회·메타 해설을 한곳에서 모아 보여줄 예정입니다. 아래는 뉴스형 목록과
          카테고리 필터 <strong>초기 디자인</strong>이며, 본문·썸네일은 샘플입니다.
        </p>
      </div>
      <NewsBoard />
    </main>
  );
}
