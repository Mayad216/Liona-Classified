import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { ResumeScreeningWizard } from "@/components/resume/ResumeScreeningWizard";
import {
  applyScreeningToResumeData,
  fetchResumeScreeningCatalog,
  getStoredScreeningAnswers,
} from "@/lib/resume/resumeScreening";
import type { ResumeData } from "@/types/resume";
import type { ResumeScreeningAnswers, ResumeScreeningCatalog } from "@/types/resumeScreening";

type Props = {
  open: boolean;
  onClose: () => void;
  data: ResumeData;
  onSave: (data: ResumeData) => void;
  saving?: boolean;
};

export function EditScreeningAnswersModal({
  open,
  onClose,
  data,
  onSave,
  saving = false,
}: Props) {
  const [catalog, setCatalog] = useState<ResumeScreeningCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<ResumeScreeningAnswers>({});

  useEffect(() => {
    if (!open) return;
    setAnswers(getStoredScreeningAnswers(data));
    setLoading(true);
    fetchResumeScreeningCatalog()
      .then(setCatalog)
      .finally(() => setLoading(false));
  }, [open, data]);

  if (!open) return null;

  const handleSave = () => {
    const nextData = applyScreeningToResumeData(
      { ...data, builder_screening: answers },
      answers,
      { overwriteExisting: false }
    );
    onSave(nextData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl border border-slate-200 bg-[#eef1f4] shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:rounded-t-2xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#008f6b]">
              Job search answers
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Edit screening questions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update one answer at a time. Changes are saved when you finish.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6">
          {loading || !catalog ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#00a67e]" />
            </div>
          ) : (
            <ResumeScreeningWizard
              questions={catalog.questions}
              sources={catalog.sources}
              answers={answers}
              onChange={setAnswers}
              onComplete={handleSave}
              onCancel={onClose}
              completeLabel={saving ? "Saving…" : "Save answers"}
              completing={saving}
              showStepHeader
            />
          )}
        </div>
      </div>
    </div>
  );
}
