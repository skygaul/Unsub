import Link from "next/link";
import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
        내 구독, 어디서 어떻게
        <br />
        끊는지 알려드려요
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        결제 문자를 붙여넣으면 구독을 자동으로 정리하고, 서비스별 해지 방법과
        환불 규정을 결제 경로에 맞춰 안내해요.
      </p>
      <LoginButton />
      <nav className="flex gap-4 text-sm text-zinc-500">
        <Link href="/guides" className="hover:underline">
          해지 가이드 둘러보기
        </Link>
        <Link href="/privacy" className="hover:underline">
          개인정보처리방침
        </Link>
      </nav>
    </main>
  );
}
