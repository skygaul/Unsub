-- v0.11: "무엇으로 결제했나요?"(결제 수단) 추가. 이미 schema.sql을 실행해 둔 DB에 한 번만 실행하세요.
-- 기존 구독은 모두 'unknown'(잘 모르겠어요)으로 남고, 기존 앱 코드도 그대로 동작합니다. (여러 번 실행해도 안전)
-- card=신용·체크카드, bank=계좌이체·자동이체, simple_pay=간편결제, mobile=휴대폰 소액결제, points=포인트·상품권

alter table public.subscriptions
  add column if not exists payment_method text not null default 'unknown'
  check (payment_method in ('card', 'bank', 'simple_pay', 'mobile', 'points', 'other', 'unknown'));
