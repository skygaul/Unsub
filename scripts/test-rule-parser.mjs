// 규칙 기반 파서 확인용. 사용: node scripts/test-rule-parser.mjs
// (Node의 TypeScript 지원을 사용하므로 별도 설치가 필요 없다)
import assert from "node:assert/strict";
import { ruleParse } from "../src/lib/rule-parser.ts";

const SERVICES = [
  ["netflix", "넷플릭스"], ["youtube_premium", "유튜브 프리미엄"], ["coupang_wow", "쿠팡 와우 멤버십"],
  ["naver_plus", "네이버플러스 멤버십"], ["disney_plus", "디즈니+"], ["tving", "티빙"], ["wavve", "웨이브"],
  ["chatgpt", "ChatGPT (Plus/Pro/Business)"], ["claude", "Claude (Pro/Max/Ultra)"],
  ["gemini", "제미나이 (Google AI Pro/Ultra)"], ["notion", "노션 (유료 플랜)"],
].map(([id, name]) => ({ id, name }));
const TODAY = "2026-11-03";

const cases = [
  {
    text: "[Web발신] 삼성카드 승인 넷플릭스 17,000원 일시불",
    expect: { complete: true, service_id: "netflix", amount: 17000, payment_channel: "direct" },
  },
  {
    text: "[Apple] App Store 구독 영수증 ChatGPT Plus 29,000원 매월 자동 갱신",
    expect: { complete: true, service_id: "chatgpt", amount: 29000, payment_channel: "apple", billing_cycle: "monthly" },
  },
  {
    text: "Google Play 결제 완료: 유튜브 프리미엄 14,900원. 다음 결제일 11/25",
    expect: { complete: true, service_id: "youtube_premium", amount: 14900, payment_channel: "google_play", next_billing_date: "2026-11-25" },
  },
  {
    text: "쿠팡 와우 멤버십 7,890원 결제 예정일 2026-12-05",
    expect: { complete: true, service_id: "coupang_wow", amount: 7890, next_billing_date: "2026-12-05" },
  },
  {
    text: "디즈니+ 연간 구독 119,000원 결제. 다음 결제일 2027년 1월 5일",
    expect: { complete: true, service_id: "disney_plus", amount: 119000, billing_cycle: "yearly" },
  },
  {
    // 이미 지난 날짜(11/01)는 다음 해로 넘긴다
    text: "티빙 14,900원 결제 다음 결제일 11/01",
    expect: { complete: true, service_id: "tving", next_billing_date: "2027-11-01" },
  },
  {
    text: "[Google Play] Claude Pro 구독 $20.00 결제",
    expect: { complete: false, service_id: "claude", amount: null },
  },
  {
    text: "CJ대한통운 택배가 오늘 도착 예정입니다. 상품 12,000원",
    expect: { complete: false, service_id: null, is_subscription_payment: false },
  },
  {
    text: "넷플릭스 17,000원 결제 후 잔액 5,000원",
    expect: { complete: false, service_id: "netflix", amount: null },
  },
  {
    text: "넷플릭스와 티빙 번들 결제 20,000원",
    expect: { complete: false, service_id: null },
  },
  {
    text: "제미나이 Google AI Pro 19,500원 휴대폰결제",
    expect: { complete: true, service_id: "gemini", amount: 19500, payment_channel: "carrier" },
  },
];

let failed = 0;
for (const c of cases) {
  const r = ruleParse(c.text, SERVICES, TODAY);
  const actual = { complete: r.complete, ...r.data };
  try {
    for (const [k, v] of Object.entries(c.expect)) assert.equal(actual[k], v, `${k}`);
    console.log("통과 |", c.text.slice(0, 40));
  } catch (e) {
    failed++;
    console.log("실패 |", c.text.slice(0, 40), "|", e.message, "| 실제:", JSON.stringify(actual));
  }
}
console.log(failed === 0 ? `\n전체 ${cases.length}건 통과` : `\n${failed}건 실패`);
process.exit(failed === 0 ? 0 : 1);
