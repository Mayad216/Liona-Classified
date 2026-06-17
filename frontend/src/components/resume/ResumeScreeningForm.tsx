import type {
  ResumeScreeningAnswers,
  ResumeScreeningQuestion,
  ResumeScreeningSourceMeta,
} from "@/types/resumeScreening";
import { cn } from "@/lib/utils";

type Props = {
  sources: ResumeScreeningSourceMeta[];
  questionsBySource: Record<string, ResumeScreeningQuestion[]>;
  answers: ResumeScreeningAnswers;
  onChange: (answers: ResumeScreeningAnswers) => void;
  errors?: Record<string, string>;
};

export function ResumeScreeningForm({
  sources,
  questionsBySource,
  answers,
  onChange,
  errors = {},
}: Props) {
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
    <div className="space-y-8">
      {sources.map((source) => {
        const questions = questionsBySource[source.id] ?? [];
        if (questions.length === 0) return null;

        return (
          <section
            key={source.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 border-b border-slate-100 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#008f6b]">
                {source.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">{source.description}</p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-slate-400 hover:text-[#006b52]"
              >
                {source.url.replace(/^https:\/\//, "")}
              </a>
            </div>

            <div className="space-y-5">
              {questions.map((question) => {
                const key = question.id;
                const error = errors[key];
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-900">
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
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#00a67e]"
                      />
                    )}

                    {question.type === "single_choice" && (
                      <div className="mt-2 space-y-1.5">
                        {(question.options ?? []).map((option) => (
                          <label
                            key={option}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
                              answers[key] === option
                                ? "border-[#00a67e] bg-[#00a67e]/10"
                                : "border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <input
                              type="radio"
                              name={key}
                              checked={answers[key] === option}
                              onChange={() => setAnswer(key, option)}
                              className="accent-[#00a67e]"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === "multi_choice" && (
                      <div className="mt-2 space-y-1.5">
                        {(question.options ?? []).map((option) => {
                          const selected = Array.isArray(answers[key])
                            ? (answers[key] as string[]).includes(option)
                            : false;
                          return (
                            <label
                              key={option}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
                                selected
                                  ? "border-[#00a67e] bg-[#00a67e]/10"
                                  : "border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMulti(key, option)}
                                className="accent-[#00a67e]"
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
