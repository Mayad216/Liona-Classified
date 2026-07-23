import { useEffect, useRef, useState, type RefObject } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Briefcase,
  Wrench,
  Menu,
  X,
  Plus,
  Heart,
  Sparkles,
  Calculator,
  BellRing,
  Users,
  MessageCircle,
  Truck,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronDown,
  FileText,
  Bot,
  UtensilsCrossed,
  Languages,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

function isServicesHomeActive(pathname: string) {
  if (pathname === "/movers" || pathname.startsWith("/movers/")) return false;
  if (pathname === "/meals" || pathname.startsWith("/meals/")) return false;
  if (pathname === "/tutoring" || pathname.startsWith("/tutoring/")) return false;
  return pathname === "/services" || pathname.startsWith("/services/");
}

function isMoversActive(pathname: string) {
  return pathname === "/movers" || pathname.startsWith("/movers/");
}

function isTutoringActive(pathname: string) {
  return pathname === "/tutoring" || pathname.startsWith("/tutoring/");
}

function isMealsActive(pathname: string) {
  return pathname === "/meals" || pathname.startsWith("/meals/");
}

function isJobsActive(pathname: string) {
  return pathname === "/jobs" || (pathname.startsWith("/jobs/") && !pathname.startsWith("/jobs/copilot"));
}

function isCopilotActive(pathname: string) {
  return pathname.startsWith("/jobs/copilot");
}

function isJobsSectionActive(pathname: string) {
  return isJobsActive(pathname) || isCopilotActive(pathname);
}

type NavItem = {
  to: string;
  label: string;
  icon: typeof Building2;
  isActive?: (pathname: string) => boolean;
};

const primaryNavItems: NavItem[] = [
  { to: "/accommodation", label: "Accommodation", icon: Building2 },
  { to: "/match", label: "Match Me", icon: Sparkles },
  {
    to: "/resume",
    label: "Resume Builder",
    icon: FileText,
    isActive: (pathname) => pathname.startsWith("/resume"),
  },
  {
    to: "/movers",
    label: "Movers",
    icon: Truck,
    isActive: isMoversActive,
  },
  {
    to: "/tutoring",
    label: "Language Tutoring",
    icon: Languages,
    isActive: isTutoringActive,
  },
  {
    to: "/meals",
    label: "Homemade meals",
    icon: UtensilsCrossed,
    isActive: isMealsActive,
  },
  {
    to: "/services",
    label: "Home Services",
    icon: Wrench,
    isActive: isServicesHomeActive,
  },
];

const jobsNavItems: NavItem[] = [
  {
    to: "/jobs",
    label: "Jobs",
    icon: Briefcase,
    isActive: isJobsActive,
  },
  {
    to: "/jobs/copilot",
    label: "Job CoPilot",
    icon: Bot,
    isActive: isCopilotActive,
  },
];

const secondaryLinks = [
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/messages", label: "Inbox", icon: MessageCircle },
  { to: "/community", label: "Community", icon: Users },
  { to: "/saved-searches", label: "Alerts", icon: BellRing },
  { to: "/calculator", label: "Cost calculator", icon: Calculator },
];

const navBeforeJobs = primaryNavItems.slice(0, 3);
const navAfterJobs = primaryNavItems.slice(3);

function NavItemLink({
  item,
  pathname,
  className,
  iconClassName = "h-4 w-4",
}: {
  item: NavItem;
  pathname: string;
  className: (active: boolean) => string;
  iconClassName?: string;
}) {
  const Icon = item.icon;
  const active = item.isActive ? item.isActive(pathname) : pathname === item.to;

  return (
    <NavLink to={item.to} className={() => className(active)}>
      <Icon className={iconClassName} />
      {item.label}
    </NavLink>
  );
}

function JobsNavDropdown({
  pathname,
  open,
  onToggle,
  onClose,
  menuRef,
}: {
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  menuRef: RefObject<HTMLDivElement | null>;
}) {
  const active = isJobsSectionActive(pathname);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-brand-50 text-brand-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <Briefcase className="h-4 w-4" />
        Jobs
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {jobsNavItems.map((item) => {
            const Icon = item.icon;
            const itemActive = item.isActive ? item.isActive(pathname) : pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                  itemActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [jobsMenuOpen, setJobsMenuOpen] = useState(false);
  const [mobileJobsOpen, setMobileJobsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const jobsMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setJobsMenuOpen(false);
    setMobileJobsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (jobsMenuRef.current && !jobsMenuRef.current.contains(e.target as Node)) {
        setJobsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-sm">
            <span className="text-lg font-black">K</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-bold leading-none tracking-tight">Khaleej</div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-500">
              UAE Classifieds
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {navBeforeJobs.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              pathname={location.pathname}
              className={(active) =>
                cn(
                  "inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            />
          ))}
          <JobsNavDropdown
            pathname={location.pathname}
            open={jobsMenuOpen}
            onToggle={() => setJobsMenuOpen((open) => !open)}
            onClose={() => setJobsMenuOpen(false)}
            menuRef={jobsMenuRef}
          />
          {navAfterJobs.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              pathname={location.pathname}
              className={(active) =>
                cn(
                  "inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            />
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to="/messages"
            aria-label="Messages"
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <NotificationBell />
          <LanguageSwitcher />
          {user ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
              >
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <span className="max-w-[100px] truncate text-sm font-medium text-slate-700">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldCheck className="h-4 w-4" /> Admin panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth/login" className="hidden md:block">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
          )}
          <Link to="/post">
            <Button size="sm" className="hidden sm:inline-flex">
              <Plus className="h-4 w-4" />
              Post Ad
            </Button>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200/70 bg-white lg:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navBeforeJobs.map((item) => (
              <NavItemLink
                key={item.to}
                item={item}
                pathname={location.pathname}
                iconClassName="h-5 w-5"
                className={(active) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )
                }
              />
            ))}

            <div className="rounded-lg">
              <button
                type="button"
                onClick={() => setMobileJobsOpen((open) => !open)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isJobsSectionActive(location.pathname)
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Briefcase className="h-5 w-5" />
                <span className="flex-1 text-left">Jobs</span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", mobileJobsOpen && "rotate-180")}
                />
              </button>
              {mobileJobsOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                  {jobsNavItems.map((item) => (
                    <NavItemLink
                      key={item.to}
                      item={item}
                      pathname={location.pathname}
                      iconClassName="h-4 w-4"
                      className={(active) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                          active
                            ? "bg-brand-50 text-brand-700"
                            : "text-slate-600 hover:bg-slate-100"
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {navAfterJobs.map((item) => (
              <NavItemLink
                key={item.to}
                item={item}
                pathname={location.pathname}
                iconClassName="h-5 w-5"
                className={(active) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )
                }
              />
            ))}
            <div className="my-2 border-t border-slate-100" />
            {secondaryLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
            {user ? (
              <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="h-5 w-5" /> Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <ShieldCheck className="h-5 w-5" /> Admin panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" /> Sign out
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Link to="/auth/login">
                  <Button variant="outline" size="md" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="md" className="w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
