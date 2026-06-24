"use client";

import { useEffect, useRef } from "react";

interface ChatInitProps {
  onSend: (text: string) => void;
  prefill?: string;
}

export function ChatInit({ onSend, prefill }: ChatInitProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (prefill && !sent.current) {
      sent.current = true;
      // Small delay so the welcome message renders first
      const t = setTimeout(() => onSend(prefill), 600);
      return () => clearTimeout(t);
    }
  }, [prefill, onSend]);

  return null;
}
