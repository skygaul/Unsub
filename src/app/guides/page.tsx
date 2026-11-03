import Link from "next/link";
import VerificationBadge from "@/components/VerificationBadge";
import { createClient } from "@/lib/supabase/server";
import type { Verification } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  channels: string[];
  verification: Verification;
  last_verified: string;
};

export default async function GuidesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, channels, verification, last_verified")
    .order("name");

  const services = (data ?? []) as Row[];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← 내 구독
      </Link>
      <h1 className="mt-3 text-2xl font-bold">해지 가이드</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        서비스를 고르면 결제 경로별 해지 방법과 환불 규정을 볼 수 있어요. 정책은 바뀔 수 있어서
        확인 상태와 확인 일자를 함께 보여 드려요.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          가이드를 불러오지 못했어요. 새로고침해 주세요.
        </p>
      )}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <li key={s.id}>
            <Link
              href={`/guides/${s.id}`}
              className="block h-full rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <p className="font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                결제 경로: {s.channels.join(" · ")}
              </p>
              <div className="mt-3">
                <VerificationBadge
                  verification={s.verification}
                  lastVerified={s.last_verified}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
