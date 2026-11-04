import Link from "next/link";
import { notFound } from "next/navigation";
import VerificationBadge from "@/components/VerificationBadge";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";

// cancel JSON의 키를 사람이 읽는 이름으로 바꾼다
const KEY_LABELS: Record<string, string> = {
  direct: "서비스에 직접 결제한 경우",
  web: "웹에서 결제한 경우",
  ios: "iPhone·iPad (Apple 결제)",
  apple: "Apple(앱스토어) 결제",
  android: "Android",
  google_play: "Google Play 결제",
  google_play_store: "Google 스토어·Play 구매",
  store: "앱스토어·Google Play 결제",
  carrier: "통신사 결제",
  partners: "제휴·연동으로 가입한 경우",
  partner: "제휴사를 통해 가입한 경우",
  other_channels: "다른 경로로 가입한 경우",
  third_party: "제3자(스토어 등)를 통한 결제",
  immediate: "즉시 종료",
  annual: "연간 이용권",
  note: "참고",
  restrictions: "제한 사항",
  deadline: "기한",
  business: "Business 플랜",
  cannot_sign_in: "로그인할 수 없을 때",
  workspace: "Workspace 관리자 계정",
  double: "티빙·웨이브 더블 이용권",
};

const CHANNEL_TABS = [
  { id: "all", label: "전체", keys: null },
  { id: "direct", label: "직접 결제", keys: ["direct", "web", "immediate", "annual", "restrictions", "deadline", "business", "cannot_sign_in", "workspace"] },
  { id: "apple", label: "Apple", keys: ["apple", "ios", "store", "third_party", "other_channels"] },
  { id: "google_play", label: "Google Play", keys: ["google_play", "google_play_store", "android", "store", "third_party", "other_channels"] },
  { id: "carrier", label: "통신사·제휴", keys: ["carrier", "partners", "partner", "other_channels", "double"] },
] as const;

const ALL_MAPPED_KEYS = new Set<string>(
  CHANNEL_TABS.flatMap((t) => (t.keys ? [...t.keys] : [])),
);

export default async function GuideDetailPage(
  props: PageProps<"/guides/[serviceId]">,
) {
  const { serviceId } = await props.params;
  const query = await props.searchParams;
  const channelParam = typeof query.channel === "string" ? query.channel : "all";
  const tab = CHANNEL_TABS.find((t) => t.id === channelParam) ?? CHANNEL_TABS[0];

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .maybeSingle();
  if (!data) notFound();
  const service = data as Service;

  const entries = Object.entries(service.cancel).filter(([key]) => {
    if (!tab.keys) return true;
    // 어느 결제 경로에도 속하지 않는 항목(공통 안내)은 항상 보여 준다
    return (tab.keys as readonly string[]).includes(key) || !ALL_MAPPED_KEYS.has(key);
  });

  const safeSources = service.sources.filter((u) => u.startsWith("https://"));

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/guides" className="text-sm text-zinc-500 hover:underline">
        ← 해지 가이드
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{service.name} 해지 방법</h1>
      <div className="mt-3">
        <VerificationBadge
          verification={service.verification}
          lastVerified={service.last_verified}
        />
      </div>

      {service.warnings.length > 0 && (
        <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
          <h2 className="font-semibold text-amber-900 dark:text-amber-200">꼭 확인하세요</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-200">
            {service.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">어디서 결제했나요?</h2>
        <nav className="mt-3 flex flex-wrap gap-2" aria-label="결제 경로">
          {CHANNEL_TABS.map((t) => (
            <Link
              key={t.id}
              href={t.id === "all" ? `/guides/${service.id}` : `/guides/${service.id}?channel=${t.id}`}
              aria-current={t.id === tab.id ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                t.id === tab.id
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <ol className="mt-5 space-y-4">
          {entries.map(([key, text]) => (
            <li key={key} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm font-semibold">{KEY_LABELS[key] ?? key}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">
                {text}
              </p>
            </li>
          ))}
          {entries.length === 0 && (
            <li className="text-sm text-zinc-500">이 결제 경로에 해당하는 안내가 아직 없어요.</li>
          )}
        </ol>
      </section>

      {service.after_cancel && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">해지하면 어떻게 되나요?</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">{service.after_cancel}</p>
        </section>
      )}

      {service.refund && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">환불 규정</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">{service.refund}</p>
        </section>
      )}

      {service.notes && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">참고</h2>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{service.notes}</p>
        </section>
      )}

      {service.contact && (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">고객센터: {service.contact}</p>
      )}

      {safeSources.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">출처</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {safeSources.map((u) => (
              <li key={u}>
                <a
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-600 hover:underline dark:text-blue-400"
                >
                  {u}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        이 안내는 공개된 도움말을 정리한 참고 정보이며 법률·금융 자문이 아니에요. 서비스의
        화면과 정책은 바뀔 수 있으니 해지 전에 공식 안내를 한 번 더 확인해 주세요.
      </p>
    </main>
  );
}
