import type { Listing, User } from "@/types";

export type ListingStatus = "active" | "pending" | "draft" | "rejected" | "paused";

export interface UserListing extends Listing {
  status: ListingStatus;
  views: number;
  messageCount: number;
  hostId: string;
  boostedUntil?: string;
}

export interface MessageThread {
  id: string;
  participantName: string;
  participantAvatar: string;
  listingTitle?: string;
  lastMessage: string;
  updatedAt: string;
  unread: boolean;
  verified: boolean;
  userId: string;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

export interface UserProfile {
  userId: string;
  phone: string;
  bio: string;
  emirate: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
  publicProfile: boolean;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: User["role"];
  verified: boolean;
  suspended: boolean;
  listings: number;
  joinedAt: string;
}

export interface ModerationReport {
  id: string;
  target: string;
  targetType: "listing" | "user";
  reason: string;
  priority: "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved";
  reportedAt: string;
}

export interface AdSlot {
  id: string;
  name: string;
  active: boolean;
  ctr: string;
}

export interface ActivityEvent {
  id: string;
  message: string;
  tone: "brand" | "success" | "warning" | "danger";
  at: string;
}

export interface AdminState {
  listingStatus: Record<string, ListingStatus>;
  users: PlatformUser[];
  reports: ModerationReport[];
  adSlots: AdSlot[];
  activity: ActivityEvent[];
}

export type UserDashboardTab =
  | "overview"
  | "listings"
  | "pickups"
  | "messages"
  | "favorites"
  | "applications"
  | "billing"
  | "profile"
  | "settings";

export type AdminTab = "overview" | "listings" | "users" | "reports" | "ads";
