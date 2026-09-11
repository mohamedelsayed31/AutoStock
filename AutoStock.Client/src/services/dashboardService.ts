import axiosInstance from "../api/axiosInstance";

import type {
  DashboardData,
} from "../types/dashboard";


export async function getDashboard():
  Promise<DashboardData> {

  const response =
    await axiosInstance.get<DashboardData>(
      "/Dashboard"
    );

  return response.data;
}