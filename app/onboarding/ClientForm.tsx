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
      <div className="rounded-2xl border border-border p-5 shadow-sm bg-card">
        <h1 className="text-xl font-semibold mb-3 text-foreground">
          닉네임 설정
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          공개 프로필 주소로 사용됩니다:{" "}
          <code className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground border border-primary">
            /u/{normalized || "username"}
          </code>
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-foreground">닉네임</label>
            <input
              className="w-full border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="3~20자, 영문/숫자/-/_"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              maxLength={20}
              pattern="[a-z0-9_-]+"
              title="영문 소문자, 숫자, -, _ 만 입력 가능합니다"
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-muted-foreground" aria-live="polite">
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
              <div className="text-xs text-muted-foreground">
                {normalized.length}/20
              </div>
            </div>
          </div>

          {message && (
            <div className="text-sm text-destructive" aria-live="assertive">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !valid.ok || available === false}
            className="px-4 py-2 rounded bg-foreground text-background disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring transition-opacity hover:opacity-90"
          >
            {isPending ? "저장 중…" : "저장하고 시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
