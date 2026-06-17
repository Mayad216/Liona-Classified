import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardLayout<T extends string>({
  title,
  subtitle,
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tabs: { id: T; label: string; icon: LucideIcon; badge?: number }[];
  activeTab: T;
  onTabChange: (id: T) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60">
      <div className="container py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  activeTab === id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </aside>
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <h3 className="text-base font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
