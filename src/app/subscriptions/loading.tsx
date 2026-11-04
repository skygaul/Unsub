import { LoadingPage, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <LoadingPage maxWidth="max-w-xl">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-3 h-7 w-32" />
      <div className="mt-6 flex flex-col gap-5">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    </LoadingPage>
  );
}
