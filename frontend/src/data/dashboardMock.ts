import { mockListings } from "@/data/mock";
import type {
  ActivityEvent,
  AdSlot,
  AdminState,
  Invoice,
  MessageThread,
  ModerationReport,
  PlatformUser,
  UserListing,
  UserProfile,
} from "@/types/dashboard";

export function buildInitialUserListings(): UserListing[] {
  return mockListings.map((l, i) => ({
    ...l,
    hostId: l.host.id,
    status:
      i === 2 ? "pending" : i === 4 ? "paused" : ("active" as const),
    views: [324, 189, 412, 98, 256, 501][i] ?? 100,
    messageCount: [12, 4, 8, 2, 6, 19][i] ?? 3,
    boostedUntil: l.featured ? "2026-06-01T00:00:00Z" : undefined,
  }));
}

export const initialMessageThreads: MessageThread[] = [
  {
    id: "th1",
    userId: "u1",
    participantName: "Rohan Mehta",
    participantAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    listingTitle: "Modern Bedspace in Dubai Marina",
    lastMessage: "Is the place still available for June move-in?",
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unread: true,
    verified: true,
  },
  {
    id: "th2",
    userId: "u1",
    participantName: "Sofia Rossi",
    participantAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    listingTitle: "Family 2BR Apartment — Sharjah",
    lastMessage: "Thanks for the quick reply!",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unread: false,
    verified: false,
  },
  {
    id: "th3",
    userId: "u1",
    participantName: "Khalid Bin Saeed",
    participantAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    lastMessage: "Can I visit tomorrow at 6pm?",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    unread: false,
    verified: true,
  },
  {
    id: "th4",
    userId: "u2",
    participantName: "Aisha Al Marri",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    listingTitle: "Private Room — Al Reem Island",
    lastMessage: "Ejari + DEWA included in rent.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unread: true,
    verified: true,
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-2401",
    date: "2026-05-01",
    description: "Featured listing — 7 days (L-1024)",
    amount: 149,
    status: "paid",
  },
  {
    id: "INV-2402",
    date: "2026-04-12",
    description: "Boost pack — 3 listings",
    amount: 299,
    status: "paid",
  },
  {
    id: "INV-2403",
    date: "2026-05-15",
    description: "Pro lister subscription",
    amount: 99,
    status: "pending",
  },
];

export const defaultProfiles: Record<string, UserProfile> = {
  u1: {
    userId: "u1",
    phone: "+971 50 123 4567",
    bio: "Marketing lead in Dubai Marina. Hosting verified bedspaces since 2024.",
    emirate: "Dubai",
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
    publicProfile: true,
  },
  u2: {
    userId: "u2",
    phone: "+971 55 987 6543",
    bio: "Software engineer looking for a quiet shared flat near metro.",
    emirate: "Dubai",
    notifyEmail: true,
    notifyPush: true,
    notifySms: true,
    publicProfile: true,
  },
  admin: {
    userId: "admin",
    phone: "+971 4 000 0000",
    bio: "Khaleej platform administrator",
    emirate: "Dubai",
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
    publicProfile: false,
  },
};

export const initialPlatformUsers: PlatformUser[] = [
  {
    id: "u1",
    name: "Aisha Al Marri",
    email: "aisha@khaleej.ae",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    role: "lister",
    verified: true,
    suspended: false,
    listings: 3,
    joinedAt: "2024-03-15",
  },
  {
    id: "u2",
    name: "Rohan Mehta",
    email: "rohan@khaleej.ae",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    role: "seeker",
    verified: true,
    suspended: false,
    listings: 0,
    joinedAt: "2025-01-08",
  },
  {
    id: "u3",
    name: "Sofia Rossi",
    email: "sofia@khaleej.ae",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    role: "lister",
    verified: false,
    suspended: false,
    listings: 1,
    joinedAt: "2025-08-22",
  },
  {
    id: "u4",
    name: "Khalid Bin Saeed",
    email: "khalid@khaleej.ae",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    role: "broker",
    verified: true,
    suspended: false,
    listings: 12,
    joinedAt: "2023-11-01",
  },
  {
    id: "admin",
    name: "Platform Admin",
    email: "admin@khaleej.ae",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    role: "admin",
    verified: true,
    suspended: false,
    listings: 0,
    joinedAt: "2023-01-01",
  },
];

export const initialReports: ModerationReport[] = [
  {
    id: "R-101",
    target: "Listing L-1024",
    targetType: "listing",
    reason: "Possible duplicate photos",
    priority: "high",
    status: "open",
    reportedAt: "2026-05-22T14:00:00Z",
  },
  {
    id: "R-102",
    target: "User u9",
    targetType: "user",
    reason: "Spam messaging in inbox",
    priority: "medium",
    status: "open",
    reportedAt: "2026-05-21T09:30:00Z",
  },
  {
    id: "R-103",
    target: "Listing L-1029",
    targetType: "listing",
    reason: "Misleading photos vs. actual unit",
    priority: "medium",
    status: "investigating",
    reportedAt: "2026-05-20T16:45:00Z",
  },
];

export const initialAdSlots: AdSlot[] = [
  { id: "ad1", name: "Homepage hero", active: true, ctr: "3.4%" },
  { id: "ad2", name: "Sidebar — Accommodation", active: true, ctr: "1.8%" },
  { id: "ad3", name: "Inline — Job listings", active: false, ctr: "—" },
  { id: "ad4", name: "Footer banner", active: true, ctr: "0.9%" },
];

export const initialActivity: ActivityEvent[] = [
  {
    id: "ev1",
    message: "Listing L-1026 flagged by AI fraud detector",
    tone: "warning",
    at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "ev2",
    message: "1,284 new signups today",
    tone: "brand",
    at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "ev3",
    message: "AED 12,400 in featured listings purchased",
    tone: "success",
    at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "ev4",
    message: "3 high-priority user reports open",
    tone: "danger",
    at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

export function buildInitialAdminState(): AdminState {
  const listingStatus: Record<string, import("@/types/dashboard").ListingStatus> = {};
  mockListings.forEach((l, i) => {
    listingStatus[l.id] = i === 2 ? "pending" : i === 5 ? "pending" : "active";
  });
  return {
    listingStatus,
    users: initialPlatformUsers,
    reports: initialReports,
    adSlots: initialAdSlots,
    activity: initialActivity,
  };
}
