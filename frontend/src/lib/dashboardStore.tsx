import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildInitialAdminState,
  buildInitialUserListings,
  defaultProfiles,
  initialInvoices,
  initialMessageThreads,
} from "@/data/dashboardMock";
import type {
  ActivityEvent,
  AdminState,
  Invoice,
  ListingStatus,
  MessageThread,
  PlatformUser,
  UserListing,
  UserProfile,
} from "@/types/dashboard";

const LISTINGS_KEY = "khaleej:dashboard:listings";
const THREADS_KEY = "khaleej:dashboard:threads";
const INVOICES_KEY = "khaleej:dashboard:invoices";
const PROFILES_KEY = "khaleej:dashboard:profiles";
const ADMIN_KEY = "khaleej:dashboard:admin";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(`dashboard:${key}`));
}

type DashboardStoreValue = {
  listings: UserListing[];
  threads: MessageThread[];
  invoices: Invoice[];
  profiles: Record<string, UserProfile>;
  admin: AdminState;
  getUserListings: (userId: string) => UserListing[];
  getUserThreads: (userId: string) => MessageThread[];
  getProfile: (userId: string) => UserProfile;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  boostListing: (id: string) => void;
  deleteListing: (id: string) => void;
  markThreadRead: (id: string) => void;
  saveProfile: (profile: UserProfile) => void;
  adminApproveListing: (id: string) => void;
  adminRejectListing: (id: string) => void;
  adminRemoveListing: (id: string) => void;
  adminToggleUserVerified: (id: string) => void;
  adminToggleUserSuspended: (id: string) => void;
  adminResolveReport: (id: string, action: "resolve" | "dismiss") => void;
  adminInvestigateReport: (id: string) => void;
  adminToggleAdSlot: (id: string) => void;
  adminAddActivity: (event: Omit<ActivityEvent, "id">) => void;
  getListingStatus: (id: string) => ListingStatus;
  getAdminListings: () => UserListing[];
  refresh: () => void;
};

const DashboardContext = createContext<DashboardStoreValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<UserListing[]>(() =>
    readJson(LISTINGS_KEY, buildInitialUserListings())
  );
  const [threads, setThreads] = useState<MessageThread[]>(() =>
    readJson(THREADS_KEY, initialMessageThreads)
  );
  const [invoices] = useState<Invoice[]>(() =>
    readJson(INVOICES_KEY, initialInvoices)
  );
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(() =>
    readJson(PROFILES_KEY, defaultProfiles)
  );
  const [admin, setAdmin] = useState<AdminState>(() =>
    readJson(ADMIN_KEY, buildInitialAdminState())
  );

  const refresh = useCallback(() => {
    setListings(readJson(LISTINGS_KEY, buildInitialUserListings()));
    setThreads(readJson(THREADS_KEY, initialMessageThreads));
    setProfiles(readJson(PROFILES_KEY, defaultProfiles));
    setAdmin(readJson(ADMIN_KEY, buildInitialAdminState()));
  }, []);

  useEffect(() => {
    const keys = [LISTINGS_KEY, THREADS_KEY, PROFILES_KEY, ADMIN_KEY];
    const handler = () => refresh();
    keys.forEach((k) => window.addEventListener(`dashboard:${k}`, handler));
    return () => keys.forEach((k) => window.removeEventListener(`dashboard:${k}`, handler));
  }, [refresh]);

  const persistListings = useCallback((next: UserListing[]) => {
    writeJson(LISTINGS_KEY, next);
    setListings(next);
  }, []);

  const persistThreads = useCallback((next: MessageThread[]) => {
    writeJson(THREADS_KEY, next);
    setThreads(next);
  }, []);

  const persistProfiles = useCallback((next: Record<string, UserProfile>) => {
    writeJson(PROFILES_KEY, next);
    setProfiles(next);
  }, []);

  const persistAdmin = useCallback((next: AdminState) => {
    writeJson(ADMIN_KEY, next);
    setAdmin(next);
  }, []);

  const getListingStatus = useCallback(
    (id: string): ListingStatus => {
      return admin.listingStatus[id] ?? listings.find((l) => l.id === id)?.status ?? "active";
    },
    [admin.listingStatus, listings]
  );

  const getUserListings = useCallback(
    (userId: string) =>
      listings.filter((l) => l.hostId === userId).map((l) => ({
        ...l,
        status: getListingStatus(l.id),
      })),
    [listings, getListingStatus]
  );

  const getUserThreads = useCallback(
    (userId: string) => threads.filter((t) => t.userId === userId),
    [threads]
  );

  const getProfile = useCallback(
    (userId: string): UserProfile =>
      profiles[userId] ?? {
        userId,
        phone: "",
        bio: "",
        emirate: "Dubai",
        notifyEmail: true,
        notifyPush: true,
        notifySms: false,
        publicProfile: true,
      },
    [profiles]
  );

  const updateListingStatus = useCallback(
    (id: string, status: ListingStatus) => {
      persistListings(
        listings.map((l) => (l.id === id ? { ...l, status } : l))
      );
      persistAdmin({
        ...admin,
        listingStatus: { ...admin.listingStatus, [id]: status },
      });
    },
    [listings, admin, persistListings, persistAdmin]
  );

  const boostListing = useCallback(
    (id: string) => {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      persistListings(
        listings.map((l) =>
          l.id === id
            ? {
                ...l,
                featured: true,
                boostedUntil: until.toISOString(),
              }
            : l
        )
      );
    },
    [listings, persistListings]
  );

  const deleteListing = useCallback(
    (id: string) => {
      persistListings(listings.filter((l) => l.id !== id));
      const { [id]: _, ...rest } = admin.listingStatus;
      persistAdmin({ ...admin, listingStatus: rest });
    },
    [listings, admin, persistListings, persistAdmin]
  );

  const markThreadRead = useCallback(
    (id: string) => {
      persistThreads(threads.map((t) => (t.id === id ? { ...t, unread: false } : t)));
    },
    [threads, persistThreads]
  );

  const saveProfile = useCallback(
    (profile: UserProfile) => {
      persistProfiles({ ...profiles, [profile.userId]: profile });
    },
    [profiles, persistProfiles]
  );

  const adminAddActivity = useCallback(
    (event: Omit<ActivityEvent, "id">) => {
      persistAdmin({
        ...admin,
        activity: [
          { ...event, id: `ev-${Date.now()}` },
          ...admin.activity.slice(0, 19),
        ],
      });
    },
    [admin, persistAdmin]
  );

  const adminApproveListing = useCallback(
    (id: string) => {
      updateListingStatus(id, "active");
      adminAddActivity({
        message: `Listing ${id} approved`,
        tone: "success",
        at: new Date().toISOString(),
      });
    },
    [updateListingStatus, adminAddActivity]
  );

  const adminRejectListing = useCallback(
    (id: string) => {
      updateListingStatus(id, "rejected");
      adminAddActivity({
        message: `Listing ${id} rejected`,
        tone: "warning",
        at: new Date().toISOString(),
      });
    },
    [updateListingStatus, adminAddActivity]
  );

  const adminRemoveListing = useCallback(
    (id: string) => {
      deleteListing(id);
      adminAddActivity({
        message: `Listing ${id} removed from platform`,
        tone: "danger",
        at: new Date().toISOString(),
      });
    },
    [deleteListing, adminAddActivity]
  );

  const adminToggleUserVerified = useCallback(
    (id: string) => {
      persistAdmin({
        ...admin,
        users: admin.users.map((u) =>
          u.id === id ? { ...u, verified: !u.verified } : u
        ),
      });
    },
    [admin, persistAdmin]
  );

  const adminToggleUserSuspended = useCallback(
    (id: string) => {
      persistAdmin({
        ...admin,
        users: admin.users.map((u) =>
          u.id === id ? { ...u, suspended: !u.suspended } : u
        ),
      });
    },
    [admin, persistAdmin]
  );

  const adminResolveReport = useCallback(
    (id: string, action: "resolve" | "dismiss") => {
      persistAdmin({
        ...admin,
        reports: admin.reports.map((r) =>
          r.id === id
            ? { ...r, status: action === "resolve" ? "resolved" : "resolved" }
            : r
        ),
      });
      adminAddActivity({
        message: `Report ${id} ${action === "resolve" ? "resolved" : "dismissed"}`,
        tone: "brand",
        at: new Date().toISOString(),
      });
    },
    [admin, persistAdmin, adminAddActivity]
  );

  const adminInvestigateReport = useCallback(
    (id: string) => {
      persistAdmin({
        ...admin,
        reports: admin.reports.map((r) =>
          r.id === id ? { ...r, status: "investigating" } : r
        ),
      });
    },
    [admin, persistAdmin]
  );

  const adminToggleAdSlot = useCallback(
    (id: string) => {
      persistAdmin({
        ...admin,
        adSlots: admin.adSlots.map((s) =>
          s.id === id ? { ...s, active: !s.active } : s
        ),
      });
    },
    [admin, persistAdmin]
  );

  const getAdminListings = useCallback(
    () =>
      listings.map((l) => ({
        ...l,
        status: getListingStatus(l.id),
      })),
    [listings, getListingStatus]
  );

  const value = useMemo(
    () => ({
      listings,
      threads,
      invoices,
      profiles,
      admin,
      getUserListings,
      getUserThreads,
      getProfile,
      updateListingStatus,
      boostListing,
      deleteListing,
      markThreadRead,
      saveProfile,
      adminApproveListing,
      adminRejectListing,
      adminRemoveListing,
      adminToggleUserVerified,
      adminToggleUserSuspended,
      adminResolveReport,
      adminInvestigateReport,
      adminToggleAdSlot,
      adminAddActivity,
      getListingStatus,
      getAdminListings,
      refresh,
    }),
    [
      listings,
      threads,
      invoices,
      profiles,
      admin,
      getUserListings,
      getUserThreads,
      getProfile,
      updateListingStatus,
      boostListing,
      deleteListing,
      markThreadRead,
      saveProfile,
      adminApproveListing,
      adminRejectListing,
      adminRemoveListing,
      adminToggleUserVerified,
      adminToggleUserSuspended,
      adminResolveReport,
      adminInvestigateReport,
      adminToggleAdSlot,
      adminAddActivity,
      getListingStatus,
      getAdminListings,
      refresh,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboardStore() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardStore must be used within DashboardProvider");
  return ctx;
}

export function roleLabel(role: PlatformUser["role"]): string {
  const labels: Record<PlatformUser["role"], string> = {
    seeker: "Seeker",
    lister: "Lister",
    broker: "Broker",
    service_provider: "Service provider",
    employer: "Employer",
    admin: "Admin",
  };
  return labels[role];
}
