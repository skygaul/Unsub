// 해지 가이드 캐시 설정 시험. 사용: node scripts/test-public-client.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { cachedFetch, revalidateSeconds } = await import("../src/lib/supabase/public.ts");

// 캐시 시간: 기본 5분, 환경변수로 바꿀 수 있고 0이면 캐시 끔, 이상한 값은 기본값, 상한 24시간
assert.equal(revalidateSeconds(undefined), 300);
assert.equal(revalidateSeconds(""), 300);
assert.equal(revalidateSeconds("  "), 300);
assert.equal(revalidateSeconds("60"), 60);
assert.equal(revalidateSeconds("0"), 0);
assert.equal(revalidateSeconds("abc"), 300);
assert.equal(revalidateSeconds("-5"), 300);
assert.equal(revalidateSeconds("1.5"), 300);
assert.equal(revalidateSeconds("999999999"), 24 * 60 * 60);

// cachedFetch: 원래 요청 설정은 그대로 두고 캐시 시간(next.revalidate)만 덧붙인다
const realFetch = globalThis.fetch;
let seen;
globalThis.fetch = async (input, init) => {
  seen = { input, init };
  return new Response("[]", { status: 200 });
};
try {
  delete process.env.SERVICES_REVALIDATE_SECONDS;
  await cachedFetch("https://example.supabase.co/rest/v1/services", {
    method: "GET",
    headers: { apikey: "k", Accept: "application/json" },
  });
  assert.equal(seen.input, "https://example.supabase.co/rest/v1/services");
  assert.equal(seen.init.method, "GET");
  assert.equal(seen.init.headers.apikey, "k");
  assert.equal(seen.init.next.revalidate, 300);

  // 환경변수는 호출할 때 읽는다
  process.env.SERVICES_REVALIDATE_SECONDS = "0";
  await cachedFetch("https://example.supabase.co/rest/v1/services");
  assert.equal(seen.init.next.revalidate, 0);

  // init 없이 불러도 동작
  delete process.env.SERVICES_REVALIDATE_SECONDS;
  await cachedFetch("https://example.supabase.co/rest/v1/services");
  assert.equal(seen.init.next.revalidate, 300);
} finally {
  globalThis.fetch = realFetch;
  delete process.env.SERVICES_REVALIDATE_SECONDS;
}

console.log("해지 가이드 캐시 설정 시험 통과");
