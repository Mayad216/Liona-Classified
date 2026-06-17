import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  visible: boolean;
  onChange: (visible: boolean) => void;
  className?: string;
}

/** Opt-in toggle — profile appears in roommate search only when enabled. */
export function ProfileVisibilityToggle({ visible, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        visible
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white"
          : "border-slate-200 bg-gradient-to-br from-slate-50 to-white",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
              visible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            )}
          >
            {visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-semibold text-slate-900">Show my profile in search</p>
            <p className="mt-1 text-sm text-slate-600">
              {visible
                ? "Other people looking for a roommate can find and match with you."
                : "Your profile stays hidden. You can still search and view matches, but others won't see you."}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={visible}
          onClick={() => onChange(!visible)}
          className={cn(
            "relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition",
            visible ? "bg-emerald-600" : "bg-slate-300"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
              visible ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
