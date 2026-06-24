"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LeafIcon } from "./LeafIcon";
import { Send, RotateCcw, Loader2, Copy, Check, Share2 } from "lucide-react";
import { renderMarkdown } from "./renderMarkdown";
import { ImpactSimulator } from "./ImpactSimulator";
import { saveConversation } from "@/lib/chatHistory";

function formatVerificationDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseChecklistItems(content: string) {
  return content
    .split("\n")
    .map(line => line.trim())
    .filter(line => /^\d+\.\s+/.test(line))
    .map(line => line.replace(/^\d+\.\s+/, ""))
    .map(line => line.replace(/\*\*/g, ""));
}

function isHighRiskText(text: string) {
  const t = text.toLowerCase();
  const signals = [
    "suicide",
    "kill myself",
    "hurt myself",
    "end my life",
    "self harm",
    "can't go on",
    "immediate danger",
    "i am in danger",
    "overdose",
    "abuse",
    "eviction tonight",
    "no food today",
  ];
  return signals.some(s => t.includes(s));
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface IntakeData {
  urgency?: string;
  householdSize?: string;
  hasChildren?: string;
  veteranOrDisability?: string;
  incomeBand?: string;
}

type Language = "en" | "es";

const STARTERS: Record<Language, string[]> = {
  en: [
    "My family is struggling to pay rent and may face eviction next week.",
    "We don't have enough food and I'm not sure what assistance programs we qualify for.",
    "I've been feeling very depressed and overwhelmed and don't know where to get help.",
    "I lost my job and I'm worried about paying bills. What financial help is available?",
  ],
  es: [
    "Mi familia tiene problemas para pagar la renta y podríamos enfrentar un desalojo la próxima semana.",
    "No tenemos suficiente comida y no sé para qué programas de ayuda calificamos.",
    "Me he sentido muy deprimido y abrumado y no sé dónde buscar ayuda.",
    "Perdí mi trabajo y me preocupa cómo pagar las cuentas. ¿Qué ayuda financiera hay disponible?",
  ],
};

const QUICK_ACTIONS: Record<Language, Array<{ label: string; prompt: string }>> = {
  en: [
    { label: "Housing help", prompt: "I need help with housing." },
    { label: "Food support", prompt: "I need help with food support." },
    { label: "Utility bills", prompt: "I need help with utility bills." },
    { label: "Mental health", prompt: "I need help with mental health support." },
    { label: "Legal aid", prompt: "I need help with legal aid." },
    { label: "Medical care", prompt: "I need help with medical care." },
  ],
  es: [
    { label: "Vivienda", prompt: "Necesito ayuda con vivienda." },
    { label: "Comida", prompt: "Necesito ayuda con comida." },
    { label: "Servicios", prompt: "Necesito ayuda con servicios públicos." },
    { label: "Salud mental", prompt: "Necesito ayuda con salud mental." },
    { label: "Ayuda legal", prompt: "Necesito ayuda legal." },
    { label: "Atención médica", prompt: "Necesito ayuda con atención médica." },
  ],
};

const WELCOME_MESSAGES: Record<Language, Message> = {
  en: {
    role: "assistant",
    content: `## Welcome to New Leaf

I'm here to help you find the community support you need, with no judgment, no cost, and no red tape.

**Just tell me what's going on.** You can share as much or as little as you're comfortable with. The more you share, the more personalized I can make your action plan.

Some things I can help with:
- **Housing:** eviction, shelter, rental assistance
- **Food:** SNAP, food banks, WIC, school meals
- **Financial:** emergency funds, utility bills, unemployment
- **Mental health:** crisis support, counseling, therapy resources
- **Medical:** free clinics, Medicaid, prescription help
- **Legal:** free legal aid, tenant rights, family services

If you're in immediate danger, please call **911**. For a mental health crisis, call or text **988**.

---

*What's going on? Tell me in your own words.*`,
  },
  es: {
    role: "assistant",
    content: `## Bienvenido a New Leaf

Estoy aquí para ayudarte a encontrar el apoyo comunitario que necesitas, sin juicios, sin costo y sin trámites innecesarios.

**Solo cuéntame qué está pasando.** Puedes compartir tanto o tan poco como quieras. Cuanto más compartas, más personalizado será tu plan.

Algunas cosas con las que puedo ayudarte:
- **Vivienda:** desalojo, refugio, ayuda con la renta
- **Comida:** SNAP, bancos de alimentos, WIC, comidas escolares
- **Finanzas:** fondos de emergencia, cuentas, desempleo
- **Salud mental:** apoyo en crisis, consejería, terapia
- **Atención médica:** clínicas gratuitas, Medicaid, ayuda con recetas
- **Ayuda legal:** ayuda legal gratuita, derechos de inquilinos, servicios familiares

Si estás en peligro inmediato, llama al **911**. Para una crisis de salud mental, llama o envía un mensaje al **988**.

---

*¿Qué está pasando? Cuéntamelo con tus propias palabras.*`,
  },
};

export function ChatInterface({ prefill }: { prefill?: string }) {
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGES.en]);
  const [input, setInput] = useState("");
  const [location, setLocation] = useState("");
  const [showIntake, setShowIntake] = useState(false);
  const [urgency, setUrgency] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [hasChildren, setHasChildren] = useState("");
  const [veteranOrDisability, setVeteranOrDisability] = useState("");
  const [incomeBand, setIncomeBand] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highRiskSession, setHighRiskSession] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prefillSent = useRef(false);
  const messagesRef = useRef<Message[]>(messages);
  const locationRef = useRef<string>(location);
  const languageRef = useRef<Language>(language);
  const welcomeMessage = WELCOME_MESSAGES[language];
  const starters = STARTERS[language];
  const quickActions = QUICK_ACTIONS[language];

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { languageRef.current = language; }, [language]);

  useEffect(() => {
    if (messages.length === 1 && messages[0]?.role === "assistant") {
      setMessages([welcomeMessage]);
    }
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send prefill from category links
  useEffect(() => {
    if (prefill && !prefillSent.current) {
      prefillSent.current = true;
      const t = setTimeout(() => sendMessage(prefill), 700);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);

    const highRiskNow = isHighRiskText(text);
    if (highRiskNow) {
      setHighRiskSession(true);
      const emergencyNotice: Message = {
        role: "assistant",
        content: `## Immediate Support Options\n\nIf you are in immediate danger, call **911** now.\n\nFor mental health crisis support, call or text **988** (24/7).\n\nFor urgent local shelter, food, and financial support, call **211**.\n\nIf talking feels hard right now, text **HOME** to **741741** for crisis text support.`,
      };
      setMessages(prev => [...prev, emergencyNotice]);
    }

    const userMsg: Message = { role: "user", content: text.trim() };
    const conversation = messages.slice(1);

    const newMessages = [...conversation, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);
    setIsStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const intake: IntakeData = {
        urgency: urgency || undefined,
        householdSize: householdSize.trim() || undefined,
        hasChildren: hasChildren || undefined,
        veteranOrDisability: veteranOrDisability || undefined,
        incomeBand: incomeBand || undefined,
      };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          location: location.trim() || undefined,
          intake,
          language,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming, urgency, householdSize, hasChildren, veteranOrDisability, incomeBand, location, language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  useEffect(() => {
    return () => {
      const msgs = messagesRef.current.slice(1);
      if (msgs.length > 1) {
        saveConversation(msgs, locationRef.current || undefined, languageRef.current);
      }
    };
  }, []);

  const handleReset = () => {
    abortRef.current?.abort();
    const msgs = conversationMessages;
    if (msgs.length > 1) {
      saveConversation(msgs, location || undefined, language);
    }
    setMessages([welcomeMessage]);
    setInput("");
    setError(null);
    setIsStreaming(false);
  };

  const handleShareConversation = async () => {
    const text = conversationMessages
      .map(m => `${m.role === "user" ? "You" : "New Leaf"}: ${m.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard not available
    }
  };

  const conversationMessages = messages.slice(1);
  const showStarters = conversationMessages.length === 0;
  const highRiskInput = isHighRiskText(input);
  const showEmergencyPriority = highRiskSession || highRiskInput || urgency === "Today";

  const lastConv = conversationMessages[conversationMessages.length - 1];
  const showImpact =
    !isStreaming &&
    lastConv?.role === "assistant" &&
    lastConv.content.length > 150 &&
    !lastConv.content.includes("Immediate Support Options");
  const impactText =
    conversationMessages.filter(m => m.role === "user").map(m => m.content).join(" ") +
    " " + (lastConv?.content ?? "");

  useEffect(() => {
    if (showImpact) {
      const t = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 90);
      return () => clearTimeout(t);
    }
  }, [showImpact]);

  const requestCallScript = () => {
    const context = input.trim() || "my current support needs";
    const locationText = location.trim() ? ` I am in ${location.trim()}.` : "";
    if (language === "es") {
      sendMessage(`Escribe un guion de 30 segundos que pueda leer cuando llame al 211 sobre ${context}.${locationText} Incluye cómo empezar, qué detalles mencionar y qué debo preguntar antes de terminar la llamada.`);
      return;
    }
    sendMessage(`Please write a 30-second phone script I can read when I call 211 about ${context}.${locationText} Include what to say first, key details to mention, and what to ask before ending the call.`);
  };

  const requestDocumentChecklist = () => {
    const context = input.trim() || "my current support needs";
    const locationText = location.trim() ? ` I am in ${location.trim()}.` : "";
    if (language === "es") {
      sendMessage(`Crea una lista práctica de documentos para ${context}.${locationText} Divídela en documentos requeridos, documentos útiles y alternativas si no tengo algún documento.`);
      return;
    }
    sendMessage(`Create a practical document checklist for ${context}.${locationText} Split it into: required documents, helpful documents, and alternatives if I do not have an item.`);
  };

  const requestHandoffSummary = () => {
    const context = input.trim() || (language === "es" ? "mi situación actual" : "my current situation");
    const locationText = location.trim() ? ` ${language === "es" ? "Estoy en" : "I am in"} ${location.trim()}.` : "";
    if (language === "es") {
      sendMessage(`Crea un resumen breve y claro para compartir con un operador del 211, un trabajador social o un orientador sobre ${context}.${locationText} Incluye la necesidad principal, el nivel de urgencia, detalles importantes del hogar y lo que ya intenté.`);
      return;
    }
    sendMessage(`Create a short, clear handoff summary I can share with a 211 operator, social worker, or counselor about ${context}.${locationText} Include my main need, urgency level, important household details, and what I have already tried.`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 py-6 space-y-5">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-white shadow-sm p-0.5">
            <button
              onClick={() => setLanguage("en")}
              disabled={isStreaming}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                language === "en"
                  ? "bg-leaf-forest text-white shadow-sm"
                  : "text-muted-foreground hover:text-leaf-forest"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("es")}
              disabled={isStreaming}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                language === "es"
                  ? "bg-leaf-forest text-white shadow-sm"
                  : "text-muted-foreground hover:text-leaf-forest"
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {showEmergencyPriority && (
          <div className="rounded-2xl border border-leaf-crimson/30 bg-leaf-crimson/10 p-4">
            <p className="text-sm font-semibold text-leaf-crimson mb-2">{language === "es" ? "La ayuda de emergencia debe ir primero" : "Emergency support should come first"}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a href="tel:911" className="rounded-full border border-leaf-crimson/40 bg-white px-3 py-1.5 font-semibold text-leaf-crimson">
                {language === "es" ? "Llama al 911 ahora" : "Call 911 now"}
              </a>
              <a href="tel:988" className="rounded-full border border-leaf-forest/40 bg-white px-3 py-1.5 font-semibold text-leaf-forest">
                {language === "es" ? "Llama o escribe al 988" : "Call or text 988"}
              </a>
              <a href="tel:211" className="rounded-full border border-leaf-forest/40 bg-white px-3 py-1.5 font-semibold text-leaf-forest">
                {language === "es" ? "Llama al 211" : "Call 211"}
              </a>
            </div>
          </div>
        )}

        {/* Welcome message */}
        <AssistantBubble content={welcomeMessage.content} isFirst />

        {/* Starters */}
        {showStarters && (
          <div className="animate-fade-in delay-200">
            <p className="text-xs text-muted-foreground mb-3 text-center font-medium uppercase tracking-wide">
              {language === "es" ? "Opciones rápidas, o escribe tu propio mensaje abajo" : "Quick starters, or type your own below"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {starters.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  disabled={isStreaming}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-leaf-mist bg-white shadow-sm hover:bg-leaf-mist/60 hover:border-leaf-sage hover:shadow-md hover:-translate-y-0.5 transition-all text-foreground/80 leading-snug disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation */}
        {conversationMessages.map((msg, i) =>
          msg.role === "user" ? (
            <UserBubble key={i} content={msg.content} />
          ) : (
            <AssistantBubble
              key={i}
              content={msg.content}
              isStreaming={isStreaming && i === conversationMessages.length - 1}
              isLatest={i === conversationMessages.length - 1}
              onFollowUp={(kind) => {
                if (kind === "worked") {
                  sendMessage(language === "es" ? "Esto ayudó. ¿Qué debo hacer ahora para mantener el avance y evitar retrocesos?" : "This helped. What should I do next to keep momentum and avoid setbacks?");
                } else {
                  sendMessage(language === "es" ? "Esa opción no funcionó. Por favor dame un Plan B y un Plan C con alternativas que pueda intentar hoy." : "That option did not work. Please give me a Plan B and Plan C with alternatives I can try today.");
                }
              }}
              language={language}
            />
          )
        )}

        {/* Impact Simulator — appears after a generated plan */}
        {showImpact && (
          <ImpactSimulator
            input={{
              text: impactText,
              householdSize,
              hasChildren,
              incomeBand,
              veteranOrDisability,
              location,
            }}
            language={language}
            onAsk={() =>
              sendMessage(
                language === "es"
                  ? "Ayúdame a aplicar para estos programas. ¿Qué hago primero y qué documentos necesito?"
                  : "Help me apply for these programs. What do I do first, and what documents do I need?"
              )
            }
          />
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive">
            <strong>Error:</strong> {error}. Please try again.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Reset row */}
      {conversationMessages.length > 0 && (
        <div className="px-4 pb-1 flex flex-wrap items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-leaf-forest transition-colors"
          >
            <RotateCcw size={12} />
            Start a new conversation
          </button>
          <button
            onClick={handleShareConversation}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-leaf-forest transition-colors"
          >
            <Share2 size={12} />
            Share conversation
          </button>
          <a
            href="/saved"
            className="text-xs text-leaf-forest hover:underline"
          >
            → View saved plans
          </a>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="mb-2">
            <label htmlFor="location-input" className="text-[11px] text-muted-foreground">
              {language === "es" ? "Ciudad, condado o código postal (opcional, ayuda con recursos locales)" : "City, county, or ZIP (optional, helps with local resources)"}
            </label>
            <input
              id="location-input"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              disabled={isStreaming}
              maxLength={80}
              placeholder={language === "es" ? "Ejemplo: San Jose, CA o 95112" : "Example: San Jose, CA or 95112"}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-leaf-sage focus:ring-2 focus:ring-leaf-mist disabled:opacity-60"
            />
          </div>

          <div className="mb-2.5 rounded-xl border border-border bg-white px-3 py-2.5">
            <button
              type="button"
              onClick={() => setShowIntake(v => !v)}
              className="text-xs font-medium text-leaf-forest hover:underline"
            >
              {showIntake ? (language === "es" ? "Ocultar detalles opcionales" : "Hide optional intake details") : (language === "es" ? "Agregar detalles opcionales" : "Add optional intake details")}
            </button>

            {showIntake && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="text-[11px] text-muted-foreground">
                  Urgency
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value)}
                    disabled={isStreaming}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="Today">Today</option>
                    <option value="This week">This week</option>
                    <option value="This month">This month</option>
                  </select>
                </label>

                <label className="text-[11px] text-muted-foreground">
                  Household size
                  <input
                    type="text"
                    value={householdSize}
                    onChange={e => setHouseholdSize(e.target.value)}
                    disabled={isStreaming}
                    placeholder="Example: 4"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-foreground"
                  />
                </label>

                <label className="text-[11px] text-muted-foreground">
                  Children in household?
                  <select
                    value={hasChildren}
                    onChange={e => setHasChildren(e.target.value)}
                    disabled={isStreaming}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <label className="text-[11px] text-muted-foreground">
                  Veteran or disability status
                  <select
                    value={veteranOrDisability}
                    onChange={e => setVeteranOrDisability(e.target.value)}
                    disabled={isStreaming}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="Veteran">Veteran</option>
                    <option value="Disability">Disability</option>
                    <option value="Neither">Neither</option>
                  </select>
                </label>

                <label className="text-[11px] text-muted-foreground sm:col-span-2">
                  Income range
                  <select
                    value={incomeBand}
                    onChange={e => setIncomeBand(e.target.value)}
                    disabled={isStreaming}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="No income">No income</option>
                    <option value="Under $1,500/month">Under $1,500/month</option>
                    <option value="$1,500-$3,000/month">$1,500-$3,000/month</option>
                    <option value="Over $3,000/month">Over $3,000/month</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
              </div>
            )}
          </div>

          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {quickActions.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                disabled={isStreaming}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/85 hover:bg-leaf-mist/70 hover:border-leaf-sage transition-colors disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <button
              onClick={requestCallScript}
              disabled={isStreaming}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/90 hover:bg-leaf-mist/70 hover:border-leaf-sage transition-colors disabled:opacity-50"
            >
              {language === "es" ? "Generar guion de llamada" : "Generate call script"}
            </button>
            <button
              onClick={requestDocumentChecklist}
              disabled={isStreaming}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/90 hover:bg-leaf-mist/70 hover:border-leaf-sage transition-colors disabled:opacity-50"
            >
              {language === "es" ? "Generar lista de documentos" : "Generate document checklist"}
            </button>
            <button
              onClick={requestHandoffSummary}
              disabled={isStreaming}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/90 hover:bg-leaf-mist/70 hover:border-leaf-sage transition-colors disabled:opacity-50"
            >
              {language === "es" ? "Generar resumen para compartir" : "Generate handoff summary"}
            </button>
          </div>

          <div className="flex items-end gap-3 rounded-2xl border border-border bg-white shadow-sm focus-within:border-leaf-sage focus-within:ring-2 focus-within:ring-leaf-mist transition-all px-4 py-3">
            <textarea
              ref={textareaRef}
              rows={1}
              maxLength={500}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder={language === "es" ? "Describe tu situación. Estamos aquí para ayudarte..." : "Describe your situation. We're here to help..."}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-h-[24px] max-h-40 disabled:opacity-60 font-sans"
              aria-label="Describe your situation"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-leaf-forest text-white disabled:opacity-40 hover:bg-leaf-sage transition-colors"
              aria-label="Send message"
            >
              {isStreaming ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2 px-0.5">
            <p className="text-[11px] text-muted-foreground">
              {language === "es" ? "Presiona Enter para enviar y Shift+Enter para una nueva línea." : "Press Enter to send, Shift+Enter for a new line."}
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              {input.trim().length}/500
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            {language === "es" ? "Las respuestas de IA deben verificarse con fuentes oficiales. En emergencias llama al" : "AI responses should be verified with official sources. For emergencies call"}{" "}
            <a href="tel:911" className="font-semibold text-leaf-crimson">911</a>{" "}
            {language === "es" ? "o" : "or"}{" "}
            <a href="tel:988" className="font-semibold text-leaf-forest">988</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({
  content,
  isStreaming,
  isFirst,
  isLatest,
  onFollowUp,
  language,
}: {
  content: string;
  isStreaming?: boolean;
  isFirst?: boolean;
  isLatest?: boolean;
  onFollowUp?: (kind: "worked" | "fallback") => void;
  language?: Language;
}) {
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [verifiedOn] = useState(() => formatVerificationDate(new Date()));
  const checklistItems = useMemo(() => parseChecklistItems(content), [content]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const savePlan = () => {
    try {
      const key = "newleaf_saved_plans";
      const existing = localStorage.getItem(key);
      const plans = existing ? JSON.parse(existing) as Array<{ savedAt: string; content: string }> : [];
      plans.unshift({ savedAt: new Date().toISOString(), content });
      localStorage.setItem(key, JSON.stringify(plans.slice(0, 25)));
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      // localStorage may be unavailable
    }
  };

  const exportPlan = () => {
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `newleaf-plan-${stamp}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // file export may be blocked
    }
  };

  const toggleChecklistItem = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const showCopy = !isFirst && !isStreaming && content.length > 100;

  return (
    <div className={`flex gap-3 ${isFirst ? "" : "animate-slide-left"}`}>
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-full bg-leaf-forest flex items-center justify-center shadow-sm">
          <LeafIcon size={18} className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0 max-w-[94%]">
        <div className="rounded-2xl rounded-tl-sm bg-white border border-border px-5 py-4 shadow-sm">
          {content ? (
            <div
              className="chat-prose"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <TypingDots />
          )}
        </div>

        {!isFirst && content && (
          <div className="mt-2 rounded-xl border border-border/80 bg-leaf-mist/35 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center rounded-full border border-border bg-white px-2 py-0.5">
                {language === "es" ? `Verificado: ${verifiedOn}` : `Last verified: ${verifiedOn}`}
              </span>
              <span className="inline-flex items-center rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-amber-900">
                {language === "es" ? "Confianza: Confirmar" : "Confidence: Needs confirmation"}
              </span>
              <button
                onClick={() => setReported(true)}
                disabled={reported}
                className="inline-flex items-center rounded-full border border-border bg-white px-2 py-0.5 hover:bg-leaf-mist/60 transition-colors disabled:opacity-70"
                title={language === "es" ? "Reportar información desactualizada" : "Report outdated information"}
              >
                {reported ? (language === "es" ? "Gracias por avisar" : "Thanks for the report") : (language === "es" ? "Reportar info desactualizada" : "Report outdated info")}
              </button>
            </div>
          </div>
        )}

        {!isFirst && checklistItems.length > 0 && (
          <div className="mt-2 rounded-xl border border-border bg-white px-3 py-2">
            <button
              onClick={() => setChecklistOpen(v => !v)}
              className="text-[11px] font-medium text-leaf-forest hover:underline"
            >
              {checklistOpen ? (language === "es" ? "Ocultar lista" : "Hide checklist mode") : (language === "es" ? "Abrir lista" : "Open checklist mode")}
            </button>

            {checklistOpen && (
              <div className="mt-2 space-y-1.5">
                {checklistItems.map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                    <input
                      type="checkbox"
                      checked={!!checkedItems[idx]}
                      onChange={() => toggleChecklistItem(idx)}
                      className="mt-0.5"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-3 pl-1">
          {isStreaming && content && (
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-sage typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-sage typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-sage typing-dot" />
            </div>
          )}
          {showCopy && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-leaf-forest transition-colors"
              title="Copy response"
            >
              {copied ? (
                <><Check size={11} className="text-leaf-forest" /> {language === "es" ? "Copiado" : "Copied"}</>
              ) : (
                <><Copy size={11} /> {language === "es" ? "Copiar plan" : "Copy plan"}</>
              )}
            </button>
          )}
          {!isFirst && !isStreaming && content.length > 100 && (
            <button
              onClick={savePlan}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-leaf-forest transition-colors"
              title="Save this plan"
            >
              {saved ? (language === "es" ? "Guardado" : "Saved") : (language === "es" ? "Guardar plan" : "Save plan")}
            </button>
          )}
          {!isFirst && !isStreaming && content.length > 100 && (
            <button
              onClick={exportPlan}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-leaf-forest transition-colors"
              title="Export plan as text"
            >
              {language === "es" ? "Exportar .txt" : "Export .txt"}
            </button>
          )}
        </div>

        {!isFirst && isLatest && !isStreaming && !!onFollowUp && (
          <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
            <button
              onClick={() => onFollowUp("worked")}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-foreground/85 hover:bg-leaf-mist/70 hover:border-leaf-sage transition-colors"
            >
              {language === "es" ? "Esto funcionó" : "This worked"}
            </button>
            <button
              onClick={() => onFollowUp("fallback")}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-foreground/85 hover:bg-leaf-mist/70 hover:border-leaf-sage transition-colors"
            >
              {language === "es" ? "Necesito más opciones" : "Need backup options"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end animate-slide-right">
      <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-leaf-forest px-4 py-3 shadow-sm">
        <p className="text-white text-sm leading-relaxed font-sans whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 py-1">
      <span className="w-2 h-2 rounded-full bg-leaf-sage typing-dot" />
      <span className="w-2 h-2 rounded-full bg-leaf-sage typing-dot" />
      <span className="w-2 h-2 rounded-full bg-leaf-sage typing-dot" />
    </div>
  );
}