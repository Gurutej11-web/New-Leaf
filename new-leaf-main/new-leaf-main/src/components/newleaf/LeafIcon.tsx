"use client";

interface LeafIconProps {
  className?: string;
  size?: number;
}

export function LeafIcon({ className = "", size = 28 }: LeafIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Leaf shape */}
      <path
        d="M16 3C10 3 4 9 4 17C4 23.627 8.373 28 16 28C23.627 28 28 23.627 28 17C28 9 22 3 16 3Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M16 3C16 3 6 8 6 17C6 23.075 10.477 27 16 27C21.523 27 26 23.075 26 17C26 8 16 3 16 3Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Center vein */}
      <path
        d="M16 27L16 10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Side veins */}
      <path
        d="M16 20L11 16M16 17L11 13M16 14L12 11"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M16 20L21 16M16 17L21 13M16 14L20 11"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function LeafLogo({ className = "", size = 36 }: LeafIconProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="flex items-center justify-center rounded-xl bg-white text-leaf-forest shadow-sm border border-leaf-mist"
        style={{ width: size, height: size }}
      >
        <LeafIcon size={Math.round(size * 0.72)} />
      </div>
      <span
        className="font-fredoka font-semibold tracking-tight text-leaf-forest"
        style={{ fontSize: Math.round(size * 0.61) }}
      >
        New Leaf
      </span>
    </div>
  );
}
