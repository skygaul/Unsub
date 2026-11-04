import Link from "next/link";
import {
  categoryBreakdown,
  findOverlaps,
  topExpensive,
  type CategoryId,
  type OverlapHint,
} from "@/lib/insights";
import { formatWon, monthlyAmount, type Subscription } from "@/lib/types";

type Sub = Pick<Subscription, "id" | "name" | "amount" | "currency" | "billing_cycle" | "service_id">;

/** 분류에 붙은 "정리해 볼까요?" 안내. */
function HintBox({ hint }: { hint: OverlapHint }) {
  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
        <span aria-hidden="true">⚠ </span>
        정리해 볼까요? {hint.title}
      </p>
      <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-200/80">{hint.detail}</p>
      {hint.targets.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {hint.targets.map((t) => (
            <Link
              key={t.id}
              href={`/guides/${t.serviceId}`}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t.name} 해지 방법
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}

/** 이용 중인 구독의 분류별 비중, 정리해 볼 만한 구독 안내, 비싼 순서를 한 카드에 보여 준다. */
export default function DashboardInsights({ active, rate }: { active: Sub[]; rate: number }) {
  if (active.length === 0) return null;

  const monthlyTotal = active.reduce((sum, s) => sum + monthlyAmount(s, rate), 0);
  const rows = categoryBreakdown(active, rate);
  const top = topExpensive(active, 3, rate);

  const hintsByCategory = new Map<CategoryId, OverlapHint[]>();
  for (const h of findOverlaps(active, rate)) {
    hintsByCategory.set(h.category, [...(hintsByCategory.get(h.category) ?? []), h]);
  }

  return (
    <section className="mt-8" aria-label="구독 분석">
      <h2 className="text-lg font-semibold">구독 분석</h2>
      <div className="mt-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          1년이면 <b className="text-black dark:text-white">{formatWon(monthlyTotal * 12)}</b>을 쓰고 있어요
        </p>

        <ul className="mt-4 flex flex-col gap-4">
          {rows.map((r) => (
            <li key={r.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>
                  {r.label} <span className="text-zinc-500">{r.count}개</span>
                </span>
                <span className="shrink-0">
                  {formatWon(r.monthly)} <span className="text-zinc-500">({r.percent}%)</span>
                </span>
              </div>
              <div
                className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                role="img"
                aria-label={`${r.label} ${r.percent}%`}
              >
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.max(r.percent, 2)}%` }}
                />
              </div>
              {(hintsByCategory.get(r.id) ?? []).map((h) => (
                <HintBox key={h.key} hint={h} />
              ))}
            </li>
          ))}
        </ul>

        <h3 className="mt-5 text-sm font-semibold">가장 비싼 구독</h3>
        <ol className="mt-2 flex flex-col gap-1 text-sm">
          {top.map((s, i) => (
            <li key={s.id} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">
                <span className="mr-2 text-zinc-500">{i + 1}</span>
                {s.name}
              </span>
              <span className="shrink-0">매달 {formatWon(monthlyAmount(s, rate))}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
