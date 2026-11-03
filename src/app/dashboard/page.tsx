import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteSubscriptionButton from "@/components/DeleteSubscriptionButton";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import {
  BILLING_CYCLE_LABELS,
  PAYMENT_CHANNEL_LABELS,
  daysUntil,
  formatWon,
  monthlyAmount,
  type Subscription,
} from "@/lib/types";

function DueBadge({ date }: { date: string }) {
  const d = daysUntil(date);
  if (d < 0) {
    return <span className="text-xs text-zinc-500">결제일 {Math.abs(d)}일 지남</span>;
  }
  const soon = d <= 3;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        soon
          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {d === 0 ? "오늘 결제" : `D-${d}`}
    </span>
  );
}

function SubscriptionCard({ sub }: { sub: Subscription }) {
  const cancelled = sub.status === "cancelled";
  return (
    <li
      className={`rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 ${
        cancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{sub.name}</p>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {formatWon(sub.amount)} · {BILLING_CYCLE_LABELS[sub.billing_cycle]} ·{" "}
            {PAYMENT_CHANNEL_LABELS[sub.payment_channel]}
          </p>
          {sub.next_billing_date && !cancelled && (
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              다음 결제일 {sub.next_billing_date}
              <DueBadge date={sub.next_billing_date} />
            </p>
          )}
          {sub.memo && (
            <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{sub.memo}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        {sub.service_id && (
          <Link
            href={`/guides/${sub.service_id}`}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            해지 방법 보기
          </Link>
        )}
        <Link href={`/subscriptions/${sub.id}`} className="hover:underline">
          수정
        </Link>
        <span className="ml-auto">
          <DeleteSubscriptionButton id={sub.id} name={sub.name} />
        </span>
      </div>
    </li>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy는 낙관적 체크일 뿐이므로 여기서도 직접 확인한다.
  if (!user) redirect("/");

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_billing_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const subs = (data ?? []) as Subscription[];
  const active = subs.filter((s) => s.status === "active");
  const cancelled = subs.filter((s) => s.status === "cancelled");
  const monthlyTotal = active.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const dueSoon = active.filter(
    (s) => s.next_billing_date && daysUntil(s.next_billing_date) >= 0 && daysUntil(s.next_billing_date) <= 7,
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">내 구독</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/guides"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            해지 가이드
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">한 달 구독료</p>
          <p className="mt-1 text-2xl font-bold">{formatWon(monthlyTotal)}</p>
          <p className="mt-1 text-xs text-zinc-500">연간 결제는 12개월로 나눠 계산해요</p>
        </div>
        <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">7일 안에 결제될 구독</p>
          <p className="mt-1 text-2xl font-bold">{dueSoon.length}개</p>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {dueSoon.length > 0 ? dueSoon.map((s) => s.name).join(", ") : "예정된 결제가 없어요"}
          </p>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">이용 중 ({active.length})</h2>
        <Link
          href="/subscriptions/new"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          구독 추가
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          구독 목록을 불러오지 못했어요. 새로고침해 주세요.
        </p>
      )}

      {!error && active.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">아직 등록한 구독이 없어요</p>
          <p className="mt-1 text-sm text-zinc-500">
            쓰고 있는 구독을 추가하면 한 달에 얼마를 내는지 한눈에 볼 수 있어요.
          </p>
          <Link
            href="/subscriptions/new"
            className="mt-4 inline-block rounded-full bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            첫 구독 추가하기
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {active.map((s) => (
            <SubscriptionCard key={s.id} sub={s} />
          ))}
        </ul>
      )}

      {cancelled.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold">해지함 ({cancelled.length})</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {cancelled.map((s) => (
              <SubscriptionCard key={s.id} sub={s} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
