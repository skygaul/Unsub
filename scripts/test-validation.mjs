// 구독 입력 검증(원화·달러) 시험. 사용: node scripts/test-validation.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { parseSubscriptionInput } = await import("../src/lib/validation.ts");

const base = { name: "구독", billing_cycle: "monthly" };
const ok = (body, partial = false) => {
  const r = parseSubscriptionInput(body, partial);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.data;
};
const bad = (body, partial = false) =>
  assert.equal(parseSubscriptionInput(body, partial).ok, false, JSON.stringify(body));

// 통화를 안 보내면 원화
assert.equal(ok({ ...base, amount: 17000 }).currency, "KRW");
bad({ ...base, amount: 17000.5 }); // 원화는 정수만
bad({ ...base, amount: 17000, currency: "EUR" });

// 달러는 소수 둘째 자리까지
assert.equal(ok({ ...base, amount: 20, currency: "USD" }).amount, 20);
assert.equal(ok({ ...base, amount: 9.99, currency: "USD" }).amount, 9.99);
bad({ ...base, amount: 9.999, currency: "USD" });
bad({ ...base, amount: 100001, currency: "USD" });
bad({ ...base, amount: -1, currency: "USD" });
bad({ ...base, amount: "20", currency: "USD" });

// 수정(PATCH): 보낸 필드만 검사. 통화 없이 금액만 보내면 원화 기준
assert.equal(ok({ currency: "USD" }, true).currency, "USD");
assert.equal(ok({ status: "cancelled" }, true).status, "cancelled");
assert.equal(ok({ amount: 12000 }, true).amount, 12000);
bad({ amount: 12.5 }, true);
assert.equal(ok({ amount: 12.5, currency: "USD" }, true).amount, 12.5);

// 결제 수단: 안 보내면 'unknown', 허용된 값만 받는다
assert.equal(ok({ ...base, amount: 17000 }).payment_method, "unknown");
for (const m of ["card", "bank", "simple_pay", "mobile", "points", "other", "unknown"]) {
  assert.equal(ok({ ...base, amount: 17000, payment_method: m }).payment_method, m);
}
bad({ ...base, amount: 17000, payment_method: "bitcoin" });
bad({ ...base, amount: 17000, payment_method: "" });
bad({ ...base, amount: 17000, payment_method: 5 });
// 수정(PATCH)에서는 보낸 필드만 검사한다
assert.equal(ok({ payment_method: "card" }, true).payment_method, "card");
assert.equal(ok({ status: "cancelled" }, true).payment_method, undefined);
bad({ payment_method: "x" }, true);

console.log("입력 검증 시험 통과");
