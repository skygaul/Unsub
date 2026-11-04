import { LoadingPage, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingPage maxWidth="max-w-3xl">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </LoadingPage>
  );
}
