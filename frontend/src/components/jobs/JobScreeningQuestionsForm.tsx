import type { JobApplicationAnswers, JobApplicationQuestion } from "@/types/jobApplication";
import { cn } from "@/lib/utils";

type Props = {
  questions: JobApplicationQuestion[];
  answers: JobApplicationAnswers;
  onChange: (answers: JobApplicationAnswers) => void;
  errors?: Record<string, string>;
};

export function JobScreeningQuestionsForm({
  questions,
  answers,
  onChange,
  errors = {},
}: Props) {
  if (questions.length === 0) return null;

  function setAnswer(key: string, value: string | string[]) {
    onChange({ ...answers, [key]: value });
  }

  function toggleMulti(key: string, option: string) {
    const current = Array.isArray(answers[key]) ? (answers[key] as string[]) : [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setAnswer(key, next);
  }

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <p className="text-sm font-semibold text-slate-900">Screening questions</p>
      {questions.map((question) => {
        const key = question.template_id;
        const error = errors[key];
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-800">
              {question.label}
              {question.required ? (
                <span className="text-red-500"> *</span>
              ) : (
                <span className="text-xs font-normal text-slate-400"> (optional)</span>
              )}
            </label>
            {question.help_text && (
              <p className="mt-0.5 text-xs text-slate-500">{question.help_text}</p>
            )}

            {question.type === "text" && (
              <input
                type="text"
                value={(answers[key] as string) ?? ""}
                onChange={(e) => setAnswer(key, e.target.value)}
                placeholder={question.placeholder}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            )}

            {question.type === "date" && (
              <input
                type="date"
                value={(answers[key] as string) ?? ""}
                onChange={(e) => setAnswer(key, e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            )}

            {question.type === "single_choice" && (
              <div className="mt-2 space-y-1.5">
                {(question.options ?? []).map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      answers[key] === option
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      name={key}
                      checked={answers[key] === option}
                      onChange={() => setAnswer(key, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.type === "multi_choice" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(question.options ?? []).map((option) => {
                  const selected = Array.isArray(answers[key])
                    ? (answers[key] as string[]).includes(option)
                    : false;
                  return (
                    <label
                      key={option}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        selected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={() => toggleMulti(key, option)}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            )}

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}
