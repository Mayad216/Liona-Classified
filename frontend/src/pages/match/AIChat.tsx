import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import { DIMENSIONS, CATEGORIES } from "@/lib/matchmaking/config";
import type { Dimension } from "@/lib/matchmaking/types";
import { POPULAR_LANGUAGES, WORLD_LANGUAGES } from "@/lib/matchmaking/worldLanguages";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

interface ChatMsg {
  id: string;
  from: "ai" | "user";
  text: string;
  /** When set, this AI message belongs to a specific dimension and shows quick replies. */
  forKey?: string;
}

/**
 * Conversational onboarding. Walks the user through each dimension as a
 * friendly question, with quick-reply chips matching the dimension's option set.
 * Free-text answers are parsed against the dimension's options when possible.
 */
export function AIChat() {
  const navigate = useNavigate();
  const { profile, setPreference, completeness } = useMatchProfile();
  const [activeIdx, setActiveIdx] = useState(() => {
    return Math.max(
      0,
      DIMENSIONS.findIndex((d) => profile.preferences[d.key] == null)
    );
  });
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      id: crypto.randomUUID(),
      from: "ai",
      text:
        "Hey! I'm your matchmaking agent 🤖.\n\nI'll ask you a few quick questions about your lifestyle and find compatible roommates. You can tap an option, type freely, or write \"skip\" to skip any question.",
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const activeDim: Dimension | undefined = DIMENSIONS[activeIdx];

  /** When activeIdx changes, push the next AI question. */
  useEffect(() => {
    if (!activeDim) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          from: "ai",
          text:
            "That's everything I need! Ready to see your top matches? 🚀",
        },
      ]);
      return;
    }
    setMessages((m) => {
      // Avoid duplicating the same question if the user just answered.
      if (m[m.length - 1]?.forKey === activeDim.key) return m;
      return [
        ...m,
        {
          id: crypto.randomUUID(),
          from: "ai",
          text: questionFor(activeDim),
          forKey: activeDim.key,
        },
      ];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const completion = completeness();

  const handleAnswer = (answer: unknown, display: string) => {
    if (!activeDim) return;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: "user", text: display },
    ]);
    if (answer !== "__skip__") {
      setPreference(activeDim.key, answer);
    }
    // small delay so the user sees the typed message before the next question
    setTimeout(() => setActiveIdx((i) => i + 1), 150);
  };

  const handleSubmit = () => {
    if (!draft.trim()) return;
    if (!activeDim) return;
    const parsed = parseFreeText(activeDim, draft.trim());
    if (parsed === "__unparsable__") {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "user", text: draft },
        {
          id: crypto.randomUUID(),
          from: "ai",
          text:
            "I couldn't quite parse that — could you pick one of the options below, or rephrase?",
          forKey: activeDim.key,
        },
      ]);
      setDraft("");
      return;
    }
    handleAnswer(parsed, draft);
    setDraft("");
  };

  const quickReplies = useMemo(() => buildQuickReplies(activeDim), [activeDim]);

  return (
    <div className="bg-slate-50/60 min-h-[calc(100vh-64px)] py-8">
      <div className="container max-w-3xl">
        <div className="flex items-center justify-between">
          <Link
            to="/match/seeker"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link to="/match/profile">
            <Button variant="outline" size="sm">
              Switch to form view
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Khaleej AI · Matchmaker</div>
              <div className="text-xs text-white/70">
                Profile {Math.round(completion * 100)}% complete ·{" "}
                {activeDim
                  ? CATEGORIES[activeDim.category].label
                  : "Done"}
              </div>
            </div>
            <button
              onClick={() => {
                setMessages([messages[0]]);
                setActiveIdx(0);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium hover:bg-white/20"
              title="Restart"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
              style={{ width: `${Math.round(completion * 100)}%` }}
            />
          </div>

          {/* Messages */}
          <div className="max-h-[60vh] space-y-3 overflow-y-auto bg-slate-50/40 p-5">
            {messages.map((m) => (
              <Message key={m.id} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          {activeDim && quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white p-4">
              {quickReplies.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleAnswer(q.value, q.label)}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                >
                  {q.label}
                </button>
              ))}
              <button
                onClick={() => handleAnswer("__skip__", "Skip")}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-600"
              >
                Skip
              </button>
            </div>
          )}

          {/* Composer */}
          {activeDim ? (
            <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type your answer..."
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
              <button
                onClick={handleSubmit}
                disabled={!draft.trim()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 bg-gradient-to-br from-brand-50 to-accent-50/40 p-5 text-center">
              <Button size="lg" onClick={() => navigate("/match/seeker")}>
                <Sparkles className="h-4 w-4" />
                See my matches
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }: { msg: ChatMsg }) {
  if (msg.from === "ai") {
    return (
      <div className="flex items-end gap-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end justify-end gap-2">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-sm text-white">
        {msg.text}
      </div>
      <Avatar name="You" size="sm" className="bg-slate-200 text-slate-700" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Helpers — turn a Dimension into a friendly question + quick replies
// ─────────────────────────────────────────────────────────────────────

function questionFor(dim: Dimension): string {
  const lead = dim.icon ? `${dim.icon} ` : "";
  const optional = dim.optional ? " (optional — skip if you prefer)" : "";
  switch (dim.type.kind) {
    case "enum":
      return `${lead}${dim.label}${optional} — pick one:`;
    case "multi-select":
      return `${lead}${dim.label} — tap as many as fit${
        dim.type.maxSelectable ? ` (up to ${dim.type.maxSelectable})` : ""
      }:`;
    case "language-multi-select":
      return `${lead}${dim.label} — type a language name or use the form view to pick from the full list:`;
    case "scale":
      return `${lead}On a scale of ${dim.type.min} to ${dim.type.max}, ${dim.label.toLowerCase()}?\n(${dim.type.labelLow} → ${dim.type.labelHigh})`;
    case "boolean":
      return `${lead}${dim.label}?`;
    case "range":
      return `${lead}What's your preferred ${dim.label.toLowerCase()}?`;
  }
}

interface QuickReply {
  label: string;
  value: unknown;
}

function buildQuickReplies(dim?: Dimension): QuickReply[] {
  if (!dim) return [];
  const t = dim.type;
  switch (t.kind) {
    case "enum":
      return t.options.map((o) => ({ label: o, value: o }));
    case "multi-select":
      // For multi-select we just expose the options; the user has to use
      // the form view to multi-select cleanly. Each tap commits a single choice.
      return t.options.map((o) => ({ label: o, value: [o] }));
    case "language-multi-select":
      return POPULAR_LANGUAGES.map((o) => ({ label: o, value: [o] }));
    case "scale": {
      const min = t.min;
      const max = t.max;
      return Array.from({ length: max - min + 1 }, (_, i) => min + i).map(
        (n) => ({ label: String(n), value: n })
      );
    }
    case "boolean":
      return [
        { label: t.labelTrue ?? "Yes", value: true },
        { label: t.labelFalse ?? "No", value: false },
      ];
    case "range": {
      const min = t.min;
      const max = t.max;
      const mid = Math.round((min + max) / 2);
      return [
        { label: `${min}–${mid}`, value: [min, mid] },
        { label: `${mid}–${max}`, value: [mid, max] },
        { label: "No preference", value: [min, max] },
      ];
    }
  }
}

/** Try to map free-text to a valid value for the dimension. */
function parseFreeText(dim: Dimension, raw: string): unknown | "__unparsable__" {
  const text = raw.toLowerCase();
  if (text === "skip" || text === "no preference") return "__skip__";

  switch (dim.type.kind) {
    case "enum":
    case "multi-select": {
      const matches = dim.type.options.filter((o) =>
        text.includes(o.toLowerCase())
      );
      if (matches.length === 0) return "__unparsable__";
      return dim.type.kind === "multi-select" ? matches : matches[0];
    }
    case "language-multi-select": {
      const matches = WORLD_LANGUAGES.filter((o) => text.includes(o.toLowerCase()));
      if (matches.length === 0) return "__unparsable__";
      return [matches[0]];
    }
    case "scale":
    case "range": {
      const nums = (raw.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
      if (nums.length === 0) return "__unparsable__";
      if (dim.type.kind === "scale") {
        const n = Math.max(dim.type.min, Math.min(dim.type.max, nums[0]));
        return n;
      }
      const a = Math.max(dim.type.min, Math.min(dim.type.max, nums[0]));
      const b = Math.max(dim.type.min, Math.min(dim.type.max, nums[1] ?? a));
      return [Math.min(a, b), Math.max(a, b)];
    }
    case "boolean":
      if (/\b(yes|yeah|yep|sure|ok|y)\b/.test(text)) return true;
      if (/\b(no|nope|nah|never|n)\b/.test(text)) return false;
      return "__unparsable__";
  }
}
