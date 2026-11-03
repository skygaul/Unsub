# 구독 해지 도우미

결제 문자를 붙여넣으면 구독을 자동으로 정리하고, 서비스별 해지 방법과 환불 규정을 결제 경로에 맞춰 안내하는 웹서비스입니다.

- **작업 인수인계 (현재 진행 상황, 다음 할 일): [HANDOFF.md](HANDOFF.md)**
- 기획 문서: [PRD.md](PRD.md)
- 해지 가이드 원본 데이터: [cancel-guides.json](cancel-guides.json)
- 사용자 리뷰 조사: [review-research.md](review-research.md)

## 기술 스택
Next.js (App Router) · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS) · Claude API · Vercel

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값을 채운 뒤 저장
npm run dev
```

## 결제 문자 자동 입력 (현재 상태)
- **규칙 기반 파서**(무료)가 서비스와 금액이 명확한 문자를 먼저 처리합니다.
- **Claude(Haiku) 분석은 아직 연결하지 않았습니다.** `ANTHROPIC_API_KEY`가 없으면 규칙으로 읽은 부분만 채우고 나머지는 직접 입력합니다. 키를 설정하면 애매한 문자를 AI가 분석합니다. 전환 절차는 [HANDOFF.md](HANDOFF.md) 맨 위를 참고하세요.

## 환경 변수
| 이름 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(또는 publishable) 키 |
| `ANTHROPIC_API_KEY` | Claude API 키 (서버 전용) |

## Supabase 설정
1. Supabase 프로젝트를 만든다.
2. SQL Editor에서 [supabase/schema.sql](supabase/schema.sql)을 실행하고, 이어서 [supabase/seed.sql](supabase/seed.sql)을 실행한다.
3. Authentication > Providers에서 Google을 켜고 Google Cloud의 OAuth Client ID/Secret을 입력한다.
4. Authentication > URL Configuration에 Site URL과 Redirect URL(`http://localhost:3000/auth/callback`, 배포 주소의 `/auth/callback`)을 추가한다.

`cancel-guides.json`을 수정했다면 `node scripts/generate-seed.mjs`로 seed.sql을 다시 만든다.
