import type { JobApplicationAnswers, JobApplicationQuestion } from "@/types/jobApplication";

export function validateScreeningAnswers(
  questions: JobApplicationQuestion[],
  answers: JobApplicationAnswers
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    if (!question.required) continue;
    const value = answers[question.template_id];
    if (
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors[question.template_id] = `${question.label} is required.`;
    }
  }

  return errors;
}
