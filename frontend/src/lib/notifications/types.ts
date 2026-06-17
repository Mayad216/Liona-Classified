export type AppNotificationKind = "review_prompt" | "system";

export interface AppNotification {
  id: string;
  userId: string;
  kind: AppNotificationKind;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  unread: boolean;
  /** Area guide id — used for review prompts. */
  areaId?: string;
}
