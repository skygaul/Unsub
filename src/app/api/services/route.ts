import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { createPublicClient } from "@/lib/supabase/public";

// 해지 가이드 목록 (로그인 없이 읽기 가능, 결과는 일정 시간 캐시됨)
export async function GET() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, channels, verification, last_verified")
    .order("name");

  if (error) return jsonError("가이드를 불러오지 못했어요.", 500);
  return NextResponse.json({ data });
}
