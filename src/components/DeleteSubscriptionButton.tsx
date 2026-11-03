"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteSubscriptionButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm(`"${name}" 구독을 목록에서 삭제할까요?\n(서비스의 실제 구독은 해지되지 않아요.)`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "삭제하지 못했어요.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 났어요.");
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        onClick={onDelete}
        disabled={loading}
        className="text-sm text-red-600 hover:underline disabled:opacity-60"
      >
        {loading ? "삭제 중..." : "삭제"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
