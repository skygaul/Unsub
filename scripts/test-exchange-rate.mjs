// 환율 모듈 시험. 사용: node scripts/test-exchange-rate.mjs
// 실제 환율 서비스를 한 번 호출한다(무료, 키 불필요, 사용자 정보 없음).
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { describeRate, getUsdKrwRate } = await import("../src/lib/exchange-rate.ts");

// 문구
assert.equal(
  describeRate({ rate: 1344.59, source: "live", date: "2026-11-03" }),
  "1달러 = 1,344.59원 (2026-11-03 기준)",
);
assert.match(describeRate({ rate: 1400, source: "fallback", date: null }), /기본값/);

// 실제 호출: 값이 정상 범위이고 live면 기준일이 있다
const r = await getUsdKrwRate();
console.log("받은 환율:", r);
assert.ok(r.rate >= 500 && r.rate <= 3000);
if (r.source === "live") assert.match(r.date ?? "", /^\d{4}-\d{2}-\d{2}$/);

// 네트워크가 막혀도 기본값으로 돌아간다
const realFetch = globalThis.fetch;
globalThis.fetch = async () => {
  throw new Error("network down");
};
const f = await getUsdKrwRate();
assert.equal(f.source, "fallback");
assert.equal(f.rate, 1400);

// 이상한 값(0원, 문자열)은 버리고 기본값을 쓴다
globalThis.fetch = async () => new Response(JSON.stringify({ rates: { KRW: 0 } }), { status: 200 });
assert.equal((await getUsdKrwRate()).source, "fallback");
globalThis.fetch = async () => new Response("oops", { status: 500 });
assert.equal((await getUsdKrwRate()).source, "fallback");
globalThis.fetch = realFetch;

console.log("환율 시험 통과");
