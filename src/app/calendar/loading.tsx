import { LoadingPage, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingPage maxWidth="max-w-3xl">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-8 w-12 rounded-full" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-8 w-12 rounded-full" />
      </div>

      <Skeleton className="mt-4 h-24 rounded-xl" />

      <div className="mt-4 grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-md" />
        ))}
      </div>
    </LoadingPage>
  );
}
