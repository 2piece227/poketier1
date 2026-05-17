"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/login.css";

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.nickname) {
        router.replace("/");
      }
    });
  }, []);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 16) {
      setError("닉네임은 2자 이상 16자 이하로 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.updateUser({
      data: { nickname: trimmed },
    });
    if (authErr) {
      setError("닉네임 저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase
        .from("profiles")
        .upsert(
          { id: userId, nickname: trimmed, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
    }

    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="login-header">
        <Link className="login-brand" href="/" aria-label="메인으로 이동">
          <span className="login-brand-badge">PT</span>
          <span className="login-brand-text">poketier</span>
        </Link>
      </header>

      <main className="login-page">
        <section className="login-card">
          <p className="logo">첫 가입 환영합니다</p>
          <h1>무엇으로 불릴까요?</h1>
          <input
            className="login-input"
            type="text"
            placeholder="닉네임을 입력하세요"
            maxLength={16}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            className="login-btn"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "저장 중..." : "닉네임 저장"}
          </button>
          {error && <p className="helper-text is-error">{error}</p>}
        </section>
      </main>
    </>
  );
}
