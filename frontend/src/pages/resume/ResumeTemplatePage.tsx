import { useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ResumeTemplatePreviewCard } from "@/components/resume/ResumeTemplatePreviewCard";
import { ResumePreview } from "@/components/resume/ResumePreview";
import {
  ATS_PLATFORMS,
  getAtsPlatform,
  type AtsPlatformId,
} from "@/lib/resume/atsPlatforms";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sampleResumeData";
import { needsScreening, needsTemplateSelection } from "@/lib/resume/setup";
import { loadResumeDesign, saveResumeDesign } from "@/lib/resume/sections";
import {
  getModernTemplates,
  getTemplatesForPlatform,
  RESUME_TEMPLATES,
  type ResumeTemplate,
} from "@/lib/resume/templates";
import { useResumeBuilderCatalog } from "@/lib/resume/useResumeBuilderCatalog";
import { useResume } from "@/lib/resume/useResume";
import { cn } from "@/lib/utils";
import type { TemplateMeta } from "@/lib/resume/templates";

type TemplateFilter = AtsPlatformId | "all" | "modern" | "resumebuilder";

export function ResumeTemplatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resume, save, saving } = useResume(id);
  const { catalog: rbCatalog, templates: rbTemplates, loading: rbLoading } =
    useResumeBuilderCatalog();
  const [selected, setSelected] = useState<ResumeTemplate>("contemporary");
  const [platformFilter, setPlatformFilter] = useState<TemplateFilter>("resumebuilder");
  const [submitting, setSubmitting] = useState(false);

  const visibleTemplates: TemplateMeta[] = useMemo(() => {
    if (platformFilter === "all") return RESUME_TEMPLATES;
    if (platformFilter === "modern") return getModernTemplates();
    if (platformFilter === "resumebuilder") return rbTemplates;
    return getTemplatesForPlatform(platformFilter);
  }, [platformFilter, rbTemplates]);

  const selectedMeta =
    visibleTemplates.find((t) => t.id === selected) ??
    visibleTemplates[0] ??
    RESUME_TEMPLATES[0];
  const activePlatform =
    platformFilter === "all" || platformFilter === "modern" || platformFilter === "resumebuilder"
      ? null
      : getAtsPlatform(platformFilter);

  if (!id) return null;

  if (resume && needsScreening(resume)) {
    return <Navigate to={`/resume/${id}/screening`} replace />;
  }

  if (resume && !needsTemplateSelection(resume)) {
    return <Navigate to={`/resume/${id}/edit`} replace />;
  }

  if (!resume) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#eef1f4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00a67e]" />
      </div>
    );
  }

  const handleContinue = () => {
    setSubmitting(true);
    save({
      template: selected,
      setup_step: "complete",
    });
    const design = loadResumeDesign(id);
    saveResumeDesign(id, { ...design, accentColor: selectedMeta.previewAccent });
    navigate(`/resume/${id}/edit`);
    setSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eef1f4]">
      <div className="border-b border-slate-200 bg-white">
        <div className="container max-w-6xl py-8">
          <Link to="/resume" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            ← Back to resumes
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#008f6b]">
            Step 2 of 3 · Template
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Choose your resume template
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Pick a layout before you start filling in your details. Each template is ATS-safe but
            styled differently — you can change it later from the Design menu.
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setPlatformFilter("resumebuilder")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                platformFilter === "resumebuilder"
                  ? "border-[#00a67e] bg-[#00a67e]/10 text-[#006b52]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              ResumeBuilder.com
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter("modern")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                platformFilter === "modern"
                  ? "border-[#00a67e] bg-[#00a67e]/10 text-[#006b52]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              Modern picks
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                platformFilter === "all"
                  ? "border-[#00a67e] bg-[#00a67e]/10 text-[#006b52]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              All templates
            </button>
            {ATS_PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatformFilter(p.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  platformFilter === p.id
                    ? "border-[#00a67e] bg-[#00a67e]/10 text-[#006b52]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>

          {platformFilter === "resumebuilder" && rbCatalog && (
            <p className="mt-3 text-xs text-slate-500">
              Templates from{" "}
              <a
                href={rbCatalog.source}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#006b52] hover:underline"
              >
                ResumeBuilder.com
              </a>
              {rbCatalog.live_fetch ? " (app connected)" : " (public catalog)"}.{" "}
              {rbCatalog.live_fetch_message}
            </p>
          )}

          {activePlatform && (
            <p className="mt-3 text-xs text-slate-500">
              Showing templates approved for {activePlatform.name}. Preferred export:{" "}
              {activePlatform.preferredExport === "docx"
                ? ".docx"
                : activePlatform.preferredExport === "pdf"
                  ? ".pdf"
                  : ".docx or .pdf"}
            </p>
          )}
        </div>
      </div>

      <div className="container max-w-6xl py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rbLoading && platformFilter === "resumebuilder" ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#00a67e]" />
              </div>
            ) : (
              visibleTemplates.map((t) => (
                <ResumeTemplatePreviewCard
                  key={`${platformFilter}-${t.id}-${t.label}`}
                  template={t}
                  selected={selected === t.id}
                  onSelect={setSelected}
                />
              ))
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Live preview
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{selectedMeta.label}</p>
              <p className="mt-1 text-xs text-slate-500">{selectedMeta.blurb}</p>
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-100 bg-[#e8ecf0]">
                <div className="max-h-[420px] overflow-y-auto p-3">
                  <div className="origin-top scale-[0.48] sm:scale-[0.55]">
                    <ResumePreview
                      data={SAMPLE_RESUME_DATA}
                      template={selected}
                      accentColor={selectedMeta.previewAccent}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="mt-4 w-full bg-[#00a67e] hover:bg-[#008f6b]"
                onClick={handleContinue}
                disabled={submitting || saving}
              >
                Use this template & start
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
