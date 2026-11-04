import { USD_KRW_RATE, monthlyAmount, type Subscription } from "@/lib/types";

type Sub = Pick<Subscription, "id" | "name" | "amount" | "currency" | "billing_cycle" | "service_id">;

export type CategoryId = "ott" | "ai" | "membership" | "work" | "other";

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  ott: "영상·음악",
  ai: "AI 도구",
  membership: "쇼핑 멤버십",
  work: "업무 도구",
  other: "기타",
};

/** 해지 가이드가 있는 서비스의 분류. 여기에 없거나 서비스를 고르지 않은 구독은 "기타"로 묶는다. */
const SERVICE_CATEGORY: Record<string, CategoryId> = {
  netflix: "ott",
  youtube_premium: "ott",
  disney_plus: "ott",
  tving: "ott",
  wavve: "ott",
  chatgpt: "ai",
  claude: "ai",
  gemini: "ai",
  coupang_wow: "membership",
  naver_plus: "membership",
  notion: "work",
};

export function categoryOf(sub: Pick<Subscription, "service_id">): CategoryId {
  return (sub.service_id && SERVICE_CATEGORY[sub.service_id]) || "other";
}

export type CategoryRow = {
  id: CategoryId;
  label: string;
  monthly: number;
  count: number;
  /** 전체 월 구독료 중 비중(0~100, 반올림) */
  percent: number;
};

/** 이용 중인 구독을 분류별 월 환산 금액이 큰 순서로 묶는다. */
export function categoryBreakdown(active: Sub[], rate: number = USD_KRW_RATE): CategoryRow[] {
  const total = active.reduce((sum, s) => sum + monthlyAmount(s, rate), 0);
  const map = new Map<CategoryId, { monthly: number; count: number }>();
  for (const s of active) {
    const id = categoryOf(s);
    const cur = map.get(id) ?? { monthly: 0, count: 0 };
    map.set(id, { monthly: cur.monthly + monthlyAmount(s, rate), count: cur.count + 1 });
  }
  return [...map.entries()]
    .map(([id, v]) => ({
      id,
      label: CATEGORY_LABELS[id],
      monthly: v.monthly,
      count: v.count,
      percent: total > 0 ? Math.round((v.monthly / total) * 100) : 0,
    }))
    .sort((a, b) => b.monthly - a.monthly);
}

/** 월 환산 금액이 큰 구독 순서. */
export function topExpensive<T extends Sub>(
  active: T[],
  limit = 3,
  rate: number = USD_KRW_RATE,
): T[] {
  return [...active]
    .sort((a, b) => monthlyAmount(b, rate) - monthlyAmount(a, rate))
    .slice(0, limit);
}

export type OverlapHint = {
  key: string;
  title: string;
  detail: string;
  /** 해지 방법을 볼 수 있는 구독 (service_id가 있는 것만) */
  targets: { id: string; name: string; serviceId: string }[];
};

function targetsOf(subs: Sub[]) {
  return subs
    .filter((s): s is Sub & { service_id: string } => s.service_id !== null)
    .map((s) => ({ id: s.id, name: s.name, serviceId: s.service_id }));
}

const OTT_LIMIT = 2;

/**
 * 정리해 볼 만한 구독을 규칙으로 찾는다. AI를 쓰지 않는다.
 * - 같은 서비스를 두 번 이상 등록
 * - 영상·음악 구독이 2개 이상
 * - AI 도구 구독이 2개 이상
 * - 쿠팡 와우와 네이버플러스 멤버십을 같이 사용
 */
export function findOverlaps(active: Sub[], rate: number = USD_KRW_RATE): OverlapHint[] {
  const hints: OverlapHint[] = [];

  const byService = new Map<string, Sub[]>();
  for (const s of active) {
    if (!s.service_id) continue;
    byService.set(s.service_id, [...(byService.get(s.service_id) ?? []), s]);
  }
  for (const [serviceId, list] of byService) {
    if (list.length < 2) continue;
    const monthly = list.reduce((sum, s) => sum + monthlyAmount(s, rate), 0);
    hints.push({
      key: `dup-${serviceId}`,
      title: `${list[0].name}을(를) ${list.length}번 등록했어요`,
      detail: `같은 서비스를 중복해서 등록했거나 실제로 중복 결제 중일 수 있어요. 합치면 매달 ${monthly.toLocaleString("ko-KR")}원이에요.`,
      targets: targetsOf(list.slice(0, 1)),
    });
  }

  const ott = active.filter((s) => categoryOf(s) === "ott");
  if (ott.length >= OTT_LIMIT) {
    const monthly = ott.reduce((sum, s) => sum + monthlyAmount(s, rate), 0);
    hints.push({
      key: "ott",
      title: `영상·음악 구독이 ${ott.length}개예요`,
      detail: `매달 ${monthly.toLocaleString("ko-KR")}원이에요. 최근 한 달 동안 안 본 서비스가 있다면 하나씩 쉬어 가는 것도 방법이에요.`,
      targets: targetsOf(ott),
    });
  }

  const ai = active.filter((s) => categoryOf(s) === "ai");
  if (ai.length >= 2) {
    const monthly = ai.reduce((sum, s) => sum + monthlyAmount(s, rate), 0);
    hints.push({
      key: "ai",
      title: `AI 도구 구독이 ${ai.length}개예요`,
      detail: `매달 ${monthly.toLocaleString("ko-KR")}원이에요. 기능이 겹치면 주로 쓰는 하나만 남겨도 충분할 수 있어요.`,
      targets: targetsOf(ai),
    });
  }

  const wow = active.filter((s) => s.service_id === "coupang_wow");
  const plus = active.filter((s) => s.service_id === "naver_plus");
  if (wow.length > 0 && plus.length > 0) {
    hints.push({
      key: "membership",
      title: "쿠팡 와우와 네이버플러스를 함께 쓰고 있어요",
      detail: "두 멤버십은 배송과 적립 혜택이 비슷해요. 자주 이용하는 쪽만 유지해도 되는지 확인해 보세요.",
      targets: targetsOf([wow[0], plus[0]]),
    });
  }

  return hints;
}
