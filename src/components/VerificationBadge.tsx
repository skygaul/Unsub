import { VERIFICATION_LABELS, type Verification } from "@/lib/types";

const STYLES: Record<Verification, string> = {
  page_read: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  official_search: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  blog_only: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function VerificationBadge({
  verification,
  lastVerified,
}: {
  verification: Verification;
  lastVerified?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[verification]}`}
    >
      {VERIFICATION_LABELS[verification]}
      {lastVerified ? ` · ${lastVerified} 확인` : ""}
    </span>
  );
}
