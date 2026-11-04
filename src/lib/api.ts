import { NextResponse } from "next/server";
import { limiter, type LimitName } from "@/lib/rate-limit";
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

/**
 * 사용자별 호출 제한을 확인한다. 제한을 넘었으면 429 응답(Retry-After 포함)을 돌려주고,
 * 아니면 null을 돌려준다. requireUser() 다음, 본문을 읽기 전에 호출할 것.
 */
export function enforceRateLimit(userId: string, name: LimitName, message?: string) {
  const result = limiter.check(name, userId);
  if (!result.limited) return null;
  const response = jsonError(
    message ?? "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
    429,
  );
  response.headers.set("Retry-After", String(result.retryAfterSeconds));
  return response;
}

/** 본문이 JSON이 아니면 null */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
