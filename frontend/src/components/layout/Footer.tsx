import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Apple } from "lucide-react";
import { PICKUP_ENABLED } from "@/lib/pickup/flags";

const platformLinks = [
  { to: "/accommodation", label: "Accommodation" },
  { to: "/jobs", label: "Browse jobs" },
  { to: "/jobs/copilot", label: "Jobs Copilot" },
  { to: "/resume", label: "Resume builder" },
  { to: "/services", label: "Home Services" },
  { to: "/movers", label: "Movers" },
  { to: "/tutoring", label: "Language Tutoring" },
  { to: "/meals", label: "Homemade meals" },
  ...(PICKUP_ENABLED ? [{ to: "/pickup", label: "Pickup & Movers" }] : []),
  { to: "/match", label: "AI Matchmaking" },
  { to: "/post", label: "Post an Ad" },
];

const columns = [
  {
    title: "Platform",
    links: platformLinks,
  },
  {
    title: "Tools",
    links: [
      { to: "/calculator", label: "Move-in calculator" },
      { to: "/saved-searches", label: "Saved searches" },
      { to: "/wishlist", label: "Wishlist" },
      { to: "/messages", label: "Messages" },
      { to: "/community", label: "Community & events" },
      { to: "/community/areas", label: "Area guides" },
      { to: "/payments", label: "Secure payments" },
      { to: "/verify", label: "Get verified" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/careers", label: "Careers" },
      { to: "/press", label: "Press" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Trust & Safety",
    links: [
      { to: "/verify", label: "Verification" },
      { to: "/terms", label: "Terms" },
      { to: "/privacy", label: "Privacy" },
      { to: "/report", label: "Report a listing" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-50/60 mt-20">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white">
                <span className="text-lg font-black">K</span>
              </div>
              <span className="text-base font-bold">Khaleej</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              The UAE's all-in-one classifieds platform — verified accommodation, jobs,
              and home services, powered by AI.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800"
                >
                  <Apple className="h-5 w-5" />
                  <div className="text-left leading-tight">
                    <div className="text-[9px] uppercase tracking-widest text-slate-300">
                      Download
                    </div>
                    <div className="text-xs font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M3.2 1.4 13.6 12 3.2 22.6c-.3-.2-.5-.6-.5-1V2.4c0-.4.2-.8.5-1z"
                      fill="#60a5fa"
                    />
                    <path
                      d="m13.6 12 3.6-3.6 4.5 2.6c.6.4.6 1.6 0 2L17.2 15.6 13.6 12z"
                      fill="#fbbf24"
                    />
                    <path d="M3.2 1.4 17.2 8.4 13.6 12 3.2 1.4z" fill="#34d399" />
                    <path d="M3.2 22.6 13.6 12l3.6 3.6L3.2 22.6z" fill="#f87171" />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] uppercase tracking-widest text-slate-300">
                      Get on
                    </div>
                    <div className="text-xs font-bold">Google Play</div>
                  </div>
                </a>
              </div>
              <div className="flex items-center gap-2">
                {[Twitter, Instagram, Linkedin, Facebook, Mail].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-brand-600 hover:border-brand-200 transition"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-900">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-slate-600 transition hover:text-brand-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Khaleej Classifieds FZ-LLC. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Available in EN · AR · HI · UR · RU · TG · TR</span>
            <span className="hidden md:inline">·</span>
            <span>Made with care in Dubai</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
