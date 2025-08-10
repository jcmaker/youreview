"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  words: string[];
  intervalMs?: number;
  className?: string;
};

export default function RotatingText({
  words,
  intervalMs = 2000,
  className,
}: Props) {
  const safeWords = useMemo(() => (words.length > 0 ? words : [""]), [words]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const show = setInterval(() => {
      setPhase("out");
      // brief fade-out before switching
      const t = setTimeout(() => {
        setIdx((i) => (i + 1) % safeWords.length);
        setPhase("in");
      }, 180);
      return () => clearTimeout(t);
    }, intervalMs);
    return () => clearInterval(show);
  }, [intervalMs, safeWords.length]);

  return (
    <span
      className={`inline-block h-[1.4em] align-baseline relative overflow-hidden ${
        className ?? ""
      }`}
      aria-live="polite"
    >
      <span
        key={idx}
        className={`block transition-all duration-200 will-change-transform ${
          phase === "in"
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1"
        }`}
      >
        {safeWords[idx]}
      </span>
    </span>
  );
}
