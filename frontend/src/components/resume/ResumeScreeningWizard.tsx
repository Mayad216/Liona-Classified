import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResumeScreeningQuestionField } from "@/components/resume/ResumeScreeningQuestionField";
import {
  getSourceMeta,
  validateScreeningQuestion,
} from "@/lib/resume/resumeScreening";
import type {
  ResumeScreeningAnswers,
  ResumeScreeningQuestion,
  ResumeScreeningSourceMeta,
} from "@/types/resumeScreening";

type Props = {
  questions: ResumeScreeningQuestion[];
  sources: ResumeScreeningSourceMeta[];
  answers: ResumeScreeningAnswers;
  onChange: (answers: ResumeScreeningAnswers) => void;
  onComplete: () => void;
  onCancel?: () => void;
  initialStep?: number;
  completeLabel?: string;
  showStepHeader?: boolean;
  completing?: boolean;
};

export function ResumeScreeningWizard({
  questions,
  sources,
  answers,
  onChange,
  onComplete,
  onCancel,
  initialStep = 0,
  completeLabel = "Continue to templates",
  showStepHeader = true,
  completing = false,
}: Props) {
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState<string | undefined>();

  const total = questions.length;
  const current = questions[step];
  const source = current ? getSourceMeta(sources, current.source) : undefined;
  const progress = total > 0 ? ((step + 1) / total) * 100 : 0;

  const canGoBack = step > 0;
  const isLast = step >= total - 1;

  const stepLabel = useMemo(() => {
    if (total === 0) return "";
    return `Question ${step + 1} of ${total}`;
  }, [step, total]);

  if (!current || total === 0) {
    return (
      <p className="text-sm text-slate-500">No screening questions available.</p>
    );
  }

  const goNext = () => {
    const validationError = validateScreeningQuestion(current, answers);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(undefined);
    if (isLast) {
      onComplete();
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(undefined);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div>
      {showStepHeader && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <span>{stepLabel}</span>
            {source && <span className="text-[#008f6b]">{source.name}</span>}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#00a67e] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {source && (
          <p className="mb-4 text-xs text-slate-400">
            Inspired by{" "}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#006b52] hover:underline"
            >
              {source.name}
            </a>
          </p>
        )}

        <ResumeScreeningQuestionField
          question={current}
          answers={answers}
          onChange={(next) => {
            setError(undefined);
            onChange(next);
          }}
          error={error}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          ) : (
            canGoBack && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="border-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && canGoBack && (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="border-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            type="button"
            className="bg-[#00a67e] hover:bg-[#008f6b]"
            onClick={goNext}
            disabled={completing}
          >
            {isLast ? completeLabel : "Next"}
            {!isLast && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
