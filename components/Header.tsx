import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import NavLinks from "./NavLinks";
import LogoutButton from "./LogoutButton";

export default function Header({ user }: { user: User | null }) {
  return (
    <header className="site-header">
      <Link className="brand brand-link" href="/" aria-label="메인으로 이동">
        <div className="brand-badge">PT</div>
        <div>
          <p className="brand-name">poketier</p>
          <p className="brand-sub">포켓티어</p>
        </div>
      </Link>

      <NavLinks />

      <div className="auth-area">
        {user ? (
          <>
            <Link href="/profile" className="ghost-btn">
              프로필
            </Link>
            <LogoutButton />
          </>
        ) : (
          <Link href="/login" className="ghost-btn">
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
