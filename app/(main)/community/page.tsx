import type { Metadata } from "next";
import "@/styles/community.css";

export const metadata: Metadata = {
  title: "poketier | 커뮤니티",
  description: "포켓티어 커뮤니티 글 목록",
};

export default function CommunityPage() {
  return (
    <main className="community-page">
      <div className="community-page-hero">
        <p className="section-label">COMMUNITY</p>
        <h1>커뮤니티</h1>
        <p className="community-page-lead">
          파티 공유·질문·토론 글이 모이는 공간입니다. 아래는 연동 전{" "}
          <strong>초기 디자인</strong>이며, 메인에는 최근 글만 요약해 두었습니다.
        </p>
      </div>

      <section className="community-board card">
        <div className="community-toolbar">
          <div className="community-search">
            <label className="visually-hidden" htmlFor="communitySearchInput">
              글 검색
            </label>
            <input
              id="communitySearchInput"
              type="search"
              placeholder="검색 (준비 중)"
              disabled
              aria-disabled="true"
            />
          </div>
          <button type="button" className="ghost-btn" disabled aria-disabled="true">
            글쓰기
          </button>
        </div>

        <div className="post-list">
          {[
            { title: "더블 입문 샘플 파티 공유합니다", desc: "초보도 운용하기 쉬운 밸런스형 샘플과 기본 운영 루트 정리.", tag: "샘플", views: 482, time: "10분 전" },
            { title: "이번 주 랭크에서 체감 좋은 선봉 3종", desc: "실제 래더 기준으로 안정적인 선봉 기용 사례를 모았습니다.", tag: "공략", views: 327, time: "35분 전" },
            { title: "신규 규칙 대응용 안티 메타 아이디어", desc: "상위권 조합 저격을 위한 기술/아이템 선택지 토론 스레드.", tag: "토론", views: 298, time: "1시간 전" },
            { title: "포챔스 모바일 출시 대비 팀 빌딩 가이드", desc: "출시 초기 환경에서 바로 쓰기 좋은 범용 팀 템플릿을 소개합니다.", tag: "가이드", views: 612, time: "2시간 전" },
            { title: "시즌 초반 추천 템포 포켓몬 정리", desc: "선공·후공 시나리오별로 묶어 본 샘플 메모입니다.", tag: "공략", views: 201, time: "3시간 전" },
            { title: "라이트 유저도 보는 주간 메타 스레드", desc: "핵심만 골라 정리한 비공식 요약입니다.", tag: "토론", views: 156, time: "5시간 전" },
          ].map((post) => (
            <article key={post.title} className="post-item">
              <h3>{post.title}</h3>
              <p>{post.desc}</p>
              <div className="post-meta">
                <span>{post.tag}</span>
                <span>조회 {post.views}</span>
                <span>{post.time}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
