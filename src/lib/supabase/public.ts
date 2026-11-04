import { createClient } from "@supabase/supabase-js";

// 해지 가이드(services)는 거의 바뀌지 않는 공개 데이터라서, 이 시간 동안은 DB에 다시 묻지 않고 저장해 둔 결과를 쓴다.
// 가이드를 고치고 seed.sql을 실행하면 이 시간이 지난 뒤 화면에 반영된다.
// 환경변수 SERVICES_REVALIDATE_SECONDS로 바꿀 수 있고, 0이면 캐시하지 않는다(개발 중 DB를 바로 확인할 때).
const DEFAULT_REVALIDATE_SECONDS = 300;
const MAX_REVALIDATE_SECONDS = 24 * 60 * 60;

export function revalidateSeconds(raw: string | undefined = process.env.SERVICES_REVALIDATE_SECONDS) {
  if (raw === undefined || raw.trim() === "") return DEFAULT_REVALIDATE_SECONDS;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) return DEFAULT_REVALIDATE_SECONDS;
  return Math.min(n, MAX_REVALIDATE_SECONDS);
}

/** Next.js의 요청 캐시(Data Cache)를 켜는 fetch. Supabase 요청이 이 fetch를 거치도록 연결한다. */
export function cachedFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, next: { revalidate: revalidateSeconds() } });
}

/**
 * 로그인하지 않은 사용자(anon)로 읽는 Supabase 클라이언트. 쿠키를 읽지 않으므로 응답이 사용자마다 달라지지 않고,
 * 그래서 결과를 서버 전체에서 공유해 캐시할 수 있다.
 * ⚠️ 해지 가이드 같은 공개 데이터에만 쓸 것. 사용자 데이터(구독 등)는 반드시 createClient(server.ts)로 읽는다.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: cachedFetch },
    },
  );
}
