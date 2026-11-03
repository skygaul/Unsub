export const BILLING_CYCLES = ["monthly", "yearly"] as const;
export const PAYMENT_CHANNELS = [
  "direct",
  "apple",
  "google_play",
  "carrier",
  "unknown",
] as const;
export const STATUSES = ["active", "cancelled"] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number];
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];
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
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  payment_channel: PaymentChannel;
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

/** 월 환산 금액(원). 연간은 12로 나눠 반올림한다. */
export function monthlyAmount(s: Pick<Subscription, "amount" | "billing_cycle">) {
  return s.billing_cycle === "yearly" ? Math.round(s.amount / 12) : s.amount;
}

export function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
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
