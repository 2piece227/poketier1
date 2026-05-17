"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "@/styles/login.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(`구글 로그인 실패: ${error.message}`);
      setLoading(false);
    }
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
          <Link href="/" className="logo">poketier</Link>
          <h1>무엇으로 로그인하시겠습니까?</h1>
          <button
            id="googleLoginBtn"
            className="login-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "구글로 로그인"}
          </button>
          {error && <p className="helper-text is-error">{error}</p>}
        </section>
      </main>
    </>
  );
}
