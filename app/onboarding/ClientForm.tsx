"use client";

import { setUsername } from "@/app/actions/setUsername";
import { normalizeUsername, validateUsername } from "@/lib/profile/username";
import { useEffect, useMemo, useState, useTransition } from "react";

export default function ClientForm() {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalized = useMemo(() => normalizeUsername(value), [value]);
  const valid = validateUsername(normalized);

  useEffect(() => {
    // Defer to API endpoint to avoid bundling server secrets on client
    let active = true;
    (async () => {
      if (!valid.ok) {
        setAvailable(null);
        return;
      }
      setChecking(true);
      try {
        const res = await fetch(
          `/api/profile/username/availability?q=${encodeURIComponent(
            normalized
          )}`
        );
        const j = (await res.json()) as { available?: boolean };
        if (active) setAvailable(!!j.available);
      } catch {
        if (active) setAvailable(null);
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [normalized, valid.ok]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!valid.ok) {
      setMessage(valid.reason || "유효하지 않은 닉네임");
      return;
    }
    if (available === false) {
      setMessage("이미 사용 중입니다");
      return;
    }
    startTransition(async () => {
      try {
        await setUsername({ username: normalized });
        window.location.href = "/create/movie";
      } catch (err) {
        const msg = err instanceof Error ? err.message : "저장 실패";
        setMessage(msg);
      }
    });
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="rounded-2xl border p-5 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">닉네임 설정</h1>
        <p className="text-sm text-gray-600 mb-4">
          공개 프로필 주소로 사용됩니다:{" "}
          <code>/u/{normalized || "username"}</code>
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">닉네임</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="3~20자, 영문/숫자/-/_"
            />
            <div className="text-xs mt-1">
              {!valid.ok && value
                ? valid.reason
                : checking
                ? "사용 가능 여부 확인 중…"
                : available === true
                ? "사용 가능합니다"
                : available === false
                ? "이미 사용 중입니다"
                : ""}
            </div>
          </div>
          <div className="text-sm text-red-600">{message}</div>
          <button
            type="submit"
            disabled={isPending || !valid.ok || available === false}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {isPending ? "저장 중…" : "저장하고 시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
