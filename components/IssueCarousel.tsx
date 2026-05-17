"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";

const GAP = 16;
const ANIM_MS = 400;

export default function IssueCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getGap = () => {
    const t = trackRef.current;
    if (!t) return GAP;
    const v = parseFloat(getComputedStyle(t).gap || getComputedStyle(t).columnGap || "");
    return isFinite(v) ? v : GAP;
  };

  const getStep = () => {
    const first = trackRef.current?.querySelector<HTMLElement>(".issue-card");
    return first ? first.getBoundingClientRect().width + getGap() : 300;
  };

  const getCardCount = () =>
    trackRef.current?.querySelectorAll(".issue-card").length ?? 0;

  const getMaxPx = () => {
    const t = trackRef.current;
    return t ? Math.max(0, t.scrollWidth - (t.parentElement?.clientWidth ?? 0)) : 0;
  };

  const offsetFor = useCallback((i: number) =>
    Math.min(getStep() * Math.max(0, i), getMaxPx()), []);

  const setPos = useCallback((i: number, animate: boolean) => {
    const t = trackRef.current;
    if (!t) return;
    t.style.transition = animate ? "transform 260ms ease" : "none";
    t.style.transform = `translateX(${-offsetFor(i)}px)`;
  }, [offsetFor]);

  const updateNav = useCallback((i: number) => {
    const n = getCardCount();
    const cur = offsetFor(i);
    setCanPrev(i > 0 && offsetFor(i - 1) < cur - 0.5);
    setCanNext(i < n - 1 && offsetFor(i + 1) > cur + 0.5);
  }, [offsetFor]);

  const endAnim = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setBusy(false);
  }, []);

  const move = useCallback((dir: number) => {
    if (busy) return;
    const n = getCardCount();
    setIndex((prev) => {
      const next = prev + dir;
      if (next < 0 || next > n - 1) return prev;
      if (Math.abs(offsetFor(next) - offsetFor(prev)) < 0.5) return prev;
      if (timerRef.current) clearTimeout(timerRef.current);
      setBusy(true);
      timerRef.current = setTimeout(endAnim, ANIM_MS);
      setPos(next, true);
      updateNav(next);
      return next;
    });
  }, [busy, offsetFor, setPos, updateNav, endAnim]);

  useEffect(() => {
    setPos(0, false);
    updateNav(0);
    requestAnimationFrame(() => { setPos(0, false); updateNav(0); });
  }, [setPos, updateNav]);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.target === t && e.propertyName === "transform") endAnim();
    };
    const onResize = () => {
      endAnim();
      setIndex((prev) => {
        const clamped = Math.min(prev, getCardCount() - 1);
        setPos(clamped, false);
        updateNav(clamped);
        return clamped;
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowRight") move(1);
    };
    t.addEventListener("transitionend", onEnd);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      t.removeEventListener("transitionend", onEnd);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [endAnim, move, setPos, updateNav]);

  return (
    <section className="hot-issue card">
      <div className="section-head">
        <div>
          <p className="section-label">HOT NOW</p>
          <h1>포켓몬 핫이슈 &amp; 새 정보</h1>
        </div>
        <div className="slide-actions">
          <button
            className="slide-btn"
            onClick={() => move(-1)}
            disabled={!canPrev}
            aria-label="이전 이슈"
            aria-disabled={!canPrev}
          >‹</button>
          <button
            className="slide-btn"
            onClick={() => move(1)}
            disabled={!canNext}
            aria-label="다음 이슈"
            aria-disabled={!canNext}
          >›</button>
        </div>
      </div>
      <div className="issue-track-wrap">
        <div
          ref={trackRef}
          className="issue-track"
          onMouseEnter={() => { if (trackRef.current) trackRef.current.style.transitionDuration = "340ms"; }}
          onMouseLeave={() => { if (trackRef.current) trackRef.current.style.transitionDuration = "260ms"; }}
        >
          <article className="issue-card">
            <p className="issue-tag">업데이트</p>
            <h3>신규 이벤트 시즌 예고</h3>
            <p>이번 주 메타 핵심 포켓몬과 추천 빌드를 빠르게 확인하세요.</p>
          </article>
          <article className="issue-card">
            <p className="issue-tag">대회</p>
            <h3>랭크 상위 100인 픽률 변화</h3>
            <p>상위권에서 급상승한 포켓몬 조합을 비교 분석합니다.</p>
          </article>
          <article className="issue-card">
            <p className="issue-tag">핫이슈</p>
            <h3>신규 룰 적용 후 티어 재편</h3>
            <p>핵심 규칙 변경이 S/A티어에 미친 영향을 정리했습니다.</p>
          </article>
          <article className="issue-card">
            <p className="issue-tag">가이드</p>
            <h3>초보자용 첫 랭크 체크리스트</h3>
            <p>진입 장벽을 낮추는 세팅과 운영 포인트를 단계별로 안내합니다.</p>
          </article>
          <article className="issue-card issue-card--more" aria-label="더 보기">
            <p className="issue-tag">더보기</p>
            <h3>새소식 전체 보기</h3>
            <p>업데이트·대회·가이드 등 더 많은 소식은 최신 정보에서 확인하세요.</p>
            <Link className="issue-more-link" href="/news">최신 정보로 이동</Link>
          </article>
        </div>
      </div>
    </section>
  );
}
