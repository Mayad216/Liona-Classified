import { Loader2 } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { ResumeBuilder } from "./ResumeBuilder";
import { needsScreening, needsTemplateSelection } from "@/lib/resume/setup";
import { useResume } from "@/lib/resume/useResume";

export function ResumeBuilderPage() {
  const { id } = useParams();
  const { resume } = useResume(id);

  if (!id) return null;

  if (!resume) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#eef1f4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00a67e]" />
      </div>
    );
  }

  if (needsScreening(resume)) {
    return <Navigate to={`/resume/${id}/screening`} replace />;
  }

  if (needsTemplateSelection(resume)) {
    return <Navigate to={`/resume/${id}/template`} replace />;
  }

  return <ResumeBuilder id={id} />;
}
