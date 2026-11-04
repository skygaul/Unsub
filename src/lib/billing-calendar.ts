import { USD_KRW_RATE, monthlyAmount, toKrw, type Subscription } from "@/lib/types";

export type CalendarItem = Pick<
  Subscription,
  "id" | "name" | "amount" | "currency" | "billing_cycle" | "next_billing_date" | "service_id"
>;

/** "YYYY-MM" 형식이면 [년, 월]을, 아니면 null을 돌려준다. */
export function parseMonth(value: string | undefined): [number, number] | null {
  const m = value?.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return [year, month];
}

export function formatMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function shiftMonth(year: number, month: number, delta: number): [number, number] {
  const index = year * 12 + (month - 1) + delta;
  return [Math.floor(index / 12), (index % 12) + 1];
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * 해당 월에 결제되는 구독을 날짜(일)별로 묶는다.
 * - 월간: 다음 결제일의 '일'이 매달 반복된다(31일이 없는 달은 말일로 당긴다).
 * - 연간: 다음 결제일과 같은 '월'에만 나타난다(2월 29일은 평년에 28일로 당긴다).
 * 다음 결제일이 없는 구독은 달력에 넣지 않는다.
 */
export function billingsByDay(items: CalendarItem[], year: number, month: number) {
  const last = daysInMonth(year, month);
  const byDay = new Map<number, CalendarItem[]>();
  for (const item of items) {
    if (!item.next_billing_date) continue;
    const [, m, d] = item.next_billing_date.split("-").map(Number);
    if (item.billing_cycle === "yearly" && m !== month) continue;
    const day = Math.min(d, last);
    byDay.set(day, [...(byDay.get(day) ?? []), item]);
  }
  return byDay;
}

/** 달력에 나온 구독의 실제 결제 합계(연간 결제는 결제되는 달에만 전액). */
export function monthTotal(byDay: Map<number, CalendarItem[]>, rate: number = USD_KRW_RATE) {
  let sum = 0;
  for (const list of byDay.values()) for (const s of list) sum += toKrw(s.amount, s.currency, rate);
  return sum;
}

/** 해지한 구독으로 매달 아끼는 금액(원화 환산, 연간 결제는 12로 나눈 값). */
export function monthlySavings(
  cancelled: Pick<Subscription, "amount" | "currency" | "billing_cycle">[],
  rate: number = USD_KRW_RATE,
) {
  return cancelled.reduce((sum, s) => sum + monthlyAmount(s, rate), 0);
}
