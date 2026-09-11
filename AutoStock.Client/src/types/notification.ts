export type NotificationType =
  1 | 2 | 3 | 4;


export interface Notification {
  id: number;

  type: NotificationType;

  title: string;

  message: string;

  entityName: string | null;

  entityId: string | null;

  isRead: boolean;

  readAt: string | null;

  createdAt: string;
}


export interface UnreadNotificationCount {
  count: number;
}