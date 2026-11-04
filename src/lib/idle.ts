// 일정 시간 아무 활동이 없으면 자동 로그아웃하기 위한 공통 값과 계산.
// 마지막 활동 시각은 `last_active` 쿠키(밀리초 타임스탬프)에 두고,
// 브라우저(IdleLogout)와 서버(proxy)가 같은 쿠키를 보고 판단한다.

/** 이 시간 동안 활동이 없으면 로그아웃한다. */
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

/** 로그아웃 이만큼 전부터 "계속 사용하시겠어요?" 안내를 띄운다. */
export const IDLE_WARNING_MS = 60 * 1000;

export const LAST_ACTIVE_COOKIE = "last_active";

/** 쿠키 자체의 수명. 판단은 값(시각)으로 하고, 이 값은 오래 남아 있지 않게 하는 정도의 의미다. */
export const LAST_ACTIVE_COOKIE_MAX_AGE_S = 24 * 60 * 60;

/** 기기 시계가 서버와 이만큼 이상 앞서 있으면 잘못된 값으로 보고 지금으로 취급한다. */
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;

/** 쿠키 문자열 값을 타임스탬프로. 없거나 이상한 값이면 null. */
export function parseLastActive(value: string | undefined | null): number | null {
  if (!value || !/^\d{10,15}$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
}

/** 마지막 활동 이후 흐른 시간(ms). 시계가 너무 앞서 있으면 0으로 본다. */
export function idleFor(lastActive: number, now: number) {
  const diff = now - lastActive;
  return diff < -MAX_FUTURE_SKEW_MS ? 0 : Math.max(diff, 0);
}

export type IdleState = "active" | "warning" | "expired";

/** 흐른 시간으로 상태를 정한다. warning은 만료 직전 안내 구간이다. */
export function idleState(idleMs: number): IdleState {
  if (idleMs >= IDLE_TIMEOUT_MS) return "expired";
  if (idleMs >= IDLE_TIMEOUT_MS - IDLE_WARNING_MS) return "warning";
  return "active";
}

/** 만료까지 남은 초(올림). 이미 지났으면 0. */
export function secondsLeft(idleMs: number) {
  return Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - idleMs) / 1000));
}
