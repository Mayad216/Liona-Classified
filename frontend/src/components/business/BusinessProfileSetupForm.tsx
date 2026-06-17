import { useEffect, useState } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { JOB_INDUSTRIES } from "@/lib/post/jobListingCatalog";
import type { BusinessProfile, BusinessProfileInput } from "@/types/businessProfile";
import type { Emirate } from "@/types";

const EMIRATES: Emirate[] = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

type Props = {
  initial?: BusinessProfile | null;
  saving?: boolean;
  error?: string | null;
  onSubmit: (input: BusinessProfileInput) => Promise<void>;
};

export function BusinessProfileSetupForm({
  initial,
  saving = false,
  error,
  onSubmit,
}: Props) {
  const [companyName, setCompanyName] = useState(initial?.company_name ?? "");
  const [legalName, setLegalName] = useState(initial?.legal_name ?? "");
  const [tradeLicence, setTradeLicence] = useState(initial?.trade_licence_number ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [emirate, setEmirate] = useState<Emirate>((initial?.emirate as Emirate) ?? "Dubai");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? "");
  const [contactPhone, setContactPhone] = useState(initial?.contact_phone ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) return;
    setCompanyName(initial.company_name ?? "");
    setLegalName(initial.legal_name ?? "");
    setTradeLicence(initial.trade_licence_number ?? "");
    setIndustry(initial.industry ?? "");
    setEmirate((initial.emirate as Emirate) ?? "Dubai");
    setWebsite(initial.website ?? "");
    setContactEmail(initial.contact_email ?? "");
    setContactPhone(initial.contact_phone ?? "");
    setDescription(initial.description ?? "");
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !industry.trim()) {
      setFormError("Company name and industry are required.");
      return;
    }

    setFormError(null);
    await onSubmit({
      company_name: companyName.trim(),
      legal_name: legalName.trim() || undefined,
      trade_licence_number: tradeLicence.trim() || undefined,
      industry: industry.trim(),
      emirate,
      website: website.trim() || undefined,
      contact_email: contactEmail.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
      description: description.trim() || undefined,
    });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Business Profile required</p>
            <p className="mt-1 text-sm text-slate-600">
              Job listings on Khaleej can only be posted from a verified Business Profile — not
              personal accounts. Set up your company details once, then publish roles under that
              business.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Gulf Tech Solutions LLC"
          required
        />
        <Input
          label="Legal name (optional)"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          placeholder="As on trade licence"
        />
        <Input
          label="Trade licence number (optional)"
          value={tradeLicence}
          onChange={(e) => setTradeLicence(e.target.value)}
          placeholder="e.g. CN-1234567"
        />
        <Select
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          options={[
            { value: "", label: "Select industry…" },
            ...JOB_INDUSTRIES.map((item) => ({ value: item, label: item })),
          ]}
        />
        <Select
          label="Primary emirate"
          value={emirate}
          onChange={(e) => setEmirate(e.target.value as Emirate)}
          options={EMIRATES.map((item) => ({ value: item, label: item }))}
        />
        <Input
          label="Company website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
        />
        <Input
          label="HR contact email (optional)"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="careers@company.com"
        />
        <Input
          label="HR contact phone (optional)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+971 4 …"
        />
      </div>

      <Input
        label="About the company (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief overview for candidates — size, culture, sectors…"
      />

      {(formError || error) && (
        <p className="text-sm text-red-600">{formError ?? error}</p>
      )}

      <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Trade licence and company details may be verified before your first job goes live. Personal
          accounts cannot post job listings.
        </span>
      </div>

      <Button type="submit" loading={saving} className="w-full sm:w-auto">
        Save Business Profile & continue
      </Button>
    </form>
  );
}
