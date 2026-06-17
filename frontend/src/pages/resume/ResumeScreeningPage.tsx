import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ResumeScreeningWizard } from "@/components/resume/ResumeScreeningWizard";
import {
  applyScreeningToResumeData,
  fetchResumeScreeningCatalog,
  getStoredScreeningAnswers,
} from "@/lib/resume/resumeScreening";
import { needsScreening, resumeBuilderPath } from "@/lib/resume/setup";
import { useResume } from "@/lib/resume/useResume";
import type { ResumeScreeningAnswers, ResumeScreeningCatalog } from "@/types/resumeScreening";

export function ResumeScreeningPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resume, save, saving } = useResume(id);
  const [catalog, setCatalog] = useState<ResumeScreeningCatalog | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [answers, setAnswers] = useState<ResumeScreeningAnswers>({});

  useEffect(() => {
    fetchResumeScreeningCatalog()
      .then(setCatalog)
      .finally(() => setLoadingCatalog(false));
  }, []);

  useEffect(() => {
    if (resume) {
      setAnswers(getStoredScreeningAnswers(resume.data));
    }
  }, [resume]);

  if (!id) return null;

  if (resume && !needsScreening(resume)) {
    return <Navigate to={resumeBuilderPath(resume)} replace />;
  }

  if (!resume || loadingCatalog || !catalog) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#eef1f4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00a67e]" />
      </div>
    );
  }

  const handleComplete = () => {
    const prefilledData = applyScreeningToResumeData(
      { ...resume.data, builder_screening: answers },
      answers
    );

    save({
      setup_step: "template",
      data: prefilledData,
    });

    navigate(`/resume/${id}/template`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eef1f4] pb-16">
      <div className="border-b border-slate-200 bg-white">
        <div className="container max-w-2xl py-8">
          <Link to="/resume" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            ← Back to resumes
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#008f6b]">
            Step 1 of 3 · Screening
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Tell us about your job search
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            One question at a time — the same intake style used by{" "}
            <a
              href="https://jobcopilot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#006b52] hover:underline"
            >
              JobCopilot
            </a>{" "}
            and{" "}
            <a
              href="https://app.resumebuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#006b52] hover:underline"
            >
              ResumeBuilder.com
            </a>
            . You can edit these answers anytime while building your resume.
          </p>
          {catalog.note && (
            <p className="mt-3 text-xs text-slate-500">{catalog.note}</p>
          )}
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <ResumeScreeningWizard
          questions={catalog.questions}
          sources={catalog.sources}
          answers={answers}
          onChange={setAnswers}
          onComplete={handleComplete}
          completeLabel={saving ? "Saving…" : "Continue to templates"}
          completing={saving}
        />
      </div>
    </div>
  );
}
