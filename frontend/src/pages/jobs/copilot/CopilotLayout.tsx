import { Link, NavLink, Outlet } from "react-router-dom";
import { Briefcase, ClipboardList, CreditCard, FileText, LayoutDashboard, Settings, Shield, Sparkles, UserCircle, Wand2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/jobs/copilot/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs/copilot/jobs", label: "Recommended", icon: Sparkles },
  { to: "/jobs/copilot/applications", label: "Applications", icon: ClipboardList },
  { to: "/jobs/copilot/settings", label: "Settings", icon: Settings },
  { to: "/jobs/copilot/ai", label: "AI tools", icon: Wand2 },
  { to: "/jobs/copilot/billing", label: "Billing", icon: CreditCard },
  { to: "/jobs/copilot/profile", label: "Profile", icon: UserCircle },
  { to: "/jobs/copilot/resumes", label: "Resumes", icon: FileText },
];

export function CopilotLayout() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-16 pt-6">
      <div className="container max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Jobs Copilot
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI job application assistant
            </h1>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-700"
          >
            <Briefcase className="h-4 w-4" />
            Browse jobs
          </Link>
        </div>

        <nav className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/jobs/copilot/admin"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`
              }
            >
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
