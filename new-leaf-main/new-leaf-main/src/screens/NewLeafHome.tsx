"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LeafIcon, LeafLogo } from "@/components/newleaf/LeafIcon";
import { Reveal } from "@/components/newleaf/Reveal";
import { ScrollEnhancements } from "@/components/newleaf/ScrollEnhancements";
import { HeroIllustration } from "@/components/newleaf/HeroIllustration";
import { QuickExit } from "@/components/newleaf/QuickExit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  Apple,
  DollarSign,
  Heart,
  Stethoscope,
  Scale,
  ArrowRight,
  Phone,
  MessageSquare,
  ChevronRight,
  Search,
  Zap,
  UserCheck,
  Clock,
  Menu,
  X,
  ShieldCheck,
  ClipboardList,
  MapPinned,
  HandHeart,
  HelpCircle,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";

const CATEGORIES = [
  {
    icon: Home,
    label: "Housing",
    description: "Eviction, shelter, rental assistance, Section 8",
    starter: "I'm facing eviction and need housing assistance.",
  },
  {
    icon: Apple,
    label: "Food",
    description: "SNAP, food banks, WIC, school meals",
    starter: "My family doesn't have enough food and needs assistance.",
  },
  {
    icon: DollarSign,
    label: "Financial",
    description: "Emergency funds, bills, unemployment, debt",
    starter: "I'm struggling financially and need help with bills.",
  },
  {
    icon: Heart,
    label: "Mental Health",
    description: "Crisis support, counseling, therapy resources",
    starter: "I'm struggling with my mental health and need support.",
  },
  {
    icon: Stethoscope,
    label: "Medical",
    description: "Free clinics, Medicaid, prescription assistance",
    starter: "I need medical care but can't afford it.",
  },
  {
    icon: Scale,
    label: "Legal Aid",
    description: "Free legal help, tenant rights, family services",
    starter: "I need free legal assistance.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe your situation",
    body: "Tell us what's happening in your own words. No forms or jargon required.",
  },
  {
    step: "02",
    title: "AI understands what you mean",
    body: "New Leaf interprets your situation in plain language and maps it to the right programs, even when you don't know what those programs are called.",
  },
  {
    step: "03",
    title: "Get a personalized plan",
    body: "Step-by-step guidance with verified local and national resources, plus what to say when you call.",
  },
];

const SEARCH_VS_NLP = [
  { real: "We can't buy groceries this week", search: "SNAP benefits application" },
  { real: "My landlord is kicking us out tomorrow", search: "emergency rental assistance programs" },
  { real: "I've been feeling hopeless and can't cope", search: "mental health crisis hotline" },
  { real: "The electricity is being shut off and I can't pay", search: "LIHEAP utility assistance" },
];

const WHAT_YOU_GET = [
  {
    icon: ClipboardList,
    title: "Clear action steps",
    body: "Who to call first, what to ask, and what to do next if denied.",
  },
  {
    icon: MapPinned,
    title: "Local + national resources",
    body: "Support that matches your area and situation, including options you may not know to search for.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-forward guidance",
    body: "Urgent situations routed to human crisis support immediately, with emergency numbers always visible.",
  },
  {
    icon: HandHeart,
    title: "Respectful experience",
    body: "No account wall, no judgment, and no complex forms before you can ask for help.",
  },
];

const TRUST_PROGRAMS = [
  "211", "988 Crisis Line", "SNAP", "Medicaid", "HUD Housing", "LIHEAP",
  "WIC", "Crisis Text Line", "Legal Aid Network", "Community Action Agencies",
];

const ALERTS = [
  "In immediate danger? Call 911",
  "Mental health crisis? Call or text 988",
  "Text HOME to 741741 — Crisis Text Line",
  "Free, confidential local help 24/7 — call 211",
];

const VERIFIED_SOURCES = [
  { name: "211", org: "United Way", desc: "National 24/7 referral network for local food, housing, and crisis services.", href: "https://www.211.org" },
  { name: "988", org: "SAMHSA", desc: "Suicide & Crisis Lifeline and the national mental-health treatment locator.", href: "https://988lifeline.org" },
  { name: "SNAP & WIC", org: "USDA FNS", desc: "Federal food assistance — eligibility, application steps, and benefit details.", href: "https://www.fns.usda.gov/snap/recipient/eligibility" },
  { name: "Housing", org: "HUD", desc: "Housing Choice Vouchers, public housing, and homelessness assistance.", href: "https://www.hud.gov/topics/rental_assistance" },
  { name: "Benefits", org: "Benefits.gov", desc: "Official federal finder across every assistance program you may qualify for.", href: "https://www.benefits.gov" },
  { name: "Food Banks", org: "Feeding America", desc: "60,000+ pantries and meal programs across the national network.", href: "https://www.feedingamerica.org/find-your-local-foodbank" },
];

const FAQS = [
  {
    q: "Is New Leaf really free to use?",
    a: "Yes — always. There's no account to create, no subscription, and no hidden fee. New Leaf was built for the USAII Global AI Hackathon to make community support easier to find, not to monetize people in crisis.",
  },
  {
    q: "Do I need to create an account or share personal details?",
    a: "No account is required to chat with New Leaf. You can share as much or as little as you're comfortable with — a city or ZIP code helps us point you to local resources, but it's entirely optional.",
  },
  {
    q: "Is the information accurate and up to date?",
    a: "New Leaf draws on verified government and nonprofit program information and labels its confidence on every response. Program rules and availability change, so we always recommend confirming details with the official source or your local 211 operator before you act.",
  },
  {
    q: "What happens if I'm in immediate danger?",
    a: "New Leaf is not an emergency service. If you or someone else is in immediate danger, call 911. For a mental health crisis, call or text 988 — both are surfaced automatically whenever New Leaf detects urgent language.",
  },
  {
    q: "Can New Leaf replace a caseworker, doctor, or lawyer?",
    a: "No. New Leaf organizes options and explains next steps, but final eligibility, medical, and legal decisions always involve a licensed professional or human caseworker. Think of it as a starting point, not a substitute.",
  },
  {
    q: "Does New Leaf work outside the United States?",
    a: "Yes. Tell New Leaf your city or country and it will tailor guidance to your region's actual emergency numbers and assistance programs instead of defaulting to U.S.-only resources.",
  },
];

export default function NewLeafHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <ScrollEnhancements />

      {/* Top crisis ticker — home only, slides across like the trust strip */}
      <div
        className="bg-[hsl(4_72%_42%)] text-white marquee-row overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
        role="region"
        aria-label="Emergency crisis lines"
      >
        <div className="marquee-track py-1.5">
          {[...ALERTS, ...ALERTS].map((alert, i) => (
            <span key={i} className="flex items-center gap-2 px-8 text-xs font-medium whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
              {alert}
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <header
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? "border-border bg-white/95 shadow-sm"
            : "border-transparent bg-white/80"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <LeafLogo size={38} />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how" className="nav-link hover:text-leaf-forest transition-colors">How it works</a>
            <a href="#why-ai" className="nav-link hover:text-leaf-forest transition-colors">Why AI</a>
            <a href="#about" className="nav-link hover:text-leaf-forest transition-colors">About</a>
            <Link href="/saved" className="nav-link hover:text-leaf-forest transition-colors">My Plans</Link>
            <a href="#faq" className="nav-link hover:text-leaf-forest transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <QuickExit variant="outline" className="hidden sm:inline-flex" />
            <Link
              href="/chat"
              className="btn-shine hidden sm:flex items-center gap-2 bg-leaf-forest text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-leaf-sage transition-colors"
            >
              Get Help Now <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-leaf-mist/60 transition-colors"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              <span className="relative w-[17px] h-[17px] block">
                <Menu size={17} className={`absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? "opacity-0 rotate-45 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
                <X size={17} className={`absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-45 scale-75"}`} />
              </span>
            </button>
          </div>
        </div>
        <div className={`md:hidden collapsible-grid ${mobileMenuOpen ? "is-open" : ""}`}>
          <div className="border-t border-border bg-white px-4 py-3 space-y-1">
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-leaf-mist/60 transition-colors">How it works</a>
            <a href="#why-ai" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-leaf-mist/60 transition-colors">Why AI</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-leaf-mist/60 transition-colors">About</a>
            <Link href="/saved" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-leaf-mist/60 transition-colors">My Plans</Link>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-leaf-mist/60 transition-colors">FAQ</a>
            <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 mt-2 bg-leaf-forest text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
              Get Help Now <ArrowRight size={14} />
            </Link>
            <div className="pt-2 flex justify-center">
              <QuickExit variant="outline" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero — editorial left-aligned */}
      <section className="relative px-4 sm:px-6 pt-16 pb-20 border-b border-border soft-grid-bg overflow-hidden">
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <Reveal>
            {/* Badge with logo hard-left */}
            <div className="flex items-center mb-7">
              <div className="flex-shrink-0 w-7 h-7 rounded-md bg-white border border-leaf-sage/40 shadow-sm flex items-center justify-center mr-4">
                <LeafIcon size={15} className="text-leaf-forest" />
              </div>
              <span className="text-xs font-medium text-leaf-forest tracking-wide">
                Free &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; No account needed
              </span>
            </div>

            <h1 className="font-fredoka text-5xl sm:text-6xl font-semibold text-foreground leading-[1.05] tracking-tight mb-5">
              You don&apos;t have to<br />
              <span className="text-leaf-forest">face this alone.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              New Leaf listens in plain language and connects you with the right
              community support — housing, food, financial help, mental health
              resources, and more. Personalized. Free. Immediate.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/chat"
                className="btn-shine flex items-center justify-center gap-2 bg-leaf-forest text-white text-base font-semibold px-6 py-3.5 rounded-lg shadow-md shadow-leaf-forest/20 hover:bg-leaf-sage hover:shadow-lg hover:shadow-leaf-forest/25 hover:-translate-y-0.5 transition-all"
              >
                <MessageSquare size={17} />
                Get Help Now
              </Link>
              <a
                href="tel:211"
                className="flex items-center justify-center gap-2 border border-border bg-white text-foreground text-base font-medium px-6 py-3.5 rounded-lg shadow-sm hover:bg-leaf-mist/60 hover:-translate-y-0.5 transition-all"
              >
                <Phone size={17} className="text-leaf-forest" />
                Call 211 now
              </a>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Mental health crisis?{" "}
              <a href="tel:988" className="font-semibold text-leaf-crimson hover:underline">Call or text 988</a>
              {" "}· Text <strong>HOME to 741741</strong> · Emergency:{" "}
              <a href="tel:911" className="font-semibold text-leaf-crimson hover:underline">911</a>
            </p>
          </Reveal>

          {/* Right: illustration + stat block */}
          <Reveal delay={150} className="hidden md:flex md:flex-col gap-5 items-stretch">
            <HeroIllustration className="pointer-events-none w-full h-44 hidden lg:block" />
            <div className="flex flex-col gap-0 rounded-2xl overflow-hidden bg-white shadow-xl shadow-leaf-forest/10 ring-1 ring-border">
              <div className="absolute top-0 right-0 w-24 h-24 bg-leaf-forest/[0.04] rounded-bl-[3rem]" />
              {[
                { value: "37M+", label: "Americans lack access to basic support services" },
                { value: "211", label: "The number to call for free local help, 24/7" },
                { value: "Free", label: "New Leaf will always be free to use" },
              ].map(({ value, label }, i) => (
                <div key={label} className={`group relative flex items-center gap-5 px-6 py-5 transition-colors hover:bg-leaf-mist/30 ${i < 2 ? "border-b border-border" : ""}`}>
                  <div className="font-fredoka text-3xl font-semibold text-leaf-forest w-16 flex-shrink-0 transition-transform group-hover:scale-110">{value}</div>
                  <p className="text-sm text-muted-foreground leading-snug">{label}</p>
                </div>
              ))}
              <div className="relative bg-leaf-mist/40 px-6 py-4 flex items-center gap-2.5">
                <LeafIcon size={14} className="text-leaf-forest leaf-float flex-shrink-0" />
                <p className="text-xs text-leaf-forest/80 font-medium">A New Leaf is one conversation away</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mobile stats */}
      <section className="md:hidden border-b border-border">
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { value: "37M+", label: "lack access" },
            { value: "211", label: "connects you" },
            { value: "Free", label: "always" },
          ].map(({ value, label }) => (
            <div key={label} className="py-5 text-center">
              <div className="font-fredoka text-2xl font-semibold text-leaf-forest">{value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip — programs & resources New Leaf connects you to */}
      <section className="border-b border-border bg-white py-5">
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3.5">
          Connects you to trusted programs, including
        </p>
        <div className="marquee-row overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track">
            {[...TRUST_PROGRAMS, ...TRUST_PROGRAMS].map((program, i) => (
              <span
                key={i}
                className="flex items-center gap-2 px-6 text-sm font-semibold text-foreground/70 whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-sage/60" />
                {program}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="px-4 sm:px-6 py-16 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf-sage mb-2">What you get</p>
            <h2 className="font-fredoka text-3xl font-semibold text-foreground">
              A clear next step, not just links.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden shadow-sm ring-1 ring-border">
            {WHAT_YOU_GET.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80} className="group bg-white p-6 transition-colors hover:bg-leaf-mist/25">
                <div className="w-9 h-9 rounded-lg bg-leaf-mist flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-leaf-forest">
                  <Icon size={18} className="text-leaf-forest transition-colors group-hover:text-white" />
                </div>
                <h3 className="font-fredoka text-lg font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Accuracy & verified sources */}
      <section id="accuracy" className="px-4 sm:px-6 py-16 border-b border-border bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf-sage mb-2">Accuracy you can verify</p>
            <h2 className="font-fredoka text-3xl font-semibold text-foreground mb-3">
              Every recommendation traces back to an official source.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              New Leaf is grounded in official government and nonprofit program data — not anonymous web
              results. Each resource it surfaces links straight to the agency that runs it, so you can
              confirm the details yourself before you act.
            </p>
          </Reveal>

          <Reveal delay={80} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {VERIFIED_SOURCES.map(({ name, org, desc, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm hover:border-leaf-sage hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-fredoka text-lg font-semibold text-leaf-forest">{name}</span>
                  <ExternalLink size={14} className="text-muted-foreground/50 group-hover:text-leaf-forest transition-colors" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-leaf-sage mb-1.5">{org}</span>
                <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
              </a>
            ))}
          </Reveal>

          <Reveal delay={160} className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: "Official sources only", body: "Guidance is drawn from .gov and established nonprofit programs, each linked so you can verify it." },
              { icon: Clock, title: "Confidence + freshness labels", body: "Every response carries a confidence note and a last-verified date, with a one-tap way to flag outdated info." },
              { icon: UserCheck, title: "Human fallback built in", body: "For anything time-sensitive, New Leaf routes you to a live 211 specialist or 988 counselor to confirm." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-leaf-ivory-d/40 p-5">
                <Icon size={18} className="text-leaf-forest mb-3" />
                <h3 className="font-fredoka text-base font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </Reveal>

          <Reveal delay={220} className="mt-8">
            <div className="flex items-start gap-3 rounded-xl border border-leaf-forest/20 bg-leaf-mist/40 px-5 py-4">
              <ShieldCheck size={18} className="text-leaf-forest flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                <strong className="text-foreground">On our roadmap:</strong> direct, real-time integrations
                with these agencies&apos; open data — and a formal vetting partnership — so recommendations
                update the moment programs change.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-4 sm:px-6 py-16 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf-sage mb-2">How it works</p>
            <h2 className="font-fredoka text-3xl font-semibold text-foreground">
              Three steps from overwhelmed to supported.
            </h2>
          </Reveal>
          <div className="relative grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, body }, i) => (
              <Reveal key={step} delay={i * 120} className="group relative">
                <div className="font-fredoka text-5xl font-semibold text-leaf-mist mb-4 leading-none select-none transition-colors duration-300 group-hover:text-leaf-sage/50">
                  {step}
                </div>
                <h3 className="font-fredoka text-xl font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section id="global" className="px-4 sm:px-6 py-16 border-b border-border bg-leaf-ivory-d/40">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf-sage mb-2">Global reach</p>
            <h2 className="font-fredoka text-3xl font-semibold text-foreground">
              Built for wherever you are, not just a ZIP code.
            </h2>
          </Reveal>

          <Reveal delay={80} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { region: "United States", lines: ["211 · 988 · SNAP", "Section 8 · Medicaid"] },
              { region: "United Kingdom", lines: ["999 / 111", "Samaritans 116 123"] },
              { region: "Canada", lines: ["211", "Crisis Services Canada"] },
              { region: "Australia", lines: ["000", "Lifeline 13 11 14"] },
              { region: "India", lines: ["112", "iCall · NIMHANS"] },
              { region: "European Union", lines: ["112", "Local social services"] },
              { region: "Latin America", lines: ["Local emergency services", "Ask New Leaf"] },
              { region: "100+ more countries", lines: ["Ask New Leaf for", "local resources"] },
            ].map(({ region, lines }) => (
              <div
                key={region}
                className="rounded-xl border border-border bg-white p-4 shadow-sm hover:border-leaf-sage transition-colors"
              >
                <p className="font-semibold text-sm text-foreground mb-1.5 leading-snug">{region}</p>
                {lines.map((line, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-snug">{line}</p>
                ))}
              </div>
            ))}
          </Reveal>

          <Reveal delay={160}>
            <div className="rounded-2xl border border-leaf-forest/25 bg-leaf-mist p-6 flex flex-col sm:flex-row items-start gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-leaf-forest/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-leaf-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-fredoka text-xl font-semibold text-foreground mb-2">Designed for governmental scale</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  New Leaf is architected to integrate with verified, locally-maintained government and NGO resource databases — improving accuracy and reach in every community it serves. Contact us to explore a partnership.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why AI */}
      <section id="why-ai" className="relative px-4 sm:px-6 py-16 bg-leaf-forest border-b border-leaf-sage overflow-hidden">
        <div className="aurora-bg">
          <span className="-top-32 left-1/4 w-[500px] h-[500px] bg-leaf-amber/20" />
          <span className="bottom-[-8rem] right-[-4rem] w-[380px] h-[380px] bg-leaf-sky/20" style={{ animationDelay: "3s" }} />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Why AI</p>
            <h2 className="font-fredoka text-3xl font-semibold text-white mb-3">
              People in crisis don&apos;t know the vocabulary.
            </h2>
            <p className="text-white/65 text-base max-w-2xl leading-relaxed">
              A keyword search only works if you know the right terms. When you&apos;re overwhelmed,
              you don&apos;t think &ldquo;SNAP benefits&rdquo; — you think &ldquo;we can&apos;t buy food.&rdquo; New Leaf bridges that gap.
            </p>
          </Reveal>

          <Reveal delay={100} className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="lift-hover border border-white/15 rounded-xl p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
                <Search size={12} /> Search engine needs
              </div>
              <div className="space-y-2.5">
                {SEARCH_VS_NLP.map(({ search }, i) => (
                  <div key={i} className="font-mono text-xs bg-white/10 text-white/60 px-3 py-2 rounded-md">{search}</div>
                ))}
              </div>
            </div>
            <div className="lift-hover border border-white/25 bg-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">
                <MessageSquare size={12} /> What people actually say
              </div>
              <div className="space-y-2.5">
                {SEARCH_VS_NLP.map(({ real }, i) => (
                  <div key={i} className="text-sm text-white flex items-start gap-2">
                    <span className="text-leaf-amber mt-0.5 flex-shrink-0">→</span>
                    <span>&ldquo;{real}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: "Natural language", body: "Understands how people describe crises, not just keywords" },
              { icon: Zap, title: "Instant matching", body: "Maps your words to programs, eligibility, and action steps automatically" },
              { icon: UserCheck, title: "Personalized plans", body: "Step-by-step guidance for your specific situation, not a generic list" },
            ].map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 100} className="lift-hover border border-white/15 rounded-xl p-5 hover:border-white/30">
                <Icon size={18} className="text-white/70 mb-3" />
                <h3 className="font-fredoka text-lg font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-4 sm:px-6 py-16 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf-sage mb-2">Get started</p>
            <h2 className="font-fredoka text-3xl font-semibold text-foreground">
              What can New Leaf help with?
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(({ icon: Icon, label, description, starter }, i) => {
              const tints = [
                "bg-leaf-mist text-leaf-forest",
                "bg-leaf-amber/15 text-leaf-amber-d",
                "bg-leaf-sky/12 text-leaf-sky",
                "bg-leaf-crimson/10 text-leaf-crimson",
                "bg-leaf-sage/15 text-leaf-sage",
                "bg-leaf-forest/10 text-leaf-forest",
              ];
              return (
                <Reveal key={label} delay={i * 60}>
                  <Link
                    href={`/chat?q=${encodeURIComponent(starter)}`}
                    className="category-card group flex items-start gap-4 rounded-xl border border-border p-5 bg-white shadow-sm hover:border-leaf-sage transition-colors h-full"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${tints[i % tints.length]}`}>
                      <Icon size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground mb-0.5">{label}</div>
                      <p className="text-xs text-muted-foreground leading-snug">{description}</p>
                    </div>
                    <ArrowRight size={15} className="flex-shrink-0 mt-1 text-muted-foreground/40 group-hover:text-leaf-forest group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* About + Trust */}
      <section id="about" className="px-4 sm:px-6 py-16 border-b border-border">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf-sage mb-2">Our mission</p>
            <h2 className="font-fredoka text-3xl font-semibold text-foreground mb-5 leading-tight">
              Help should be easy to find.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When people are in crisis, they shouldn&apos;t have to search dozens of websites or
              know the right terminology. The information exists — it&apos;s just scattered
              and inaccessible when you&apos;re already overwhelmed.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              New Leaf was built for that student whose family is struggling to pay rent.
              For the parent who can&apos;t put food on the table. For anyone who needs help
              but doesn&apos;t know where to start.
            </p>
            <div className="space-y-4 border-t border-border pt-6">
              {[
                { label: "AI-powered, human-centered", desc: "Technology that listens and guides, humans who verify and decide" },
                { label: "Verified resources", desc: "Every program surfaces from official .gov and .org sources" },
                { label: "Always free, always private", desc: "No account, no tracking, no cost — ever" },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-leaf-forest flex-shrink-0 mt-2" />
                  <p className="text-sm text-foreground">
                    <strong>{label}</strong> — {desc}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="space-y-4">
            <div className="lift-hover border border-border rounded-xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <UserCheck size={16} className="text-leaf-forest" />
                <h3 className="font-semibold text-foreground text-sm">Human oversight — always</h3>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 pb-4 border-b border-border">
                  <Clock size={13} className="text-leaf-crimson flex-shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Urgent situations —</strong> when New Leaf detects immediate risk, it surfaces 911 and 988 above everything else. Crisis counselors answer 988 within minutes, 24/7.
                  </p>
                </div>
                <div className="flex items-start gap-3 pb-4 border-b border-border">
                  <UserCheck size={13} className="text-leaf-forest flex-shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Eligibility decisions —</strong> AI informs only. Caseworkers at 211 and partner agencies make all final determinations.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <UserCheck size={13} className="text-leaf-forest flex-shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Medical &amp; legal —</strong> always referred to licensed professionals. New Leaf never substitutes for a doctor, lawyer, or social worker.
                  </p>
                </div>
              </div>
            </div>

            <div className="lift-hover border border-border rounded-xl p-6 bg-white shadow-sm">
              <h3 className="font-semibold text-foreground text-sm mb-4">Important to know</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "New Leaf provides information and guidance, not medical, legal, or financial advice.",
                  "AI responses should be verified with official government and nonprofit sources.",
                  "Resource availability and eligibility can change — your local 211 operator can confirm.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-leaf-forest mt-0.5 flex-shrink-0 text-xs">✓</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  Built for the <strong className="text-foreground">USAII Global Hackathon</strong> — Community Awareness Track
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 sm:px-6 py-16 border-b border-border bg-leaf-ivory-d/40">
        <div className="max-w-3xl mx-auto">
          <Reveal className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf-sage mb-2">Common questions</p>
            <h2 className="font-fredoka text-3xl font-semibold text-foreground mb-3">
              Good to know before you start.
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Still unsure about something? Ask New Leaf directly in the chat — it&apos;s happy to explain how it works.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <Accordion type="single" collapsible className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              {FAQS.map(({ q, a }, i) => (
                <AccordionItem key={q} value={`item-${i}`} className="border-border px-5 last:border-b-0">
                  <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-leaf-forest hover:no-underline py-4">
                    <span className="flex items-center gap-3">
                      <HelpCircle size={15} className="text-leaf-sage flex-shrink-0" />
                      {q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pl-7">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 sm:px-6 py-16 bg-leaf-forest overflow-hidden">
        <div className="aurora-bg">
          <span className="-bottom-24 -right-24 w-[400px] h-[400px] bg-white/10" />
          <span className="-top-20 -left-20 w-[280px] h-[280px] bg-leaf-amber/15" style={{ animationDelay: "2s" }} />
        </div>
        <Reveal className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-6 shadow-md leaf-float">
              <LeafIcon size={22} className="text-leaf-forest" />
            </div>
            <h2 className="font-fredoka text-4xl font-semibold text-white mb-3">
              Ready to find support?
            </h2>
            <p className="text-white/65 text-base leading-relaxed">
              No forms, no accounts, no jargon. Just tell us what&apos;s going on.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
            <Link
              href="/chat"
              className="btn-shine flex items-center justify-center gap-2 bg-white text-leaf-forest text-base font-semibold px-6 py-3.5 rounded-lg hover:bg-leaf-mist transition-all shadow-lg hover:-translate-y-0.5 flex-1"
            >
              <MessageSquare size={17} />
              Get Help Now
            </Link>
            <a
              href="tel:211"
              className="flex items-center justify-center gap-2 border border-white/25 text-white text-base font-medium px-6 py-3.5 rounded-lg hover:bg-white/10 hover:-translate-y-0.5 transition-all flex-1"
            >
              <Phone size={17} />
              Call 211
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-leaf-ivory-d/60 px-4 sm:px-6 pt-14 pb-8 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pb-10">
            {/* Brand column */}
            <div>
              <LeafLogo size={34} />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                A free, AI-powered resource finder that helps people in crisis describe
                their situation in plain language and get matched with real community
                support — fast.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock size={12} className="text-leaf-forest" />
                No account needed · Nothing stored
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Globe size={12} className="text-leaf-forest" />
                Available in English &amp; Español
              </div>
            </div>

            {/* Get support column */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Get support</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {CATEGORIES.map(({ label, starter }) => (
                  <li key={label}>
                    <Link
                      href={`/chat?q=${encodeURIComponent(starter)}`}
                      className="hover:text-leaf-forest transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <ChevronRight size={12} className="text-leaf-sage/60 transition-transform group-hover:translate-x-0.5" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Explore column */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Explore</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  { label: "How it works", href: "#how" },
                  { label: "Why AI", href: "#why-ai" },
                  { label: "About New Leaf", href: "#about" },
                  { label: "My Plans", href: "/saved" },
                  { label: "FAQ", href: "#faq" },
                  { label: "Start a conversation", href: "/chat" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="hover:text-leaf-forest transition-colors inline-flex items-center gap-1.5 group">
                      <ChevronRight size={12} className="text-leaf-sage/60 transition-transform group-hover:translate-x-0.5" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Crisis lines column */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Crisis lines</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:911" className="flex items-center gap-2 font-semibold text-leaf-crimson hover:underline">
                    <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-leaf-crimson" />
                    911 — Emergency
                  </a>
                </li>
                <li>
                  <a href="tel:988" className="flex items-center gap-2 font-semibold text-leaf-forest hover:underline">
                    988 — Crisis &amp; Suicide Lifeline
                  </a>
                </li>
                <li>
                  <a href="tel:211" className="flex items-center gap-2 font-semibold text-leaf-forest hover:underline">
                    211 — Local Help
                  </a>
                </li>
                <li className="text-muted-foreground text-xs leading-snug pt-1">
                  Text <strong className="text-foreground">HOME</strong> to <strong className="text-foreground">741741</strong> for crisis text support
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} New Leaf · Built for the USAII Global AI Hackathon — Team Spurs In 6
            </p>
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Community support resource finder · Free forever · Not a substitute for professional help
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile persistent quick-access bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="flex-1 flex items-center justify-center gap-2 bg-leaf-forest text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:scale-[0.98] transition-transform"
          >
            <MessageSquare size={15} />
            Get Help Now
          </Link>
          <a
            href="tel:211"
            aria-label="Call 211"
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-border bg-white text-leaf-forest active:scale-[0.98] transition-transform"
          >
            <Phone size={16} />
          </a>
        </div>
      </div>

      {/* Spacer so the fixed mobile bar never covers footer content */}
      <div className="md:hidden h-16" />
    </div>
  );
}