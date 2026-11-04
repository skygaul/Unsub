import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseAuthCookie } from "@/lib/supabase/auth-cookie";
import {
  IDLE_TIMEOUT_MS,
  LAST_ACTIVE_COOKIE,
  LAST_ACTIVE_COOKIE_MAX_AGE_S,
  idleFor,
  parseLastActive,
} from "@/lib/idle";

// 로그인이 필요한 경로. 낙관적 체크일 뿐이며, 실제 권한 검사는 API와 RLS에서 한다.
const PROTECTED_PREFIXES = ["/dashboard", "/subscriptions", "/calendar"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isApi = pathname.startsWith("/api");
  const now = Date.now();

  // 로그인 세션 쿠키가 없는 방문자는 로그인한 사용자가 아니므로 Supabase에 물어볼 필요가 없다.
  // (공개 페이지를 여는 방문자의 요청마다 생기던 Supabase 왕복을 없앤다.)
  if (!hasSupabaseAuthCookie(request.cookies.getAll().map((c) => c.name))) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      redirect.cookies.delete(LAST_ACTIVE_COOKIE);
      return redirect;
    }
    const anonymous = NextResponse.next({ request });
    if (request.cookies.has(LAST_ACTIVE_COOKIE)) anonymous.cookies.delete(LAST_ACTIVE_COOKIE);
    return anonymous;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 세션 갱신. createServerClient와 getUser 사이에 다른 코드를 넣지 말 것.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 상태에서 마지막 활동 후 IDLE_TIMEOUT_MS가 지났으면 이 기기의 세션을 끝낸다.
  // (탭을 닫아 두었다가 돌아온 경우를 여기서 잡는다. 열려 있는 탭은 IdleLogout이 처리한다.)
  const lastActive = parseLastActive(request.cookies.get(LAST_ACTIVE_COOKIE)?.value);
  if (user && lastActive !== null && idleFor(lastActive, now) >= IDLE_TIMEOUT_MS) {
    await supabase.auth.signOut({ scope: "local" });
    const expired = isApi
      ? NextResponse.json({ error: "오래 활동이 없어 로그아웃됐어요. 다시 로그인해 주세요." }, { status: 401 })
      : NextResponse.redirect(new URL("/?reason=idle", request.url));
    // signOut이 지운 세션 쿠키를 응답에 그대로 담는다.
    response.cookies.getAll().forEach((c) => expired.cookies.set(c));
    expired.cookies.delete(LAST_ACTIVE_COOKIE);
    return expired;
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    redirect.cookies.delete(LAST_ACTIVE_COOKIE);
    return redirect;
  }

  if (!user) {
    if (request.cookies.has(LAST_ACTIVE_COOKIE)) response.cookies.delete(LAST_ACTIVE_COOKIE);
  } else if (!request.headers.has("next-router-prefetch")) {
    // 사용자가 직접 연 화면·요청만 활동으로 친다. 링크 미리 불러오기(prefetch)는 제외한다.
    response.cookies.set(LAST_ACTIVE_COOKIE, String(now), {
      path: "/",
      maxAge: LAST_ACTIVE_COOKIE_MAX_AGE_S,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }

  return response;
}
