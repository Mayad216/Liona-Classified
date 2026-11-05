import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Palette,
  Type,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDevice } from "@/lib/device";
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
  const [moreOpen, setMoreOpen] = useState(false);
  const { isCompact } = useDevice();

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white safe-top">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {onEditScreening && !isCompact && (
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

          {!isCompact && (
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
                    <DesignPanel
                      template={template}
                      onTemplateChange={onTemplateChange}
                      design={design}
                      onDesignChange={onDesignChange}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {!isCompact && (
            <>
              <button
                type="button"
                disabled={sharing}
                onClick={onShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Globe className="h-3.5 w-3.5" />
                {isPublic ? "Unpublish" : "Share"}
              </button>
              {isPublic && onCopyLink && (
                <button
                  type="button"
                  onClick={onCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Link"}
                </button>
              )}
            </>
          )}

          {isCompact && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                aria-label="More actions"
                className="inline-flex h-10 w-10 touch-target items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {moreOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Close menu"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    {onEditScreening && (
                      <button
                        type="button"
                        onClick={() => {
                          onEditScreening();
                          setMoreOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <ClipboardList className="h-4 w-4" /> Job search answers
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMoreOpen(false);
                        setDesignOpen(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Palette className="h-4 w-4" /> Design & template
                    </button>
                    <button
                      type="button"
                      disabled={sharing}
                      onClick={() => {
                        onShare();
                        setMoreOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Globe className="h-4 w-4" /> {isPublic ? "Unpublish" : "Share"}
                    </button>
                    {isPublic && onCopyLink && (
                      <button
                        type="button"
                        onClick={() => {
                          onCopyLink();
                          setMoreOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy link"}
                      </button>
                    )}
                  </div>
                </>
              )}
              {designOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/40"
                    aria-label="Close design panel"
                    onClick={() => setDesignOpen(false)}
                  />
                  <div className="fixed inset-x-3 bottom-3 z-50 max-h-[75dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                    <DesignPanel
                      template={template}
                      onTemplateChange={onTemplateChange}
                      design={design}
                      onDesignChange={onDesignChange}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onDownload}
            className="inline-flex touch-target items-center gap-1.5 rounded-lg bg-[#00a67e] px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#008f6b] sm:px-4"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:inline">Download</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function DesignPanel({
  template,
  onTemplateChange,
  design,
  onDesignChange,
}: {
  template: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
  design: ResumeDesignSettings;
  onDesignChange: (design: ResumeDesignSettings) => void;
}) {
  return (
    <>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Type className="h-3.5 w-3.5" /> Template
      </p>
      <ResumeTemplateCatalog value={template} onChange={onTemplateChange} compact />
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
              onClick={() => onDesignChange({ ...design, accentColor: c.value })}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition sm:h-7 sm:w-7",
                design.accentColor === c.value
                  ? "scale-110 border-slate-900"
                  : "border-white shadow ring-1 ring-slate-200"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Font</p>
        <select
          value={design.fontFamily}
          onChange={(e) => onDesignChange({ ...design, fontFamily: e.target.value })}
          className="h-11 w-full rounded-lg border border-slate-200 px-2 text-sm sm:h-9"
        >
          {RESUME_FONT_OPTIONS.map((f) => (
            <option key={f.id} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
