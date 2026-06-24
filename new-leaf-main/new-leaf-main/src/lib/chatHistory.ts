export interface SavedConversation {
  id: string;
  title: string;
  savedAt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  location?: string;
  language?: string;
}

export interface SavedPlan {
  id: string;
  savedAt: string;
  content: string;
}

const CONV_KEY = "newleaf_conversations";
const PLAN_KEY = "newleaf_saved_plans";

export function saveConversation(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  location?: string,
  language?: string
): string {
  if (typeof window === "undefined") return "";
  try {
    const firstUser = messages.find(m => m.role === "user");
    const title = firstUser
      ? firstUser.content.slice(0, 60) + (firstUser.content.length > 60 ? "…" : "")
      : "Conversation";
    const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: SavedConversation = {
      id,
      title,
      savedAt: new Date().toISOString(),
      messages,
      location,
      language,
    };
    const existing = getConversations();
    const updated = [entry, ...existing].slice(0, 20);
    localStorage.setItem(CONV_KEY, JSON.stringify(updated));
    return id;
  } catch {
    return "";
  }
}

export function getConversations(): SavedConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONV_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedConversation[];
  } catch {
    return [];
  }
}

export function deleteConversation(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const updated = getConversations().filter(c => c.id !== id);
    localStorage.setItem(CONV_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getSavedPlans(): SavedPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{ id?: string; savedAt: string; content: string }>;
    return parsed.map((p, i) => ({
      id: p.id ?? `plan-${i}`,
      savedAt: p.savedAt,
      content: p.content,
    }));
  } catch {
    return [];
  }
}

export function deleteSavedPlan(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const plans = getSavedPlans();
    const updated = plans.filter(p => p.id !== id);
    localStorage.setItem(PLAN_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
