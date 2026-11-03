import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { isUuid, parseSubscriptionInput } from "@/lib/validation";

// 구독 수정 (보낸 필드만 바꾼다)
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/subscriptions/[id]">,
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  if (!isUuid(id)) return jsonError("잘못된 주소예요.", 400);

  const body = await readJson(request);
  const parsed = parseSubscriptionInput(body, true);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const { data, error } = await auth.supabase
    .from("subscriptions")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23503") return jsonError("존재하지 않는 서비스예요.", 400);
    return jsonError("구독을 수정하지 못했어요.", 500);
  }
  // RLS 때문에 남의 구독이나 없는 구독은 0행이 수정된다
  if (!data) return jsonError("구독을 찾을 수 없어요.", 404);
  return NextResponse.json({ data });
}

// 구독 삭제
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/subscriptions/[id]">,
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  if (!isUuid(id)) return jsonError("잘못된 주소예요.", 400);

  const { data, error } = await auth.supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return jsonError("구독을 삭제하지 못했어요.", 500);
  if (!data) return jsonError("구독을 찾을 수 없어요.", 404);
  return NextResponse.json({ data: { id: data.id } });
}
