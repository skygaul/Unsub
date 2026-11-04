-- v0.5: 달러 결제 지원. 이미 schema.sql을 실행해 둔 DB에 한 번만 실행하세요.
-- 기존 구독은 모두 원화(KRW)로 남고, 기존 앱 코드도 그대로 동작합니다. (여러 번 실행해도 안전)

alter table public.subscriptions
  add column if not exists currency text not null default 'KRW'
  check (currency in ('KRW', 'USD'));

-- 달러는 센트 단위(소수 둘째 자리)까지 저장해야 하므로 정수 → numeric(12, 2)
alter table public.subscriptions
  alter column amount type numeric(12, 2);
