"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Status } from "@/lib/types";

/** 구독을 "해지함"으로 표시하거나 "이용 중"으로 되돌린다. 서비스의 실제 구독은 바뀌지 않는다. */
export default function CancelToggleButton({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: Status;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelling = status === "active";

  async function onToggle() {
    if (
      cancelling &&
      !window.confirm(
        `"${name}" 해지를 마쳤나요?\n목록에서 "해지함"으로 옮기고, 아끼는 금액에 더해요.\n(서비스의 실제 구독은 직접 해지해야 해요.)`,
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: cancelling ? "cancelled" : "active" }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "상태를 바꾸지 못했어요.");
        setLoading(false);
        return;
      }
      router.refresh();
      setLoading(false);
    } catch {
      setError("네트워크 오류가 났어요.");
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        onClick={onToggle}
        disabled={loading}
        className="font-medium text-emerald-700 hover:underline disabled:opacity-60 dark:text-emerald-400"
      >
        {loading ? "처리 중..." : cancelling ? "해지 완료" : "이용 중으로 되돌리기"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
