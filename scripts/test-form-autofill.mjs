// 결제 문자 분석 결과를 폼에 채우는 규칙 시험. 사용: node scripts/test-form-autofill.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { EMPTY_VALUES, applyParsed } = await import("../src/lib/form-autofill.ts");

const SERVICES = ["netflix", "tving"];
const parsed = (over = {}) => ({
  service_id: null, service_name: null, amount: null, currency: "KRW",
  billing_cycle: null, next_billing_date: null, payment_method: "unknown", ...over,
});

// 문자 1: 국민카드 + 다음 결제일 + 연간
const sms1 = parsed({
  service_id: "netflix", service_name: "넷플릭스", amount: 17000,
  billing_cycle: "yearly", next_billing_date: "2026-12-05", payment_method: "card",
});
// 문자 2: 티빙 14,900원 결제 (수단·주기·날짜 단서 없음)
const sms2 = parsed({ service_id: "tving", service_name: "티빙", amount: 14900 });

// 1) 새 폼에서 처음 분석: 읽은 것만 채움
const r1 = applyParsed(EMPTY_VALUES, new Set(), sms1, SERVICES);
assert.equal(r1.values.paymentMethod, "card");
assert.equal(r1.values.nextDate, "2026-12-05");
assert.equal(r1.values.cycle, "yearly");
assert.deepEqual([...r1.filled].sort(), ["amount", "currency", "cycle", "method", "name", "nextDate", "service"]);

// 2) 같은 폼에서 이어서 분석: 이전 분석이 채운 값이 남지 않는다 (사용자가 보고한 문제)
const r2 = applyParsed(r1.values, r1.filled, sms2, SERVICES);
assert.equal(r2.values.paymentMethod, "unknown", "수단 단서가 없는 새 문자는 수단을 되돌린다");
assert.equal(r2.values.nextDate, "", "이전 문자의 결제일이 남지 않는다");
assert.equal(r2.values.cycle, "monthly", "이전 문자의 결제 주기가 남지 않는다");
assert.equal(r2.values.serviceId, "tving");
assert.equal(r2.values.name, "티빙");
assert.equal(r2.values.amount, "14900");
assert.deepEqual([...r2.filled].sort(), ["amount", "currency", "name", "service"]);

// 3) 사용자가 직접 고른 값은 지우지 않는다: 분석 후 수단을 직접 바꿨다면(자동 채움 목록에서 빠짐)
const afterManual = { ...r1.values, paymentMethod: "bank" };
const autoAfterManual = new Set(r1.filled);
autoAfterManual.delete("method"); // 컴포넌트가 사용자 수정 시 하는 일
const r3 = applyParsed(afterManual, autoAfterManual, sms2, SERVICES);
assert.equal(r3.values.paymentMethod, "bank", "직접 고른 수단은 그대로");
// 같은 시점에 직접 안 고친 결제일은 되돌아간다
assert.equal(r3.values.nextDate, "");

// 4) 분석 전에 사용자가 먼저 직접 입력한 값도 보존(자동 채움 목록이 비어 있음)
const typed = { ...EMPTY_VALUES, paymentMethod: "points", nextDate: "2027-01-01", name: "내가 쓴 이름" };
const r4 = applyParsed(typed, new Set(), parsed(), SERVICES);
assert.deepEqual(r4.values, typed, "아무것도 못 읽은 분석은 사용자가 쓴 값을 건드리지 않는다");
assert.equal(r4.filled.size, 0);

// 5) 새 문자에 값이 있으면 직접 쓴 값 위에 덮어쓴다(기존 동작 유지: 분석은 읽은 것을 채움)
const r5 = applyParsed(typed, new Set(), parsed({ payment_method: "simple_pay" }), SERVICES);
assert.equal(r5.values.paymentMethod, "simple_pay");

// 6) 목록에 없는 서비스 id는 무시, 달러 통화는 금액과 함께 채움
const r6 = applyParsed(EMPTY_VALUES, new Set(), parsed({ service_id: "unknown_svc", amount: 20, currency: "USD" }), SERVICES);
assert.equal(r6.values.serviceId, "");
assert.equal(r6.values.currency, "USD");
assert.ok(r6.filled.has("currency") && !r6.filled.has("service"));
// 달러로 분석한 다음 원화 문자를 분석하면 통화도 되돌아간 뒤 새 값이 채워진다
const r7 = applyParsed(r6.values, r6.filled, parsed({ amount: 17000, currency: "KRW" }), SERVICES);
assert.equal(r7.values.currency, "KRW");
assert.equal(r7.values.amount, "17000");

// 입력으로 받은 값 객체를 바꾸지 않는다
const frozen = Object.freeze({ ...EMPTY_VALUES });
applyParsed(frozen, new Set(["method"]), sms1, SERVICES);

console.log("폼 자동 채움 시험 통과");
