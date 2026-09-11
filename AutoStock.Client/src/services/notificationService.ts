import axiosInstance
  from "../api/axiosInstance";

import type {
  Notification,
  UnreadNotificationCount,
} from "../types/notification";


export async function getNotifications(
  take = 20
): Promise<Notification[]> {

  const response =
    await axiosInstance.get<Notification[]>(
      "/Notifications",
      {
        params: {
          take,
        },
      }
    );


  return response.data;
}


export async function getUnreadNotificationCount():
  Promise<number> {

  const response =
    await axiosInstance
      .get<UnreadNotificationCount>(
        "/Notifications/unread-count"
      );


  return response.data.count;
}


export async function markNotificationAsRead(
  id: number
): Promise<void> {

  await axiosInstance.patch(
    `/Notifications/${id}/read`
  );
}


export async function markAllNotificationsAsRead():
  Promise<number> {

  const response =
    await axiosInstance.patch<{
      updatedCount: number;
    }>(
      "/Notifications/read-all"
    );


  return response.data.updatedCount;
}