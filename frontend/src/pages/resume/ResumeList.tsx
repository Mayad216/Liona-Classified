import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Plus, Trash2, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createResume, listResumes } from "@/lib/resume/useResume";
import { resumeStore } from "@/lib/resume/store";
import { getStoredAuthToken, api } from "@/lib/api";
import type { ResumeRecord } from "@/types/resume";
import { getTemplateMeta, isResumeTemplate } from "@/lib/resume/templates";
import { resumeBuilderPath } from "@/lib/resume/setup";

export function ResumeList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ResumeRecord[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (token) {
      api
        .resumes(token)
        .then((res) => setItems(res.data))
        .catch(() => setItems(listResumes()));
    } else {
      setItems(listResumes());
    }
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const resume = await createResume();
      resumeStore.save(String(resume.id), resume);
      navigate(`/resume/${resume.id}/screening`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string | number) => {
    resumeStore.remove(String(id));
    setItems((prev) => prev.filter((r) => String(r.id) !== String(id)));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eef1f4] pb-20 pt-0">
      <div className="border-b border-slate-200 bg-white">
        <div className="container flex max-w-5xl flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#00a67e]/10 px-3 py-1 text-xs font-bold text-[#008f6b]">
              <Sparkles className="h-3.5 w-3.5" />
              Free resume builder
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Build your resume in minutes
            </h1>
            <p className="mt-3 max-w-xl text-slate-600">
              Section-by-section editor with live preview, expert tips, and ATS-friendly
              templates — the same guided workflow used by top online resume builders.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-[#00a67e] hover:bg-[#008f6b]"
            >
              <Plus className="h-4 w-4" />
              Create my resume
            </Button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <Upload className="h-3.5 w-3.5" />
              Import existing resume (soon)
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-10">
        <h2 className="text-lg font-bold text-slate-900">My resumes</h2>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-800">No resumes yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Answer a few screening questions, choose a template, then add your details section
              by section.
            </p>
            <Button
              className="mt-6 bg-[#00a67e] hover:bg-[#008f6b]"
              onClick={handleCreate}
              disabled={creating}
            >
              Create my resume
            </Button>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((r) => (
              <li
                key={r.id}
                className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#00a67e]/40 hover:shadow-md"
              >
                <div className="min-w-0">
                  <Link
                    to={resumeBuilderPath(r)}
                    className="font-semibold text-slate-900 group-hover:text-[#00a67e]"
                  >
                    {r.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {isResumeTemplate(r.template)
                      ? getTemplateMeta(r.template).label
                      : r.template}{" "}
                    template
                    {r.data.personal_info.full_name
                      ? ` · ${r.data.personal_info.full_name}`
                      : ""}
                  </p>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Updated {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "recently"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Link to={resumeBuilderPath(r)}>
                    <Button
                      size="sm"
                      className="bg-[#00a67e] hover:bg-[#008f6b]"
                    >
                      Edit
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
