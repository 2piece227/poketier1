import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // 세션 쿠키를 갱신하기 위해 반드시 getUser() 호출 (getSession() 사용 금지)
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
