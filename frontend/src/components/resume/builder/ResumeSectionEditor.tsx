import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExperienceEntryEditor } from "@/components/resume/builder/ExperienceEntryEditor";
import { ProfessionalSummaryEditor } from "@/components/resume/builder/ProfessionalSummaryEditor";
import { SkillsSectionEditor } from "@/components/resume/builder/SkillsSectionEditor";
import { ResumeAutocompleteField } from "@/components/resume/ResumeAutocompleteField";
import {
  newCertification,
  newEducation,
  newExperience,
  newLanguage,
  newProject,
} from "@/lib/resume/defaults";
import type { ResumeSectionId } from "@/lib/resume/sections";
import { getSectionDef } from "@/lib/resume/sections";
import type { ResumeData } from "@/types/resume";

type Props = {
  section: ResumeSectionId;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/15";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

export function ResumeSectionEditor({ section, data, onChange }: Props) {
  const patch = (partial: Partial<ResumeData>) => onChange({ ...data, ...partial });
  const meta = getSectionDef(section);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">{meta.label}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below — your resume preview updates instantly.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {section === "personal" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Full name</label>
              <input
                className={fieldClass}
                value={data.personal_info.full_name}
                onChange={(e) =>
                  patch({
                    personal_info: { ...data.personal_info, full_name: e.target.value },
                  })
                }
                placeholder="e.g. Sarah Al Maktoum"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={fieldClass}
                value={data.personal_info.email}
                onChange={(e) =>
                  patch({ personal_info: { ...data.personal_info, email: e.target.value } })
                }
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={fieldClass}
                value={data.personal_info.phone}
                onChange={(e) =>
                  patch({ personal_info: { ...data.personal_info, phone: e.target.value } })
                }
                placeholder="+971 50 000 0000"
              />
            </div>
            <div>
              <label className={labelClass}>City / location</label>
              <input
                className={fieldClass}
                value={data.personal_info.location}
                onChange={(e) =>
                  patch({ personal_info: { ...data.personal_info, location: e.target.value } })
                }
                placeholder="Dubai, UAE"
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                className={fieldClass}
                value={data.personal_info.linkedin}
                onChange={(e) =>
                  patch({ personal_info: { ...data.personal_info, linkedin: e.target.value } })
                }
                placeholder="linkedin.com/in/you"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Website / portfolio</label>
              <input
                className={fieldClass}
                value={data.personal_info.website}
                onChange={(e) =>
                  patch({ personal_info: { ...data.personal_info, website: e.target.value } })
                }
                placeholder="https://"
              />
            </div>
          </div>
        )}

        {section === "summary" && (
          <ProfessionalSummaryEditor
            data={data}
            summary={data.summary}
            onChange={(summary) => patch({ summary })}
          />
        )}

        {section === "experience" && (
          <div className="space-y-6">
            {data.experiences.map((exp, idx) => (
              <ExperienceEntryEditor
                key={exp.id}
                exp={exp}
                onChange={(updated) => {
                  const experiences = [...data.experiences];
                  experiences[idx] = updated;
                  patch({ experiences });
                }}
                onRemove={() =>
                  patch({ experiences: data.experiences.filter((_, i) => i !== idx) })
                }
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => patch({ experiences: [...data.experiences, newExperience()] })}
            >
              <Plus className="h-4 w-4" /> Add position
            </Button>
          </div>
        )}

        {section === "education" && (
          <div className="space-y-4">
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ResumeAutocompleteField
                    label="Degree"
                    fieldType="degree"
                    value={edu.degree}
                    placeholder="e.g. Bachelor of Science (BSc)"
                    onChange={(degree) => {
                      const education = [...data.education];
                      education[idx] = { ...edu, degree };
                      patch({ education });
                    }}
                  />
                  <ResumeAutocompleteField
                    label="School / university"
                    fieldType="school"
                    value={edu.school}
                    placeholder="e.g. American University of Sharjah"
                    onChange={(school) => {
                      const education = [...data.education];
                      education[idx] = { ...edu, school };
                      patch({ education });
                    }}
                  />
                </div>
                <textarea
                  rows={2}
                  value={edu.description}
                  onChange={(e) => {
                    const education = [...data.education];
                    education[idx] = { ...edu, description: e.target.value };
                    patch({ education });
                  }}
                  placeholder="Honors, activities, relevant coursework…"
                  className={`${fieldClass} mt-3`}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => patch({ education: [...data.education, newEducation()] })}
            >
              <Plus className="h-4 w-4" /> Add education
            </Button>
          </div>
        )}

        {section === "skills" && (
          <SkillsSectionEditor
            data={data}
            skills={data.skills}
            onChange={(skills) => patch({ skills })}
          />
        )}

        {section === "languages" && (
          <div className="space-y-3">
            {data.languages.map((lang, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-3">
                <ResumeAutocompleteField
                  label="Language"
                  fieldType="language"
                  value={lang.name}
                  placeholder="e.g. English"
                  onChange={(name) => {
                    const languages = [...data.languages];
                    languages[idx] = { ...lang, name };
                    patch({ languages });
                  }}
                />
                <ResumeAutocompleteField
                  label="Proficiency"
                  fieldType="language_level"
                  value={lang.level}
                  placeholder="e.g. Fluent"
                  onChange={(level) => {
                    const languages = [...data.languages];
                    languages[idx] = { ...lang, level };
                    patch({ languages });
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => patch({ languages: [...data.languages, newLanguage()] })}
            >
              <Plus className="h-4 w-4" /> Add language
            </Button>
          </div>
        )}

        {section === "projects" && (
          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={proj.id} className="space-y-2 rounded-lg border border-slate-200 p-4">
                <Input
                  label="Project name"
                  value={proj.name}
                  onChange={(e) => {
                    const projects = [...data.projects];
                    projects[idx] = { ...proj, name: e.target.value };
                    patch({ projects });
                  }}
                />
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => {
                    const projects = [...data.projects];
                    projects[idx] = { ...proj, description: e.target.value };
                    patch({ projects });
                  }}
                  className={fieldClass}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => patch({ projects: [...data.projects, newProject()] })}
            >
              <Plus className="h-4 w-4" /> Add project
            </Button>
          </div>
        )}

        {section === "certifications" && (
          <div className="space-y-3">
            {data.certifications.map((cert, idx) => (
              <div key={cert.id} className="grid gap-2 sm:grid-cols-3">
                <Input
                  label="Certification"
                  value={cert.name}
                  onChange={(e) => {
                    const certifications = [...data.certifications];
                    certifications[idx] = { ...cert, name: e.target.value };
                    patch({ certifications });
                  }}
                />
                <Input
                  label="Issuer"
                  value={cert.issuer}
                  onChange={(e) => {
                    const certifications = [...data.certifications];
                    certifications[idx] = { ...cert, issuer: e.target.value };
                    patch({ certifications });
                  }}
                />
                <Input
                  label="Date"
                  placeholder="YYYY-MM"
                  value={cert.date}
                  onChange={(e) => {
                    const certifications = [...data.certifications];
                    certifications[idx] = { ...cert, date: e.target.value };
                    patch({ certifications });
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                patch({ certifications: [...data.certifications, newCertification()] })
              }
            >
              <Plus className="h-4 w-4" /> Add certification
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
