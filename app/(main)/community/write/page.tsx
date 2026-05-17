"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import PartyBuilder from "@/components/PartyBuilder";
import { emptySlot, SLOT_COUNT, type PokemonSlot } from "@/lib/party-constants";
import "@/styles/community.css";
import "@/styles/login.css";

export default function CommunityWritePage() {
  const router  = useRouter();
  const supabase = createClient();

  const [user,        setUser]       = useState<User | null>(null);
  const [title,       setTitle]      = useState("");
  const [description, setDesc]       = useState("");
  const [slots,       setSlots]      = useState<PokemonSlot[]>(
    Array.from({ length: SLOT_COUNT }, emptySlot)
  );
  const [submitting,  setSubmitting] = useState(false);
  const [msg,         setMsg]        = useState("");
  const [msgError,    setMsgError]   = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setUser(data.user);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 복사 / 붙여넣기 ──────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(slots));
      setMsg("파티 복사 완료"); setMsgError(false);
    } catch {
      setMsg("복사 실패"); setMsgError(true);
    }
  };

  const handlePaste = async () => {
    try {
      const text   = await navigator.clipboard.readText();
      const parsed = JSON.parse(text) as PokemonSlot[];
      if (!Array.isArray(parsed)) throw new Error();
      setSlots(Array.from({ length: SLOT_COUNT }, (_, i) => parsed[i] ?? emptySlot()));
      setMsg("파티 붙여넣기 완료"); setMsgError(false);
    } catch {
      setMsg("클립보드에 유효한 파티 데이터가 없습니다."); setMsgError(true);
    }
  };

  // ── 글 등록 ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim()) { setMsg("제목을 입력해주세요."); setMsgError(true); return; }
    if (!user)         { setMsg("로그인이 필요합니다.");  setMsgError(true); return; }

    setSubmitting(true);
    setMsg("");

    const { error } = await supabase.from("posts").insert({
      author_id  : user.id,
      author_nick: user.user_metadata?.nickname ?? "익명",
      title      : title.trim(),
      description: description.trim(),
      party      : slots,
    });

    setSubmitting(false);

    if (error) {
      setMsg(error.message || "글 등록에 실패했습니다."); setMsgError(true);
    } else {
      router.push("/community");
    }
  };

  return (
    <main className="community-write-page">
      <div className="write-page-header">
        <button type="button" className="ghost-secondary-btn write-back-btn" onClick={() => router.back()}>
          ← 목록
        </button>
        <h1>파티 글쓰기</h1>
      </div>

      {msg && <p className={`helper-text write-msg${msgError ? " is-error" : ""}`}>{msg}</p>}

      <div className="write-form">
        {/* 제목 */}
        <div className="party-field write-title-field">
          <label className="party-field-label" htmlFor="post-title">제목</label>
          <input
            id="post-title"
            type="text"
            className="party-field-input write-title-input"
            placeholder="글 제목을 입력하세요"
            maxLength={100}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* 파티 빌더 */}
        <div className="write-party-section">
          <div className="write-section-header">
            <span className="party-field-label write-section-label">파티</span>
            <div className="party-actions">
              <button type="button" className="ghost-secondary-btn party-action-btn" onClick={handleCopy}>복사</button>
              <button type="button" className="ghost-secondary-btn party-action-btn" onClick={handlePaste}>붙여넣기</button>
            </div>
          </div>
          <PartyBuilder slots={slots} onChange={setSlots} idPrefix="write" />
        </div>

        {/* 설명 */}
        <div className="party-field write-desc-field">
          <label className="party-field-label" htmlFor="post-desc">설명</label>
          <textarea
            id="post-desc"
            className="write-desc-textarea"
            placeholder="파티 운영 방법, 기술 선택 이유, 주의점 등을 설명해주세요..."
            rows={6}
            value={description}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        {/* 제출 */}
        <div className="write-submit-row">
          <button type="button" className="ghost-secondary-btn" onClick={() => router.back()}>취소</button>
          <button type="button" className="login-btn" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "등록 중..." : "글 등록"}
          </button>
        </div>
      </div>
    </main>
  );
}
