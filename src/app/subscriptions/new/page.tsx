import Link from "next/link";
import { redirect } from "next/navigation";
import SubscriptionForm from "@/components/SubscriptionForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewSubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: services } = await supabase
    .from("services")
    .select("id, name")
    .order("name");

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← 내 구독
      </Link>
      <h1 className="mt-3 text-2xl font-bold">구독 추가</h1>
      <div className="mt-6">
        <SubscriptionForm services={services ?? []} />
      </div>
    </main>
  );
}
