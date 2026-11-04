import { USD_KRW_RATE } from "@/lib/types";

export type UsdKrwRate = {
  /** 1달러가 몇 원인지 */
  rate: number;
  /** live: 환율 서비스에서 가져옴 / fallback: 가져오지 못해 기본값(USD_KRW_RATE)을 씀 */
  source: "live" | "fallback";
  /** 환율 기준일(YYYY-MM-DD). fallback이면 null */
  date: string | null;
};

const REVALIDATE_SECONDS = 60 * 60; // 한 시간마다 새로 가져온다
const TIMEOUT_MS = 3000;

// 값이 이 범위를 벗어나면 잘못된 응답으로 보고 버린다.
const MIN_RATE = 500;
const MAX_RATE = 3000;

function sane(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= MIN_RATE && n <= MAX_RATE;
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`exchange rate http ${res.status}`);
  return res.json();
}

// 1) Frankfurter(유럽중앙은행 기준, 영업일마다 갱신, 키 불필요)
async function fromFrankfurter(): Promise<UsdKrwRate> {
  const json = (await getJson("https://api.frankfurter.dev/v1/latest?base=USD&symbols=KRW")) as {
    date?: string;
    rates?: { KRW?: number };
  };
  if (!sane(json.rates?.KRW)) throw new Error("frankfurter: bad rate");
  return { rate: json.rates.KRW, source: "live", date: json.date ?? null };
}

// 2) 예비: ExchangeRate-API 무료 엔드포인트(하루 한 번 갱신, 키 불필요)
async function fromOpenErApi(): Promise<UsdKrwRate> {
  const json = (await getJson("https://open.er-api.com/v6/latest/USD")) as {
    result?: string;
    time_last_update_utc?: string;
    rates?: { KRW?: number };
  };
  if (json.result !== "success" || !sane(json.rates?.KRW)) throw new Error("open.er-api: bad rate");
  const date = json.time_last_update_utc ? new Date(json.time_last_update_utc) : null;
  return {
    rate: json.rates.KRW,
    source: "live",
    date: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null,
  };
}

/**
 * 오늘의 원/달러 환율. 환율 서비스를 쓸 수 없으면 기본값(USD_KRW_RATE)으로 돌아가서,
 * 환율 때문에 화면이 실패하는 일은 없다. 사용자 정보는 외부로 보내지 않는다.
 */
export async function getUsdKrwRate(): Promise<UsdKrwRate> {
  for (const source of [fromFrankfurter, fromOpenErApi]) {
    try {
      return await source();
    } catch {
      // 다음 출처를 시도한다
    }
  }
  return { rate: USD_KRW_RATE, source: "fallback", date: null };
}

/** 화면에 보여 줄 환율 안내 문구. 예: "1달러 = 1,344.59원 (2026-11-03 기준)" */
export function describeRate({ rate, source, date }: UsdKrwRate) {
  const value = rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  if (source === "live") return `1달러 = ${value}원${date ? ` (${date} 기준)` : ""}`;
  return `1달러 = ${value}원 (환율을 가져오지 못해 기본값 사용)`;
}
