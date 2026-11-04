// 자동 로그아웃(비활동) 계산 시험. 사용: node scripts/test-idle.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const {
  IDLE_TIMEOUT_MS, IDLE_WARNING_MS, idleFor, idleState, parseLastActive, secondsLeft,
} = await import("../src/lib/idle.ts");

const MIN = 60 * 1000;

// 설정값: 10분, 만료 1분 전 안내
assert.equal(IDLE_TIMEOUT_MS, 10 * MIN);
assert.equal(IDLE_WARNING_MS, 1 * MIN);

// 쿠키 값 해석
assert.equal(parseLastActive("1793750551000"), 1793750551000);
assert.equal(parseLastActive(undefined), null);
assert.equal(parseLastActive(""), null);
assert.equal(parseLastActive("abc"), null);
assert.equal(parseLastActive("-5"), null);
assert.equal(parseLastActive("1.5e12"), null);

// 상태 경계: 9분 전까지 active, 9분부터 warning, 10분부터 expired
assert.equal(idleState(0), "active");
assert.equal(idleState(8 * MIN + 59_000), "active");
assert.equal(idleState(9 * MIN), "warning");
assert.equal(idleState(9 * MIN + 59_000), "warning");
assert.equal(idleState(10 * MIN), "expired");
assert.equal(idleState(3 * 60 * MIN), "expired");

// 남은 초
assert.equal(secondsLeft(9 * MIN), 60);
assert.equal(secondsLeft(9 * MIN + 500), 60); // 59.5초 → 올림
assert.equal(secondsLeft(9 * MIN + 59_000), 1);
assert.equal(secondsLeft(10 * MIN), 0);
assert.equal(secondsLeft(11 * MIN), 0);

// 흐른 시간. 기기 시계가 5분 넘게 앞서 있으면 잘못된 값으로 보고 0
const now = 1_800_000_000_000;
assert.equal(idleFor(now - 5 * MIN, now), 5 * MIN);
assert.equal(idleFor(now + 1 * MIN, now), 0); // 조금 앞선 시계는 0 (음수가 되지 않음)
assert.equal(idleFor(now + 30 * MIN, now), 0); // 너무 앞선 시계는 지금으로 취급
assert.equal(idleState(idleFor(now + 30 * MIN, now)), "active");

console.log("자동 로그아웃 계산 시험 통과");
