"use client";

import { useCallback, useEffect } from "react";
import { LogOut } from "lucide-react";

const SAFE_URL = "https://www.google.com";

const VARIANTS = {
  onColor: "bg-white text-leaf-crimson hover:bg-leaf-ivory",
  outline: "border border-leaf-crimson/40 bg-white text-leaf-crimson hover:bg-leaf-crimson/5",
};

export function QuickExit({
  className = "",
  variant = "onColor",
}: {
  className?: string;
  variant?: keyof typeof VARIANTS;
}) {
  const exit = useCallback(() => {
    try {
      window.location.replace(SAFE_URL);
    } catch {
      window.location.href = SAFE_URL;
    }
  }, []);

  useEffect(() => {
    let count = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      count += 1;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { count = 0; }, 1000);
      if (count >= 3) {
        count = 0;
        exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) clearTimeout(timer);
    };
  }, [exit]);

  return (
    <button
      type="button"
      onClick={exit}
      title="Instantly leave this site (or press Esc three times)"
      aria-label="Quick exit — instantly leave this site and go to a neutral page"
      className={`inline-flex items-center gap-1.5 rounded-md font-bold px-3 py-1 text-xs shadow-sm active:scale-95 transition-all ${VARIANTS[variant]} ${className}`}
    >
      <LogOut size={13} />
      Quick Exit
    </button>
  );
}
