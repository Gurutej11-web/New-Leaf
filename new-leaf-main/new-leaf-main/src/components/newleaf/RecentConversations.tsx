"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConversations } from "@/lib/chatHistory";
import type { SavedConversation } from "@/lib/chatHistory";
import { MessageSquare } from "lucide-react";

export function RecentConversations() {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);

  useEffect(() => {
    setConversations(getConversations().slice(0, 3));
  }, []);

  if (conversations.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-leaf-forest mb-2.5">
          <MessageSquare size={14} />
          Recent conversations
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your past conversations will appear here after you start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-leaf-forest mb-2.5">
        <MessageSquare size={14} />
        Recent conversations
      </div>
      <div className="space-y-2">
        {conversations.map(conv => (
          <Link
            key={conv.id}
            href="/saved"
            className="block rounded-lg border border-border bg-white px-3 py-2 hover:bg-leaf-mist/60 transition-colors"
          >
            <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
              {conv.title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(conv.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              {" · "}
              {conv.messages.length} messages
            </p>
          </Link>
        ))}
      </div>
      <Link
        href="/saved"
        className="mt-2.5 block text-xs text-leaf-forest hover:underline font-medium"
      >
        View all →
      </Link>
    </div>
  );
}
