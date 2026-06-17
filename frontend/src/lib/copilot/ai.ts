import { api, getStoredAuthToken } from "@/lib/api";
import type {
  CopilotAiUsage,
  CopilotKeywordResult,
  CopilotMatchExplanation,
  CopilotTailorResult,
} from "@/types/copilot";

function token() {
  const t = getStoredAuthToken();
  if (!t) throw new Error("Sign in to use AI tools.");
  return t;
}

export async function copilotAiUsage(): Promise<CopilotAiUsage> {
  const res = await api.copilotAiUsage(token());
  return res.data;
}

export async function copilotGenerateSummary(targetRole?: string) {
  const res = await api.copilotAiGenerateSummary({ target_role: targetRole }, token());
  return { data: res.data };
}

export async function copilotImproveBullet(bullet: string, role?: string) {
  const res = await api.copilotAiImproveBullet({ bullet, role }, token());
  return { data: res.data };
}

export async function copilotGenerateCoverLetter(jobMatchId: number) {
  const res = await api.copilotAiCoverLetter({ job_match_id: jobMatchId }, token());
  return { data: res.data };
}

export async function copilotExtractKeywords(jobMatchId: number) {
  const res = await api.copilotAiKeywords({ job_match_id: jobMatchId }, token());
  return { data: res.data };
}

export async function copilotTailorResume(jobMatchId: number) {
  const res = await api.copilotAiTailor({ job_match_id: jobMatchId }, token());
  return { data: res.data };
}

export async function copilotExplainMatch(jobMatchId: number) {
  const res = await api.copilotAiExplainMatch({ job_match_id: jobMatchId }, token());
  return { data: res.data };
}

export async function copilotScreeningAnswer(question: string) {
  const res = await api.copilotAiScreeningAnswer({ question }, token());
  return { data: res.data };
}

export type { CopilotTailorResult, CopilotKeywordResult, CopilotMatchExplanation, CopilotAiUsage };
