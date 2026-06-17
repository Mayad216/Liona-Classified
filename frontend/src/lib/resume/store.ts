import {
  createLocalResume,
  GUEST_TOKEN_KEY,
  RESUME_STORAGE_KEY,
} from "@/lib/resume/defaults";
import type { ResumeRecord } from "@/types/resume";

function readAll(): ResumeRecord[] {
  try {
    const raw = localStorage.getItem(RESUME_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResumeRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: ResumeRecord[]) {
  localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(items));
}

export const resumeStore = {
  list(): ResumeRecord[] {
    return readAll().sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
    );
  },

  get(id: string): ResumeRecord | undefined {
    return readAll().find((r) => String(r.id) === String(id));
  },

  create(title?: string): ResumeRecord {
    const resume = createLocalResume(title);
    const items = readAll();
    items.unshift(resume);
    writeAll(items);
    return resume;
  },

  save(id: string, patch: Partial<ResumeRecord>): ResumeRecord {
    const items = readAll();
    const idx = items.findIndex((r) => String(r.id) === String(id));
    if (idx === -1) throw new Error("Resume not found");
    items[idx] = {
      ...items[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    writeAll(items);
    return items[idx];
  },

  remove(id: string) {
    writeAll(readAll().filter((r) => String(r.id) !== String(id)));
  },

  getGuestToken(): string | null {
    return localStorage.getItem(GUEST_TOKEN_KEY);
  },

  setGuestToken(token: string) {
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  },
};
