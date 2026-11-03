import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SubscriptionForm from "@/components/SubscriptionForm";
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

  const { data: services } = await supabase
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
