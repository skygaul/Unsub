// 사용자별 호출 제한. 서버 인스턴스의 메모리에 기록하므로 서버가 여러 개로 늘면 인스턴스마다 따로 센다.
// 남용을 막는 최소한의 장치이고, 정확한 제한이 필요해지면 DB나 Redis 같은 공용 저장소로 옮길 것.

export type Limit = { windowMs: number; max: number };

/** 이름별 제한. 한 사용자가 windowMs 안에 max번을 넘기면 막는다. */
export const LIMITS = {
  /** 구독 목록 조회 */
  read: { windowMs: 60_000, max: 120 },
  /** 구독 생성·수정·삭제 */
  write: { windowMs: 60_000, max: 60 },
  /** 결제 문자 분석(AI 비용이 들 수 있음) */
  parse: { windowMs: 60_000, max: 8 },
} as const satisfies Record<string, Limit>;

export type LimitName = keyof typeof LIMITS;

export type RateLimitResult = { limited: false } | { limited: true; retryAfterSeconds: number };

/** 기록이 이 개수를 넘으면 오래된 사용자 기록을 한꺼번에 정리한다(메모리가 계속 늘지 않게). */
const SWEEP_THRESHOLD = 2000;

export class RateLimiter<Name extends string = LimitName> {
  private hits = new Map<string, number[]>();
  private limits: Record<Name, Limit>;
  private now: () => number;

  constructor(limits: Record<Name, Limit>, now: () => number = Date.now) {
    this.limits = limits;
    this.now = now;
  }

  /** 호출 한 번을 기록하고, 제한을 넘었는지 알려 준다. 넘었으면 기록하지 않는다. */
  check(name: Name, key: string): RateLimitResult {
    const { windowMs, max } = this.limits[name];
    const now = this.now();
    const id = `${name}:${key}`;

    const recent = (this.hits.get(id) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      this.hits.set(id, recent);
      const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
      return { limited: true, retryAfterSeconds };
    }

    recent.push(now);
    this.hits.set(id, recent);
    if (this.hits.size > SWEEP_THRESHOLD) this.sweep(now);
    return { limited: false };
  }

  /** 가장 긴 제한 시간보다 오래 아무 호출이 없던 기록을 지운다. */
  private sweep(now: number) {
    const longest = Math.max(...Object.values<Limit>(this.limits).map((l) => l.windowMs));
    for (const [id, times] of this.hits) {
      if (times.length === 0 || now - times[times.length - 1] >= longest) this.hits.delete(id);
    }
  }

  /** 시험에서 기록 크기를 확인하는 용도 */
  get size() {
    return this.hits.size;
  }
}

/** 서버 전체에서 공유하는 제한기 */
export const limiter = new RateLimiter(LIMITS);
