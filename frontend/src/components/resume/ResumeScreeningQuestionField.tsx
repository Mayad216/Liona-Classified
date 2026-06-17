import type { ResumeScreeningAnswers, ResumeScreeningQuestion } from "@/types/resumeScreening";
import { ResumeJobTitleQuestionField } from "@/components/resume/ResumeJobTitleQuestionField";
import { cn } from "@/lib/utils";

type Props = {
  question: ResumeScreeningQuestion;
  answers: ResumeScreeningAnswers;
  onChange: (answers: ResumeScreeningAnswers) => void;
  error?: string;
};

export function ResumeScreeningQuestionField({
  question,
  answers,
  onChange,
  error,
}: Props) {
  const key = question.id;

  function setAnswer(value: string | string[]) {
    onChange({ ...answers, [key]: value });
  }

  function toggleMulti(option: string) {
    const current = Array.isArray(answers[key]) ? (answers[key] as string[]) : [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setAnswer(next);
  }

  return (
    <div>
      <label className="block text-lg font-semibold text-slate-900 sm:text-xl">
        {question.label}
        {question.required ? (
          <span className="text-red-500"> *</span>
        ) : (
          <span className="text-sm font-normal text-slate-400"> (optional)</span>
        )}
      </label>
      {question.help_text && (
        <p className="mt-2 text-sm text-slate-500">{question.help_text}</p>
      )}

      {question.type === "job_title" && (
        <ResumeJobTitleQuestionField
          value={(answers[key] as string) ?? ""}
          onChange={(next) => setAnswer(next)}
          placeholder={question.placeholder}
        />
      )}

      {question.type === "text" && (
        <input
          type="text"
          value={(answers[key] as string) ?? ""}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={question.placeholder}
          autoFocus
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20"
        />
      )}

      {question.type === "single_choice" && (
        <div className="mt-4 space-y-2">
          {(question.options ?? []).map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm sm:text-base",
                answers[key] === option
                  ? "border-[#00a67e] bg-[#00a67e]/10"
                  : "border-slate-200 hover:bg-slate-50"
              )}
            >
              <input
                type="radio"
                name={key}
                checked={answers[key] === option}
                onChange={() => setAnswer(option)}
                className="accent-[#00a67e]"
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {question.type === "multi_choice" && (
        <div className="mt-4 space-y-2">
          {(question.options ?? []).map((option) => {
            const selected = Array.isArray(answers[key])
              ? (answers[key] as string[]).includes(option)
              : false;
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm sm:text-base",
                  selected
                    ? "border-[#00a67e] bg-[#00a67e]/10"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleMulti(option)}
                  className="accent-[#00a67e]"
                />
                {option}
              </label>
            );
          })}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
