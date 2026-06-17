import { ResumeTemplateCatalog } from "@/components/resume/ResumeTemplateCatalog";
import type { ResumeTemplate } from "@/lib/resume/templates";

type Props = {
  value: ResumeTemplate;
  onChange: (template: ResumeTemplate) => void;
};

export function ResumeTemplatePicker({ value, onChange }: Props) {
  return (
    <ResumeTemplateCatalog
      value={value}
      onChange={onChange}
      className="rounded-xl border border-slate-200 bg-white p-4"
    />
  );
}
