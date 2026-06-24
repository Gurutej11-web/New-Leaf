"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Apple, Home, Zap, Briefcase, Baby, Stethoscope, DollarSign,
  TrendingUp, Sparkles, ChevronDown, ChevronUp, Bookmark, Check, Info,
  type LucideIcon,
} from "lucide-react";
import { estimateImpact, type ImpactInput } from "@/lib/impactSimulator";

const ICONS: Record<string, LucideIcon> = {
  snap: Apple,
  rental: Home,
  liheap: Zap,
  unemployment: Briefcase,
  childcare: Baby,
  wic: Baby,
  medicaid: Stethoscope,
};

const CONF_STYLES: Record<string, string> = {
  High: "bg-leaf-forest/10 text-leaf-forest border-leaf-forest/20",
  Medium: "bg-leaf-amber/15 text-leaf-amber-d border-leaf-amber/30",
  Low: "bg-muted text-muted-foreground border-border",
};

function usd(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

export function ImpactSimulator({
  input,
  language = "en",
  onAsk,
}: {
  input: ImpactInput;
  language?: "en" | "es";
  onAsk?: () => void;
}) {
  const result = useMemo(() => estimateImpact(input), [input]);
  const [mounted, setMounted] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  const es = language === "es";

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const target = result.monthlyTotal;
    if (target <= 0) { setCount(0); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 950;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Guarantee the final value lands even if rAF is throttled or never fires.
    const fallback = setTimeout(() => setCount(target), 1100);
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [result.monthlyTotal]);

  if (result.programs.length === 0) return null;

  const maxAmount = Math.max(...result.programs.map(p => p.amount), 1);

  const saveEstimate = () => {
    try {
      const lines = result.programs.map(
        p => `- ${p.name}: ${usd(p.amount)} ${p.cadence === "monthly" ? "/mo" : "one-time"} (${p.confidence} confidence)`
      );
      const text = `# Estimated Impact\n\nPotential monthly support: ${usd(result.monthlyTotal)}/month${result.oneTimeTotal ? ` + ${usd(result.oneTimeTotal)} one-time` : ""}\n\n${lines.join("\n")}\n\nThese are informational estimates, not official eligibility determinations. Confirm with each program or by calling 211.`;
      const key = "newleaf_saved_plans";
      const existing = localStorage.getItem(key);
      const plans = existing ? JSON.parse(existing) : [];
      plans.unshift({ savedAt: new Date().toISOString(), content: text });
      localStorage.setItem(key, JSON.stringify(plans.slice(0, 25)));
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      // localStorage may be unavailable
    }
  };

  return (
    <div className="animate-slide-left pl-11">
      <div className="rounded-3xl border-2 border-leaf-forest/15 bg-white shadow-lg shadow-leaf-forest/10 overflow-hidden">
        <div className="relative bg-leaf-forest px-5 sm:px-6 py-5 overflow-hidden">
          <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/[0.06]" />
          <div className="absolute top-6 right-12 w-20 h-20 rounded-full bg-leaf-amber/10" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-2">
              <Sparkles size={13} /> {es ? "Simulador de impacto" : "Impact Simulator"}
            </div>
            <p className="text-white/80 text-sm mb-1.5">
              {es ? "Apoyo mensual potencial al que podrías calificar" : "Potential monthly support you may qualify for"}
            </p>
            <div className="flex items-end gap-2">
              <span className="font-fredoka text-4xl sm:text-5xl font-semibold text-white leading-none tabular-nums">
                {usd(count)}
              </span>
              <span className="text-white/70 text-sm mb-1">/ {es ? "mes" : "month"}</span>
            </div>
            {(result.oneTimeTotal > 0 || result.coverageTotal > 0) && (
              <p className="text-white/60 text-xs mt-2.5">
                {result.oneTimeTotal > 0 && <>+ {usd(result.oneTimeTotal)} {es ? "único" : "one-time"}</>}
                {result.oneTimeTotal > 0 && result.coverageTotal > 0 && " · "}
                {result.coverageTotal > 0 && <>+ {usd(result.coverageTotal)}/mo {es ? "en cobertura de salud" : "in health coverage"}</>}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 space-y-3.5">
          {result.programs.map((p, i) => {
            const Icon = ICONS[p.key] || DollarSign;
            const width = mounted ? Math.max(8, (p.amount / maxAmount) * 100) : 0;
            return (
              <div key={p.key}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-leaf-mist flex items-center justify-center">
                      <Icon size={16} className="text-leaf-forest" />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                    <span className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${CONF_STYLES[p.confidence]}`}>
                      {p.confidence}
                    </span>
                  </div>
                  <span className="flex-shrink-0 font-fredoka text-base font-semibold text-foreground tabular-nums">
                    {usd(p.amount)}
                    <span className="text-muted-foreground text-xs font-sans font-normal">
                      {p.cadence === "monthly" ? "/mo" : ""}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-leaf-mist/60 overflow-hidden ml-[42px]">
                  <div
                    className="h-full rounded-full bg-leaf-forest transition-all duration-700 ease-out"
                    style={{ width: `${width}%`, transitionDelay: `${i * 90}ms` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 sm:px-6 pb-2">
          <button
            onClick={() => setShowBreakdown(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-leaf-forest hover:underline"
          >
            <Info size={13} />
            {showBreakdown
              ? (es ? "Ocultar cómo se calculó" : "Hide how this was calculated")
              : (es ? "Ver cómo se calculó" : "See how this was calculated")}
            {showBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {showBreakdown && (
            <div className="mt-3 space-y-3 rounded-xl bg-leaf-ivory-d/40 border border-border p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  {es ? "Suposiciones" : "Assumptions"}
                </p>
                <ul className="space-y-1">
                  {result.assumptions.map((a, i) => (
                    <li key={i} className="text-xs text-foreground/75 flex items-start gap-1.5">
                      <span className="text-leaf-sage mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2.5 border-t border-border pt-3">
                {result.programs.map(p => (
                  <div key={p.key} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{p.name}</span>
                      <span className="text-muted-foreground flex-shrink-0">
                        {usd(p.amount)} {p.cadence === "monthly" ? "/mo" : "one-time"}
                      </span>
                    </div>
                    <p className="text-foreground/70 mt-0.5 leading-relaxed">{p.assumption}</p>
                    <p className="text-muted-foreground/80 mt-0.5">{es ? "Fuente" : "Source"}: {p.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border mt-1">
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
            {es
              ? "Estas son proyecciones informativas basadas en datos públicos de los programas y lo que compartiste — no son determinaciones oficiales de elegibilidad. Confirma con cada programa o llamando al 211."
              : "These are informational projections based on public program data and what you shared — not official eligibility determinations. Confirm with each program or by calling 211."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={saveEstimate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-leaf-forest text-white px-3.5 py-2 rounded-lg hover:bg-leaf-sage transition-colors"
            >
              {saved
                ? <><Check size={13} /> {es ? "Guardado" : "Saved"}</>
                : <><Bookmark size={13} /> {es ? "Guardar estimación" : "Save estimate"}</>}
            </button>
            {onAsk && (
              <button
                onClick={onAsk}
                className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border bg-white text-foreground px-3.5 py-2 rounded-lg hover:bg-leaf-mist/60 transition-colors"
              >
                <TrendingUp size={13} /> {es ? "Ayúdame a aplicar" : "Help me apply for these"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
