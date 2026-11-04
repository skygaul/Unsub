export const BILLING_CYCLES = ["monthly", "yearly"] as const;
export const PAYMENT_CHANNELS = [
  "direct",
  "apple",
  "google_play",
  "carrier",
  "unknown",
] as const;
/** 무엇으로 결제했나요? (결제 경로 payment_channel과는 별개: 경로는 "어디서", 수단은 "무엇으로") */
export const PAYMENT_METHODS = [
  "card",
  "bank",
  "simple_pay",
  "mobile",
  "points",
  "other",
  "unknown",
] as const;
export const STATUSES = ["active", "cancelled"] as const;
export const CURRENCIES = ["KRW", "USD"] as const;

export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  KRW: "원",
  USD: "달러",
};

/** 환율 서비스를 쓸 수 없을 때만 쓰는 기본 환율(원/달러). 평소에는 exchange-rate.ts가 가져온 실제 환율을 쓴다. */
export const USD_KRW_RATE = 1400;

export type BillingCycle = (typeof BILLING_CYCLES)[number];
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type Status = (typeof STATUSES)[number];

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "월간",
  yearly: "연간",
};

export const PAYMENT_CHANNEL_LABELS: Record<PaymentChannel, string> = {
  direct: "서비스에 직접 결제",
  apple: "Apple(앱스토어)",
  google_play: "Google Play",
  carrier: "통신사 결제",
  unknown: "잘 모르겠어요",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "신용·체크카드",
  bank: "계좌이체·자동이체",
  simple_pay: "간편결제",
  mobile: "휴대폰 소액결제",
  points: "포인트·상품권",
  other: "기타",
  unknown: "잘 모르겠어요",
};

export const STATUS_LABELS: Record<Status, string> = {
  active: "이용 중",
  cancelled: "해지함",
};

export type Subscription = {
  id: string;
  user_id: string;
  service_id: string | null;
  name: string;
  amount: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  payment_channel: PaymentChannel;
  /** 마이그레이션(v0.11) 전의 DB에서는 없을 수 있어 화면에서는 값이 있는지 확인하고 쓴다 */
  payment_method: PaymentMethod;
  status: Status;
  memo: string | null;
  created_at: string;
};

export type Verification =
  | "page_read"
  | "official_search"
  | "partial"
  | "blog_only";

export type Service = {
  id: string;
  name: string;
  channels: string[];
  cancel: Record<string, string>;
  after_cancel: string | null;
  refund: string | null;
  warnings: string[];
  notes: string | null;
  contact: string | null;
  sources: string[];
  verification: Verification;
  last_verified: string;
};

export const VERIFICATION_LABELS: Record<Verification, string> = {
  page_read: "공식 문서 확인",
  official_search: "공식 출처 검색 확인",
  partial: "일부만 공식 확인",
  blog_only: "공식 확인 전 (참고용)",
};

/** 금액을 원화로 바꾼다. 달러는 주어진 환율(기본값 USD_KRW_RATE)로 환산해 반올림한다. */
export function toKrw(amount: number, currency: Currency, rate: number = USD_KRW_RATE) {
  return currency === "USD" ? Math.round(amount * rate) : amount;
}

/** 월 환산 금액(원). 달러는 환산하고, 연간은 12로 나눠 반올림한다. */
export function monthlyAmount(
  s: Pick<Subscription, "amount" | "currency" | "billing_cycle">,
  rate: number = USD_KRW_RATE,
) {
  const krw = toKrw(s.amount, s.currency, rate);
  return s.billing_cycle === "yearly" ? Math.round(krw / 12) : krw;
}

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

/** 결제한 통화 그대로 표시한다. 달러는 "$20.00", 원은 "17,000원". */
export function formatMoney(amount: number, currency: Currency) {
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return formatWon(amount);
}

/** 한국 시간 기준 오늘 날짜(YYYY-MM-DD) */
export function todayKst() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 오늘부터 해당 날짜까지 남은 일수. 지났으면 음수. */
export function daysUntil(dateStr: string) {
  const ms = Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${todayKst()}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}
