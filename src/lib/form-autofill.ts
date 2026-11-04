import type { BillingCycle, Currency, PaymentMethod } from "@/lib/types";

// 결제 문자 분석 결과를 구독 폼에 채우는 규칙. 화면(컴포넌트)에서 분리해서 시험할 수 있게 했다.
//
// 원칙: 분석은 "읽을 수 있는 것만" 채운다. 그런데 같은 폼에서 문자를 여러 번 분석하면, 새 문자에 없는 정보가
// 이전 문자의 값으로 남아 있게 된다(예: 카드 문자 다음에 수단이 없는 문자를 분석해도 카드가 남음).
// 그래서 "이전 분석이 채웠고 그 뒤로 사용자가 고치지 않은 칸"은 먼저 처음 값으로 되돌린 뒤 새 결과를 채운다.
// 사용자가 직접 고른 값은 건드리지 않는다.

export type AutoField = "service" | "name" | "amount" | "currency" | "cycle" | "nextDate" | "method";

export type FormValues = {
  serviceId: string;
  name: string;
  amount: string;
  currency: Currency;
  cycle: BillingCycle;
  nextDate: string;
  paymentMethod: PaymentMethod;
};

/** 새 구독 폼의 처음 값 */
export const EMPTY_VALUES: FormValues = {
  serviceId: "",
  name: "",
  amount: "",
  currency: "KRW",
  cycle: "monthly",
  nextDate: "",
  paymentMethod: "unknown",
};

export type ParsedFields = {
  service_id: string | null;
  service_name: string | null;
  amount: number | null;
  currency?: Currency;
  billing_cycle: BillingCycle | null;
  next_billing_date: string | null;
  payment_method?: PaymentMethod;
};

/**
 * 현재 폼 값(current)에 분석 결과(d)를 적용해서 새 폼 값과 "이번 분석이 채운 칸"을 돌려준다.
 * prevAuto는 이전 분석이 채웠고 아직 사용자가 고치지 않은 칸이다.
 */
export function applyParsed(
  current: FormValues,
  prevAuto: ReadonlySet<AutoField>,
  d: ParsedFields,
  knownServiceIds: readonly string[],
): { values: FormValues; filled: Set<AutoField> } {
  const values: FormValues = { ...current };

  // 1) 이전 분석이 채웠고 아직 아무도 고치지 않은 칸을 처음 값으로 되돌린다.
  if (prevAuto.has("service")) values.serviceId = EMPTY_VALUES.serviceId;
  if (prevAuto.has("name")) values.name = EMPTY_VALUES.name;
  if (prevAuto.has("amount")) values.amount = EMPTY_VALUES.amount;
  if (prevAuto.has("currency")) values.currency = EMPTY_VALUES.currency;
  if (prevAuto.has("cycle")) values.cycle = EMPTY_VALUES.cycle;
  if (prevAuto.has("nextDate")) values.nextDate = EMPTY_VALUES.nextDate;
  if (prevAuto.has("method")) values.paymentMethod = EMPTY_VALUES.paymentMethod;

  // 2) 이번 분석에서 읽은 것만 채운다. 결제 수단은 문자에 근거가 있을 때만(unknown이면 채우지 않음).
  const filled = new Set<AutoField>();
  if (d.service_id && knownServiceIds.includes(d.service_id)) {
    values.serviceId = d.service_id;
    filled.add("service");
  }
  if (d.service_name) {
    values.name = d.service_name;
    filled.add("name");
  }
  if (d.amount !== null) {
    values.amount = String(d.amount);
    filled.add("amount");
    if (d.currency === "USD" || d.currency === "KRW") {
      values.currency = d.currency;
      filled.add("currency");
    }
  }
  if (d.billing_cycle) {
    values.cycle = d.billing_cycle;
    filled.add("cycle");
  }
  if (d.next_billing_date) {
    values.nextDate = d.next_billing_date;
    filled.add("nextDate");
  }
  if (d.payment_method && d.payment_method !== "unknown") {
    values.paymentMethod = d.payment_method;
    filled.add("method");
  }

  return { values, filled };
}
