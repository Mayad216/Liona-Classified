import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Send, Sparkles, X, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  cta?: { to: string; label: string };
}

const seed: Message[] = [
  {
    id: "m1",
    from: "bot",
    text:
      "Hi! I'm Khaleej AI 🤖. Tell me what you're looking for — a room, a roommate, a job, or a service?",
    cta: { to: "/match", label: "Find me a roommate" },
  },
];

const canned = (q: string): { text: string; cta?: { to: string; label: string } } => {
  const lower = q.toLowerCase();
  if (
    lower.includes("roommate") ||
    lower.includes("match") ||
    lower.includes("compatible") ||
    lower.includes("flatmate")
  )
    return {
      text: "Perfect — that's exactly what our AI Matchmaking Agent is for! It scores compatibility across lifestyle, schedule, and habits.",
      cta: { to: "/match", label: "Open Matchmaker" },
    };
  if (lower.includes("room") || lower.includes("accommodation") || lower.includes("flat"))
    return {
      text: "Got it! I'll find verified rooms matching your budget. You can also let our AI Matchmaker find compatible roommates for shared listings.",
      cta: { to: "/accommodation", label: "Browse listings" },
    };
  if (lower.includes("job") || lower.includes("work"))
    return {
      text: "Sure — I can recommend jobs based on your CV. Upload one in your dashboard for AI-powered matches.",
      cta: { to: "/jobs", label: "See jobs" },
    };
  if (lower.includes("clean") || lower.includes("service") || lower.includes("ac"))
    return {
      text: "Excellent — our verified service providers respond within 30 minutes on average.",
      cta: { to: "/services", label: "Find a service" },
    };
  return {
    text: "Thanks! Our team and AI are on it. Looking for the perfect roommate? Try our AI Matchmaking Agent.",
    cta: { to: "/match", label: "Try AI matchmaker" },
  };
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(seed);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const userMsg: Message = { id: crypto.randomUUID(), from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setTimeout(() => {
      const reply = canned(text);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "bot", text: reply.text, cta: reply.cta },
      ]);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-105",
          open && "scale-90"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex w-[min(360px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300",
          open
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Khaleej AI Assistant</div>
            <div className="text-xs text-white/70">Typically replies instantly</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 bg-slate-50/60">
          {messages.map((m) => (
            <div key={m.id} className="space-y-2">
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.from === "bot"
                    ? "bg-white text-slate-800 shadow-sm rounded-tl-sm"
                    : "ml-auto bg-brand-600 text-white rounded-tr-sm"
                )}
              >
                {m.text}
              </div>
              {m.cta && m.from === "bot" && (
                <Link
                  to={m.cta.to}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {m.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything..."
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
          <button
            onClick={send}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
