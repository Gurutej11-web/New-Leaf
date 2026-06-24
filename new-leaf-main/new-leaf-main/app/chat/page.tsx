import type { Metadata } from "next";
import Link from "next/link";
import { LeafLogo } from "@/components/newleaf/LeafIcon";
import { ChatInterface } from "@/components/newleaf/ChatInterface";
import { EmergencyBar } from "@/components/newleaf/EmergencyBar";
import { CircleCheck, ShieldAlert, PhoneCall, Sparkles } from "lucide-react";
import { RecentConversations } from "@/components/newleaf/RecentConversations";

export const metadata: Metadata = {
  title: "Get Help",
  description:
    "Tell New Leaf what you're going through and get a personalized plan with community support resources.",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ChatPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const prefill = q ? decodeURIComponent(q) : undefined;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-white/80 backdrop-blur-sm z-10">
        <Link href="/" aria-label="New Leaf home">
          <LeafLogo size={36} />
        </Link>
        <div className="ml-4 flex items-center gap-4">
          <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            Free · Confidential · No account needed
          </span>
          <a
            href="tel:211"
            className="text-sm font-semibold text-leaf-forest border border-leaf-forest/30 px-3 py-1.5 rounded-lg hover:bg-leaf-mist transition-colors"
          >
            Call 211
          </a>
        </div>
      </header>

      {/* Emergency bar */}
      <EmergencyBar />

      {/* Chat — flex-1 fills remaining height */}
      <main className="relative flex-1 min-h-0 overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-leaf-mist/40 via-white to-leaf-mist/20" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-leaf-mist/70 blur-3xl" />
        </div>

        <div className="relative h-full max-w-[1600px] mx-auto px-3 sm:px-5 py-4">
          <div className="h-full grid xl:grid-cols-[250px_minmax(0,1fr)_250px] gap-4">
            <aside className="hidden xl:flex flex-col gap-3">
              <div className="glass-panel rounded-2xl p-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-leaf-forest mb-3">
                  <Sparkles size={14} />
                  Before you start
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CircleCheck size={14} className="text-leaf-forest mt-0.5" />
                    Share what happened, when it started, and what you need most right now.
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck size={14} className="text-leaf-forest mt-0.5" />
                    Mention your city or county for better local resource matches.
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleCheck size={14} className="text-leaf-forest mt-0.5" />
                    Ask follow-up questions like what to say on the phone.
                  </li>
                </ul>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-leaf-crimson mb-2.5">
                  <ShieldAlert size={14} />
                  Immediate support
                </div>
                <div className="space-y-2 text-sm">
                  <a href="tel:911" className="block rounded-lg border border-border bg-white px-3 py-2 hover:bg-leaf-mist/60">
                    911 · Immediate danger
                  </a>
                  <a href="tel:988" className="block rounded-lg border border-border bg-white px-3 py-2 hover:bg-leaf-mist/60">
                    988 · Crisis line (call or text)
                  </a>
                  <a href="tel:211" className="block rounded-lg border border-border bg-white px-3 py-2 hover:bg-leaf-mist/60">
                    211 · Local services
                  </a>
                </div>
              </div>
            </aside>

            <div className="h-full min-h-0 rounded-3xl border border-border/70 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <ChatInterface prefill={prefill} />
            </div>

            <aside className="hidden xl:flex flex-col gap-3">
              <div className="glass-panel rounded-2xl p-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-leaf-forest mb-2.5">
                  <PhoneCall size={14} />
                  Call prep
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Ask New Leaf to draft what to say in a 30-second phone script before calling agencies.
                </p>
                <div className="rounded-lg bg-leaf-mist/70 px-3 py-2 text-xs text-foreground">
                  Example: &quot;Can you write exactly what I should say when I call 211 for rental help?&quot;
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Good details to include</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Household size and ages</li>
                  <li>• Current urgent deadline (today, this week, this month)</li>
                  <li>• Income status (job loss, reduced hours, no income)</li>
                  <li>• Documents you already have</li>
                </ul>
              </div>
              <RecentConversations />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}