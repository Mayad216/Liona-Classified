import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", ready: true },
  { code: "ar", label: "Arabic", native: "العربية", ready: true },
  { code: "hi", label: "Hindi", native: "हिन्दी", ready: false },
  { code: "ur", label: "Urdu", native: "اردو", ready: false },
  { code: "ru", label: "Russian", native: "Русский", ready: false },
  { code: "tl", label: "Tagalog", native: "Tagalog", ready: false },
  { code: "tr", label: "Turkish", native: "Türkçe", ready: false },
  { code: "fa", label: "Farsi", native: "فارسی", ready: false },
] as const;

const KEY = "khaleej:lang";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string>(() => localStorage.getItem(KEY) || "en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (c: string) => {
    setCode(c);
    localStorage.setItem(KEY, c);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase tracking-wider text-[11px] font-bold">
          {current.code}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => l.ready && pick(l.code)}
              disabled={!l.ready}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-2 text-sm transition",
                l.ready ? "hover:bg-slate-50" : "cursor-not-allowed opacity-60",
                code === l.code && "bg-brand-50 text-brand-700"
              )}
            >
              <div className="flex flex-col text-left">
                <span className="font-medium">{l.label}</span>
                <span className="text-[11px] text-slate-500">{l.native}</span>
              </div>
              <div className="flex items-center gap-2">
                {!l.ready && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                    Soon
                  </span>
                )}
                {code === l.code && (
                  <Check className="h-4 w-4 text-brand-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
