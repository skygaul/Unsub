# 구독 해지 도우미 (Unsub)

결제 문자를 붙여넣으면 구독을 자동으로 정리하고, 서비스별 해지 방법과 환불 규정을 **결제 경로에 맞춰** 안내하는 웹서비스입니다.

**배포 주소: https://unsub-unsub1.vercel.app** (Google 로그인으로 바로 사용할 수 있습니다)

## 문제와 해결
구독은 쉽게 가입되지만 해지는 어렵습니다. 같은 서비스라도 앱스토어, 구글 플레이, 카드사, 통신사, 서비스 웹사이트 등 **어디서 결제했는지에 따라 해지하는 곳이 달라서** 해지 메뉴를 찾지 못하거나 환불 규정을 놓치기 쉽습니다.

이 서비스는 결제 문자를 붙여넣으면 서비스·금액·주기를 자동으로 채워 구독을 정리하고, 결제 경로별 해지 방법과 환불 규정을 보여 줍니다.

## 주요 기능
- **Google 로그인**: Supabase Auth (OAuth)
- **내 구독 관리**: 구독 추가·수정·삭제, 한 달 구독료 합계, 7일 안에 결제될 구독 표시
- **결제 문자 자동 입력**: 문자를 붙여넣으면 서비스, 금액, 결제 주기를 읽어 입력칸을 채움 (저장 전에 사용자가 확인)
- **해지 가이드**: 11개 서비스(넷플릭스, 유튜브 프리미엄, 쿠팡 와우, 네이버플러스, 디즈니+, 티빙, 웨이브, ChatGPT, Claude, 제미나이, 노션)의 해지 방법과 환불 규정. 결제 경로별 탭, 공식 출처 링크, 정보 검증 수준 배지 제공

## 평가 항목별 구현 위치
| 평가 항목 | 구현 내용 | 위치 |
|---|---|---|
| PRD | 문제·유저·기능·데이터 정의, 변경 이력 | [PRD.md](PRD.md) |
| 프론트엔드 | 화면 5종(랜딩·로그인, 내 구독, 구독 추가·수정, 해지 가이드 목록·상세) + Google 로그인 | `src/app/`, `src/components/` |
| 백엔드/API | 구독 CRUD, 서비스 조회, 문자 분석 API (인증·입력 검증 포함) | `src/app/api/` |
| DB 연동 | Supabase PostgreSQL, 사용자별 데이터 분리(RLS) | [supabase/schema.sql](supabase/schema.sql), [supabase/seed.sql](supabase/seed.sql) |
| 배포·AI 확장 | Vercel 배포(GitHub 푸시 시 자동 재배포), Claude API로 결제 문자 분석 | `src/lib/parse-payment.ts`, `src/lib/rule-parser.ts` |

## AI 활용 (결제 문자 분석)
- **하이브리드 구조**: 비용이 들지 않는 규칙 기반 파서가 서비스와 금액이 명확한 문자를 먼저 처리하고, 애매한 경우에만 Claude(`claude-haiku-5-5`)를 호출합니다.
- **개인정보 보호**: 12자리 이상 숫자(카드·계좌번호 등)는 분석 전에 가립니다. 문자 원문은 저장하지 않습니다.
- **안전장치**: 프롬프트 인젝션 방어, 사용자별 호출 제한(분당 8회), 분석 결과는 서비스 목록에 있는 값만 허용, 사용자가 확인한 뒤에만 저장합니다.
- **장애 대응**: AI를 쓸 수 없으면(키 없음, 한도, 오류) 규칙으로 읽은 부분만 채우고 나머지는 직접 입력하게 합니다.
- 이 프로젝트는 **바이브코딩**(Claude Code)으로 기획부터 배포까지 진행했습니다.

## 기술 스택
Next.js 16 (App Router, TypeScript) · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS) · Anthropic Claude API · Vercel

## 알려진 한계
- 일부 서비스(디즈니+, 네이버플러스)의 환불 규정은 검증이 덜 끝났습니다. 각 가이드의 검증 수준 배지로 구분해 표시합니다.
- 해지 안내는 공개된 도움말을 정리한 참고 정보이며, 서비스 정책은 바뀔 수 있습니다. 해지 전에 공식 안내를 한 번 더 확인해 주세요.
- 문자 분석의 호출 제한은 서버 인스턴스 메모리 기준입니다.

## 관련 문서
- 기획 문서: [PRD.md](PRD.md)
- 해지 가이드 원본 데이터: [cancel-guides.json](cancel-guides.json)
- 사용자 리뷰 조사: [review-research.md](review-research.md)
- 작업 인수인계 (진행 상황, 다음 할 일): [HANDOFF.md](HANDOFF.md)
- 개인정보처리방침: https://unsub-unsub1.vercel.app/privacy

---

## 개발자용

### 로컬 실행
```bash
npm install
cp .env.example .env.local   # 값을 채운 뒤 저장
npm run dev
```

### 환경 변수
| 이름 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(또는 publishable) 키 |
| `ANTHROPIC_API_KEY` | Claude API 키 (서버 전용, 없으면 규칙 파서만 동작) |
| `ANTHROPIC_MODEL` | (선택) 사용할 모델. 기본값 `claude-haiku-5-5` |

### Supabase 설정
1. Supabase 프로젝트를 만든다.
2. SQL Editor에서 [supabase/schema.sql](supabase/schema.sql)을 실행하고, 이어서 [supabase/seed.sql](supabase/seed.sql)을 실행한다.
3. Authentication > Providers에서 Google을 켜고 Google Cloud의 OAuth Client ID/Secret을 입력한다.
4. Authentication > URL Configuration에 Site URL과 Redirect URL(`http://localhost:3000/auth/callback`, 배포 주소의 `/auth/callback`)을 추가한다.

`cancel-guides.json`을 수정했다면 `node scripts/generate-seed.mjs`로 seed.sql을 다시 만든다.
