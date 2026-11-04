"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IDLE_TIMEOUT_MS,
  LAST_ACTIVE_COOKIE,
  LAST_ACTIVE_COOKIE_MAX_AGE_S,
  idleFor,
  idleState,
  parseLastActive,
  secondsLeft,
} from "@/lib/idle";
import { createClient } from "@/lib/supabase/client";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;
// 활동이 이어지는 동안 쿠키를 너무 자주 쓰지 않게 하는 간격
const WRITE_THROTTLE_MS = 10_000;

function readLastActive() {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LAST_ACTIVE_COOKIE}=`));
  return parseLastActive(match?.split("=")[1]);
}

function writeLastActive(now: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LAST_ACTIVE_COOKIE}=${now}; Path=/; Max-Age=${LAST_ACTIVE_COOKIE_MAX_AGE_S}; SameSite=Lax${secure}`;
}

function clearLastActive() {
  document.cookie = `${LAST_ACTIVE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * 로그인한 채로 IDLE_TIMEOUT_MS 동안 활동이 없으면 로그아웃한다.
 * 만료 직전에는 "계속 사용" 안내를 띄운다. 여러 탭이 같은 쿠키를 보므로 한 탭에서 활동하면 모두 연장된다.
 * 로그인하지 않았으면(쿠키 없음) 아무것도 하지 않는다. 탭을 닫아 둔 경우는 서버(proxy)가 확인한다.
 */
export default function IdleLogout() {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const lastWrite = useRef(0);
  const warningShown = useRef(false);
  const signingOut = useRef(false);
  const continueRef = useRef<HTMLButtonElement>(null);

  const signOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    try {
      await createClient().auth.signOut({ scope: "local" });
    } catch {
      // 네트워크 오류여도 쿠키를 지우고 이동하면 서버가 다음 요청에서 세션을 다시 확인한다.
    }
    clearLastActive();
    router.replace("/?reason=idle");
    router.refresh();
  }, [router]);

  const keepAlive = useCallback(() => {
    const now = Date.now();
    writeLastActive(now);
    lastWrite.current = now;
    warningShown.current = false;
    setSecondsRemaining(null);
  }, []);

  useEffect(() => {
    function check() {
      const last = readLastActive();
      if (last === null) {
        // 로그인 상태가 아니다(또는 로그아웃함)
        warningShown.current = false;
        setSecondsRemaining(null);
        return;
      }
      const idleMs = idleFor(last, Date.now());
      const state = idleState(idleMs);
      if (state === "expired") {
        void signOut();
      } else if (state === "warning") {
        warningShown.current = true;
        setSecondsRemaining(secondsLeft(idleMs));
      } else {
        warningShown.current = false;
        setSecondsRemaining(null);
      }
    }

    function onActivity() {
      // 안내가 떠 있을 때는 버튼으로만 연장한다(실수로 마우스만 움직여 안내가 사라지지 않게)
      if (warningShown.current || signingOut.current) return;
      if (readLastActive() === null) return; // 로그인 상태가 아니면 쿠키를 만들지 않는다
      const now = Date.now();
      if (now - lastWrite.current < WRITE_THROTTLE_MS) return;
      writeLastActive(now);
      lastWrite.current = now;
    }

    check();
    const timer = window.setInterval(check, 1000);
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", check);
    };
  }, [signOut]);

  const visible = secondsRemaining !== null;
  useEffect(() => {
    if (visible) continueRef.current?.focus();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        aria-describedby="idle-desc"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
      >
        <h2 id="idle-title" className="text-lg font-semibold">
          곧 로그아웃돼요
        </h2>
        <p id="idle-desc" className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {Math.round(IDLE_TIMEOUT_MS / 60000)}분 동안 활동이 없어서{" "}
          <b className="text-black dark:text-white">{secondsRemaining}초</b> 뒤에 자동으로
          로그아웃돼요. 계속 사용하시겠어요?
        </p>
        <div className="mt-5 flex gap-3">
          <button
            ref={continueRef}
            onClick={keepAlive}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            계속 사용
          </button>
          <button
            onClick={() => void signOut()}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            지금 로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
