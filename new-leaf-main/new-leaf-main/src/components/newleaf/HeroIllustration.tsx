"use client";

interface HeroIllustrationProps {
  className?: string;
}

/**
 * Abstract, on-brand botanical illustration used to give the hero's
 * negative space some life without competing with the copy. Pure SVG,
 * brand-color only, gently animated leaves (paused under reduced motion).
 */
export function HeroIllustration({ className = "" }: HeroIllustrationProps) {
  return (
    <svg
      viewBox="0 0 360 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="180" cy="180" r="170" fill="hsl(var(--leaf-forest))" opacity="0.04" />
      <circle cx="180" cy="180" r="128" fill="hsl(var(--leaf-sage))" opacity="0.05" />

      <g style={{ transformOrigin: "150px 150px" }} className="leaf-float">
        <path
          d="M150 60C110 60 78 96 78 150C78 196 110 230 150 230C190 230 222 196 222 150C222 96 190 60 150 60Z"
          fill="hsl(var(--leaf-forest))"
          opacity="0.9"
        />
        <path d="M150 222L150 88" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <path d="M150 190L120 162M150 160L120 132M150 132L126 110" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
        <path d="M150 190L180 162M150 160L180 132M150 132L174 110" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      </g>

      <g style={{ transformOrigin: "262px 110px", animationDelay: "1.1s" }} className="leaf-float">
        <path
          d="M262 78C242 78 226 96 226 118C226 138 242 150 262 150C282 150 298 138 298 118C298 96 282 78 262 78Z"
          fill="hsl(var(--leaf-amber))"
          opacity="0.85"
        />
        <path d="M262 146L262 90" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      </g>

      <g style={{ transformOrigin: "92px 258px", animationDelay: "0.5s" }} className="leaf-float">
        <path
          d="M92 232C76 232 64 246 64 264C64 280 76 290 92 290C108 290 120 280 120 264C120 246 108 232 92 232Z"
          fill="hsl(var(--leaf-sky))"
          opacity="0.7"
        />
        <path d="M92 286L92 240" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      </g>

      <circle cx="276" cy="244" r="6" fill="hsl(var(--leaf-amber))" opacity="0.5" />
      <circle cx="252" cy="270" r="4" fill="hsl(var(--leaf-forest))" opacity="0.35" />
      <circle cx="64" cy="150" r="5" fill="hsl(var(--leaf-sage))" opacity="0.4" />
    </svg>
  );
}