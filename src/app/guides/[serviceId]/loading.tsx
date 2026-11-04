import { LoadingPage, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingPage maxWidth="max-w-2xl">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-3 h-7 w-56" />
      <Skeleton className="mt-3 h-6 w-40 rounded-full" />

      <Skeleton className="mt-8 h-6 w-36" />
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>

      <Skeleton className="mt-8 h-6 w-32" />
      <Skeleton className="mt-3 h-16" />
      <Skeleton className="mt-8 h-6 w-28" />
      <Skeleton className="mt-3 h-24" />
    </LoadingPage>
  );
}
