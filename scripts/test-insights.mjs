// 구독 분석·중복 안내 계산 시험. 사용: node scripts/test-insights.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { categoryBreakdown, categoryOf, findOverlaps, topExpensive } = await import(
  "../src/lib/insights.ts"
);

let n = 0;
const sub = (name, service_id, amount, billing_cycle = "monthly", currency = "KRW") => ({
  id: `id${++n}`, name, service_id, amount, currency, billing_cycle,
});

// 분류
assert.equal(categoryOf({ service_id: "netflix" }), "ott");
assert.equal(categoryOf({ service_id: "claude" }), "ai");
assert.equal(categoryOf({ service_id: null }), "other");
assert.equal(categoryOf({ service_id: "unknown_service" }), "other");

// 분류별 합계와 비중 (연간은 12로 나눔)
const subs = [
  sub("넷플릭스", "netflix", 17000),
  sub("티빙", "tving", 13000),
  sub("노션", "notion", 96000, "yearly"), // 월 8,000
  sub("직접", null, 2000),
];
const rows = categoryBreakdown(subs);
assert.equal(rows[0].id, "ott");
assert.equal(rows[0].monthly, 30000);
assert.equal(rows[0].count, 2);
assert.equal(rows.find((r) => r.id === "work").monthly, 8000);
assert.equal(rows.reduce((s, r) => s + r.monthly, 0), 40000);
assert.equal(rows[0].percent, 75);
assert.deepEqual(categoryBreakdown([]), []);

// 비싼 순서 (월 환산 기준)
assert.deepEqual(topExpensive(subs, 2).map((s) => s.name), ["넷플릭스", "티빙"]);
assert.equal(topExpensive(subs, 3)[2].name, "노션");

// 중복·낭비 안내
const h0 = findOverlaps(subs); // 영상·음악 2개부터 안내
assert.equal(h0.length, 1);
assert.equal(h0[0].key, "ott");
assert.equal(h0[0].targets.length, 2);
assert.equal(findOverlaps([subs[0], subs[2], subs[3]]).length, 0); // 영상·음악 1개

const ott3 = [...subs, sub("웨이브", "wavve", 10900)];
const h1 = findOverlaps(ott3);
assert.equal(h1.length, 1);
assert.equal(h1[0].key, "ott");
assert.equal(h1[0].targets.length, 3);

// 달러 구독은 환산해서 분류별 합계에 들어간다 (Claude $20 = 28,000원)
const usd = categoryBreakdown([sub("Claude", "claude", 20, "monthly", "USD"), sub("넷플릭스", "netflix", 28000)]);
assert.equal(usd.find((r) => r.id === "ai").monthly, 28000);
assert.equal(usd[0].percent, 50);

// 실제 환율을 넘기면 비중과 순위가 그 값으로 바뀐다 (Claude $20, 환율 1,000원 → 20,000원)
const usd2 = [sub("Claude", "claude", 20, "monthly", "USD"), sub("넷플릭스", "netflix", 28000)];
assert.equal(categoryBreakdown(usd2, 1000).find((r) => r.id === "ai").monthly, 20000);
assert.equal(topExpensive(usd2, 1, 1000)[0].name, "넷플릭스");
assert.equal(topExpensive(usd2, 1, 2000)[0].name, "Claude");

const ai2 = [sub("ChatGPT", "chatgpt", 28000), sub("Claude", "claude", 28000)];
assert.equal(findOverlaps(ai2)[0].key, "ai");
assert.equal(findOverlaps([sub("ChatGPT", "chatgpt", 28000)]).length, 0);

const mem = [sub("와우", "coupang_wow", 7890), sub("네이버플러스", "naver_plus", 4900)];
assert.equal(findOverlaps(mem)[0].key, "membership");
assert.equal(findOverlaps([mem[0]]).length, 0);

const dup = [sub("넷플릭스", "netflix", 17000), sub("넷플릭스 2", "netflix", 17000)];
const h2 = findOverlaps(dup);
assert.equal(h2[0].key, "dup-netflix");
assert.match(h2[0].detail, /34,000원/);
assert.equal(h2[0].targets.length, 1);

// 서비스를 고르지 않은 구독은 중복·분류 대상에서 빠진다
assert.equal(findOverlaps([sub("a", null, 1), sub("b", null, 1)]).length, 0);

console.log("구독 분석 시험 통과");
