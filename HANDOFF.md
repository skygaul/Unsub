# HANDOFF: 작업 인수인계 문서

다른 모델이나 사람이 이 프로젝트를 이어받을 때 **가장 먼저 읽는 문서**입니다. 마지막 갱신: 2026-11-04.
작업을 끝낼 때마다 **5장(현재 상태)과 6장(다음 할 일)을 갱신**하고, 옛 내용은 덧붙이지 말고 고쳐 주세요. (옛 기록은 git 이력에 있습니다.)

---

## 0. 한 줄 요약

과제 제출용 서비스는 **완성·배포·공개 상태**입니다. 운영 주소 `https://unsub-unsub1.vercel.app`, 저장소 `https://github.com/skygaul/Unsub`(Public). 이후 작업은 **기능 추가·개선**이며, 평가 기간에는 `main` 푸시(= 자동 배포)를 피하세요.

> v0.6(자동 로그아웃)까지 푸시·배포됨. **운영 사이트에서의 실제 동작(안내 창, 자동 로그아웃)은 아직 확인 기록이 없음**. 5장 "v0.6" 참고.

---

## 1. 프로젝트 한눈에 보기

| 항목 | 내용 |
|---|---|
| 서비스 | 결제 문자를 붙여넣으면 구독을 자동으로 정리하고, 서비스별 해지 방법·환불 규정을 결제 경로에 맞춰 안내하는 웹서비스 |
| 이름 | 화면 제목은 **"구독 해지 도우미"**, 저장소·Supabase·Vercel 프로젝트 이름은 **Unsub** (README는 "구독 해지 도우미 (Unsub)"로 병기). PRD 제목에는 아직 "(가칭)"이 남아 있음 |
| 목적 | AIFFEL 과제 "Main Quest 1. 바이브코딩으로 웹 서비스 만들기" 제출. 이후 포트폴리오로 개선 |
| 사용자 | 한국어 사용자. 바이브코딩 입문자. 응답은 **한국어** |
| 작업 폴더 | `C:\Users\ivysh\OneDrive\문서\AIFFEL\first-service` (Windows, Git Bash 가능) |
| 운영 | https://unsub-unsub1.vercel.app (⚠️ `unsub.vercel.app`은 **다른 사람의 사이트**, 쓰지 말 것) |
| 저장소 | https://github.com/skygaul/Unsub (Public, 브랜치 `main`, `gh`는 skygaul 계정) |

### 과제 요구사항 (원문 요약)
1. **PRD**: 문제 정의, 타겟 유저, 핵심 기능(MVP), 화면 구성, 데이터 구조 포함
2. **프론트엔드**: 상호작용 화면 2개 이상 + **구글 로그인**
3. **백엔드/API**: 프레임워크로 API 서버, 최소 CRUD
4. **DB**: 실제 저장·조회
5. **배포**: 접속 가능한 URL. MCP·Skill·AI 기능 확장 시도가 가산 요소
6. **제출**: GitHub URL(PRD 포함) + 배포 URL을 구글폼으로 (https://forms.gle/pNbPPvJCv9t929zr8)

### 사용자 선호 (지켜 주세요)
- **단계별로 진행**하고, 무엇을 했는지와 사용자가 직접 할 일을 구분해서 알려 줌. 큰 변경은 **먼저 방식을 설명하고 동의를 받은 뒤** 구현
- **웹서비스 범위 안에서만** 제안 (모바일 앱, PWA, 푸시 알림, Gmail 연동, 브라우저 확장은 제외하라고 함)
- 계정 생성, OAuth 설정, 키 발급, Supabase SQL 실행, Vercel 설정 같은 **계정 작업은 사용자가 직접** 함. 대신 하지 말고 화면별로 안내
- **API 키·비밀번호는 채팅에 붙여넣지 않도록** 하고, 코드·문서에도 실제 값을 넣지 않음. `.env.local`에만 저장 (git 제외)
- **커밋·푸시는 사용자가 확인한 뒤에** 함 (푸시하면 Vercel에 자동 배포됨)
- 정보 출처와 신뢰도를 솔직하게 표시하는 걸 선호함 (추측과 확인된 사실을 구분)

---

## 2. 기획 배경 (왜 이 서비스인가)

| 단계 | 결과 | 문서 |
|---|---|---|
| 아이디어 탐색 | X 북마크 아티클 허브는 경쟁이 촘촘해 보류 | (대화 기록) |
| 리뷰 분석 | 한국 앱스토어 Top 50 중 20개 앱의 1~3점 리뷰 분석. 반복 불만: 구독 해지 방법 불명, 자동결제 인지 못함, 환불 불투명 | [review-research.md](review-research.md) |
| 경쟁 조사 | 기존 구독 앱은 수동 입력·결제일 알림 위주. 해지 경로 안내는 비어 있음 | PRD 1장 |
| 차별점 | ① 결제 문자 붙여넣기로 자동 입력 ② 결제 경로별 해지 안내 ③ 해지 방해 시 신고 문구(P1, 미구현) ④ 웹 기반 | [PRD.md](PRD.md) |

수익보다 "과제 + 포트폴리오"가 1차 목표. 구독 트래커는 무료 앱이 많아 수익화는 어렵다고 판단함.

---

## 3. 기술 스택과 핵심 결정

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js 16.4.4** (App Router, TypeScript, Turbopack) | 아래 "Next 16 주의사항" 필독 |
| 스타일 | Tailwind CSS v4 | |
| DB / 인증 | **Supabase** (PostgreSQL, Auth, RLS) + `@supabase/ssr` | Google OAuth. 지역 **서울** |
| AI | `@anthropic-ai/sdk` 1.4.0 + zod 4, 기본 모델 `claude-haiku-5-5` (`ANTHROPIC_MODEL`로 변경 가능) | 서버에서만 호출. 문자 파싱(F5) |
| 배포 | **Vercel Hobby**, GitHub `main` 푸시 시 자동 배포(약 40초~1분), 함수 지역 **서울(icn1)** | |
| 환율 | Frankfurter → ExchangeRate-API → 기본값(1,400원) | 키 불필요 |

### Next 16 주의사항 (학습 데이터와 다름)
- `AGENTS.md`와 `node_modules/next/dist/docs/`에 "이 버전은 기존 Next와 다르니 코드 작성 전 문서를 읽어라"는 지침이 있음. **코드를 쓰기 전에 `node_modules/next/dist/docs/01-app/`의 관련 문서 확인**
- **`middleware`가 `proxy`로 이름이 바뀜.** 파일은 `src/proxy.ts`, 함수는 `export async function proxy(...)`
- `cookies()`, `headers()`, `searchParams`, `params`는 **비동기**(`await`). 페이지 props 타입은 전역 `PageProps<"/경로">`, `LayoutProps`, `RouteContext`
- `cacheComponents`, `partialPrefetching`은 **의도적으로 껐음** (`next.config.ts`). 다시 켜지 말 것
- 전역 타입(`PageProps` 등)은 빌드 시 생성되므로 `npx tsc --noEmit` 단독 실행에서는 오류처럼 보여도 `npm run build`는 통과함
- `fetch`의 `next: { revalidate: 초 }` 캐시가 동작함 (환율에 사용)

### 핵심 설계 결정
- **결제 문자 원문은 저장·로그하지 않음.** 파싱 결과만 저장. 12자리 이상 숫자는 분석 전에 `[숫자 가림]`으로 마스킹
- 사용자 데이터는 RLS로 본인만 접근. `services`(해지 가이드)는 누구나 읽기 전용
- 로그인 보호는 `proxy`에서 낙관적 체크만 하고, 실제 권한은 API(`getUser()`)와 RLS에서 확인
- 문자 분석은 **규칙 파서가 먼저**, 애매할 때만 Claude 호출(비용 절감), Claude를 못 쓰면 규칙 결과로 대체
- 모든 해지 가이드에 `verification`(신뢰도)과 `last_verified`(확인일)를 두고 화면에 표시
- 달러는 `currency` 컬럼으로 저장하고, 합계·비중은 **그날의 실제 환율**로 원화 환산(저장 시점 환율은 기록하지 않음)

---

## 4. 파일 지도

```
first-service/
├─ HANDOFF.md / PRD.md / README.md / review-research.md / cancel-guides.json / AGENTS.md
├─ .env.example (템플릿)   .env.local (실제 값, git 제외, 절대 출력·커밋 금지)
├─ supabase/
│  ├─ schema.sql                    테이블 3개 + RLS (새 DB는 이것 + seed.sql)
│  ├─ seed.sql                      services 11행 (scripts/generate-seed.mjs가 생성)
│  └─ migration-v0.5-currency.sql   이미 schema.sql을 실행한 DB에 currency 추가
├─ scripts/
│  ├─ generate-seed.mjs, ts-loader.mjs
│  └─ test-*.mjs                    시험 6종 (아래 "시험" 참고)
└─ src/
   ├─ proxy.ts                      세션 갱신 + 보호 경로 + 자동 로그아웃 확인(lib/supabase/proxy.ts)
   ├─ app/
   │  ├─ layout.tsx                 IdleLogout 포함
   │  ├─ page.tsx                   랜딩·로그인 (?reason=idle 안내)
   │  ├─ dashboard/page.tsx         내 구독, 합계, 해지 완료, 절약액, 구독 분석
   │  ├─ calendar/page.tsx          결제 달력 (?month=YYYY-MM)
   │  ├─ subscriptions/new, [id]    구독 추가·수정 (SubscriptionForm)
   │  ├─ guides/, guides/[serviceId]  해지 가이드 (로그인 불필요)
   │  ├─ privacy/page.tsx           개인정보처리방침 (Google 게시용)
   │  ├─ auth/callback/route.ts     OAuth 코드 → 세션 (열린 리다이렉트 방지)
   │  └─ api/ subscriptions, subscriptions/[id], services, services/[id], parse
   ├─ components/                   LoginButton, LogoutButton, IdleLogout, SubscriptionForm,
   │                                CancelToggleButton, DeleteSubscriptionButton,
   │                                DashboardInsights, VerificationBadge
   └─ lib/
      ├─ types.ts          타입·라벨·금액(원/달러)·날짜 계산, USD_KRW_RATE(기본값)
      ├─ validation.ts     구독 입력 검증 (원화 정수, 달러 소수 둘째 자리)
      ├─ api.ts            requireUser, jsonError, readJson
      ├─ rule-parser.ts    규칙 기반 문자 파서 (SERVICE_PATTERNS, 달러 인식)
      ├─ parse-payment.ts  Claude 호출, 마스킹, 프롬프트
      ├─ exchange-rate.ts  실제 환율 (1시간 캐시, 3초 제한, 폴백)
      ├─ billing-calendar.ts  달력 계산, 월 결제 합계, 절약액
      ├─ insights.ts       분류 표(SERVICE_CATEGORY), 분류별 비중, 정리 안내 규칙
      ├─ idle.ts           자동 로그아웃 상수·계산
      └─ supabase/         client.ts, server.ts, proxy.ts
```

### DB 스키마 요약 (`supabase/schema.sql`)
- `services`: id(text PK), name, channels, cancel, after_cancel, refund, warnings, notes, contact, sources, verification(`page_read|official_search|partial|blog_only`), last_verified. 읽기 전용
- `subscriptions`: id, user_id(`default auth.uid()`), service_id, name, **amount `numeric(12,2)`**, **currency(`KRW|USD`, 기본 KRW)**, billing_cycle, next_billing_date, payment_channel(`direct|apple|google_play|carrier|unknown`), status(`active|cancelled`), memo, created_at. RLS: 본인만 CRUD
- `complaint_drafts`: id, user_id, subscription_id, content, created_at. RLS: 본인만. **화면·API는 아직 없음(P1)**

### API
| 경로 | 설명 |
|---|---|
| `GET/POST /api/subscriptions` | 내 구독 목록·생성. `requireUser()` 인증, `parseSubscriptionInput()` 검증 |
| `PATCH/DELETE /api/subscriptions/[id]` | 수정(보낸 필드만)·삭제. 남의 구독·없는 id는 404(RLS로 0행) |
| `GET /api/services`, `/api/services/[id]` | 해지 가이드 목록·상세 (로그인 불필요) |
| `POST /api/parse` | 문자 → 구독 필드. 로그인 필요, 사용자당 1분 8회(서버 메모리), 5~2000자. `source`: `rules`/`ai`/`rules_partial` |

---

## 5. 현재 상태

### 완료 (배포됨, 운영 검증 완료)
| 버전 | 내용 | 비고 |
|---|---|---|
| v0.1~v0.2 | PRD, 로그인, 구독 CRUD, 해지 가이드 11개, 문자 자동 입력(규칙 + Claude Haiku) | 시험 통과, 운영에서 Google 로그인(테스트 사용자가 아닌 계정 포함)·AI 자동 입력 확인 |
| 배포 | Vercel, Supabase URL 등록, Google 프로덕션 게시, 저장소 Public, 구글폼 제출 준비 완료 | 5c 참고 |
| v0.3 | 해지 완료 버튼 + "해지해서 아끼는 돈" 카드, 결제 달력 `/calendar` | `3843def` |
| v0.4 / v0.4.1 | 대시보드 "구독 분석"(분류별 비중, 비싼 순위, 1년 총액) + "정리해 볼까요?" 안내를 **분류 막대 아래에 합침**. 안내 규칙: 중복 등록, 영상·음악 2개↑, AI 2개↑, 쿠팡 와우+네이버플러스 | `a899154`, `af00e67` |
| v0.5 | 달러 결제(`currency`), **실제 환율** 환산, 문자 인식(`$20.00`, `US$`, `20 USD`, `20달러`), 금액·통화·주기 입력 칸 폭 조정 | `a899154`. **Supabase에서 `migration-v0.5-currency.sql` 실행 완료** |
| 속도 | Vercel 함수 지역을 서울(icn1)로 변경 | 체감 속도 개선 확인 |

### v0.6 자동 로그아웃 (푸시·배포됨, 운영 동작 확인 전)
- **동작**: 로그인한 채 **10분** 활동이 없으면 로그아웃, **만료 1분 전에 "곧 로그아웃돼요, 계속 사용하시겠어요?" 안내**(계속 사용 / 지금 로그아웃). 로그아웃되면 홈에 "자동으로 로그아웃됐어요" 안내
- **구조**: 마지막 활동 시각을 `last_active` 쿠키(ms 타임스탬프, JS가 읽고 써야 해서 httpOnly 아님)에 둠
  - 열린 탭: `src/components/IdleLogout.tsx`가 1초마다 쿠키를 보고 안내·로그아웃. 마우스·키보드·스크롤·터치 활동이 있으면 쿠키를 갱신(10초 간격). 안내가 떠 있을 땐 **버튼으로만** 연장. 여러 탭은 같은 쿠키를 보므로 한 탭에서 활동하면 모두 연장
  - 탭을 닫아 둔 경우: `src/lib/supabase/proxy.ts`가 요청마다 쿠키를 확인해, 10분이 넘었으면 `signOut({ scope: "local" })` 후 `/?reason=idle`로 보냄(API 요청은 401 JSON). 미리 불러오기(prefetch) 요청은 활동으로 치지 않음
  - 상수: `src/lib/idle.ts`의 `IDLE_TIMEOUT_MS`(10분), `IDLE_WARNING_MS`(1분)
- **한계**: 공용 PC에 로그인을 두고 간 경우를 막는 편의 기능이며, 쿠키를 훔친 공격까지 막는 보안 장치는 아님(쿠키 값은 조작 가능). 기기 시계가 5분 넘게 앞서면 지금으로 취급
- **상태**: 시험(`test-idle.mjs`)·린트·빌드 통과, 커밋·푸시 완료. **로그인 상태의 실제 동작(안내 표시, 자동 로그아웃, 탭 닫았다 돌아온 경우)은 에이전트가 직접 보지 못했음**. 다시 확인하려면 `idle.ts`의 시간을 잠깐 짧게(예: 40초/20초) 줄여 로컬에서 시험하고 **반드시 10분/1분으로 되돌릴 것**
- 참고: 개발 모드(`npm run dev`)에서 `style={{user-select:"auto"}}` 때문에 hydration 경고가 뜨면 브라우저 확장 프로그램이 HTML을 바꾼 것이며 코드 문제가 아님(소스에 `user-select` 없음, 시크릿 창에서는 안 뜸)
- DB·API 변경 없음

### 5c. 배포·운영 메모
- **푸시 = 자동 배포.** 코드 변경은 `git add -A && git commit && git push`로 반영(약 1분). **환경변수 변경은 재배포(Deployments > Redeploy)해야 반영**
- Vercel 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`(설정됨). Deployment Protection(Vercel Authentication)은 **Disabled**(켜면 공개 접속 불가)
- Supabase URL Configuration: Site URL `https://unsub-unsub1.vercel.app`, Redirect URL에 `https://unsub-unsub1.vercel.app/auth/callback`과 로컬 주소
- Google Auth Platform: **프로덕션 게시 완료**, Branding(홈페이지, `/privacy`), 승인된 도메인에 `unsub-unsub1.vercel.app` 추가
- **DB 변경이 있는 버전은 푸시 전에 Supabase SQL Editor에서 SQL을 먼저 실행**(로컬과 운영이 같은 DB). 순서가 바뀌면 새 코드가 없는 컬럼을 쓰려 해서 실패함. 새 DB는 `schema.sql` → `seed.sql`만 실행
- Anthropic Console에서 월 사용 한도 설정·잔액 확인 권장. 잔액이 0이면 AI 자동 입력만 규칙 파서로 대체되고 서비스는 계속 동작
- 푸시 전 점검: `npm run lint`, `npm run build`, 시험 6종

### 시험 (`node scripts/<이름>.mjs`, 모두 통과)
| 스크립트 | 확인 내용 |
|---|---|
| `test-rule-parser` | 규칙 파서 16건 (원화·달러·외화·중복 금액·날짜·결제 경로) |
| `test-validation` | 구독 입력 검증 (원화 정수, 달러 소수 둘째 자리) |
| `test-billing-calendar` | 달력(월간·연간·말일 보정), 환산 합계, 절약액 |
| `test-insights` | 분류별 비중, 비싼 순서, 정리 안내 규칙과 분류 연결 |
| `test-exchange-rate` | 환율 문구, **실제 환율 1회 호출**, 장애·이상값 폴백 |
| `test-idle` | 자동 로그아웃 상태 경계(9분 안내, 10분 만료), 시계 오차 |
| `test-ai-parse` | **실제 Claude 호출**(비용 발생, 1센트 이하). 규칙 파서가 처리하지 못하는 문자만 호출 |

---

## 6. 다음 할 일

1. **v0.6 운영 확인**: 배포본에서 자동 로그아웃 동작을 한 번 확인(위 "상태" 참고). 문제가 있으면 `IdleLogout.tsx`·`lib/supabase/proxy.ts`를 점검
2. 평가가 끝나면 5c의 "푸시 = 자동 배포" 제약이 풀림 (그때까지 `main` 푸시 자제)
3. 후보 기능 (웹 범위, 사용자가 고르면 진행): 여러 문자 한꺼번에 분석, 캡처 이미지 업로드 분석, **계정 삭제 버튼**(개인정보처리방침이 "문의로 요청"이라 되어 있음), "정보가 틀렸어요" 제보 버튼(새 테이블 필요), 불만 접수 초안 생성(`complaint_drafts` 활용), 서비스 추가(멜론·지니·밀리의서재·리디 등)
4. 운영 품질: API 테스트 + GitHub Actions CI, 오류 모니터링, 자체 도메인, 호출 제한을 서버 메모리 대신 DB로(서버가 늘어날 때)
5. 이름 확정 시 PRD 제목("가칭") 정리

---

## 7. 해지 가이드 데이터 (`cancel-guides.json`)

11개 서비스: 넷플릭스(`netflix`), 유튜브 프리미엄(`youtube_premium`), 쿠팡 와우(`coupang_wow`), 네이버플러스(`naver_plus`), 디즈니+(`disney_plus`), 티빙(`tving`), 웨이브(`wavve`), ChatGPT(`chatgpt`), Claude(`claude`), 제미나이(`gemini`), 노션(`notion`).

### 신뢰도 수준 (`verification`)
| 값 | 의미 | 해당 서비스 |
|---|---|---|
| `page_read` | 공식 도움말 본문을 직접 열어 대조 | 넷플릭스, 유튜브 프리미엄, ChatGPT, Claude, 제미나이, 디즈니+(구 정책) |
| `official_search` | 공식 도메인 검색 요약으로 확인, 본문 미열람 | 쿠팡 와우, 티빙, 웨이브 |
| `partial` | 일부만 공식 확인 | 노션 (환불은 공식, 해지 경로는 블로그) |
| `blog_only` | 블로그·기사 기준 | 네이버플러스 |

실제 계정 화면에서 클릭해 확인한 항목은 **0건**.

### 알려진 문제
1. **디즈니+ 환불 규정**: 읽은 페이지가 `[이전]` 정책(2025-05-16 시행)임. 개정 정책(신규 2026-05-08, 기존 회원 2026-06-12 적용)의 본문은 읽지 못함 → 환불 내용이 달라졌을 수 있음
2. **네이버플러스**: 네이버 도메인이 검색 도구에서 접근 불가라 공식 확인을 못 함
3. **쿠팡·티빙·웨이브**: 검색 요약 기반이라 공식 본문과 미세하게 다를 수 있음
4. **제미나이**: Android·iOS 경로는 검색 요약 기준
5. 정책은 바뀜. 화면에 `last_verified`를 반드시 표시할 것

### 데이터 수정 절차
1. `cancel-guides.json` 수정 → 2. `node scripts/generate-seed.mjs`로 `supabase/seed.sql` 재생성 → 3. Supabase SQL Editor에서 seed.sql 실행(`on conflict do update`라 재실행 가능) → 4. 커밋·푸시
- 새 서비스를 추가하면 **세 곳에 더** 넣을 것: `src/lib/rule-parser.ts`의 `SERVICE_PATTERNS`(문자 인식 별칭), `src/lib/insights.ts`의 `SERVICE_CATEGORY`(분류, 없으면 "기타"), 가이드 상세의 `KEY_LABELS`·`CHANNEL_TABS`(새 `cancel` 키를 썼다면, 없으면 "공통"으로 항상 표시됨)

---

## 8. 개발 환경 메모

- Node v26.7.0, npm 11.19.0, git 2.56.0. Windows 11. Git Bash(POSIX) 사용 가능. 줄바꿈 경고(LF→CRLF)는 무시해도 됨
- 개발 서버: `npm run dev` (http://localhost:3000). **로컬도 운영과 같은 Supabase DB를 씀** → 로컬에서 만든 구독은 운영에도 보임
- 빌드·린트: `npm run build`, `npm run lint`
- 웹 조사 시 Reddit, 네이버 도메인은 도구에서 접근이 막혀 있음

---

## 9. 보안·개인정보 체크리스트

- [x] `.env.local`이 git에 올라가지 않음 (`.gitignore`의 `.env*`, `.env.example`만 예외). 푸시마다 `git status`로 확인
- [x] `ANTHROPIC_API_KEY`는 서버 코드에서만 사용 (`NEXT_PUBLIC_` 접두사 금지)
- [x] Supabase `service_role` 키는 사용하지 않음
- [x] `/api/parse`는 인증 필요 + 입력 길이 제한 + 원문 로그 출력 금지
- [x] 모든 API가 `getUser()`로 인증 확인 (proxy는 낙관적 체크일 뿐)
- [x] 해지 가이드는 안내 정보이며 법률·금융 자문이 아님을 화면(개인정보처리방침 5장)에 고지
- [x] 환율 조회는 외부 서비스에 사용자 정보를 보내지 않음
- [ ] 신고 문구(P1)는 미구현. 만들면 초안이며 책임은 사용자에게 있음을 고지할 것
- 자동 로그아웃은 편의 기능이지 보안 경계가 아님 (5장 한계 참고)

---

## 10. 이어받는 모델을 위한 첫 5분 체크

1. 이 문서 0장·5장·6장으로 현재 위치 파악 (특히 **푸시 = 자동 배포**)
2. [PRD.md](PRD.md) 12장 변경 이력으로 버전별 변경 파악
3. 코드 작성 전 `node_modules/next/dist/docs/01-app/`의 관련 문서 확인 (Next 16)
4. `.env.local` 존재 여부 확인 → 없으면 사용자에게 `.env.example`을 보고 만들게 안내(값을 채팅에 붙여넣지 않게)
5. `git status`로 미커밋 변경 확인, `npm run build`와 시험 6종이 통과하는지 확인한 뒤 작업 시작
6. DB를 바꾸는 작업이면 SQL 파일을 만들고 **사용자가 Supabase에서 먼저 실행한 뒤** 푸시하게 안내
7. 작업이 끝나면 이 문서의 5·6장과 PRD 12장을 **고쳐서** 갱신(옛 상태 문장을 남기지 말 것)
8. **기능·수집 정보·외부 서비스·쿠키가 바뀌면 `README.md`(주요 기능, 구현 위치 표, 한계)와 `src/app/privacy/page.tsx`(수집 항목, 이용 목적, 외부 서비스, 쿠키, 수정일 `UPDATED`)도 함께 갱신**할 것. 개인정보처리방침은 Google 로그인 게시 때 심사에 쓰인 공개 페이지임 (2026-11-04에 통화·쿠키·환율 서비스·자동 로그아웃 반영)
