import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function DealbreakerToggle({
  active,
  onChange,
  compact,
}: {
  active: boolean;
  onChange: (next: boolean) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      title={
        active
          ? "Deal-breaker on — anyone who clashes on this is hidden"
          : "Mark as deal-breaker"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-widest transition",
        compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
        active
          ? "border-red-300 bg-red-50 text-red-700 shadow-sm shadow-red-100"
          : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50/50 hover:text-red-600"
      )}
    >
      <ShieldAlert className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {active ? "Deal-breaker" : "Flexible"}
    </button>
  );
}
