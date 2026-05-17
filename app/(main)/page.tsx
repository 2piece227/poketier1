import Link from "next/link";
import IssueCarousel from "@/components/IssueCarousel";

export default function HomePage() {
  return (
    <main className="layout">
      <IssueCarousel />

      <section className="community-preview card" aria-labelledby="main-community-title">
        <div className="section-head">
          <div>
            <p className="section-label">COMMUNITY</p>
            <h2 id="main-community-title">최근 글</h2>
          </div>
        </div>
        <div className="post-list">
          <article className="post-item">
            <h3>더블 입문 샘플 파티 공유합니다</h3>
            <p>초보도 운용하기 쉬운 밸런스형 샘플과 기본 운영 루트 정리.</p>
            <div className="post-meta">
              <span>샘플</span>
              <span>조회 482</span>
              <span>10분 전</span>
            </div>
          </article>
          <article className="post-item">
            <h3>이번 주 랭크에서 체감 좋은 선봉 3종</h3>
            <p>실제 래더 기준으로 안정적인 선봉 기용 사례를 모았습니다.</p>
            <div className="post-meta">
              <span>공략</span>
              <span>조회 327</span>
              <span>35분 전</span>
            </div>
          </article>
          <article className="post-item">
            <h3>신규 규칙 대응용 안티 메타 아이디어</h3>
            <p>상위권 조합 저격을 위한 기술/아이템 선택지 토론 스레드.</p>
            <div className="post-meta">
              <span>토론</span>
              <span>조회 298</span>
              <span>1시간 전</span>
            </div>
          </article>
          <article className="post-item">
            <h3>포챔스 모바일 출시 대비 팀 빌딩 가이드</h3>
            <p>출시 초기 환경에서 바로 쓰기 좋은 범용 팀 템플릿을 소개합니다.</p>
            <div className="post-meta">
              <span>가이드</span>
              <span>조회 612</span>
              <span>2시간 전</span>
            </div>
          </article>
        </div>
        <p className="community-preview-more">
          <Link href="/community">커뮤니티에서 더 보기</Link>
        </p>
      </section>
    </main>
  );
}
