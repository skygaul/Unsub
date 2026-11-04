// Supabase 로그인 쿠키 판별 시험. 사용: node scripts/test-auth-cookie.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { hasSupabaseAuthCookie } = await import("../src/lib/supabase/auth-cookie.ts");

// 세션 쿠키가 있으면 true (나뉘어 저장된 경우 포함)
assert.equal(hasSupabaseAuthCookie(["sb-abcdefgh-auth-token"]), true);
assert.equal(hasSupabaseAuthCookie(["sb-abcdefgh-auth-token.0"]), true);
assert.equal(hasSupabaseAuthCookie(["x", "sb-abcdefgh-auth-token.0", "sb-abcdefgh-auth-token.1"]), true);

// 로그인한 적이 없거나 다른 쿠키뿐이면 false
assert.equal(hasSupabaseAuthCookie([]), false);
assert.equal(hasSupabaseAuthCookie(["last_active", "theme"]), false);
assert.equal(hasSupabaseAuthCookie(["__vercel_toolbar"]), false);

// 로그인 진행 중의 code-verifier는 세션이 아니다
assert.equal(hasSupabaseAuthCookie(["sb-abcdefgh-auth-token-code-verifier"]), false);

// 비슷하지만 다른 이름은 세션으로 보지 않는다
assert.equal(hasSupabaseAuthCookie(["sb-abcdefgh-auth-token.x"]), false);
assert.equal(hasSupabaseAuthCookie(["my-sb-abcdefgh-auth-token"]), false);
assert.equal(hasSupabaseAuthCookie(["sb--auth-token"]), false);

console.log("로그인 쿠키 판별 시험 통과");
