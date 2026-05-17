import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/guides.css";

export const metadata: Metadata = {
  title: "poketier | 가이드",
  description: "포켓티어 초보자를 위한 기본 개념과 학습 순서",
};

export default function GuidesPage() {
  return (
    <main className="guide-page">
      <div className="guide-hero">
        <p className="section-label">START HERE</p>
        <h1>
          처음 오셨나요?
          <br />
          천천히 같이 읽어봐요
        </h1>
        <p className="guide-hero-lead">
          어려운 용어보다는 <strong>왜 이걸 보면 좋은지</strong>부터 적었어요. 아래는 서비스
          연동 전 <strong>초안 디자인</strong>입니다.
        </p>
        <p className="guide-hero-badge" role="status">
          예상 소요 시간 · 약 5분 분량
        </p>
      </div>

      <section className="guide-quick" aria-label="빠른 시작">
        {[
          { n: 1, title: "용어만 훑기", desc: "티어·역할 같은 단어가 낯설어도 괜찮아요. 밑에 짧게 정리해 두었습니다." },
          { n: 2, title: "순서대로 보기", desc: "아래 로드맵 순서대로 보면 '다음에 뭘 보면 되지?'가 덜 헷갈려요." },
          { n: 3, title: "궁금할 때만 FAQ", desc: "막히는 지점은 접어 두었다가 필요할 때 펼쳐 보세요." },
        ].map(({ n, title, desc }) => (
          <article key={n} className="guide-quick-card">
            <div className="guide-quick-num" aria-hidden="true">{n}</div>
            <h2>{title}</h2>
            <p>{desc}</p>
          </article>
        ))}
      </section>

      <section className="guide-section" aria-labelledby="guide-concepts-title">
        <div className="guide-section-head">
          <h2 id="guide-concepts-title">기본 개념 (한눈에)</h2>
          <p>길게 설명하지 않고, 나중에 티어 페이지에서 다시 볼 수 있어요.</p>
        </div>
        <div className="guide-grid">
          {[
            { icon: "📊", title: "티어가 뭐예요?", desc: "같은 시즌·규칙 안에서 포켓몬을 '얼마나 자주 쓰이는지'를 나눈 구간이에요. 숫자가 작을수록 상위권에 가깝다고 보면 됩니다." },
            { icon: "🎯", title: "역할(물딜·기점…)은요?", desc: "한 마리가 팀에서 맡는 일을 가리켜요. 필터로만 골라 보면 '내 팀에 맞는 추천'을 찾기 쉬워요." },
            { icon: "🔄", title: "순위표와 같이 보면?", desc: "티어는 '구간', 순위는 '순서'에 가깝게 쓸 예정이에요. 통합 티어 페이지에서 같이 다룰 거예요." },
            { icon: "💡", title: "정답은 없어요", desc: "메타는 바뀌고, 팀마다 답이 달라요. 여기서는 참고용 정보로만 쓰면 좋아요." },
          ].map(({ icon, title, desc }) => (
            <article key={title} className="guide-concept">
              <div className="guide-concept-icon" aria-hidden="true">{icon}</div>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section" aria-labelledby="guide-roadmap-title">
        <div className="guide-section-head">
          <h2 id="guide-roadmap-title">이렇게 읽어보면 좋아요</h2>
          <p>한 번에 다 읽지 않아도 돼요. 멈췄던 곳부터 이어가면 됩니다.</p>
        </div>
        <div className="guide-roadmap">
          <div className="guide-step">
            <span className="guide-step-num">1</span>
            <h3>통합 티어 페이지 열기</h3>
            <p>역할 필터를 바꿔 가며 "내가 쓰는 포지션"에 어떤 포켓몬이 많이 올라가 있는지 감을 잡아요.</p>
          </div>
          <div className="guide-step">
            <span className="guide-step-num">2</span>
            <h3>최신 정보에서 패치·대회만 체크</h3>
            <p>규칙이 바뀌면 티어도 같이 움직여요. 긴 글 대신 요약부터 보는 걸 추천해요.</p>
          </div>
          <div className="guide-step">
            <span className="guide-step-num">3</span>
            <h3>커뮤니티는 나중에</h3>
            <p>
              익숙해지면 <Link href="/community">커뮤니티</Link>에서 다른 사람 파티·질문을 보면 훨씬
              도움이 돼요. 부담 없이 나중에 와도 괜찮아요.
            </p>
          </div>
        </div>
      </section>

      <section className="guide-section" aria-labelledby="guide-faq-title">
        <div className="guide-section-head">
          <h2 id="guide-faq-title">자주 묻는 질문</h2>
          <p>궁금한 줄만 펼쳐 보세요.</p>
        </div>
        <div className="guide-faq">
          <details>
            <summary>아직 게임을 안 해봤는데 봐도 되나요?</summary>
            <p className="guide-answer">네. 용어가 나오면 이 페이지의 "기본 개념"만 다시 보면 됩니다. 실제 플레이는 필요 없어요.</p>
          </details>
          <details>
            <summary>티어 낮은 포켓몬은 쓰면 안 되나요?</summary>
            <p className="guide-answer">아니에요. 티어는 "자주 쓰이는 정도"에 가깝고, 내 팀 조합·취향에 맞으면 충분히 쓸 수 있어요.</p>
          </details>
          <details>
            <summary>데이터는 언제 갱신되나요?</summary>
            <p className="guide-answer">정식 오픈 후 시즌·패치에 맞춰 갱신할 예정이에요. 지금 화면은 디자인 샘플입니다.</p>
          </details>
        </div>
      </section>

      <div className="guide-cta">
        <p>준비되면 티어표부터 둘러보세요.</p>
        <div className="guide-cta-row">
          <Link href="/tierlist" className="guide-cta-primary">통합 티어 보러 가기</Link>
          <Link href="/">메인으로</Link>
        </div>
      </div>
    </main>
  );
}
