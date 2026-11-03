// 비용 없이 동작하는 규칙 기반 결제 문자 파서.
// 서비스와 금액이 명확하면 Claude를 호출하지 않고 여기서 끝낸다.

export type ParsedPayment = {
  is_subscription_payment: boolean;
  service_name: string | null;
  service_id: string | null;
  amount: number | null;
  billing_cycle: "monthly" | "yearly" | null;
  next_billing_date: string | null;
  payment_channel: "direct" | "apple" | "google_play" | "carrier" | "unknown";
  notes: string | null;
};

export type RuleParseResult = {
  data: ParsedPayment;
  /** 서비스와 금액이 모두 확실해서 AI 없이 써도 되는 경우 */
  complete: boolean;
  /** 규칙으로 하나라도 읽어 낸 값이 있는지 */
  foundAnything: boolean;
};

type ServiceInfo = { id: string; name: string };

// 서비스 id별 문자에 자주 나오는 표기. 새 가이드를 추가하면 여기에도 추가한다.
const SERVICE_PATTERNS: Record<string, RegExp> = {
  netflix: /넷플릭스|netflix/i,
  youtube_premium: /유튜브\s*(프리미엄|뮤직)|youtube\s*(premium|music)/i,
  coupang_wow: /쿠팡\s*(로켓)?\s*와우|로켓\s*와우|coupang\s*wow/i,
  naver_plus: /네이버\s*플러스|naver\s*plus/i,
  disney_plus: /디즈니\s*(\+|플러스|plus)|disney\s*(\+|plus)/i,
  tving: /티빙|tving/i,
  wavve: /웨이브|wavve/i,
  chatgpt: /chat\s*gpt|챗\s*(gpt|지피티)|openai/i,
  claude: /\bclaude\b|클로드|anthropic/i,
  gemini: /gemini|제미나이|google\s*ai\s*(pro|ultra)|google\s*one/i,
  notion: /\bnotion\b|노션/i,
};

const KEYWORD_SUBSCRIPTION = /구독|정기\s*결제|자동\s*결제|멤버십|갱신|subscription|renew/i;

function parseAmount(text: string) {
  const matches = [...text.matchAll(/(\d{1,3}(?:,\d{3})+|\d+)\s*원/g)];
  const values = [...new Set(matches.map((m) => Number(m[1].replace(/,/g, ""))))].filter(
    (n) => n > 0 && n <= 10_000_000,
  );
  return values;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** "11/25", "11월 25일", "2026-11-25" 같은 표기를 YYYY-MM-DD로. 연도가 없으면 today 이후 가장 가까운 날짜. */
function normalizeDate(raw: string, today: string) {
  const full = raw.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  let y: number | null = null;
  let m: number;
  let d: number;
  if (full) {
    y = Number(full[1]);
    m = Number(full[2]);
    d = Number(full[3]);
  } else {
    const md = raw.match(/(\d{1,2})\s*(?:월|[./])\s*(\d{1,2})/);
    if (!md) return null;
    m = Number(md[1]);
    d = Number(md[2]);
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;

  const make = (year: number) => `${year}-${pad(m)}-${pad(d)}`;
  const valid = (s: string) => {
    const dt = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === s;
  };

  if (y !== null) {
    const s = make(y);
    return valid(s) ? s : null;
  }
  const thisYear = Number(today.slice(0, 4));
  const candidate = make(thisYear);
  if (valid(candidate) && candidate >= today) return candidate;
  const next = make(thisYear + 1);
  return valid(next) ? next : null;
}

function parseNextDate(text: string, today: string) {
  const m = text.match(
    /(다음\s*결제(?:일|\s*예정일)?|결제\s*예정일?|갱신(?:일)?|renews?(?:\s*on)?)\s*[:은는이가]?\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}|\d{1,2}\s*[./]\s*\d{1,2}|\d{1,2}\s*월\s*\d{1,2}\s*일)/i,
  );
  return m ? normalizeDate(m[2], today) : null;
}

export function ruleParse(text: string, services: ServiceInfo[], today: string): RuleParseResult {
  const knownIds = new Set(services.map((s) => s.id));
  const matchedIds = Object.entries(SERVICE_PATTERNS)
    .filter(([id, re]) => knownIds.has(id) && re.test(text))
    .map(([id]) => id);

  const notes: string[] = [];

  // 서비스: 정확히 하나만 잡혔을 때만 확정한다
  let serviceId: string | null = null;
  let serviceName: string | null = null;
  if (matchedIds.length === 1) {
    serviceId = matchedIds[0];
    serviceName = services.find((s) => s.id === serviceId)?.name ?? null;
  } else if (matchedIds.length > 1) {
    notes.push("여러 서비스 이름이 보여서 직접 골라 주세요.");
  }

  // 금액: 서로 다른 금액이 여러 개거나 외화면 확정하지 않는다
  const foreign = /\$\s?\d|USD|달러|€|EUR|¥|JPY/i.test(text);
  const amounts = parseAmount(text);
  let amount: number | null = null;
  if (foreign) {
    notes.push("외화 결제로 보여요. 원화 금액을 직접 입력해 주세요.");
  } else if (amounts.length === 1) {
    amount = amounts[0];
  } else if (amounts.length > 1) {
    notes.push("금액이 여러 개 보여서 직접 확인해 주세요.");
  }

  const billingCycle: ParsedPayment["billing_cycle"] = /연간|연\s*구독|1\s*년|yearly|annual/i.test(text)
    ? "yearly"
    : /월간|매월|월\s*구독|1\s*개월|monthly/i.test(text)
      ? "monthly"
      : null;

  let channel: ParsedPayment["payment_channel"] = "unknown";
  if (/app\s*store|앱\s*스토어|itunes|apple\.com\/bill/i.test(text)) channel = "apple";
  else if (/google\s*play|구글\s*플레이/i.test(text)) channel = "google_play";
  else if (/소액\s*결제|휴대폰\s*결제|통신사\s*결제/.test(text)) channel = "carrier";
  else if (serviceId) channel = "direct";

  const nextDate = parseNextDate(text, today);
  const isSubscription = serviceId !== null || KEYWORD_SUBSCRIPTION.test(text);

  const data: ParsedPayment = {
    is_subscription_payment: isSubscription,
    service_name: serviceName,
    service_id: serviceId,
    amount,
    billing_cycle: billingCycle,
    next_billing_date: nextDate,
    payment_channel: channel,
    notes: notes.length ? notes.join(" ") : null,
  };

  return {
    data,
    complete: serviceId !== null && amount !== null,
    foundAnything: serviceId !== null || amount !== null || billingCycle !== null || nextDate !== null,
  };
}
