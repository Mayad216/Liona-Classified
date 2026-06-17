import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Globe,
  Loader2,
  Palette,
  Type,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  RESUME_ACCENT_COLORS,
  RESUME_FONT_OPTIONS,
  type ResumeDesignSettings,
} from "@/lib/resume/sections";
import type { ResumeTemplate } from "@/lib/resume/templates";
import { ResumeTemplateCatalog } from "@/components/resume/ResumeTemplateCatalog";

interface Props {
  title: string;
  onTitleChange: (title: string) => void;
  saving: boolean;
  template: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
  design: ResumeDesignSettings;
  onDesignChange: (design: ResumeDesignSettings) => void;
  onDownload: () => void;
  onShare: () => void;
  sharing: boolean;
  isPublic: boolean;
  onCopyLink?: () => void;
  copied?: boolean;
  onEditScreening?: () => void;
}

export function ResumeBuilderHeader({
  title,
  onTitleChange,
  saving,
  template,
  onTemplateChange,
  design,
  onDesignChange,
  onDownload,
  onShare,
  sharing,
  isPublic,
  onCopyLink,
  copied,
  onEditScreening,
}: Props) {
  const [designOpen, setDesignOpen] = useState(false);

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/resume"
            className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00a67e] text-white">
              <FileText className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Resume Builder</span>
          </Link>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="min-w-0 max-w-[200px] truncate border-b border-transparent bg-transparent text-sm font-semibold text-slate-900 outline-none focus:border-[#00a67e] sm:max-w-xs"
          />
          {saving && (
            <span className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onEditScreening && (
            <button
              type="button"
              onClick={onEditScreening}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Job search answers</span>
              <span className="sm:hidden">Answers</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setDesignOpen(!designOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Palette className="h-3.5 w-3.5" />
              Design
              <ChevronDown className={cn("h-3.5 w-3.5 transition", designOpen && "rotate-180")} />
            </button>
            {designOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close design menu"
                  onClick={() => setDesignOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Type className="h-3.5 w-3.5" /> Template
                  </p>
                  <ResumeTemplateCatalog
                    value={template}
                    onChange={onTemplateChange}
                    compact
                  />
                  <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Accent color
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {RESUME_ACCENT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.label}
                        onClick={() =>
                          onDesignChange({ ...design, accentColor: c.value })
                        }
                        className={cn(
                          "h-7 w-7 rounded-full border-2 transition",
                          design.accentColor === c.value
                            ? "border-slate-900 scale-110"
                            : "border-white shadow ring-1 ring-slate-200"
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Font
                  </p>
                  <select
                    value={design.fontFamily}
                    onChange={(e) =>
                      onDesignChange({ ...design, fontFamily: e.target.value })
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                  >
                    {RESUME_FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={sharing}
            onClick={onShare}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
          >
            <Globe className="h-3.5 w-3.5" />
            {isPublic ? "Unpublish" : "Share"}
          </button>
          {isPublic && onCopyLink && (
            <button
              type="button"
              onClick={onCopyLink}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Link"}
            </button>
          )}

          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a67e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#008f6b]"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>
    </header>
  );
}
