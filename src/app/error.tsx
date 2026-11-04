"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // 서버에서 난 오류는 자세한 내용 대신 오류 코드(digest)만 전달된다. 문의할 때 알려 달라고 안내한다.
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">문제가 생겼어요</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        화면을 불러오는 중에 오류가 났어요. 잠시 후 다시 시도해 주세요. 입력해 둔 구독 정보는
        그대로 안전해요.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => retry()}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          처음으로
        </Link>
      </div>
      {digest && <p className="text-xs text-zinc-500">오류 코드: {digest}</p>}
    </main>
  );
}
