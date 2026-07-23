import { useMemo, useState } from "react";
import { Search, MapPin, Briefcase, Building, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { JobCard } from "@/components/JobCard";
import { useJobs } from "@/lib/catalog/useCatalog";
import { CatalogStatus } from "@/components/CatalogStatus";
import type { EmploymentType, ExperienceLevel } from "@/types";
import { cn } from "@/lib/utils";

const EMPLOYMENT: EmploymentType[] = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
];
const EXPERIENCE: ExperienceLevel[] = ["Entry", "Mid", "Senior", "Lead", "Executive"];

export function JobsList() {
  const { items: jobs, loading, error, live } = useJobs();
  const [q, setQ] = useState("");
  const [emirate, setEmirate] = useState("");
  const [industry, setIndustry] = useState("");
  const [employment, setEmployment] = useState<Set<EmploymentType>>(new Set());
  const [experience, setExperience] = useState<Set<ExperienceLevel>>(new Set());
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minSalary, setMinSalary] = useState(0);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (q && !`${j.title} ${j.company} ${j.industry}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (emirate && j.emirate !== emirate) return false;
      if (industry && j.industry !== industry) return false;
      if (employment.size && !employment.has(j.employmentType)) return false;
      if (experience.size && !experience.has(j.experience)) return false;
      if (remoteOnly && !j.remote) return false;
      if (j.salaryMax > 0 && j.salaryMax < minSalary) return false;
      return true;
    });
  }, [q, emirate, industry, employment, experience, remoteOnly, minSalary, jobs]);

  const industries = Array.from(new Set(jobs.map((j) => j.industry)));

  return (
    <div className="bg-slate-50/60 pb-20 pt-8">
      <div className="container">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Jobs in the UAE</h1>
            <p className="mt-2 text-slate-600">
              {filtered.length} open roles · AI-matched to your profile
            </p>
            <CatalogStatus loading={loading} error={error} live={live} />
          </div>
          <Link to="/post?mode=job">
            <Button variant="outline">
              <Building className="h-4 w-4" /> Post a job (Business)
            </Button>
          </Link>
        </header>

        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Job title, company, or keyword"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 sm:border-l sm:border-slate-200">
              <MapPin className="h-4 w-4 text-slate-400" />
              <select
                value={emirate}
                onChange={(e) => setEmirate(e.target.value)}
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              >
                <option value="">All UAE</option>
                <option>Dubai</option>
                <option>Abu Dhabi</option>
                <option>Sharjah</option>
                <option>Ajman</option>
              </select>
            </div>
            <Button>Find jobs</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm h-fit">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Employment type</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {EMPLOYMENT.map((e) => {
                  const active = employment.has(e);
                  return (
                    <button
                      key={e}
                      onClick={() => {
                        const s = new Set(employment);
                        if (active) s.delete(e);
                        else s.add(e);
                        setEmployment(s);
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        active
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      )}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">Experience</h3>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {EXPERIENCE.map((e) => {
                  const active = experience.has(e);
                  return (
                    <button
                      key={e}
                      onClick={() => {
                        const s = new Set(experience);
                        if (active) s.delete(e);
                        else s.add(e);
                        setExperience(s);
                      }}
                      className={cn(
                        "rounded-lg border py-1.5 text-[11px] font-medium transition",
                        active
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      )}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">Industry</h3>
              <Select
                className="mt-3"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                options={[
                  { value: "", label: "Any industry" },
                  ...industries.map((i) => ({ value: i, label: i })),
                ]}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Minimum salary (AED): {minSalary.toLocaleString()}
              </h3>
              <input
                type="range"
                min={0}
                max={80000}
                step={1000}
                value={minSalary}
                onChange={(e) => setMinSalary(+e.target.value)}
                className="mt-3 w-full accent-brand-600"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Remote only
            </label>

            <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 p-5">
              <Briefcase className="h-6 w-6 text-brand-700" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">Build your CV</h3>
              <p className="mt-1 text-xs text-slate-600">
                AI-assisted CV builder with UAE-specific templates. Export to PDF.
              </p>
              <Button size="sm" className="mt-3 w-full">
                Try the builder
              </Button>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <Badge tone="brand">
                <TrendingUp className="h-3 w-3" /> Sorted by relevance
              </Badge>
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="font-semibold text-slate-700">No jobs match these filters.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {filtered.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
