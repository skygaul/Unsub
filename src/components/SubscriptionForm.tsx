"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BILLING_CYCLES,
  BILLING_CYCLE_LABELS,
  PAYMENT_CHANNELS,
  PAYMENT_CHANNEL_LABELS,
  type Subscription,
} from "@/lib/types";

type ServiceOption = { id: string; name: string };

type Props = {
  services: ServiceOption[];
  /** 있으면 수정 모드 */
  initial?: Subscription;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300";

export default function SubscriptionForm({ services, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [serviceId, setServiceId] = useState(initial?.service_id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [cycle, setCycle] = useState(initial?.billing_cycle ?? "monthly");
  const [nextDate, setNextDate] = useState(initial?.next_billing_date ?? "");
  const [channel, setChannel] = useState(initial?.payment_channel ?? "unknown");
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 결제 문자 자동 입력 (추가 모드에서만 사용)
  const [smsText, setSmsText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<{
    kind: "ok" | "warn" | "error";
    text: string;
  } | null>(null);

  async function onParse() {
    setParseMessage(null);
    if (smsText.trim().length < 5) {
      setParseMessage({ kind: "error", text: "분석할 결제 문자를 붙여넣어 주세요." });
      return;
    }
    setParsing(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: smsText }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setParseMessage({
          kind: "error",
          text: json.error ?? "분석하지 못했어요. 직접 입력해 주세요.",
        });
        return;
      }

      const d = json.data as {
        is_subscription_payment: boolean;
        service_name: string | null;
        service_id: string | null;
        amount: number | null;
        billing_cycle: "monthly" | "yearly" | null;
        next_billing_date: string | null;
        payment_channel: typeof channel;
        notes: string | null;
      };

      if (d.service_id && services.some((s) => s.id === d.service_id)) {
        setServiceId(d.service_id);
      }
      if (d.service_name) setName(d.service_name);
      if (d.amount !== null) setAmount(String(d.amount));
      if (d.billing_cycle) setCycle(d.billing_cycle);
      if (d.next_billing_date) setNextDate(d.next_billing_date);
      setChannel(d.payment_channel);

      const notes: string[] = [];
      if (!d.is_subscription_payment) notes.push("구독 결제 문자가 아닌 것 같아요.");
      if (json.masked) notes.push("긴 숫자(카드·계좌번호 등)는 가리고 분석했어요.");
      if (d.notes) notes.push(d.notes);
      const source =
        json.source === "ai"
          ? "AI가 분석해서"
          : json.source === "rules_partial"
            ? "읽을 수 있는 부분만"
            : "문자에서 바로 읽어서";
      setParseMessage({
        kind:
          d.is_subscription_payment && !d.notes && json.source !== "rules_partial"
            ? "ok"
            : "warn",
        text:
          `${source} 아래 입력칸을 채웠어요. 저장하기 전에 내용이 맞는지 꼭 확인해 주세요.` +
          (json.source === "rules_partial" ? " 빈 칸은 직접 입력해 주세요." : "") +
          (notes.length ? ` ${notes.join(" ")}` : ""),
      });
    } catch {
      setParseMessage({ kind: "error", text: "네트워크 오류가 났어요. 다시 시도해 주세요." });
    } finally {
      setParsing(false);
    }
  }

  function onServiceChange(id: string) {
    setServiceId(id);
    const picked = services.find((s) => s.id === id);
    // 가이드가 있는 서비스를 고르면 이름을 채워 준다 (직접 고친 이름은 덮어쓰지 않는다)
    if (picked && (name.trim() === "" || services.some((s) => s.name === name))) {
      setName(picked.name);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountNumber = Number(amount);
    if (amount.trim() === "" || !Number.isInteger(amountNumber) || amountNumber < 0) {
      setError("금액은 0원 이상의 숫자로 입력해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/subscriptions/${initial!.id}` : "/api/subscriptions",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            amount: amountNumber,
            billing_cycle: cycle,
            next_billing_date: nextDate || null,
            payment_channel: channel,
            status,
            memo: memo || null,
            service_id: serviceId || null,
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
        setSaving(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("네트워크 오류가 났어요. 연결을 확인하고 다시 시도해 주세요.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {!isEdit && (
        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">결제 문자로 자동 입력</h2>
          <p className="mt-1 text-xs text-zinc-500">
            결제 문자나 메일 내용을 붙여넣으면 AI가 서비스, 금액, 주기를 채워 줘요. 원문은
            저장하지 않아요. 카드번호나 계좌번호 같은 개인정보는 지우고 붙여넣어 주세요.
          </p>
          <textarea
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="예: [Web발신] 넷플릭스 17,000원이 결제되었습니다."
            className={`${inputClass} mt-3`}
            aria-label="결제 문자 붙여넣기"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onParse}
              disabled={parsing}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {parsing ? "분석 중..." : "분석해서 채우기"}
            </button>
            <span className="text-xs text-zinc-500">{smsText.length}/2000</span>
          </div>
          {parseMessage && (
            <p
              role={parseMessage.kind === "error" ? "alert" : "status"}
              className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                parseMessage.kind === "ok"
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : parseMessage.kind === "warn"
                    ? "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {parseMessage.text}
            </p>
          )}
        </section>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">서비스 (선택)</span>
        <select
          value={serviceId}
          onChange={(e) => onServiceChange(e.target.value)}
          className={inputClass}
        >
          <option value="">직접 입력할게요</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">
          해지 가이드가 있는 서비스를 고르면 해지 방법을 바로 볼 수 있어요.
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">이름</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          placeholder="예: 넷플릭스"
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">결제 금액 (원)</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            required
            placeholder="17000"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">결제 주기</span>
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value as typeof cycle)}
            className={inputClass}
          >
            {BILLING_CYCLES.map((c) => (
              <option key={c} value={c}>
                {BILLING_CYCLE_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">다음 결제일 (선택)</span>
        <input
          type="date"
          value={nextDate}
          onChange={(e) => setNextDate(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">어디서 결제했나요?</span>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as typeof channel)}
          className={inputClass}
        >
          {PAYMENT_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {PAYMENT_CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">
          결제 경로에 따라 해지하는 곳이 달라요. 모르면 &quot;잘 모르겠어요&quot;를 고르세요.
        </span>
      </label>

      {isEdit && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">상태</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={inputClass}
          >
            <option value="active">이용 중</option>
            <option value="cancelled">해지함</option>
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">메모 (선택)</span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={500}
          rows={3}
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {saving ? "저장 중..." : isEdit ? "수정하기" : "추가하기"}
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
