import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  billingsByDay,
  daysInMonth,
  formatMonth,
  monthTotal,
  parseMonth,
  shiftMonth,
  type CalendarItem,
} from "@/lib/billing-calendar";
import { createClient } from "@/lib/supabase/server";
import { formatWon, todayKst } from "@/lib/types";

export const metadata: Metadata = {
  title: "결제 달력 | 구독 해지 도우미",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const params = await searchParams;
  const raw = Array.isArray(params.month) ? params.month[0] : params.month;
  const today = todayKst();
  const [year, month] = parseMonth(raw) ?? (today.slice(0, 7).split("-").map(Number) as [number, number]);

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, name, amount, billing_cycle, next_billing_date, service_id")
    .eq("status", "active")
    .not("next_billing_date", "is", null);

  const items = (data ?? []) as CalendarItem[];
  const byDay = billingsByDay(items, year, month);
  const total = monthTotal(byDay);
  const count = Array.from(byDay.values()).reduce((n, list) => n + list.length, 0);

  const lastDay = daysInMonth(year, month);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const [py, pm] = shiftMonth(year, month, -1);
  const [ny, nm] = shiftMonth(year, month, 1);
  const todayMonth = today.slice(0, 7);
  const isTodayMonth = formatMonth(year, month) === todayMonth;
  const todayDay = isTodayMonth ? Number(today.slice(8, 10)) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← 내 구독
      </Link>
      <h1 className="mt-3 text-2xl font-bold">결제 달력</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        이용 중인 구독이 언제 결제되는지 한눈에 봐요. 다음 결제일을 입력한 구독만 나와요.
      </p>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={`/calendar?month=${formatMonth(py, pm)}`}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label="이전 달"
        >
          ←
        </Link>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {year}년 {month}월
          </h2>
          {!isTodayMonth && (
            <Link href="/calendar" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
              이번 달로
            </Link>
          )}
        </div>
        <Link
          href={`/calendar?month=${formatMonth(ny, nm)}`}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label="다음 달"
        >
          →
        </Link>
      </div>

      <section className="mt-4 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">이 달에 결제될 금액</p>
        <p className="mt-1 text-2xl font-bold">{formatWon(total)}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {count}건 · 연간 결제는 결제되는 달에 전액이 잡혀요
        </p>
      </section>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          구독 목록을 불러오지 못했어요. 새로고침해 주세요.
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[34rem]">
          <div className="grid grid-cols-7 text-center text-xs text-zinc-500">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
            {cells.map((day, i) => {
              const list = day ? (byDay.get(day) ?? []) : [];
              const isToday = day !== null && day === todayDay;
              return (
                <div
                  key={i}
                  className={`min-h-20 bg-white p-1.5 dark:bg-black ${day === null ? "opacity-40" : ""}`}
                >
                  {day !== null && (
                    <>
                      <span
                        className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                          isToday ? "bg-black font-semibold text-white dark:bg-white dark:text-black" : "text-zinc-500"
                        }`}
                      >
                        {day}
                      </span>
                      <ul className="mt-1 flex flex-col gap-1">
                        {list.map((s) => (
                          <li
                            key={s.id}
                            className="truncate rounded bg-blue-50 px-1 py-0.5 text-[11px] text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                            title={`${s.name} ${formatWon(s.amount)}`}
                          >
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {count > 0 && (
        <ul className="mt-6 flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {Array.from(byDay.entries())
            .sort(([a], [b]) => a - b)
            .flatMap(([day, list]) => list.map((s) => ({ day, s })))
            .map(({ day, s }) => (
              <li key={`${day}-${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate">
                  <span className="mr-2 text-zinc-500">{month}월 {day}일</span>
                  <span className="font-medium">{s.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span>{formatWon(s.amount)}</span>
                  {s.service_id && (
                    <Link
                      href={`/guides/${s.service_id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      해지 방법
                    </Link>
                  )}
                </span>
              </li>
            ))}
        </ul>
      )}

      {!error && count === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          이 달에 결제될 구독이 없어요.
        </p>
      )}
    </main>
  );
}
