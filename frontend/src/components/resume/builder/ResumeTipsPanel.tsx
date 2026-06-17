import { Lightbulb } from "lucide-react";
import type { ResumeSectionDef } from "@/lib/resume/sections";

interface Props {
  section: ResumeSectionDef;
}

export function ResumeTipsPanel({ section }: Props) {
  return (
    <div className="border-t border-slate-200 bg-[#fffbeb] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Lightbulb className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold text-slate-900">Expert tips</h3>
      </div>
      <p className="mb-2 text-xs font-semibold text-amber-900/80">{section.label}</p>
      <ul className="space-y-2">
        {section.tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-xs leading-relaxed text-slate-700">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
