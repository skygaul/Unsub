import {
  BILLING_CYCLES,
  CURRENCIES,
  PAYMENT_CHANNELS,
  STATUSES,
  type BillingCycle,
  type Currency,
  type PaymentChannel,
  type Status,
} from "@/lib/types";

export type SubscriptionInput = {
  name: string;
  amount: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  payment_channel: PaymentChannel;
  status: Status;
  memo: string | null;
  service_id: string | null;
};

type Result =
  | { ok: true; data: Partial<SubscriptionInput> }
  | { ok: false; error: string };

const MAX_AMOUNT = 10_000_000;
const MAX_USD_AMOUNT = 100_000;

function isDateString(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/**
 * 요청 본문을 검증한다. partial이 true면 보낸 필드만 검사한다(PATCH용).
 * user_id 같은 허용되지 않은 필드는 무시한다.
 */
export function parseSubscriptionInput(body: unknown, partial: boolean): Result {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "요청 형식이 올바르지 않아요." };
  }
  const b = body as Record<string, unknown>;
  const out: Partial<SubscriptionInput> = {};
  const has = (k: string) => k in b && b[k] !== undefined;

  if (!partial || has("name")) {
    const name = typeof b.name === "string" ? b.name.trim() : "";
    if (name.length < 1 || name.length > 100) {
      return { ok: false, error: "서비스 이름은 1~100자로 입력해 주세요." };
    }
    out.name = name;
  }

  if (has("currency")) {
    if (!CURRENCIES.includes(b.currency as Currency)) {
      return { ok: false, error: "통화가 올바르지 않아요." };
    }
    out.currency = b.currency as Currency;
  } else if (!partial) {
    out.currency = "KRW";
  }

  if (!partial || has("amount")) {
    const amount = b.amount;
    // 통화를 함께 보내지 않은 수정 요청은 기존 통화를 알 수 없으므로 원화(정수) 기준으로 검사한다.
    const currency = out.currency ?? "KRW";
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
      return { ok: false, error: "금액은 0 이상의 숫자로 입력해 주세요." };
    }
    if (currency === "KRW") {
      if (!Number.isInteger(amount) || amount > MAX_AMOUNT) {
        return { ok: false, error: "원화 금액은 0원 이상의 정수로 입력해 주세요." };
      }
    } else if (
      Math.round(amount * 100) / 100 !== amount ||
      amount > MAX_USD_AMOUNT
    ) {
      return { ok: false, error: "달러 금액은 소수 둘째 자리까지 입력해 주세요." };
    }
    out.amount = amount;
  }

  if (!partial || has("billing_cycle")) {
    if (!BILLING_CYCLES.includes(b.billing_cycle as BillingCycle)) {
      return { ok: false, error: "결제 주기를 선택해 주세요." };
    }
    out.billing_cycle = b.billing_cycle as BillingCycle;
  }

  if (has("next_billing_date")) {
    if (b.next_billing_date === null || b.next_billing_date === "") {
      out.next_billing_date = null;
    } else if (isDateString(b.next_billing_date)) {
      out.next_billing_date = b.next_billing_date;
    } else {
      return { ok: false, error: "다음 결제일은 YYYY-MM-DD 형식이어야 해요." };
    }
  } else if (!partial) {
    out.next_billing_date = null;
  }

  if (has("payment_channel")) {
    if (!PAYMENT_CHANNELS.includes(b.payment_channel as PaymentChannel)) {
      return { ok: false, error: "결제 경로가 올바르지 않아요." };
    }
    out.payment_channel = b.payment_channel as PaymentChannel;
  } else if (!partial) {
    out.payment_channel = "unknown";
  }

  if (has("status")) {
    if (!STATUSES.includes(b.status as Status)) {
      return { ok: false, error: "상태 값이 올바르지 않아요." };
    }
    out.status = b.status as Status;
  } else if (!partial) {
    out.status = "active";
  }

  if (has("memo")) {
    if (b.memo === null || b.memo === "") {
      out.memo = null;
    } else if (typeof b.memo === "string" && b.memo.length <= 500) {
      out.memo = b.memo;
    } else {
      return { ok: false, error: "메모는 500자 이하로 입력해 주세요." };
    }
  } else if (!partial) {
    out.memo = null;
  }

  if (has("service_id")) {
    if (b.service_id === null || b.service_id === "") {
      out.service_id = null;
    } else if (typeof b.service_id === "string" && b.service_id.length <= 50) {
      out.service_id = b.service_id;
    } else {
      return { ok: false, error: "서비스 값이 올바르지 않아요." };
    }
  } else if (!partial) {
    out.service_id = null;
  }

  if (partial && Object.keys(out).length === 0) {
    return { ok: false, error: "수정할 내용이 없어요." };
  }

  return { ok: true, data: out };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string) {
  return UUID_RE.test(v);
}
