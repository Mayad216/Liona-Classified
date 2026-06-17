import { Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ResumeJobTitleField } from "@/components/resume/ResumeJobTitleField";
import { SkillsSectionEditor } from "@/components/resume/builder/SkillsSectionEditor";
import { enhanceBullet } from "@/lib/resume/ai";
import { ResumeAiPanel } from "@/components/resume/ResumeAiPanel";
import {
  newCertification,
  newEducation,
  newExperience,
  newLanguage,
  newProject,
} from "@/lib/resume/defaults";
import type { ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export function ResumeEditor({ data, onChange }: Props) {
  const patch = (partial: Partial<ResumeData>) => onChange({ ...data, ...partial });

  return (
    <div className="space-y-5 pb-8">
      <ResumeAiPanel data={data} onChange={onChange} />

      <Section title="Personal Info">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Full name"
            value={data.personal_info.full_name}
            onChange={(e) =>
              patch({
                personal_info: { ...data.personal_info, full_name: e.target.value },
              })
            }
          />
          <Input
            label="Email"
            type="email"
            value={data.personal_info.email}
            onChange={(e) =>
              patch({ personal_info: { ...data.personal_info, email: e.target.value } })
            }
          />
          <Input
            label="Phone"
            value={data.personal_info.phone}
            onChange={(e) =>
              patch({ personal_info: { ...data.personal_info, phone: e.target.value } })
            }
          />
          <Input
            label="Location"
            value={data.personal_info.location}
            onChange={(e) =>
              patch({ personal_info: { ...data.personal_info, location: e.target.value } })
            }
          />
          <Input
            label="LinkedIn"
            value={data.personal_info.linkedin}
            onChange={(e) =>
              patch({ personal_info: { ...data.personal_info, linkedin: e.target.value } })
            }
          />
          <Input
            label="Portfolio / website"
            value={data.personal_info.website}
            onChange={(e) =>
              patch({ personal_info: { ...data.personal_info, website: e.target.value } })
            }
          />
        </div>
      </Section>

      <Section title="Professional Summary">
        <textarea
          rows={4}
          value={data.summary}
          onChange={(e) => patch({ summary: e.target.value })}
          placeholder="2–4 sentences about your experience and goals…"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
      </Section>

      <Section title="Work Experience">
        {data.experiences.map((exp, idx) => (
          <div key={exp.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  patch({
                    experiences: data.experiences.filter((_, i) => i !== idx),
                  })
                }
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResumeJobTitleField
                value={exp.job_title}
                onChange={(job_title) => {
                  const experiences = [...data.experiences];
                  experiences[idx] = { ...exp, job_title };
                  patch({ experiences });
                }}
              />
              <Input
                label="Company"
                value={exp.company}
                onChange={(e) => {
                  const experiences = [...data.experiences];
                  experiences[idx] = { ...exp, company: e.target.value };
                  patch({ experiences });
                }}
              />
              <Input
                label="Location"
                value={exp.location}
                onChange={(e) => {
                  const experiences = [...data.experiences];
                  experiences[idx] = { ...exp, location: e.target.value };
                  patch({ experiences });
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Start"
                  placeholder="YYYY-MM"
                  value={exp.start_date}
                  onChange={(e) => {
                    const experiences = [...data.experiences];
                    experiences[idx] = { ...exp, start_date: e.target.value };
                    patch({ experiences });
                  }}
                />
                <Input
                  label="End"
                  placeholder="YYYY-MM"
                  value={exp.end_date}
                  disabled={exp.is_current}
                  onChange={(e) => {
                    const experiences = [...data.experiences];
                    experiences[idx] = { ...exp, end_date: e.target.value };
                    patch({ experiences });
                  }}
                />
              </div>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={exp.is_current}
                onChange={(e) => {
                  const experiences = [...data.experiences];
                  experiences[idx] = {
                    ...exp,
                    is_current: e.target.checked,
                    end_date: e.target.checked ? "" : exp.end_date,
                  };
                  patch({ experiences });
                }}
              />
              Current job
            </label>
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500">Bullet points</p>
              {exp.bullets.map((bullet, bi) => (
                <div key={bi} className="flex gap-2">
                  <input
                    value={bullet}
                    onChange={(e) => {
                      const experiences = [...data.experiences];
                      const bullets = [...exp.bullets];
                      bullets[bi] = e.target.value;
                      experiences[idx] = { ...exp, bullets };
                      patch({ experiences });
                    }}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    placeholder="Achievement or responsibility…"
                  />
                  <button
                    type="button"
                    title="AI enhance bullet"
                    onClick={async () => {
                      const improved = await enhanceBullet(bullet, exp.job_title);
                      const experiences = [...data.experiences];
                      const bullets = [...exp.bullets];
                      bullets[bi] = improved;
                      experiences[idx] = { ...exp, bullets };
                      patch({ experiences });
                    }}
                    className="rounded-lg border border-slate-200 p-2 text-brand-600 hover:bg-brand-50"
                  >
                    <Wand2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const experiences = [...data.experiences];
                      experiences[idx] = {
                        ...exp,
                        bullets: exp.bullets.filter((_, i) => i !== bi),
                      };
                      patch({ experiences });
                    }}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const experiences = [...data.experiences];
                  experiences[idx] = { ...exp, bullets: [...exp.bullets, ""] };
                  patch({ experiences });
                }}
              >
                <Plus className="h-4 w-4" /> Add bullet
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => patch({ experiences: [...data.experiences, newExperience()] })}
        >
          <Plus className="h-4 w-4" /> Add experience
        </Button>
      </Section>

      <Section title="Education">
        {data.education.map((edu, idx) => (
          <div key={edu.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Degree"
                value={edu.degree}
                onChange={(e) => {
                  const education = [...data.education];
                  education[idx] = { ...edu, degree: e.target.value };
                  patch({ education });
                }}
              />
              <Input
                label="School / university"
                value={edu.school}
                onChange={(e) => {
                  const education = [...data.education];
                  education[idx] = { ...edu, school: e.target.value };
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
              placeholder="Honors, activities…"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
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
      </Section>

      <Section title="Skills">
        <SkillsSectionEditor
          data={data}
          skills={data.skills}
          onChange={(skills) => patch({ skills })}
        />
      </Section>

      <Section title="Languages">
        {data.languages.map((lang, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-2">
            <Input
              label="Language"
              value={lang.name}
              onChange={(e) => {
                const languages = [...data.languages];
                languages[idx] = { ...lang, name: e.target.value };
                patch({ languages });
              }}
            />
            <Input
              label="Level"
              value={lang.level}
              onChange={(e) => {
                const languages = [...data.languages];
                languages[idx] = { ...lang, level: e.target.value };
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
      </Section>

      <Section title="Projects">
        {data.projects.map((proj, idx) => (
          <div key={proj.id} className="space-y-2 rounded-xl border border-slate-100 p-4">
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
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
      </Section>

      <Section title="Certifications">
        {data.certifications.map((cert, idx) => (
          <div key={cert.id} className="grid gap-2 sm:grid-cols-3">
            <Input
              label="Name"
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
      </Section>
    </div>
  );
}
