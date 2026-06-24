"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Adds a slim top progress bar tracking scroll depth, plus a floating
 * "back to top" button that appears once the visitor has scrolled past
 * the hero. Both are purely cosmetic/navigational and respect reduced motion.
 */
export function ScrollEnhancements() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      setShowTop(scrollTop > 720);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress-track" aria-hidden="true">
        <div className="scroll-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-10 h-10 rounded-full bg-leaf-forest text-white shadow-lg shadow-leaf-forest/25 flex items-center justify-center transition-all duration-300 hover:bg-leaf-sage hover:-translate-y-0.5 ${
          showTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <ArrowUp size={16} />
      </button>
    </>
  );
}