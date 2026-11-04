/** 불러오는 동안 자리를 잡아 주는 회색 블록. 화면 낭독기에는 읽히지 않는다. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

/** loading.tsx에서 쓰는 틀. 폭은 실제 페이지의 main과 맞춘다. */
export function LoadingPage({
  maxWidth,
  children,
}: {
  maxWidth: "max-w-xl" | "max-w-2xl" | "max-w-3xl";
  children: React.ReactNode;
}) {
  return (
    <main
      role="status"
      aria-busy="true"
      className={`mx-auto w-full ${maxWidth} px-6 py-10`}
    >
      <span className="sr-only">불러오는 중이에요</span>
      {children}
    </main>
  );
}
