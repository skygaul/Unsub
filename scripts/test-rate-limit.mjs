// 호출 제한 시험. 사용: node scripts/test-rate-limit.mjs
import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);

const { LIMITS, RateLimiter } = await import("../src/lib/rate-limit.ts");

// 설정값: 문자 분석은 분당 8회, 저장·수정·삭제는 분당 60회, 조회는 분당 120회
assert.deepEqual(LIMITS.parse, { windowMs: 60_000, max: 8 });
assert.deepEqual(LIMITS.write, { windowMs: 60_000, max: 60 });
assert.deepEqual(LIMITS.read, { windowMs: 60_000, max: 120 });

// 시계를 우리가 움직이는 제한기
let t = 1_000_000;
const limiter = new RateLimiter({ a: { windowMs: 60_000, max: 3 }, b: { windowMs: 10_000, max: 1 } }, () => t);

// max번까지는 통과, 그다음부터 막힘
for (let i = 0; i < 3; i++) assert.deepEqual(limiter.check("a", "u1"), { limited: false });
const blocked = limiter.check("a", "u1");
assert.equal(blocked.limited, true);
assert.equal(blocked.retryAfterSeconds, 60); // 첫 호출이 1분 뒤에 빠지므로

// 막힌 호출은 기록되지 않는다 (계속 시도해도 풀리는 시점이 밀리지 않음)
t += 30_000;
const stillBlocked = limiter.check("a", "u1");
assert.equal(stillBlocked.limited, true);
assert.equal(stillBlocked.retryAfterSeconds, 30);

// 사용자별, 이름별로 따로 센다
assert.deepEqual(limiter.check("a", "u2"), { limited: false });
assert.deepEqual(limiter.check("b", "u1"), { limited: false });
assert.equal(limiter.check("b", "u1").limited, true);

// 시간이 지나면 풀린다
t += 31_000; // 첫 호출로부터 61초
assert.deepEqual(limiter.check("a", "u1"), { limited: false });

// 남은 시간은 올림하고 최소 1초
t += 9_999;
const near = limiter.check("b", "u1");
assert.deepEqual(near, { limited: false }); // b의 10초 창이 지나 풀림

// 오래 호출이 없던 사용자 기록은 정리된다(메모리가 계속 늘지 않음)
const sweeper = new RateLimiter({ a: { windowMs: 1_000, max: 1 } }, () => t);
for (let i = 0; i < 2100; i++) sweeper.check("a", `user${i}`);
assert.ok(sweeper.size > 2000);
t += 5_000;
sweeper.check("a", "late-user"); // 임계치를 넘은 상태에서 호출되면 오래된 기록을 정리
assert.ok(sweeper.size < 100, `정리 후 크기 ${sweeper.size}`);

console.log("호출 제한 시험 통과");
