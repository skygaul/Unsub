import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

// 해지 가이드 상세
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/services/[id]">,
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return jsonError("가이드를 불러오지 못했어요.", 500);
  if (!data) return jsonError("가이드를 찾을 수 없어요.", 404);
  return NextResponse.json({ data });
}
