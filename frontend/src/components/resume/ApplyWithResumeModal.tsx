import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobScreeningQuestionsForm } from "@/components/jobs/JobScreeningQuestionsForm";
import { useAuth } from "@/lib/auth";
import { api, getStoredAuthToken } from "@/lib/api";
import { validateScreeningAnswers } from "@/lib/jobs/validateScreeningAnswers";
import { addApplication } from "@/lib/resume/plan";
import { listResumes } from "@/lib/resume/useResume";
import { resumeStore } from "@/lib/resume/store";
import type { Job } from "@/types";
import type { JobApplicationAnswers } from "@/types/jobApplication";
import type { ResumeRecord } from "@/types/resume";

type Props = {
  job: Job;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
};

export function ApplyWithResumeModal({ job, open, onClose, onApplied }: Props) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  const [answers, setAnswers] = useState<JobApplicationAnswers>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const questions = job.applicationQuestions ?? [];

  useEffect(() => {
    if (!open) return;
    setAnswers({});
    setAnswerErrors({});
    setError("");
    const token = getStoredAuthToken();
    if (token) {
      api
        .resumes(token)
        .then((res) => setResumes(res.data))
        .catch(() => setResumes(listResumes()));
    } else {
      setResumes(listResumes());
    }
  }, [open]);

  if (!open) return null;

  const ensurePublic = async (resume: ResumeRecord): Promise<string> => {
    let shareToken = resume.share_token ?? crypto.randomUUID();
    const token = getStoredAuthToken();

    if (token) {
      const res = await api.publishResume(resume.id, true, token);
      return res.data.share_token ?? shareToken;
    }

    resumeStore.save(String(resume.id), {
      is_public: true,
      share_token: shareToken,
    });
    return shareToken;
  };

  const handleApply = async () => {
    const resume = resumes.find((r) => String(r.id) === selectedId);
    if (!resume) {
      setError("Select a resume to continue.");
      return;
    }

    const validationErrors = validateScreeningAnswers(questions, answers);
    if (Object.keys(validationErrors).length > 0) {
      setAnswerErrors(validationErrors);
      setError("Please complete all required screening questions.");
      return;
    }

    setSubmitting(true);
    setError("");
    setAnswerErrors({});

    try {
      const shareToken = await ensurePublic(resume);
      const authToken = getStoredAuthToken();

      if (authToken && user) {
        try {
          await api.applyToJob(
            job.id,
            {
              resume_share_token: shareToken,
              cover_letter: coverLetter || undefined,
              answers: Object.keys(answers).length ? answers : undefined,
            },
            authToken
          );
        } catch {
          // fall through to local storage
        }
      }

      addApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        resumeId: resume.id,
        resumeTitle: resume.title,
        shareToken,
        coverLetter: coverLetter || undefined,
        answers: Object.keys(answers).length ? answers : undefined,
        appliedAt: new Date().toISOString(),
      });

      onApplied();
      onClose();
    } catch {
      setError("Could not submit application. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold">Apply with Khaleej Resume</h2>
        <p className="mt-1 text-sm text-slate-600">
          {job.title} at {job.company}
        </p>

        {resumes.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">You need a resume first.</p>
            <Link to="/resume">
              <Button className="mt-4" size="sm">
                Create resume
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-4 max-h-48 space-y-2 overflow-auto">
              {resumes.map((r) => (
                <li key={r.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                      selectedId === String(r.id)
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="resume"
                      checked={selectedId === String(r.id)}
                      onChange={() => setSelectedId(String(r.id))}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{r.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{r.template}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>

            <textarea
              rows={3}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Optional cover letter…"
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />

            <JobScreeningQuestionsForm
              questions={questions}
              answers={answers}
              onChange={setAnswers}
              errors={answerErrors}
            />
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {resumes.length > 0 && (
            <Button onClick={handleApply} disabled={submitting || !selectedId}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit application
                </>
              )}
            </Button>
          )}
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Your resume will be shared as a public PDF link with the employer.
        </p>
      </div>
    </div>
  );
}
