// Supabase 로그인 세션 쿠키는 `sb-<프로젝트 ref>-auth-token`이고, 길면 `.0`, `.1`처럼 나뉘어 저장된다.
// 로그인 진행 중에 잠깐 생기는 `...-auth-token-code-verifier`는 세션이 아니므로 제외한다.
const SESSION_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

/** 쿠키 이름 목록에 Supabase 로그인 세션 쿠키가 있는지. 없으면 로그인한 적이 없는 방문자다. */
export function hasSupabaseAuthCookie(cookieNames: string[]) {
  return cookieNames.some((name) => SESSION_COOKIE.test(name));
}
