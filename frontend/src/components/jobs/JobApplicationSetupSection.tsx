import { useEffect, useState } from "react";
import { ClipboardList, Mail, ExternalLink, Globe } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type {
  JobApplicationMethod,
  JobApplicationQuestion,
  JobApplicationQuestionTemplate,
} from "@/types/jobApplication";
import {
  JOB_APPLICATION_QUESTION_TEMPLATES,
  templateToJobQuestion,
} from "@/lib/jobs/applicationQuestionTemplates";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  applicationMethod: JobApplicationMethod;
  onApplicationMethodChange: (method: JobApplicationMethod) => void;
  applicationContact: string;
  onApplicationContactChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  questions: JobApplicationQuestion[];
  onQuestionsChange: (questions: JobApplicationQuestion[]) => void;
};

export function JobApplicationSetupSection({
  applicationMethod,
  onApplicationMethodChange,
  applicationContact,
  onApplicationContactChange,
  startDate,
  onStartDateChange,
  questions,
  onQuestionsChange,
}: Props) {
  const [templates, setTemplates] = useState<JobApplicationQuestionTemplate[]>(
    JOB_APPLICATION_QUESTION_TEMPLATES
  );

  useEffect(() => {
    api
      .jobApplicationQuestionTemplates()
      .then((res) => {
        if (res.data?.length) setTemplates(res.data as JobApplicationQuestionTemplate[]);
      })
      .catch(() => {
        /* bundled fallback */
      });
  }, []);

  const selectedIds = new Set(questions.map((q) => q.template_id));

  function toggleTemplate(template: JobApplicationQuestionTemplate) {
    if (selectedIds.has(template.id)) {
      onQuestionsChange(questions.filter((q) => q.template_id !== template.id));
      return;
    }
    onQuestionsChange([...questions, templateToJobQuestion(template)]);
  }

  function toggleRequired(templateId: string) {
    onQuestionsChange(
      questions.map((q) =>
        q.template_id === templateId ? { ...q, required: !q.required } : q
      )
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ClipboardList className="h-4 w-4 text-brand-600" />
          Application settings
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Choose where candidates apply, set an expected start date, and add screening questions
          (Indeed / LinkedIn-style).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            {
              value: "platform" as const,
              label: "Apply on Khaleej",
              sub: "Resume + screening on our platform",
              icon: Globe,
            },
            {
              value: "external_email" as const,
              label: "External email",
              sub: "Send applicants to your inbox",
              icon: Mail,
            },
            {
              value: "external_url" as const,
              label: "External URL",
              sub: "Link to your ATS or careers page",
              icon: ExternalLink,
            },
          ] as const
        ).map(({ value, label, sub, icon: Icon }) => {
          const active = applicationMethod === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onApplicationMethodChange(value)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                active
                  ? "border-brand-600 bg-brand-50/70 ring-1 ring-brand-600"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-brand-600" : "text-slate-400")} />
              <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
            </button>
          );
        })}
      </div>

      {applicationMethod !== "platform" && (
        <Input
          label={applicationMethod === "external_email" ? "Application email" : "Application URL"}
          placeholder={
            applicationMethod === "external_email"
              ? "careers@company.ae"
              : "https://careers.company.com/apply"
          }
          value={applicationContact}
          onChange={(e) => onApplicationContactChange(e.target.value)}
        />
      )}

      <Input
        type="date"
        label="Expected start date"
        hint="When you ideally want the new hire to begin."
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />

      {applicationMethod === "platform" && (
        <div>
          <p className="text-sm font-medium text-slate-800">Screening questions</p>
          <p className="mt-1 text-xs text-slate-500">
            Add questions from common job boards. Mark each as required or optional for applicants.
          </p>

          <div className="mt-3 space-y-2">
            {templates.map((template) => {
              const selected = questions.find((q) => q.template_id === template.id);
              const isOn = Boolean(selected);
              return (
                <div
                  key={template.id}
                  className={cn(
                    "rounded-xl border p-3 transition",
                    isOn ? "border-brand-200 bg-white" : "border-slate-200 bg-white/70"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <label className="flex flex-1 cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600"
                        checked={isOn}
                        onChange={() => toggleTemplate(template)}
                      />
                      <span>
                        <span className="text-sm font-medium text-slate-900">{template.label}</span>
                        <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-slate-400">
                          {template.source} · {template.category.replaceAll("_", " ")}
                        </span>
                      </span>
                    </label>
                    {isOn && selected && (
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <Select
                          value={selected.required ? "required" : "optional"}
                          onChange={(e) => {
                            if ((e.target.value === "required") !== selected.required) {
                              toggleRequired(template.id);
                            }
                          }}
                          options={[
                            { value: "required", label: "Required" },
                            { value: "optional", label: "Optional" },
                          ]}
                        />
                      </label>
                    )}
                  </div>
                  {template.help_text && isOn && (
                    <p className="mt-2 pl-6 text-xs text-slate-500">{template.help_text}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
