"use client";
import { useState } from "react";

const CATS = [
  { key: "all", label: "전체" },
  { key: "update", label: "업데이트" },
  { key: "tournament", label: "대회" },
  { key: "meta", label: "메타·공략" },
  { key: "guide", label: "가이드" },
] as const;

type CatKey = (typeof CATS)[number]["key"];

const CARDS = [
  { cats: ["tournament"], thumb: "", title: "지역 예선 일정·참가 방법 안내", excerpt: "샘플 텍스트입니다. 대회 공지가 들어갈 카드입니다.", date: "2026.3.26" },
  { cats: ["meta"], thumb: "--b", title: "상위권 픽률 급상승 포켓몬 3종", excerpt: "샘플 요약 문구입니다.", date: "2026.3.25" },
  { cats: ["guide"], thumb: "--c", title: "초보자를 위한 첫 랭크 준비물", excerpt: "샘플 가이드 카드입니다.", date: "2026.3.22" },
  { cats: ["update"], thumb: "--d", title: "밸런스 패치 노트 하이라이트", excerpt: "스킬·기술 변경 요약 샘플.", date: "2026.3.20" },
];

const FEATURED_CATS = ["update", "meta"];

export default function NewsBoard() {
  const [active, setActive] = useState<CatKey>("all");

  const showFeatured =
    active === "all" || FEATURED_CATS.length === 0 || FEATURED_CATS.includes(active);

  const visibleCards = CARDS.filter(
    (c) => active === "all" || c.cats.length === 0 || c.cats.includes(active)
  );

  return (
    <>
      <div className="news-filter">
        <span className="news-filter-label">카테고리</span>
        <div className="news-filter-chips" role="group" aria-label="뉴스 카테고리">
          {CATS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={active === key ? "is-active" : undefined}
              onClick={() => setActive(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showFeatured && (
        <article className="news-featured">
          <a href="#" className="news-featured-link" aria-label="주요 기사 (샘플)">
            <div className="news-featured-visual" role="presentation" />
            <div className="news-featured-body">
              <span className="news-tag">업데이트 · 메타</span>
              <h2>시즌 규칙 개편과 추천 파티 트렌드 요약</h2>
              <p>규칙 변경이 랭크 상위 티어에 미친 영향을 짧게 정리했습니다. 실제 기사 연동 시 이 영역에 히어로 이미지와 요약이 들어갑니다.</p>
              <span className="news-meta">2026.3.28 · 편집부</span>
            </div>
          </a>
        </article>
      )}

      <h2 className="news-grid-title">최근 글</h2>
      <div className="news-grid">
        {visibleCards.map((card) => (
          <article key={card.title} className="news-card">
            <a href="#" className="news-card-link">
              <div className={`news-card-thumb${card.thumb}`} role="presentation" />
              <div className="news-card-body">
                <span className="news-tag">{CATS.find((c) => card.cats.includes(c.key))?.label ?? ""}</span>
                <h3>{card.title}</h3>
                <p className="news-excerpt">{card.excerpt}</p>
                <span className="news-meta">{card.date}</span>
              </div>
            </a>
          </article>
        ))}
      </div>

      <div className="news-more">
        <button type="button" className="news-more-btn" disabled aria-disabled="true">
          더 보기 (준비 중)
        </button>
      </div>
    </>
  );
}
