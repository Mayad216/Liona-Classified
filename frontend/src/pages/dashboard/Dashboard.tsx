import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  ListChecks,
  MessageCircle,
  Heart,
  User,
  Settings,
  Plus,
  TrendingUp,
  Eye,
  CreditCard,
  Pause,
  Play,
  Trash2,
  Zap,
  ExternalLink,
  ShieldCheck,
  Bell,
  Mail,
  Smartphone,
  Truck,
  FileText,
} from "lucide-react";
import { listApplications } from "@/lib/resume/plan";
import { useResumePlan } from "@/lib/resume/useResumePlan";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { DashboardLayout, Panel } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/lib/auth";
import { useDashboardStore } from "@/lib/dashboardStore";
import { formatPrice, relativeTime } from "@/lib/utils";
import { mockListings } from "@/data/mock";
import { useWishlist } from "@/pages/Wishlist";
import { usePickupBookings } from "@/lib/pickup/usePickupBookings";
import { PICKUP_ENABLED } from "@/lib/pickup/flags";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { ProfileVisibilityToggle } from "@/components/match/ProfileVisibilityToggle";
import type { ListingStatus, UserDashboardTab, UserListing } from "@/types/dashboard";

const tabs: { id: UserDashboardTab; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "listings", label: "My listings", icon: ListChecks },
  ...(PICKUP_ENABLED ? [{ id: "pickups" as const, label: "Pickups", icon: Truck }] : []),
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

function statusTone(status: ListingStatus) {
  switch (status) {
    case "active":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "paused":
      return "outline" as const;
    case "rejected":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export function Dashboard() {
  const { user, updateUser } = useAuth();
  const store = useDashboardStore();
  const [tab, setTab] = useState<UserDashboardTab>("overview");
  const wishlist = useWishlist();
  const { getUserBookings } = usePickupBookings();
  const myPickups = user ? getUserBookings(user.id) : [];
  const applications = useMemo(() => listApplications(), [tab]);
  const { isPro: resumePro, upgradeToPro } = useResumePlan();

  const myListings = useMemo(
    () => (user ? store.getUserListings(user.id) : []),
    [user, store]
  );
  const myThreads = useMemo(
    () => (user ? store.getUserThreads(user.id) : []),
    [user, store]
  );
  const profile = user ? store.getProfile(user.id) : null;
  const {
    profile: roommateProfile,
    profileCompleteness,
    setDiscoverable,
  } = useMatchProfile();
  const unread = myThreads.filter((t) => t.unread).length;

  const stats = useMemo(() => {
    const active = myListings.filter((l) => l.status === "active").length;
    const views = myListings.reduce((s, l) => s + l.views, 0);
    const messages = myListings.reduce((s, l) => s + l.messageCount, 0);
    const revenue = active * 2500;
    return { active, views, messages, revenue, unread };
  }, [myListings, unread]);

  const favoriteListings = wishlist.items
    .map((id) => mockListings.find((l) => l.id === id))
    .filter(Boolean);

  if (!user) return null;

  return (
    <DashboardLayout
      title={`Welcome back, ${user.name.split(" ")[0]}`}
      subtitle={
        unread > 0
          ? `You have ${unread} unread message${unread > 1 ? "s" : ""} and ${stats.active} active listing${stats.active !== 1 ? "s" : ""}.`
          : `${stats.active} active listing${stats.active !== 1 ? "s" : ""} · ${stats.views.toLocaleString()} total views`
      }
      activeTab={tab}
      onTabChange={setTab}
      tabs={tabs.map((t) => ({
        ...t,
        badge:
          t.id === "messages"
            ? unread
            : t.id === "listings"
              ? myListings.length
              : t.id === "pickups" && PICKUP_ENABLED
                ? myPickups.length
                : t.id === "applications"
                  ? applications.length
                  : undefined,
      }))}
      actions={
        <>
          <Link to="/messages">
            <Button variant="outline" size="md">
              <MessageCircle className="h-4 w-4" /> Inbox
            </Button>
          </Link>
          <Link to="/post">
            <Button size="md">
              <Plus className="h-4 w-4" /> New listing
            </Button>
          </Link>
        </>
      }
    >
      {tab === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active listings"
              value={String(stats.active)}
              change={`${myListings.length} total`}
              icon={ListChecks}
            />
            <StatCard
              label="Total views"
              value={stats.views.toLocaleString()}
              change="Last 30 days"
              icon={Eye}
            />
            <StatCard
              label="Messages"
              value={String(stats.messages)}
              change={unread > 0 ? `${unread} unread` : "All read"}
              icon={MessageCircle}
              accent={unread > 0}
            />
            <StatCard
              label="Est. revenue (mo)"
              value={`AED ${stats.revenue.toLocaleString()}`}
              change="From active listings"
              icon={TrendingUp}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Panel
              title="Your listings"
              action={
                <button
                  type="button"
                  onClick={() => setTab("listings")}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  Manage all
                </button>
              }
            >
              <div className="divide-y divide-slate-100">
                {myListings.length === 0 ? (
                  <EmptyState message="No listings yet." actionLabel="Post your first ad" to="/post" />
                ) : (
                  myListings.slice(0, 4).map((l) => (
                    <ListingRow key={l.id} listing={l} compact />
                  ))
                )}
              </div>
            </Panel>

            <Panel title="Recent messages">
              <div className="divide-y divide-slate-100">
                {myThreads.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">No conversations yet.</p>
                ) : (
                  myThreads.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        store.markThreadRead(m.id);
                        setTab("messages");
                      }}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50"
                    >
                      <Avatar src={m.participantAvatar} name={m.participantName} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{m.participantName}</span>
                          <span className="text-xs text-slate-400">{relativeTime(m.updatedAt)}</span>
                        </div>
                        <p className="line-clamp-1 text-xs text-slate-600">{m.lastMessage}</p>
                      </div>
                      {m.unread && (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </Panel>
          </div>

          <BoostBanner
            onBoost={() => {
              const target = myListings.find((l) => l.status === "active");
              if (target) store.boostListing(target.id);
            }}
          />
        </>
      )}

      {tab === "listings" && (
        <Panel title={`My listings (${myListings.length})`}>
          <div className="divide-y divide-slate-100">
            {myListings.length === 0 ? (
              <EmptyState message="You haven't posted any listings." actionLabel="Create listing" to="/post" />
            ) : (
              myListings.map((l) => (
                <div key={l.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <ListingRow listing={l} />
                  <div className="flex flex-wrap gap-2 sm:ml-auto">
                    <Link to={`/accommodation/${l.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                    {l.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => store.updateListingStatus(l.id, "paused")}
                      >
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </Button>
                    ) : l.status === "paused" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => store.updateListingStatus(l.id, "active")}
                      >
                        <Play className="h-3.5 w-3.5" /> Resume
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => store.boostListing(l.id)}
                    >
                      <Zap className="h-3.5 w-3.5" /> Boost
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => {
                        if (confirm("Delete this listing permanently?")) store.deleteListing(l.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      )}

      {PICKUP_ENABLED && tab === "pickups" && (
        <Panel
          title={`Pickup bookings (${myPickups.length})`}
          action={
            <Link to="/pickup">
              <Button size="sm">
                <Truck className="h-4 w-4" /> Book pickup
              </Button>
            </Link>
          }
        >
          {myPickups.length === 0 ? (
            <EmptyState
              message="No pickup bookings yet. Book movers with vehicle size and helpers in minutes."
              actionLabel="Book pickup now"
              to="/pickup"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {myPickups.map((b) => (
                <Link
                  key={b.id}
                  to={`/pickup/${b.id}`}
                  className="flex flex-col gap-2 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{b.vehicleName}</span>
                      <Badge tone="outline">{b.helpers} helpers</Badge>
                      <Badge
                        tone={
                          b.status === "completed"
                            ? "success"
                            : b.status === "cancelled"
                              ? "danger"
                              : "brand"
                        }
                      >
                        {b.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {b.pickupAddress} → {b.dropoffAddress}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {b.scheduleLabel} · {relativeTime(b.createdAt)}
                    </p>
                  </div>
                  <span className="font-bold text-brand-700">{formatPrice(b.fare.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === "messages" && (
        <Panel title={`Inbox (${myThreads.length})`}>
          <div className="divide-y divide-slate-100">
            {myThreads.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => store.markThreadRead(m.id)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50"
              >
                <Avatar src={m.participantAvatar} name={m.participantName} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{m.participantName}</span>
                    {m.verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                  {m.listingTitle && (
                    <p className="text-xs text-brand-600">{m.listingTitle}</p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{m.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-slate-400">{relativeTime(m.updatedAt)}</span>
                  {m.unread && (
                    <Badge tone="brand" className="text-[10px]">
                      New
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 p-4">
            <Link to="/messages">
              <Button variant="outline" size="sm" className="w-full">
                Open full inbox
              </Button>
            </Link>
          </div>
        </Panel>
      )}

      {tab === "favorites" && (
        <Panel title={`Saved listings (${favoriteListings.length})`}>
          {favoriteListings.length === 0 ? (
            <EmptyState
              message="No saved listings yet. Heart listings to save them here."
              actionLabel="Browse accommodation"
              to="/accommodation"
            />
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {favoriteListings.map((l) =>
                l ? (
                  <div
                    key={l.id}
                    className="flex gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <img
                      src={l.photos[0]}
                      alt=""
                      className="h-20 w-24 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/accommodation/${l.id}`}
                        className="line-clamp-2 text-sm font-semibold hover:text-brand-700"
                      >
                        {l.title}
                      </Link>
                      <p className="mt-1 text-sm font-medium text-brand-700">
                        {formatPrice(l.price)}/mo
                      </p>
                      <button
                        type="button"
                        onClick={() => wishlist.remove(l.id)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </Panel>
      )}

      {tab === "applications" && (
        <Panel
          title="Job applications"
          action={
            <Link to="/jobs">
              <Button variant="outline" size="sm">
                Browse jobs
              </Button>
            </Link>
          }
        >
          {applications.length === 0 ? (
            <EmptyState
              message="No applications yet — apply with your Khaleej resume from any job listing."
              actionLabel="Find jobs"
              to="/jobs"
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {applications.map((app) => (
                <li key={app.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <Link
                      to={`/jobs/${app.jobId}`}
                      className="font-semibold text-slate-900 hover:text-brand-700"
                    >
                      {app.jobTitle}
                    </Link>
                    <p className="text-sm text-slate-600">{app.company}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Resume: {app.resumeTitle ?? "Untitled"} · {relativeTime(app.appliedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="success">{app.status}</Badge>
                    {app.shareToken && (
                      <Link to={`/resume/share/${app.shareToken}`}>
                        <Button variant="outline" size="sm">
                          View CV
                        </Button>
                      </Link>
                    )}
                    <Link to={`/resume/${app.resumeId}/edit`}>
                      <Button size="sm">Edit resume</Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {tab === "billing" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "Free", price: "AED 0", desc: "3 active listings", current: true, plan: "lister" as const },
              { name: "Pro Lister", price: "AED 99/mo", desc: "Unlimited + analytics", current: false, plan: "lister" as const },
              {
                name: "Resume Pro",
                price: "AED 29/mo",
                desc: "No watermark + AI credits",
                current: resumePro,
                plan: "resume" as const,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-5 ${
                  plan.current
                    ? "border-brand-300 bg-brand-50/50 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.current && (
                  <Badge tone="brand" className="mb-2">
                    Current plan
                  </Badge>
                )}
                <h3 className="font-bold">{plan.name}</h3>
                <p className="mt-1 text-2xl font-black">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
                {!plan.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => {
                      if (plan.plan === "resume") void upgradeToPro();
                    }}
                  >
                    {plan.plan === "resume" ? "Upgrade resume" : "Upgrade"}
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Panel title="Invoice history">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {store.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium">{inv.id}</td>
                      <td className="px-4 py-3 text-slate-600">{inv.description}</td>
                      <td className="px-4 py-3">AED {inv.amount}</td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            inv.status === "paid"
                              ? "success"
                              : inv.status === "pending"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {tab === "profile" && profile && (
        <Panel title="Profile">
          <form
            className="space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") ?? user.name);
              store.saveProfile({
                ...profile,
                phone: String(fd.get("phone") ?? ""),
                bio: String(fd.get("bio") ?? ""),
                emirate: String(fd.get("emirate") ?? "Dubai"),
              });
              updateUser({ name });
            }}
          >
            <div className="flex items-center gap-4">
              <Avatar src={user.avatar} name={user.name} size="lg" />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                {user.verified && (
                  <Badge tone="success" className="mt-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
            </div>
            <Input name="name" label="Display name" defaultValue={user.name} required />
            <Input name="phone" label="Phone" defaultValue={profile.phone} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={profile.bio}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Emirate</label>
              <select
                name="emirate"
                defaultValue={profile.emirate}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
              >
                {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map(
                  (e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  )
                )}
              </select>
            </div>
            <Link to="/verify" className="text-sm font-medium text-brand-700 hover:underline">
              Complete ID verification →
            </Link>
            <Button type="submit">Save profile</Button>
          </form>

          <div className="mt-6 border-t border-slate-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Roommate matching
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Profile {Math.round(profileCompleteness() * 100)}% complete · search filters and
              visibility are managed separately.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/match/profile">
                <Button variant="outline" size="sm">
                  Edit roommate profile
                </Button>
              </Link>
              <Link to="/match/search">
                <Button variant="outline" size="sm">
                  Edit search filters
                </Button>
              </Link>
              <Link to="/match/seeker">
                <Button variant="outline" size="sm">
                  View matches
                </Button>
              </Link>
            </div>
            <div className="mt-4">
              <ProfileVisibilityToggle
                visible={roommateProfile.isDiscoverable ?? false}
                onChange={setDiscoverable}
              />
            </div>
          </div>
        </Panel>
      )}

      {tab === "settings" && profile && (
        <Panel title="Notifications & privacy">
          <form
            className="space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              store.saveProfile({
                ...profile,
                notifyEmail: fd.get("notifyEmail") === "on",
                notifyPush: fd.get("notifyPush") === "on",
                notifySms: fd.get("notifySms") === "on",
                publicProfile: fd.get("publicProfile") === "on",
              });
            }}
          >
            {[
              { name: "notifyEmail", label: "Email notifications", icon: Mail, default: profile.notifyEmail },
              { name: "notifyPush", label: "Push notifications", icon: Bell, default: profile.notifyPush },
              { name: "notifySms", label: "SMS alerts", icon: Smartphone, default: profile.notifySms },
              { name: "publicProfile", label: "Public profile", icon: User, default: profile.publicProfile },
            ].map(({ name, label, icon: Icon, default: checked }) => (
              <label
                key={name}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Icon className="h-4 w-4 text-slate-400" />
                  {label}
                </span>
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={checked}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
              </label>
            ))}
            <Button type="submit">Save settings</Button>
          </form>
        </Panel>
      )}
    </DashboardLayout>
  );
}

function ListingRow({
  listing: l,
  compact,
}: {
  listing: UserListing;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 ${compact ? "p-4" : "flex-1 min-w-0"}`}>
      <img
        src={l.photos[0]}
        alt={l.title}
        className={`flex-shrink-0 rounded-lg object-cover ${compact ? "h-14 w-18" : "h-16 w-20"}`}
      />
      <div className="min-w-0 flex-1">
        <Link
          to={`/accommodation/${l.id}`}
          className="line-clamp-1 text-sm font-semibold hover:text-brand-700"
        >
          {l.title}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{formatPrice(l.price)}/mo</span>
          <span>·</span>
          <span>{l.area}</span>
          <Badge tone={statusTone(l.status)}>{l.status}</Badge>
          {l.boostedUntil && new Date(l.boostedUntil) > new Date() && (
            <Badge tone="warning">Boosted</Badge>
          )}
        </div>
      </div>
      <div className="text-right text-xs text-slate-500">
        <div className="font-semibold text-slate-900">{l.views} views</div>
        <div>{l.messageCount} messages</div>
      </div>
    </div>
  );
}

function BoostBanner({ onBoost }: { onBoost: () => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-7 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge className="bg-white/15 text-white">Boost</Badge>
          <h3 className="mt-3 text-xl font-bold">Get 4× more views</h3>
          <p className="mt-2 max-w-md text-sm text-brand-100">
            Feature your top listing for 7 days — appears at the top of search and homepage
            rotation.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          className="bg-white text-brand-700 hover:bg-brand-50"
          onClick={onBoost}
        >
          <Zap className="h-4 w-4" /> Boost listing
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  actionLabel,
  to,
}: {
  message: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <div className="p-8 text-center">
      <p className="text-sm text-slate-600">{message}</p>
      <Link to={to} className="mt-3 inline-block">
        <Button size="sm">{actionLabel}</Button>
      </Link>
    </div>
  );
}
