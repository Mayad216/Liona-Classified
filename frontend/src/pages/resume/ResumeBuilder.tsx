import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ResumeBuilderHeader } from "@/components/resume/builder/ResumeBuilderHeader";
import { ResumePreviewPanel } from "@/components/resume/builder/ResumePreviewPanel";
import { ResumeSectionEditor } from "@/components/resume/builder/ResumeSectionEditor";
import { ResumeSectionNav } from "@/components/resume/builder/ResumeSectionNav";
import { ResumeUpgradeModal } from "@/components/resume/ResumeUpgradeModal";
import { EditScreeningAnswersModal } from "@/components/resume/EditScreeningAnswersModal";
import { useResume } from "@/lib/resume/useResume";
import { useResumePlan } from "@/lib/resume/useResumePlan";
import {
  RESUME_SECTIONS,
  getSectionDef,
  loadResumeDesign,
  saveResumeDesign,
  type ResumeDesignSettings,
  type ResumeSectionId,
} from "@/lib/resume/sections";
import { api, getStoredAuthToken } from "@/lib/api";
import { resumeStore } from "@/lib/resume/store";
import { BUILDER_PREVIEW_SCALE } from "@/lib/resume/pageSize";
import type { ResumeData } from "@/types/resume";

function sectionCompletion(data: ResumeData): Partial<Record<ResumeSectionId, boolean>> {
  return {
    personal: Boolean(
      data.personal_info.full_name || data.personal_info.email || data.personal_info.phone
    ),
    summary: Boolean(data.summary.trim()),
    experience: data.experiences.some((e) => e.job_title || e.company),
    education: data.education.some((e) => e.degree || e.school),
    skills: data.skills.length > 0,
    languages: data.languages.some((l) => l.name),
    projects: data.projects.some((p) => p.name),
    certifications: data.certifications.some((c) => c.name),
  };
}

export function ResumeBuilder({ id }: { id: string }) {
  const { resume, save, setTemplate, saving, downloadPdf } = useResume(id);
  const { isPro } = useResumePlan();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<ResumeSectionId>("personal");
  const [design, setDesign] = useState<ResumeDesignSettings>(() => loadResumeDesign(id));
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(searchParams.get("upgrade") === "1");
  const [screeningOpen, setScreeningOpen] = useState(false);

  useEffect(() => {
    saveResumeDesign(id, design);
  }, [id, design]);

  const completion = useMemo(
    () => (resume ? sectionCompletion(resume.data) : {}),
    [resume]
  );

  if (!resume) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#eef1f4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00a67e]" />
      </div>
    );
  }

  const showWatermark = !isPro && (resume.watermark !== false);
  const sectionMeta = getSectionDef(activeSection);

  const frontendShareUrl = (token: string) =>
    `${window.location.origin}/resume/share/${token}`;

  const toggleShare = async () => {
    setPublishing(true);
    try {
      const nextPublic = !resume.is_public;
      let token = resume.share_token ?? crypto.randomUUID();
      const authToken = getStoredAuthToken();

      if (authToken) {
        const res = await api.publishResume(resume.id, nextPublic, authToken);
        save({ is_public: nextPublic, share_token: res.data.share_token });
        token = res.data.share_token ?? token;
      } else {
        save({ is_public: nextPublic, share_token: token });
        resumeStore.save(String(resume.id), { is_public: nextPublic, share_token: token });
      }

      setShareUrl(nextPublic ? frontendShareUrl(token) : null);
    } catch {
      const token = resume.share_token ?? crypto.randomUUID();
      save({ is_public: true, share_token: token });
      setShareUrl(frontendShareUrl(token));
    } finally {
      setPublishing(false);
    }
  };

  const copyShare = async () => {
    const url =
      shareUrl ??
      (resume.share_token && resume.is_public
        ? frontendShareUrl(resume.share_token)
        : null);
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-[#eef1f4]">
      <ResumeBuilderHeader
        title={resume.title}
        onTitleChange={(title) => save({ title })}
        saving={saving}
        template={resume.template}
        onTemplateChange={setTemplate}
        design={design}
        onDesignChange={setDesign}
        onDownload={downloadPdf}
        onShare={toggleShare}
        sharing={publishing}
        isPublic={Boolean(resume.is_public)}
        onCopyLink={copyShare}
        copied={copied}
        onEditScreening={() => setScreeningOpen(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="hidden w-56 shrink-0 lg:block xl:w-60">
          <ResumeSectionNav
            sections={RESUME_SECTIONS}
            active={activeSection}
            onSelect={setActiveSection}
            completion={completion}
          />
        </div>

        {/* Mobile section picker */}
        <div className="border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as ResumeSectionId)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium"
          >
            {RESUME_SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <ResumeSectionEditor
            section={activeSection}
            data={resume.data}
            onChange={(data) => save({ data })}
          />

          <div className="mt-6 flex justify-between gap-3 lg:max-w-2xl">
            <button
              type="button"
              disabled={activeSection === RESUME_SECTIONS[0].id}
              onClick={() => {
                const idx = RESUME_SECTIONS.findIndex((s) => s.id === activeSection);
                if (idx > 0) setActiveSection(RESUME_SECTIONS[idx - 1].id);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={activeSection === RESUME_SECTIONS[RESUME_SECTIONS.length - 1].id}
              onClick={() => {
                const idx = RESUME_SECTIONS.findIndex((s) => s.id === activeSection);
                if (idx < RESUME_SECTIONS.length - 1) {
                  setActiveSection(RESUME_SECTIONS[idx + 1].id);
                }
              }}
              className="rounded-lg bg-[#00a67e] px-4 py-2 text-sm font-bold text-white hover:bg-[#008f6b] disabled:opacity-40"
            >
              {activeSection === RESUME_SECTIONS[RESUME_SECTIONS.length - 1].id
                ? "Complete"
                : "Next section"}
            </button>
          </div>
        </div>

        <div
          className="hidden shrink-0 xl:block"
          style={{ width: `calc(210mm * ${BUILDER_PREVIEW_SCALE} + 2.5rem)` }}
        >
          <ResumePreviewPanel
            data={resume.data}
            template={resume.template}
            design={design}
            watermark={showWatermark}
            section={sectionMeta}
          />
        </div>
      </div>

      {/* Mobile preview */}
      <div className="border-t border-slate-200 bg-[#e8ecf0] p-4 xl:hidden">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Preview
        </p>
        <ResumePreviewPanel
          data={resume.data}
          template={resume.template}
          design={design}
          watermark={showWatermark}
          section={sectionMeta}
          compact
        />
      </div>

      <ResumeUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgraded={() => save({ watermark: false })}
      />

      <EditScreeningAnswersModal
        open={screeningOpen}
        onClose={() => setScreeningOpen(false)}
        data={resume.data}
        saving={saving}
        onSave={(data) => save({ data })}
      />
    </div>
  );
}
