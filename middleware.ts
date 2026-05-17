import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Supabase getUser()에 타임아웃을 걸어 네트워크 지연 시 무한 로딩 방지
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3초 안에 응답 없으면 비로그인으로 간주하고 통과
  let user = null;
  try {
    const result = await withTimeout(supabase.auth.getUser(), 3000);
    user = result.data.user;
  } catch {
    // 타임아웃 또는 네트워크 오류 → 보호 페이지만 차단, 나머지는 통과
    const { pathname } = request.nextUrl;
    if (pathname === "/nickname" || pathname === "/profile") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;

  // 이미 로그인된 상태에서 /login 접근 → 메인 또는 닉네임 설정으로
  if (user && pathname === "/login") {
    const hasNickname = Boolean(user.user_metadata?.nickname);
    return NextResponse.redirect(
      new URL(hasNickname ? "/" : "/nickname", request.url)
    );
  }

  // 미로그인 상태에서 보호된 페이지 접근
  if (!user && (pathname === "/nickname" || pathname === "/profile")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 닉네임 없이 /profile 접근 → /nickname으로
  if (user && !user.user_metadata?.nickname && pathname === "/profile") {
    return NextResponse.redirect(new URL("/nickname", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
