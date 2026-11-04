import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { enforceRateLimit, jsonError, readJson, requireUser } from "@/lib/api";
import {
  MAX_TEXT_LENGTH,
  ParseUnavailableError,
  maskSensitiveNumbers,
  parsePaymentText,
} from "@/lib/parse-payment";
import { createPublicClient } from "@/lib/supabase/public";
import { ruleParse } from "@/lib/rule-parser";
import { todayKst } from "@/lib/types";

/**
 * 결제 문자 → 구독 정보 추출. 원문은 저장하지 않고 로그에도 남기지 않는다.
 * 1) 규칙 기반으로 서비스·금액이 확실히 읽히면 그대로 돌려준다(비용 0).
 * 2) 아니면 Claude(Haiku)로 분석한다.
 * 3) Claude를 쓸 수 없으면 규칙으로 읽은 부분만 돌려준다.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  // 비용 폭주를 막는 사용자별 호출 제한(src/lib/rate-limit.ts의 LIMITS.parse)
  const limited = enforceRateLimit(
    auth.user.id,
    "parse",
    "잠시 후 다시 시도해 주세요. 1분에 몇 번까지만 분석할 수 있어요.",
  );
  if (limited) return limited;

  const body = await readJson(request);
  const raw =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;
  if (typeof raw !== "string" || raw.trim().length < 5) {
    return jsonError("분석할 결제 문자를 붙여넣어 주세요.", 400);
  }
  if (raw.length > MAX_TEXT_LENGTH) {
    return jsonError(`문자가 너무 길어요. ${MAX_TEXT_LENGTH}자 이하로 줄여 주세요.`, 400);
  }

  const { text, masked } = maskSensitiveNumbers(raw.trim());

  // 가이드가 있는 서비스 목록 (규칙 매칭과 모델의 service_id 선택에 모두 쓴다)
  const { data: serviceRows } = await createPublicClient().from("services").select("id, name");
  const services = (serviceRows ?? []) as { id: string; name: string }[];
  const serviceIds = services.map((s) => s.id);

  // 1) 규칙 기반
  const rules = ruleParse(text, services, todayKst());
  if (rules.complete) {
    return NextResponse.json({ data: rules.data, masked, source: "rules" });
  }

  // 규칙으로 읽은 만큼이라도 돌려줄 때 쓰는 응답
  const partial = () =>
    rules.foundAnything
      ? NextResponse.json({ data: rules.data, masked, source: "rules_partial" })
      : null;

  // 2) Claude
  try {
    const parsed = await parsePaymentText(text, serviceIds);
    if (!parsed) {
      return partial() ?? jsonError("문자를 분석하지 못했어요. 직접 입력해 주세요.", 422);
    }
    // 모델이 목록에 없는 id를 내놓더라도 DB 외래키 오류가 나지 않게 한 번 더 거른다.
    if (parsed.service_id && !serviceIds.includes(parsed.service_id)) {
      parsed.service_id = null;
    }
    return NextResponse.json({ data: parsed, masked, source: "ai" });
  } catch (error) {
    // 3) Claude를 못 쓰는 경우: 규칙으로 읽은 부분이 있으면 그것만 돌려준다
    if (error instanceof ParseUnavailableError) {
      return partial() ?? jsonError("자동 입력 기능을 준비 중이에요. 직접 입력해 주세요.", 503);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return partial() ?? jsonError("지금 요청이 많아요. 잠시 후 다시 시도해 주세요.", 429);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic 인증 오류: API 키를 확인해 주세요.");
      return partial() ?? jsonError("자동 입력 기능에 문제가 있어요. 직접 입력해 주세요.", 503);
    }
    // 크레딧 부족은 400으로 오기 때문에 따로 구분한다. (Console > Billing에서 충전 필요)
    if (error instanceof Anthropic.BadRequestError && /credit balance/i.test(error.message)) {
      console.error("Anthropic 크레딧 부족: Console > Billing에서 충전해 주세요.");
      return partial() ?? jsonError("자동 입력 기능을 준비 중이에요. 직접 입력해 주세요.", 503);
    }
    // 원문이 섞일 수 있어 메시지는 남기지 않고 종류만 기록한다.
    console.error("문자 분석 실패:", error instanceof Anthropic.APIError ? error.status : "unknown");
    return partial() ?? jsonError("문자를 분석하지 못했어요. 잠시 후 다시 시도해 주세요.", 502);
  }
}
