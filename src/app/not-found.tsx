import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        주소가 잘못됐거나 없어진 페이지예요.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          처음으로
        </Link>
        <Link
          href="/guides"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          해지 가이드 보기
        </Link>
      </div>
    </main>
  );
}
