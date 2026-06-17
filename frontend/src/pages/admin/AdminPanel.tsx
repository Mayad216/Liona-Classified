import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ListChecks,
  Flag,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  ShieldAlert,
  ShieldCheck,
  Megaphone,
  UserX,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { DashboardLayout, Panel } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboardStore, roleLabel } from "@/lib/dashboardStore";
import { formatPrice, relativeTime } from "@/lib/utils";
import type { AdminTab, ListingStatus } from "@/types/dashboard";

const tabs: { id: AdminTab; label: string; icon: typeof TrendingUp }[] = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "listings", label: "Listings", icon: ListChecks },
  { id: "users", label: "Users", icon: Users },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "ads", label: "Ads", icon: Megaphone },
];

function listingStatusTone(status: ListingStatus) {
  switch (status) {
    case "active":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "rejected":
      return "danger" as const;
    case "paused":
      return "outline" as const;
    default:
      return "default" as const;
  }
}

export function AdminPanel() {
  const store = useDashboardStore();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [listingSearch, setListingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");
  const [userSearch, setUserSearch] = useState("");

  const allListings = store.getAdminListings();
  const pending = allListings.filter((l) => l.status === "pending");
  const openReports = store.admin.reports.filter((r) => r.status !== "resolved");

  const filteredListings = useMemo(() => {
    const q = listingSearch.trim().toLowerCase();
    return allListings.filter((l) => {
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const matchQ =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.host.name.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [allListings, listingSearch, statusFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return store.admin.users.filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [store.admin.users, userSearch]);

  const platformStats = useMemo(
    () => ({
      users: store.admin.users.length,
      listings: allListings.filter((l) => l.status === "active").length,
      pending: pending.length,
      reports: openReports.length,
      revenue: "AED 184K",
    }),
    [store.admin.users, allListings, pending, openReports]
  );

  return (
    <DashboardLayout
      title="Platform control center"
      subtitle="Moderate listings, manage users, and monitor platform health"
      activeTab={tab}
      onTabChange={setTab}
      tabs={tabs.map((t) => ({
        ...t,
        badge:
          t.id === "listings"
            ? pending.length
            : t.id === "reports"
              ? openReports.length
              : undefined,
      }))}
      actions={
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            User view
          </Button>
        </Link>
      }
    >
      {tab === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total users"
              value={platformStats.users.toLocaleString()}
              change={`${store.admin.users.filter((u) => u.verified).length} verified`}
              icon={Users}
            />
            <StatCard
              label="Active listings"
              value={platformStats.listings.toLocaleString()}
              change={`${pending.length} pending approval`}
              icon={ListChecks}
            />
            <StatCard
              label="Revenue (mo)"
              value={platformStats.revenue}
              change="+12.4% vs last month"
              icon={DollarSign}
              accent
            />
            <StatCard
              label="Open reports"
              value={String(platformStats.reports)}
              change={`${openReports.filter((r) => r.priority === "high").length} high priority`}
              icon={Flag}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Listings awaiting approval" action={<Badge tone="brand">{pending.length}</Badge>}>
              <div className="divide-y divide-slate-100">
                {pending.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">No listings pending approval.</p>
                ) : (
                  pending.slice(0, 5).map((l) => (
                    <div key={l.id} className="flex items-center gap-3 p-4">
                      <img
                        src={l.photos[0]}
                        alt=""
                        className="h-14 w-[4.5rem] flex-shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-semibold">{l.title}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {l.host.name} · {relativeTime(l.postedAt)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600"
                        onClick={() => store.adminApproveListing(l.id)}
                        title="Approve"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => store.adminRejectListing(l.id)}
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel title="Recent platform events">
              <ul className="divide-y divide-slate-100">
                {store.admin.activity.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 p-4">
                    <Badge tone={e.tone} className="h-8 w-8 justify-center rounded-full p-0">
                      {e.tone === "warning" ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : e.tone === "danger" ? (
                        <Flag className="h-4 w-4" />
                      ) : e.tone === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </Badge>
                    <span className="flex-1 text-sm text-slate-700">{e.message}</span>
                    <span className="text-xs text-slate-400">{relativeTime(e.at)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      )}

      {tab === "listings" && (
        <Panel title={`All listings (${filteredListings.length})`}>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder="Search listings…"
                className="h-9 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Listing</th>
                  <th className="px-4 py-3 text-left">Host</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Posted</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={l.photos[0]}
                          alt=""
                          className="h-10 w-12 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <div className="line-clamp-1 max-w-[260px] font-medium">{l.title}</div>
                          <div className="text-xs text-slate-500">{l.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={l.host.avatar} name={l.host.name} size="sm" />
                        <span>{l.host.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(l.price)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={listingStatusTone(l.status)}>{l.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {relativeTime(l.postedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link to={`/accommodation/${l.id}`}>
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {l.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600"
                            onClick={() => store.adminApproveListing(l.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            if (confirm(`Remove listing ${l.id}?`)) store.adminRemoveListing(l.id);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "users" && (
        <Panel title={`Users (${filteredUsers.length})`}>
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users…"
                className="h-9 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Verified</th>
                  <th className="px-4 py-3 text-left">Listings</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={u.suspended ? "bg-red-50/30" : "hover:bg-slate-50/60"}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.name} size="sm" />
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{roleLabel(u.role)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => store.adminToggleUserVerified(u.id)}
                        className="inline-flex"
                      >
                        {u.verified ? (
                          <Badge tone="success">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge tone="warning">Pending — click to verify</Badge>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">{u.listings}</td>
                    <td className="px-4 py-3">
                      {u.suspended ? (
                        <Badge tone="danger">Suspended</Badge>
                      ) : (
                        <Badge tone="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => store.adminToggleUserSuspended(u.id)}
                      >
                        {u.suspended ? "Reinstate" : <UserX className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "reports" && (
        <Panel
          title="Moderation reports"
          action={<Badge tone="brand">{openReports.length} open</Badge>}
        >
          <ul className="divide-y divide-slate-100">
            {store.admin.reports.map((r) => (
              <li
                key={r.id}
                className={`flex flex-wrap items-center gap-3 p-4 ${
                  r.status === "resolved" ? "opacity-50" : ""
                }`}
              >
                <Flag
                  className={`h-5 w-5 ${
                    r.priority === "high" ? "text-red-500" : "text-amber-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.target}</div>
                  <div className="text-xs text-slate-500">
                    {r.reason} · {relativeTime(r.reportedAt)}
                  </div>
                </div>
                <Badge tone={r.priority === "high" ? "danger" : "warning"}>
                  {r.priority}
                </Badge>
                <Badge tone={r.status === "resolved" ? "success" : "outline"}>
                  {r.status}
                </Badge>
                {r.status !== "resolved" && (
                  <div className="flex gap-2">
                    {r.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => store.adminInvestigateReport(r.id)}
                      >
                        Investigate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => store.adminResolveReport(r.id, "resolve")}
                    >
                      Resolve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => store.adminResolveReport(r.id, "dismiss")}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "ads" && (
        <Panel title="Ad slots">
          <ul className="divide-y divide-slate-100">
            {store.admin.adSlots.map((s) => (
              <li key={s.id} className="flex items-center gap-3 p-4">
                <Megaphone className="h-5 w-5 text-brand-600" />
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-slate-500">CTR (7d): {s.ctr}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.active}
                  onClick={() => store.adminToggleAdSlot(s.id)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    s.active ? "bg-brand-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      s.active ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </DashboardLayout>
  );
}
