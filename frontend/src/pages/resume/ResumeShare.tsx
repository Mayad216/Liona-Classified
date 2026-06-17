import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { api, getApiBaseUrl } from "@/lib/api";
import { resumeStore } from "@/lib/resume/store";
import type { ResumeRecord } from "@/types/resume";

export function ResumeShare() {
  const { token } = useParams();
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;

    api
      .publicResume(token)
      .then((res) => setResume(res.data))
      .catch(() => {
        const local = resumeStore.list().find((r) => r.share_token === token && r.is_public);
        if (local) setResume(local);
        else setError(true);
      });
  }, [token]);

  const downloadPdf = () => {
    if (!token) return;
    window.open(`${getApiBaseUrl()}/resumes/share/${token}/download`, "_blank");
  };

  if (error) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Resume not found</h1>
        <p className="mt-2 text-slate-600">This link may be private or expired.</p>
        <Link to="/resume" className="mt-4 inline-block text-brand-600 hover:underline">
          Build your own resume
        </Link>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20 pt-8">
      <div className="container max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/resume"
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Resume builder
            </Link>
            <h1 className="mt-3 text-2xl font-bold">{resume.title}</h1>
            <p className="text-sm text-slate-600 capitalize">{resume.template} template</p>
          </div>
          <Button onClick={downloadPdf}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ResumePreview
            data={resume.data}
            template={resume.template}
            watermark={resume.watermark}
          />
        </div>
      </div>
    </div>
  );
}
