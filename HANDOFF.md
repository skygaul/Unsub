# HANDOFF: 작업 인수인계 문서

다른 모델이나 사람이 이 프로젝트를 이어받을 때 **가장 먼저 읽는 문서**입니다. 마지막 갱신: 2026-11-04.
작업을 끝낼 때마다 **5장(현재 상태)과 6장(다음 할 일)을 갱신**하고, 옛 내용은 덧붙이지 말고 고쳐 주세요. (옛 기록은 git 이력에 있습니다.)

---

## 0. 한 줄 요약

과제 제출용 서비스는 **완성·배포·공개 상태**입니다. 운영 주소 `https://unsub-unsub1.vercel.app`, 저장소 `https://github.com/skygaul/Unsub`(Public). 이후 작업은 **기능 추가·개선**이며, 평가 기간에는 `main` 푸시(= 자동 배포)를 피하세요.

> v0.8(보안)까지 푸시·배포됨(`772932b`). **2026-11-04 사용자가 운영 사이트에서 Google 로그인, 구독 추가, 결제 문자 자동 입력, 콘솔에 CSP 위반 없음을 확인함.** 아직 운영에서 확인 기록이 없는 것: 자동 로그아웃(안내 창, 10분 만료), 로딩·오류 화면, 호출 제한의 429. 5장 "v0.6~v0.8" 참고.

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
│  └─ test-*.mjs                    시험 (아래 "시험" 참고)
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
| `POST /api/parse` | 문자 → 구독 필드. 로그인 필요, 사용자당 1분 8회(`LIMITS.parse`), 5~2000자. `source`: `rules`/`ai`/`rules_partial` |

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
| v0.7 | 로그인 쿠키가 없는 방문자는 프록시가 Supabase를 부르지 않음(`lib/supabase/auth-cookie.ts`), 로딩 화면(`loading.tsx` 5개, `components/Skeleton.tsx`), 오류·404 화면(`error.tsx`, `global-error.tsx`, `not-found.tsx`) | `0458949` 푸시·배포됨. 아래 "v0.7" 참고 |
| v0.8 | 보안 헤더·기본 CSP(`next.config.ts`), API 호출 제한 확대(`lib/rate-limit.ts`), Dependabot(`.github/dependabot.yml`) | `772932b` 푸시·배포됨. 아래 "v0.8" 참고 |
| v0.9 | `npm test`로 시험 통합, GitHub Actions CI(린트·시험·빌드), Dependabot에 Actions 추가 | 푸시됨. 위 "v0.9" 참고 |

### v0.6 자동 로그아웃 (푸시·배포됨, 운영 동작 확인 전)
- **동작**: 로그인한 채 **10분** 활동이 없으면 로그아웃, **만료 1분 전에 "곧 로그아웃돼요, 계속 사용하시겠어요?" 안내**(계속 사용 / 지금 로그아웃). 로그아웃되면 홈에 "자동으로 로그아웃됐어요" 안내
- **구조**: 마지막 활동 시각을 `last_active` 쿠키(ms 타임스탬프, JS가 읽고 써야 해서 httpOnly 아님)에 둠
  - 열린 탭: `src/components/IdleLogout.tsx`가 1초마다 쿠키를 보고 안내·로그아웃. 마우스·키보드·스크롤·터치 활동이 있으면 쿠키를 갱신(10초 간격). 안내가 떠 있을 땐 **버튼으로만** 연장. 여러 탭은 같은 쿠키를 보므로 한 탭에서 활동하면 모두 연장
  - 탭을 닫아 둔 경우: `src/lib/supabase/proxy.ts`가 요청마다 쿠키를 확인해, 10분이 넘었으면 `signOut({ scope: "local" })` 후 `/?reason=idle`로 보냄(API 요청은 401 JSON). 미리 불러오기(prefetch) 요청은 활동으로 치지 않음
  - 상수: `src/lib/idle.ts`의 `IDLE_TIMEOUT_MS`(10분), `IDLE_WARNING_MS`(1분)
- **한계**: 공용 PC에 로그인을 두고 간 경우를 막는 편의 기능이며, 쿠키를 훔친 공격까지 막는 보안 장치는 아님(쿠키 값은 조작 가능). 기기 시계가 5분 넘게 앞서면 지금으로 취급
- **상태**: 시험(`test-idle.mjs`)·린트·빌드 통과, 커밋·푸시 완료. **2026-11-04 사용자가 로컬에서 자동 로그아웃 후 홈의 "10분 동안 활동이 없어서 자동으로 로그아웃됐어요" 안내(`/?reason=idle`)까지 확인함.** 안내 창(만료 1분 전), 탭을 닫았다 돌아온 경우, 운영 사이트에서의 동작은 확인 기록 없음. 다시 확인하려면 `idle.ts`의 시간을 잠깐 짧게(예: 40초/20초) 줄여 로컬에서 시험하고 **반드시 10분/1분으로 되돌릴 것**
- 참고: 개발 모드(`npm run dev`)에서 `style={{user-select:"auto"}}` 때문에 hydration 경고가 뜨면 브라우저 확장 프로그램이 HTML을 바꾼 것이며 코드 문제가 아님(소스에 `user-select` 없음, 시크릿 창에서는 안 뜸)
- DB·API 변경 없음

### v0.7 속도·안정성 (푸시·배포됨, 운영 로그인 흐름 확인됨)
- **프록시**: `src/lib/supabase/proxy.ts`가 `sb-*-auth-token`(분할 `.0`, `.1` 포함, `code-verifier` 제외) 쿠키가 없으면 Supabase 클라이언트를 만들지 않고 바로 응답함(보호 경로는 홈으로 이동, 남은 `last_active` 쿠키는 삭제). 쿠키가 있으면 기존대로 `getUser()`로 세션 갱신·자동 로그아웃 확인. 보호 경로 여부, 자동 로그아웃 동작은 그대로
- **검증**: 요청 횟수를 세는 가짜 Supabase를 세워 확인함. 로그인 쿠키 없는 방문자가 `/`, `/privacy`, `/dashboard`를 열면 Supabase 요청 **0건**, `/guides`는 가이드 목록 조회 1건(정상), 올바른 세션 쿠키가 있으면 `GET /auth/v1/user` 1건
- **로딩 화면**: `src/app/{dashboard,calendar,guides,guides/[serviceId],subscriptions}/loading.tsx`. 폭은 실제 페이지와 같게 맞춤. 페이지 레이아웃을 바꾸면 해당 `loading.tsx`도 맞출 것
- **오류 화면**: Next 16.4의 `error.tsx`는 `({ error, retry })`를 받음(`retry`가 안정 버전). 서버 오류는 상세 내용 대신 `digest`만 전달되므로 화면에는 "오류 코드"만 표시. `global-error.tsx`는 자체 `<html>`이 필요하고 전역 CSS가 적용되지 않아 인라인 스타일을 씀
- **확인 상태**: 로컬에서 로딩 화면(대시보드·결제 달력 오갈 때), 404 화면, 로그아웃·재로그인, 로그아웃 상태의 `/dashboard` 이동, 시크릿 창의 공개 페이지를 사용자가 확인함. 운영 사이트에서는 Google 로그인과 대시보드가 정상임(프록시 변경 이후). **아직 확인 못 한 것**: 오류 화면(일부러 오류를 내서) 표시. 서울 지역 변경 후 체감 속도는 사용자가 확인함
- 시험: `node scripts/test-auth-cookie.mjs`

### v0.8 보안 (푸시·배포됨, 운영 확인됨)
- **보안 헤더** (`next.config.ts`의 `headers()`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`(카메라·마이크·위치·결제·USB 차단), `poweredByHeader: false`. HSTS는 Vercel이 이미 붙이므로 넣지 않음
- **CSP** (운영 빌드에서만 적용, 개발 서버는 eval·웹소켓을 써서 제외): `default-src 'self'`, `script-src 'self' 'unsafe-inline'`, `connect-src 'self' <Supabase 주소>`(`NEXT_PUBLIC_SUPABASE_URL`에서 계산), `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. **한계**: Next.js가 인라인 스크립트를 써서 `'unsafe-inline'`이 필요하므로 인라인 스크립트 주입(XSS)까지는 막지 못함. 외부 스크립트·프레임 삽입·플러그인·base 바꿔치기는 막음. 더 강하게 하려면 nonce 방식으로 바꿔야 하고 그러면 모든 페이지가 요청마다 렌더링됨
- **CSP 때문에 조심할 것**: 외부 리소스(분석 스크립트, 외부 이미지·폰트, iframe, 새 API 주소)를 쓰면 `next.config.ts`의 CSP에 그 주소를 추가해야 함. 개발 서버에서는 CSP가 적용되지 않으므로 `npm run build && npm start`로 확인할 것(브라우저 콘솔의 "violates the following Content Security Policy"가 신호)
- **호출 제한** (`src/lib/rate-limit.ts`의 `LIMITS`): 조회 `read` 분당 120회, 생성·수정·삭제 `write` 분당 60회, 문자 분석 `parse` 분당 8회, 사용자별. 한도를 넘으면 `429` + `Retry-After`(`enforceRateLimit()`, `lib/api.ts`). 서버 메모리 기준이라 서버가 여러 개면 인스턴스마다 따로 셈. 기록이 2000개를 넘으면 오래된 사용자 기록을 정리함. **로그인하지 않은 요청의 제한은 없음**(401을 돌려줄 뿐)
- **Dependabot** (`.github/dependabot.yml`): npm 의존성을 매주 월요일(KST) PR로 제안, 마이너·패치는 한 PR로 묶고 메이저는 개별 PR, 열린 PR 최대 5개. **GitHub 저장소 Settings > Code security에서 Dependabot alerts·security updates를 켜는 것은 사용자가 직접 해야 함**. PR은 main에 병합하기 전까지 운영에 반영되지 않음(병합하면 자동 배포되므로 `npm run build`와 시험 확인 후 병합)
- **검증**: 운영 빌드를 띄워 응답 헤더 확인, 브라우저에서 같은 출처 요청 통과·외부 주소 요청은 CSP가 차단·Supabase 주소 요청 통과·화면 정상 동작·콘솔에는 일부러 낸 위반만 있음을 확인함. 호출 제한은 시험(`test-rate-limit.mjs`)으로만 확인했고 **실제 로그인 상태에서 429가 나는 것은 확인 전**. **2026-11-04 사용자가 로컬 운영 빌드(`npm run build && npm start`)에서 구글 로그인, 구독 추가·수정·삭제, 결제 문자 자동 입력, 결제 달력이 정상이고 콘솔에 CSP 위반이 없음을 확인함. GitHub의 Dependabot alerts·security updates도 사용자가 켬.** **배포된 운영 사이트(`unsub-unsub1.vercel.app`)에서도 사용자가 Google 로그인, 구독 추가, 결제 문자 자동 입력이 정상이고 콘솔에 CSP 위반이 없음을 확인함(2026-11-04).** 호출 제한의 429는 운영에서도 확인 기록 없음(시험 스크립트로만 확인)

### v0.9 자동 점검 CI (푸시됨 2026-11-04, GitHub Actions 첫 실행 확인 전)
- **`npm test`** = `scripts/run-tests.mjs`가 `scripts/test-*.mjs`를 모두 실행하고 시험별 결과·요약을 출력, 하나라도 실패하면 종료 코드 1(실패 출력만 자세히 보여 주고 실행 환경의 경고 문구는 걸러 냄). `npm test -- <이름 일부>`로 일부만 실행. 새 `test-*.mjs`를 만들면 자동으로 포함됨. 실제 Claude를 호출하는 `test-ai-parse.mjs`는 제외(`npm run test:ai`로 따로 실행)
- **CI** (`.github/workflows/ci.yml`): `main` 푸시와 PR마다 `npm ci` → `npm run lint` → `npm test` → `npm run build`. Node 26(개발 PC와 같은 메이저, 시험이 Node의 TypeScript 직접 실행을 씀). 빌드는 가짜 Supabase 키(`example.supabase.co`, `dummy`)로 하며 진짜 비밀값은 쓰지 않고 결과물은 배포되지 않음. 같은 브랜치의 연속 푸시는 이전 실행을 취소
- **중요한 한계**: Vercel 자동 배포는 CI 결과를 **기다리지 않음**. main에 푸시하면 CI가 실패해도 배포됨. CI는 ① Dependabot 등 PR을 병합하기 전에 깨졌는지 확인하고 ② 푸시 직후 문제를 빨리 알리는 용도. 배포 자체를 막으려면 PR 방식 + 브랜치 보호 규칙(CI 통과 필수)이 필요하지만, 지금처럼 main에 바로 푸시하는 흐름이 막히므로 적용하지 않았음
- **Dependabot**: npm에 더해 GitHub Actions(`actions/checkout`, `actions/setup-node`) 버전도 매주 점검
- **검증한 것(로컬)**: `npm test` 8개 통과, 시험을 일부러 실패시키면 종료 코드 1과 원인 출력, 필터 동작, `npm ci --dry-run`(잠금 파일 일치), 워크플로 YAML 문법, `.env.local` 없이 가짜 키로 빌드 통과(CI와 같은 조건). **아직 확인 못 한 것**: GitHub Actions에서 실제로 실행된 결과. 특히 `node-version: 26`을 setup-node가 지원하는지는 첫 실행에서 확인해야 함 — 실패하면 Actions 탭에서 "Setup Node" 단계 오류를 보고 버전을 24 등으로 낮출 것(시험이 Node의 TypeScript 직접 실행에 의존하므로 22.18 이상 필요)
- **Dependabot 현황 (2026-11-04 확인)**: 설정 직후 PR 4개가 올라옴. #1 react·react-dom 19.3.0→19.3.1(패치, 낮은 위험), #2 typescript 5.9.3→7.0.2(메이저), #3 eslint 9→10(메이저), #4 @types/node 20→26(메이저, 타입만). **병합하면 main에 들어가 자동 배포되므로 CI가 초록색일 때만 병합**하고, 메이저(#2·#3)는 호환 문제 가능성이 커서 CI 없이 병합하지 말 것. 이 PR들은 CI 도입 전에 만들어져 CI가 안 붙어 있으므로 PR에 `@dependabot rebase` 댓글을 달아 다시 만들게 하면 CI가 실행됨. 메이저 업데이트를 받지 않으려면 PR에 `@dependabot ignore this major version` 댓글
- **보안 알림 minimatch(중간)**: 글롭 처리의 서비스 거부 취약점. `npm audit --omit=dev`는 0개이고 문제의 패키지는 eslint 계열 플러그인이 쓰는 개발용이라 **운영 사이트에는 영향 없음**. Dependabot 보안 업데이트 작업이 실패한 것은 고친 버전(11.0.1)이 메이저라서 이 패키지를 3.x로 요구하는 eslint 플러그인이 받아들이지 못하기 때문(설정 문제 아님). 선택지: 알림을 "개발 도구에만 쓰여 운영 영향 없음"으로 Dismiss, 또는 eslint 플러그인이 새 버전을 낼 때까지 대기. `npm audit`(개발 도구 포함)에는 같은 이유의 moderate 16건이 나옴
- 첫 실행 확인: 푸시 후 저장소의 **Actions** 탭에서 "CI" 실행이 초록색으로 끝나는지 본다. README 맨 위 배지도 초록 "passing"이 됨

### 5c. 배포·운영 메모
- **푸시 = 자동 배포.** 코드 변경은 `git add -A && git commit && git push`로 반영(약 1분). **환경변수 변경은 재배포(Deployments > Redeploy)해야 반영**
- Vercel 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`(설정됨). Deployment Protection(Vercel Authentication)은 **Disabled**(켜면 공개 접속 불가)
- Supabase URL Configuration: Site URL `https://unsub-unsub1.vercel.app`, Redirect URL에 `https://unsub-unsub1.vercel.app/auth/callback`과 로컬 주소
- Google Auth Platform: **프로덕션 게시 완료**, Branding(홈페이지, `/privacy`), 승인된 도메인에 `unsub-unsub1.vercel.app` 추가
- **DB 변경이 있는 버전은 푸시 전에 Supabase SQL Editor에서 SQL을 먼저 실행**(로컬과 운영이 같은 DB). 순서가 바뀌면 새 코드가 없는 컬럼을 쓰려 해서 실패함. 새 DB는 `schema.sql` → `seed.sql`만 실행
- Anthropic Console에서 월 사용 한도 설정·잔액 확인 권장. 잔액이 0이면 AI 자동 입력만 규칙 파서로 대체되고 서비스는 계속 동작
- 푸시 전 점검: `npm run lint`, `npm test`, `npm run build` (CI가 같은 세 가지를 푸시·PR마다 실행함)

### 시험 (`npm test`로 전체 실행, 개별 실행은 `node scripts/<이름>.mjs`, 모두 통과)
| 스크립트 | 확인 내용 |
|---|---|
| `test-rule-parser` | 규칙 파서 16건 (원화·달러·외화·중복 금액·날짜·결제 경로) |
| `test-validation` | 구독 입력 검증 (원화 정수, 달러 소수 둘째 자리) |
| `test-billing-calendar` | 달력(월간·연간·말일 보정), 환산 합계, 절약액 |
| `test-insights` | 분류별 비중, 비싼 순서, 정리 안내 규칙과 분류 연결 |
| `test-exchange-rate` | 환율 문구, **실제 환율 1회 호출**, 장애·이상값 폴백 |
| `test-idle` | 자동 로그아웃 상태 경계(9분 안내, 10분 만료), 시계 오차 |
| `test-auth-cookie` | Supabase 로그인 쿠키 판별(분할 쿠키, code-verifier 제외) |
| `test-rate-limit` | 호출 제한 한도·차단·재시도 시간·기록 정리 |
| `test-ai-parse` | **실제 Claude 호출**(비용 발생, 1센트 이하). 규칙 파서가 처리하지 못하는 문자만 호출 |

---

## 6. 다음 할 일

1. **운영에서 아직 확인 기록이 없는 것**: 자동 로그아웃(만료 1분 전 안내 창, 10분 만료, 탭을 닫았다 돌아온 경우), 오류 화면. 문제가 있으면 `IdleLogout.tsx`·`lib/supabase/proxy.ts`·`error.tsx`를 점검
2. 평가가 끝나면 5c의 "푸시 = 자동 배포" 제약이 풀림 (그때까지 `main` 푸시 자제)
3. 후보 기능 (웹 범위, 사용자가 고르면 진행): 여러 문자 한꺼번에 분석, 캡처 이미지 업로드 분석, **계정 삭제 버튼**(개인정보처리방침이 "문의로 요청"이라 되어 있음), "정보가 틀렸어요" 제보 버튼(새 테이블 필요), 불만 접수 초안 생성(`complaint_drafts` 활용), 서비스 추가(멜론·지니·밀리의서재·리디 등)
4. 운영 품질: ~~GitHub Actions CI~~(v0.9에서 도입), API 통합 테스트(로그인 필요), 오류 모니터링, 자체 도메인, 호출 제한을 서버 메모리 대신 DB로(서버가 늘어날 때)
5. 이름 확정 시 PRD 제목("가칭") 정리

---

## 7. 해지 가이드 데이터 (`cancel-guides.json`)

11개 서비스: 넷플릭스(`netflix`), 유튜브 프리미엄(`youtube_premium`), 쿠팡 와우(`coupang_wow`), 네이버플러스(`naver_plus`), 디즈니+(`disney_plus`), 티빙(`tving`), 웨이브(`wavve`), ChatGPT(`chatgpt`), Claude(`claude`), 제미나이(`gemini`), 노션(`notion`).

### 신뢰도 수준 (`verification`)
| 값 | 의미 | 해당 서비스 |
|---|---|---|
| `page_read` | 공식 도움말 본문을 직접 열어 대조 | 넷플릭스, 유튜브 프리미엄, ChatGPT, Claude, 제미나이, 디즈니+(구 정책), **네이버플러스·노션(2026-11-04, 아래 참고)** |
| `official_search` | 공식 도메인 검색 요약으로 확인, 본문 미열람 | 쿠팡 와우, 티빙, 웨이브 |
| `partial` | 일부만 공식 확인 | (현재 없음) |
| `blog_only` | 블로그·기사 기준 | (현재 없음) |

**노션 갱신 (2026-11-04)**: 사용자가 준 공식 도움말 주소(https://www.notion.com/help/upgrade-or-downgrade-your-plan)를 웹 읽기 도구로 직접 읽고, 기존 환불 정책 페이지 내용과 합쳐 `notion`을 다시 썼음(해지 경로 Settings > Billing > Change plan > Downgrade, 모바일 앱에서는 변경 불가, Apple 구독은 Apple에 문의, 환불 규칙, 워크스페이스 단위 청구·결제 실패 시 재시도 등). 신뢰도 `partial` → `page_read`. **아직 확인하지 못한 것**: 다운그레이드 후 기능 변화(`notion.com/help/plan-downgrade`), Google Play 구독의 구체적인 취소 단계(공식 페이지에 없음). 이 두 가지는 `notes`에 그대로 적어 둠. **`notes`와 `corrections`는 내부 메모용이며 가이드 화면의 "참고" 섹션을 없애서(2026-11-04) 사용자에게 보이지 않음**(DB에는 `notes`로 합쳐 저장됨). **사용자에게 꼭 알려야 하는 주의 문장은 `warnings`(주의사항)나 해당 항목(`cancel`, `after_cancel`, `refund`)에 넣을 것.** 이 기준으로 쿠팡 와우의 "무료체험 중에는 즉시 해지 불가"를 `warnings`로 옮겼음

**네이버플러스 갱신 (2026-11-04)**: 에이전트는 `help.naver.com`에 접속할 수 없어(브라우저·웹 읽기 도구 모두 차단), **사용자가 공식 도움말(https://help.naver.com/service/23168/bookmark/20281?osType=COMMONOS) 본문을 복사해 제공한 내용**으로 `cancel-guides.json`의 `naver_plus`를 다시 썼음(정기결제 해지·즉시 종료 경로, 월간·연간 이용권별 환불 규칙, 청약철회 100%/90%, 결제수단별 환불 시점, 주의사항 6개). 블로그 기반 옛 내용은 제거. 이 항목은 서비스별 `last_verified: "2026-11-04"`를 가지며, **다른 서비스는 meta 날짜(2026-11-03)를 그대로 씀**(`scripts/generate-seed.mjs`가 서비스별 `last_verified`를 우선 사용). **DB 반영은 `supabase/seed.sql`을 Supabase SQL Editor에서 실행해야 함.**

실제 계정 화면에서 클릭해 확인한 항목은 **0건**.

### 알려진 문제
1. **디즈니+ 환불 규정**: 읽은 페이지가 `[이전]` 정책(2025-05-16 시행)임. 개정 정책(신규 2026-05-08, 기존 회원 2026-06-12 적용)의 본문은 읽지 못함 → 환불 내용이 달라졌을 수 있음
2. ~~**네이버플러스**: 공식 확인 못 함~~ **해결(2026-11-04)**: 공식 도움말 본문(사용자 제공)으로 갱신. 단 에이전트가 직접 열어 본 것은 아니고, 실제 계정 화면 클릭 확인은 0건
3. **쿠팡·티빙·웨이브**: 검색 요약 기반이라 공식 본문과 미세하게 다를 수 있음
4. **제미나이**: Android·iOS 경로는 검색 요약 기준
5. 정책은 바뀜. 화면에 `last_verified`를 반드시 표시할 것

### 데이터 수정 절차
1. `cancel-guides.json` 수정 → 2. `node scripts/generate-seed.mjs`로 `supabase/seed.sql` 재생성 → 3. Supabase SQL Editor에서 seed.sql 실행(`on conflict do update`라 재실행 가능) → 4. 커밋·푸시
- 서비스 한 개만 고쳤을 때는 그 서비스에 `"last_verified": "YYYY-MM-DD"`를 넣으면 그 서비스의 확인일만 바뀜(없으면 meta 날짜). `refund`·`after_cancel` 문자열의 `\n`은 화면에서 줄바꿈으로 표시됨
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
5. `git status`로 미커밋 변경 확인, `npm run lint`, `npm test`, `npm run build`가 통과하는지 확인한 뒤 작업 시작
6. DB를 바꾸는 작업이면 SQL 파일을 만들고 **사용자가 Supabase에서 먼저 실행한 뒤** 푸시하게 안내
7. 작업이 끝나면 이 문서의 5·6장과 PRD 12장을 **고쳐서** 갱신(옛 상태 문장을 남기지 말 것)
8. **기능·수집 정보·외부 서비스·쿠키가 바뀌면 `README.md`(주요 기능, 구현 위치 표, 한계)와 `src/app/privacy/page.tsx`(수집 항목, 이용 목적, 외부 서비스, 쿠키, 수정일 `UPDATED`)도 함께 갱신**할 것. 개인정보처리방침은 Google 로그인 게시 때 심사에 쓰인 공개 페이지임 (2026-11-04에 통화·쿠키·환율 서비스·자동 로그아웃 반영)
