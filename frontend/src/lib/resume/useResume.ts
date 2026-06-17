import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, getApiBaseUrl, getStoredAuthToken } from "@/lib/api";
import { resumeStore } from "@/lib/resume/store";
import type { ResumeData, ResumeRecord, ResumeTemplate } from "@/types/resume";

type ResumePatch = Partial<
  Pick<
    ResumeRecord,
    "title" | "template" | "data" | "is_public" | "share_token" | "watermark" | "setup_step"
  >
>;

function mergeLocalSetup(remote: ResumeRecord, id: string): ResumeRecord {
  const local = resumeStore.get(id);
  if (!local?.setup_step) return remote;
  return {
    ...remote,
    setup_step: local.setup_step,
    template: local.template ?? remote.template,
  };
}

export function useResume(id: string | undefined) {
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [useLocal, setUseLocal] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    if (!id) return;

    const token = getStoredAuthToken();
    const guestToken = resumeStore.getGuestToken();

    if (token) {
      api
        .resume(id, token)
        .then((res) => {
          setResume(mergeLocalSetup(res.data, id));
          setUseLocal(false);
        })
        .catch(() => {
          const local = resumeStore.get(id);
          if (local) {
            setResume(local);
            setUseLocal(true);
          }
        });
    } else if (guestToken) {
      fetch(`${getApiBaseUrl()}/guest/resumes/${id}`, {
        headers: { Accept: "application/json", "X-Guest-Token": guestToken },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((res: { data: ResumeRecord }) => {
          setResume(mergeLocalSetup(res.data, id));
          setUseLocal(false);
        })
        .catch(() => {
          const local = resumeStore.get(id);
          if (local) {
            setResume(local);
            setUseLocal(true);
          }
        });
    } else {
      const local = resumeStore.get(id);
      if (local) {
        setResume(local);
        setUseLocal(true);
      }
    }
  }, [id]);

  const save = useCallback(
    (patch: ResumePatch) => {
      if (!id || !resume) return;

      const next: ResumeRecord = {
        ...resume,
        ...patch,
        data: patch.data ?? resume.data,
        updated_at: new Date().toISOString(),
      };
      setResume(next);

      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(async () => {
        setSaving(true);
        try {
          const token = getStoredAuthToken();
          const guestToken = resumeStore.getGuestToken();

          if (useLocal || (!token && !guestToken)) {
            resumeStore.save(String(id), patch);
            setSaving(false);
            return;
          }

          resumeStore.save(String(id), patch);

          if (token) {
            const res = await api.updateResume(id, patch, token);
            setResume(mergeLocalSetup(res.data, id));
          } else if (guestToken) {
            const res = await api.updateResume(id, patch, undefined, guestToken);
            setResume(mergeLocalSetup(res.data, id));
          }
        } catch {
          resumeStore.save(String(id), patch);
          setUseLocal(true);
        } finally {
          setSaving(false);
        }
      }, 600);
    },
    [id, resume, useLocal]
  );

  const updateData = useCallback(
    (updater: (data: ResumeData) => ResumeData) => {
      if (!resume) return;
      save({ data: updater(resume.data) });
    },
    [resume, save]
  );

  const setTemplate = useCallback(
    (template: ResumeTemplate) => save({ template }),
    [save]
  );

  const downloadPdf = useCallback(async () => {
    if (!id) return;
    const token = getStoredAuthToken();
    const guestToken = resumeStore.getGuestToken();
    const path = token
      ? `/resumes/${id}/download`
      : `/guest/resumes/${id}/download`;

    try {
      const res = await fetch(`${getApiBaseUrl()}${path}`, {
        headers: {
          Accept: "application/pdf",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(guestToken ? { "X-Guest-Token": guestToken } : {}),
        },
      });
      if (!res.ok) throw new ApiError(res.status, "Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume?.data.personal_info.full_name || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.print();
    }
  }, [id, resume]);

  return { resume, save, updateData, setTemplate, saving, downloadPdf, useLocal };
}

export async function createResume(title?: string): Promise<ResumeRecord> {
  const token = getStoredAuthToken();

  if (token) {
    try {
      const res = await api.createResume({ title: title ?? "Untitled Resume" }, token);
      return { ...res.data, setup_step: "screening" };
    } catch {
      return resumeStore.create(title);
    }
  }

  try {
    const res = await api.createResume({}) as {
      data: ResumeRecord;
      guest_token: string;
    };
    resumeStore.setGuestToken(res.guest_token);
    const resume = { ...res.data, setup_step: "screening" as const };
    resumeStore.save(String(res.data.id), resume);
    return resume;
  } catch {
    return resumeStore.create(title);
  }
}

export function listResumes(): ResumeRecord[] {
  return resumeStore.list();
}
