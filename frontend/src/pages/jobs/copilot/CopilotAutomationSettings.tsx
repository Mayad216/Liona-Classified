import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api, getStoredAuthToken } from "@/lib/api";
import type {
  CopilotAutomationSettings,
  CopilotBlacklistEntry,
  CopilotDigestPreview,
} from "@/types/copilot";

export function CopilotAutomationSettingsPage() {
  const [settings, setSettings] = useState<CopilotAutomationSettings | null>(null);
  const [blacklist, setBlacklist] = useState<CopilotBlacklistEntry[]>([]);
  const [digest, setDigest] = useState<CopilotDigestPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: "company", value: "", reason: "" });

  const refresh = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [settingsRes, blacklistRes, digestRes] = await Promise.all([
        api.copilotAutomationSettings(token),
        api.copilotBlacklist(token),
        api.copilotDigestPreview(token),
      ]);
      setSettings(settingsRes.data);
      setBlacklist(blacklistRes.data);
      setDigest(digestRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSettings = async () => {
    const token = getStoredAuthToken();
    if (!token || !settings) return;
    setSaving(true);
    try {
      const res = await api.copilotUpdateAutomationSettings(settings, token);
      setSettings(res.data);
    } finally {
      setSaving(false);
    }
  };

  const addBlacklist = async () => {
    const token = getStoredAuthToken();
    if (!token || !newEntry.value.trim()) return;
    await api.copilotAddBlacklist(
      { type: newEntry.type, value: newEntry.value.trim(), reason: newEntry.reason || undefined },
      token
    );
    setNewEntry({ type: "company", value: "", reason: "" });
    await refresh();
  };

  const removeBlacklist = async (id: number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    await api.copilotRemoveBlacklist(id, token);
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Automation settings</h2>
        <p className="text-sm text-slate-500">
          Blacklists, daily digest emails, and advanced auto-apply controls.
        </p>
      </div>

      {settings && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">Daily digest email</h3>
          <p className="mt-1 text-sm text-slate-500">
            Summary of submitted, needs-review, and failed applications (last 24h).
          </p>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.daily_digest_enabled}
              onChange={(e) =>
                setSettings({ ...settings, daily_digest_enabled: e.target.checked })
              }
            />
            Send daily digest
          </label>
          <label className="mt-3 block text-sm">
            Delivery hour (0–23, local server time)
            <input
              type="number"
              min={0}
              max={23}
              className="mt-1 w-24 rounded-lg border border-slate-200 px-3 py-2"
              value={settings.daily_digest_hour}
              onChange={(e) =>
                setSettings({ ...settings, daily_digest_hour: Number(e.target.value) })
              }
            />
          </label>
          {digest && (
            <p className="mt-3 text-xs text-slate-500">
              Preview (24h): {digest.submitted} submitted · {digest.needs_review} need review ·{" "}
              {digest.failed} failed · {digest.remaining} credits left
            </p>
          )}
          <Button className="mt-4" size="sm" disabled={saving} onClick={saveSettings}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save digest settings
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Application blacklist</h3>
        <p className="mt-1 text-sm text-slate-500">
          Block auto-apply to specific companies, domains, or URL patterns.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={newEntry.type}
            onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
          >
            <option value="company">Company</option>
            <option value="domain">Domain</option>
            <option value="url">URL contains</option>
          </select>
          <input
            className="min-w-[180px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. example.com or Acme Corp"
            value={newEntry.value}
            onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
          />
          <input
            className="min-w-[140px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Reason (optional)"
            value={newEntry.reason}
            onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
          />
          <Button size="sm" onClick={addBlacklist}>
            Add
          </Button>
        </div>

        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {blacklist.length === 0 && (
            <li className="py-3 text-slate-500">No blacklist entries yet.</li>
          )}
          {blacklist.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-2 py-3">
              <div>
                <span className="font-medium capitalize">{entry.type}</span>: {entry.value}
                {entry.reason && <span className="text-slate-500"> — {entry.reason}</span>}
              </div>
              <button
                type="button"
                onClick={() => removeBlacklist(entry.id)}
                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
