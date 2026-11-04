import { LoadingPage, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingPage maxWidth="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="mt-2 h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-48 rounded-full" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>

      <Skeleton className="mt-8 h-6 w-24" />
      <div className="mt-4 flex flex-col gap-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </LoadingPage>
  );
}
