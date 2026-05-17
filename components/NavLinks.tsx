"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/tierlist", label: "티어·순위" },
  { href: "/community", label: "커뮤니티" },
  { href: "/guides", label: "가이드" },
  { href: "/news", label: "최신 정보" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="top-nav" aria-label="주요 메뉴">
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? "is-current" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
