import type { Metadata } from "next";
import TierBoard from "@/components/TierBoard";
import "@/styles/tierlist.css";

export const metadata: Metadata = {
  title: "poketier | 통합 티어",
  description: "더블배틀 기준 역할별 티어 구간",
};

export default function TierlistPage() {
  return (
    <main className="tier-page">
      <div className="tier-page-hero">
        <p className="section-label">TIER &amp; RANK</p>
        <h1>통합 티어리스트</h1>
        <p className="tier-page-lead">
          티어리스트와 순위표를 한 화면에서 볼 수 있도록 묶었습니다. 아래는 역할 필터와 1~5티어
          샘플 레이아웃이며, 데이터는 연동 전 <strong>디자인 확인용</strong>입니다.
        </p>
      </div>
      <TierBoard />
    </main>
  );
}
