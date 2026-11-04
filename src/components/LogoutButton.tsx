"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // 자동 로그아웃 감시가 로그아웃한 사용자를 다시 로그인 상태로 보지 않게 마지막 활동 쿠키를 지운다.
    document.cookie = "last_active=; Path=/; Max-Age=0; SameSite=Lax";
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      disabled={loading}
      className="rounded-full border border-zinc-300 px-4 py-2 text-sm transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
