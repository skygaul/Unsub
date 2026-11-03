import { NextResponse } from "next/server";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { parseSubscriptionInput } from "@/lib/validation";

// 내 구독 목록
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("subscriptions")
    .select("*")
    .order("next_billing_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return jsonError("구독 목록을 불러오지 못했어요.", 500);
  return NextResponse.json({ data });
}

// 구독 생성
export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const body = await readJson(request);
  const parsed = parseSubscriptionInput(body, false);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  // user_id는 DB 기본값(auth.uid())으로 채워지고, RLS가 본인 것만 허용한다.
  const { data, error } = await auth.supabase
    .from("subscriptions")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    // 23503: 존재하지 않는 service_id
    if (error.code === "23503") return jsonError("존재하지 않는 서비스예요.", 400);
    return jsonError("구독을 저장하지 못했어요.", 500);
  }
  return NextResponse.json({ data }, { status: 201 });
}
