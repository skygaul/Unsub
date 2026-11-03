import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 로그인한 사용자와 Supabase 클라이언트를 돌려준다.
 * 로그인하지 않았으면 401 응답을 돌려준다.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, response: jsonError("로그인이 필요해요.", 401) };
  }
  return { ok: true as const, supabase, user };
}

/** 본문이 JSON이 아니면 null */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
