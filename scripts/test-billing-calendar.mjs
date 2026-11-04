// 결제 달력 계산 시험. 사용: node scripts/test-billing-calendar.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { billingsByDay, daysInMonth, monthTotal, monthlySavings, parseMonth, shiftMonth } =
  await import("../src/lib/billing-calendar.ts");

const sub = (id, amount, billing_cycle, next_billing_date, currency = "KRW") => ({
  id, name: id, amount, currency, billing_cycle, next_billing_date, service_id: null,
});

// 월 계산
assert.deepEqual(parseMonth("2026-11"), [2026, 11]);
assert.equal(parseMonth("2026-13"), null);
assert.equal(parseMonth("abc"), null);
assert.equal(parseMonth(undefined), null);
assert.deepEqual(shiftMonth(2026, 12, 1), [2027, 1]);
assert.deepEqual(shiftMonth(2026, 1, -1), [2025, 12]);
assert.equal(daysInMonth(2026, 2), 28);
assert.equal(daysInMonth(2028, 2), 29);

// 월간: 매달 같은 '일'에 나온다
const items = [
  sub("netflix", 17000, "monthly", "2026-10-15"),
  sub("notion", 96000, "yearly", "2026-11-03"),
  sub("end31", 5000, "monthly", "2026-01-31"),
  sub("none", 9000, "monthly", null),
];
let nov = billingsByDay(items, 2026, 11);
assert.equal(nov.get(15)?.[0].id, "netflix");
assert.equal(nov.get(3)?.[0].id, "notion"); // 연간은 같은 달에만
assert.equal(nov.get(30)?.[0].id, "end31"); // 31일 → 30일로 당김
assert.equal(monthTotal(nov), 17000 + 96000 + 5000);

// 연간은 다른 달에는 나오지 않는다. 다음 결제일이 없으면 제외
const dec = billingsByDay(items, 2026, 12);
assert.equal(dec.get(3), undefined);
assert.equal(dec.get(15)?.[0].id, "netflix");
assert.equal([...dec.values()].flat().some((s) => s.id === "none"), false);

// 2월에는 말일로 당긴다
const feb = billingsByDay(items, 2027, 2);
assert.equal(feb.get(28)?.[0].id, "end31");

// 아끼는 금액: 연간은 12로 나눠 반올림
assert.equal(
  monthlySavings([{ amount: 17000, billing_cycle: "monthly" }, { amount: 96000, billing_cycle: "yearly" }]),
  17000 + 8000,
);
assert.equal(monthlySavings([]), 0);

// 달러는 1달러 = 1,400원으로 환산
assert.equal(
  monthlySavings([{ amount: 20, currency: "USD", billing_cycle: "monthly" }]),
  28000,
);
assert.equal(
  monthlySavings([{ amount: 120, currency: "USD", billing_cycle: "yearly" }]),
  14000, // 168,000원 / 12
);
// 실제 환율을 넘기면 그 값으로 환산한다
assert.equal(monthlySavings([{ amount: 20, currency: "USD", billing_cycle: "monthly" }], 1344.59), 26892);
const usdMonth2 = billingsByDay([sub("claude", 20, "monthly", "2026-11-10", "USD")], 2026, 11);
assert.equal(monthTotal(usdMonth2, 1300), 26000);
const usdMonth =billingsByDay([sub("claude", 20, "monthly", "2026-11-10", "USD")], 2026, 11);
assert.equal(monthTotal(usdMonth), 28000);

console.log("결제 달력 시험 통과");
