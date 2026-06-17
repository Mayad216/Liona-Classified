import { cn } from "@/lib/utils";
import type { ResumeSectionDef, ResumeSectionId } from "@/lib/resume/sections";

interface Props {
  sections: ResumeSectionDef[];
  active: ResumeSectionId;
  onSelect: (id: ResumeSectionId) => void;
  completion: Partial<Record<ResumeSectionId, boolean>>;
}

export function ResumeSectionNav({ sections, active, onSelect, completion }: Props) {
  return (
    <nav className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Resume sections
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => {
          const isActive = section.id === active;
          const done = completion[section.id];
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 border-l-[3px] px-4 py-2.5 text-left text-sm transition",
                  isActive
                    ? "border-[#00a67e] bg-[#00a67e]/8 font-semibold text-slate-900"
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="text-base leading-none" aria-hidden>
                  {section.icon}
                </span>
                <span className="min-w-0 flex-1 truncate">{section.label}</span>
                {done && (
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      isActive ? "bg-[#00a67e]" : "bg-emerald-400"
                    )}
                    title="Section started"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
