"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LeafLogo } from "@/components/newleaf/LeafIcon";
import { EmergencyBar } from "@/components/newleaf/EmergencyBar";
import { getSavedPlans, getConversations, deleteSavedPlan, deleteConversation } from "@/lib/chatHistory";
import type { SavedPlan, SavedConversation } from "@/lib/chatHistory";
import { X, ChevronDown, ChevronUp, ArrowLeft, FolderOpen, Lock, Printer, MessageSquare, ArrowRight } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function escapeHtml(s: string) {
  return s.replace(/[<>&]/g, c => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"));
}

function printPlan(plan: SavedPlan) {
  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) return;
  w.document.write(
    `<html><head><title>New Leaf — Your Plan</title><style>body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:48px;max-width:680px;margin:0 auto;color:#1a1a1a;white-space:pre-wrap}h1{color:#286247;font-size:22px}.meta{color:#777;font-size:13px;margin-bottom:20px}hr{border:none;border-top:1px solid #e5e5e5;margin:16px 0}</style></head><body><h1>New Leaf — Your Plan</h1><div class="meta">Saved ${formatDate(plan.savedAt)}</div><hr/><div>${escapeHtml(plan.content)}</div></body></html>`
  );
  w.document.close();
  w.focus();
  w.print();
}

function EmptyState({ kind }: { kind: "plans" | "conversations" }) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-border bg-white shadow-sm py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-leaf-mist flex items-center justify-center mb-5">
        <FolderOpen size={24} className="text-leaf-forest" />
      </div>
      <h3 className="font-fredoka text-xl font-semibold text-foreground mb-2">
        {kind === "plans" ? "No saved plans yet" : "No saved conversations yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {kind === "plans"
          ? <>When New Leaf gives you an action plan, hit <strong className="text-foreground">Save plan</strong> in the chat and it will show up here so you can come back to it anytime.</>
          : <>Your past conversations are saved here automatically when you start a new chat, so you can pick up right where you left off.</>}
      </p>
      <Link
        href="/chat"
        className="inline-flex items-center gap-2 bg-leaf-forest text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-leaf-sage transition-colors shadow-sm"
      >
        <MessageSquare size={15} />
        Start a conversation
      </Link>
    </div>
  );
}

function PlanCard({ plan, onDelete }: { plan: SavedPlan; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">{formatDate(plan.savedAt)}</p>
        <button
          onClick={onDelete}
          aria-label="Delete plan"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-leaf-crimson/10 hover:text-leaf-crimson transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {expanded ? plan.content : plan.content.slice(0, 120) + (plan.content.length > 120 ? "…" : "")}
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs text-leaf-forest hover:underline font-medium"
        >
          {expanded ? <><ChevronUp size={13} /> Collapse</> : <><ChevronDown size={13} /> Show full plan</>}
        </button>
        <button
          onClick={() => printPlan(plan)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-leaf-forest transition-colors font-medium"
        >
          <Printer size={13} /> Print
        </button>
        <Link
          href={`/chat?q=${encodeURIComponent(plan.content.slice(0, 200))}`}
          className="flex items-center gap-1 text-xs bg-leaf-forest text-white px-3 py-1.5 rounded-lg hover:bg-leaf-sage transition-colors font-medium ml-auto"
        >
          Resume in chat
        </Link>
      </div>
    </div>
  );
}

function ConversationCard({ conv, onDelete }: { conv: SavedConversation; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">{conv.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(conv.savedAt)} · {conv.messages.length} messages
            {conv.language && conv.language !== "en" ? ` · ${conv.language.toUpperCase()}` : ""}
          </p>
        </div>
        <button
          onClick={onDelete}
          aria-label="Delete conversation"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-leaf-crimson/10 hover:text-leaf-crimson transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border pt-3">
          {conv.messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-leaf-forest text-white ml-6"
                  : "bg-leaf-mist/60 text-foreground mr-6"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70 block mb-0.5">
                {msg.role === "user" ? "You" : "New Leaf"}
              </span>
              <span className="whitespace-pre-wrap">{msg.content}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1 text-xs text-leaf-forest hover:underline font-medium self-start"
      >
        {expanded ? <><ChevronUp size={13} /> Collapse</> : <><ChevronDown size={13} /> View conversation</>}
      </button>
    </div>
  );
}

export default function SavedPage() {
  const [tab, setTab] = useState<"plans" | "conversations">("plans");
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);

  useEffect(() => {
    setPlans(getSavedPlans());
    setConversations(getConversations());
  }, []);

  const handleDeletePlan = (id: string) => {
    deleteSavedPlan(id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="flex-shrink-0 border-b border-border bg-white/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" aria-label="New Leaf home">
            <LeafLogo size={36} />
          </Link>
          <Link
            href="/chat"
            className="btn-shine flex items-center gap-2 bg-leaf-forest text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-leaf-sage transition-colors"
          >
            <MessageSquare size={15} />
            Get Help Now
          </Link>
        </div>
      </header>

      <EmergencyBar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-leaf-forest transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <FolderOpen size={26} className="text-leaf-forest" />
            <h1 className="font-fredoka text-3xl font-semibold text-foreground">My Plans</h1>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-xl">
            Plans you&apos;ve saved from a New Leaf conversation, ready to revisit, print, or hand to a caseworker.
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-leaf-mist bg-leaf-mist/40 px-4 py-3 mb-8">
          <Lock size={15} className="text-leaf-forest flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/75 leading-relaxed">
            These plans live only in this browser on this device — nothing is sent to a server. If you&apos;re using a shared or public device, consider deleting them when you&apos;re done, especially if your safety depends on it.
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl border border-border bg-white shadow-sm mb-8 w-fit">
          <button
            onClick={() => setTab("plans")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "plans"
                ? "bg-leaf-forest text-white shadow-sm"
                : "text-muted-foreground hover:text-leaf-forest"
            }`}
          >
            Saved Plans{plans.length > 0 ? ` (${plans.length})` : ""}
          </button>
          <button
            onClick={() => setTab("conversations")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "conversations"
                ? "bg-leaf-forest text-white shadow-sm"
                : "text-muted-foreground hover:text-leaf-forest"
            }`}
          >
            Conversations{conversations.length > 0 ? ` (${conversations.length})` : ""}
          </button>
        </div>

        {tab === "plans" && (
          plans.length === 0 ? (
            <EmptyState kind="plans" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {plans.map(plan => (
                <PlanCard key={plan.id} plan={plan} onDelete={() => handleDeletePlan(plan.id)} />
              ))}
            </div>
          )
        )}

        {tab === "conversations" && (
          conversations.length === 0 ? (
            <EmptyState kind="conversations" />
          ) : (
            <div className="flex flex-col gap-4">
              {conversations.map(conv => (
                <ConversationCard
                  key={conv.id}
                  conv={conv}
                  onDelete={() => handleDeleteConversation(conv.id)}
                />
              ))}
            </div>
          )
        )}

        <div className="mt-10 text-center">
          <Link href="/chat" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-forest hover:underline">
            Back to the conversation
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}
