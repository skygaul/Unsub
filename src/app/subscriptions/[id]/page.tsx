import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SubscriptionForm from "@/components/SubscriptionForm";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types";
import { isUuid } from "@/lib/validation";

export default async function EditSubscriptionPage(
  props: PageProps<"/subscriptions/[id]">,
) {
  const { id } = await props.params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // RLS 덕분에 본인 구독만 조회된다. 남의 것이면 notFound.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!sub) notFound();

  // 서비스 목록은 공개 데이터라 캐시된 공개용 클라이언트로 읽는다(구독 같은 사용자 데이터는 위의 supabase로)
  const { data: services } = await createPublicClient()
    .from("services")
    .select("id, name")
    .order("name");

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← 내 구독
      </Link>
      <h1 className="mt-3 text-2xl font-bold">구독 수정</h1>
      <div className="mt-6">
        <SubscriptionForm services={services ?? []} initial={sub as Subscription} />
      </div>
    </main>
  );
}
