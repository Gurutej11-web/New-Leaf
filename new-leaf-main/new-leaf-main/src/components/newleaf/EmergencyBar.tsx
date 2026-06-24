"use client";

import { QuickExit } from "./QuickExit";

export function EmergencyBar() {
  return (
    <div
      className="w-full bg-leaf-forest px-4 py-2"
      role="banner"
      aria-label="Emergency resources"
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-x-5 gap-y-2 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-center">
          <span className="flex items-center gap-2 text-white font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            In immediate danger?
          </span>
          <a
            href="tel:911"
            className="font-bold text-white underline-offset-2 hover:underline"
          >
            Call 911
          </a>
          <span className="text-white/60">•</span>
          <span className="text-white/90">
            Mental health crisis:{" "}
            <a
              href="tel:988"
              className="font-semibold text-white hover:underline"
            >
              Call/Text 988
            </a>
          </span>
          <span className="text-white/60 hidden md:inline">•</span>
          <span className="text-white/90 hidden md:inline">
            Text{" "}
            <span className="font-semibold text-white">HOME to 741741</span>{" "}
            for crisis text support
          </span>
        </div>
        <QuickExit className="flex-shrink-0" />
      </div>
    </div>
  );
}
