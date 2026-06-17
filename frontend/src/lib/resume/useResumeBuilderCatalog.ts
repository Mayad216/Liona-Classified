import { useEffect, useState } from "react";
import {
  fetchResumeBuilderCatalog,
  getResumeBuilderTemplateMetas,
  type ResumeBuilderCatalog,
} from "@/lib/resume/resumeBuilderCatalog";
import type { TemplateMeta } from "@/lib/resume/templates";

export function useResumeBuilderCatalog() {
  const [catalog, setCatalog] = useState<ResumeBuilderCatalog | null>(null);
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchResumeBuilderCatalog()
      .then((data) => {
        if (cancelled) return;
        setCatalog(data);
        setTemplates(getResumeBuilderTemplateMetas(data));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, templates, loading };
};
