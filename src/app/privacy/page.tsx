import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 구독 해지 도우미",
  description: "구독 해지 도우미가 어떤 정보를 어떻게 다루는지 안내해요.",
};

const UPDATED = "2026-11-04";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← 처음으로
      </Link>
      <h1 className="mt-3 text-2xl font-bold">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-zinc-500">시행일 및 최종 수정일: {UPDATED}</p>

      <p className="mt-6 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        구독 해지 도우미(이하 &quot;서비스&quot;)는 교육 과정의 과제로 만든 개인 프로젝트예요.
        서비스를 쓰는 데 꼭 필요한 정보만 다루고, 아래처럼 안내해요.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">1. 수집하는 정보</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <b>Google 로그인 정보</b>: 이메일 주소와 계정 식별자. 로그인할 때 Google에서 전달돼요.
            비밀번호는 받지 않아요.
          </li>
          <li>
            <b>사용자가 직접 입력한 구독 정보</b>: 서비스 이름, 결제 금액과 통화(원 또는 달러),
            결제 주기, 다음 결제일, 결제 경로, 메모.
          </li>
          <li>
            <b>결제 문자 분석용 텍스트</b>: &quot;결제 문자로 자동 입력&quot;에 붙여넣은 내용. 분석에만
            쓰고 <b>저장하지 않아요.</b> 분석 결과(서비스, 금액, 통화, 주기, 결제일)만 사용자가
            확인한 뒤 저장돼요.
          </li>
          <li>
            <b>쿠키</b>: 로그인 상태를 유지하는 로그인 세션 쿠키와, 자동 로그아웃을 위한{" "}
            <b>마지막 활동 시각 쿠키</b>(<code>last_active</code>). 마지막 활동 시각 쿠키에는
            시각을 나타내는 숫자만 들어 있고 개인정보는 없어요. 로그인해 있는 동안에만 쓰이고
            로그아웃하거나 자동 로그아웃되면 지워져요. 광고나 추적에는 쓰지 않아요.
          </li>
        </ul>
        <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          카드번호나 계좌번호 같은 정보는 받지 않아요. 문자에 12자리 이상의 숫자가 들어 있으면 분석
          전에 자동으로 가려요. 그래도 개인정보는 지우고 붙여넣어 주세요.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">2. 이용 목적</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          <li>로그인과 본인 확인, 사용자별 구독 목록 제공</li>
          <li>한 달 구독료 계산, 결제 예정일과 결제 달력 표시, 구독 분석(분류별 비중 등)</li>
          <li>달러 결제 금액을 그날의 환율로 원화로 환산해 합계에 반영</li>
          <li>결제 문자에서 구독 정보를 추출해 입력을 돕는 기능</li>
          <li>10분 동안 활동이 없으면 자동으로 로그아웃해 계정을 보호</li>
        </ul>
        <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          광고나 마케팅에 쓰지 않고, 제3자에게 판매하지 않아요.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">3. 처리를 맡기는 외부 서비스</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-semibold">서비스</th>
                <th className="py-2 font-semibold">맡기는 일</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">Google</td>
                <td className="py-2">로그인(OAuth)</td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">Supabase</td>
                <td className="py-2">로그인 세션 관리, 구독 데이터 저장(데이터베이스)</td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">Vercel</td>
                <td className="py-2">웹사이트 호스팅</td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">Anthropic (Claude API)</td>
                <td className="py-2">
                  규칙으로 읽기 어려운 결제 문자 텍스트의 분석. 숫자를 가린 텍스트만 전달돼요.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Frankfurter, ExchangeRate-API</td>
                <td className="py-2">
                  원/달러 환율 조회. 환율만 가져오고 사용자 정보는 전달하지 않아요.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">4. 보관과 삭제</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          <li>구독 정보는 사용자가 삭제하거나 계정 삭제를 요청할 때까지 보관해요.</li>
          <li>구독 정보는 &quot;내 구독&quot; 화면에서 언제든 직접 수정하거나 삭제할 수 있어요.</li>
          <li>
            계정과 모든 데이터를 지우고 싶다면 아래 문의처로 요청해 주세요. 확인한 뒤 삭제해요.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">5. 안내 정보에 대한 고지</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          서비스가 보여 주는 해지 방법과 환불 규정은 공개된 도움말을 정리한 참고 정보예요. 법률·금융
          자문이 아니고, 서비스 제공사의 정책은 바뀔 수 있어요. 해지하기 전에 해당 서비스의 공식
          안내를 한 번 더 확인해 주세요.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">6. 문의</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          개인정보와 관련한 문의, 삭제 요청은 아래로 남겨 주세요.
        </p>
        <p className="mt-1 text-sm">
          <a
            href="https://github.com/skygaul/Unsub/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            https://github.com/skygaul/Unsub/issues
          </a>
        </p>
      </section>

      <p className="mt-10 text-xs text-zinc-500">
        이 방침은 서비스가 바뀌면 함께 수정하고, 수정일을 위에 표시해요.
      </p>
    </main>
  );
}
