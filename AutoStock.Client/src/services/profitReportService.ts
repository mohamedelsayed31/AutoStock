import axiosInstance
  from "../api/axiosInstance";

import type {
  ProfitReport,
} from "../types/profitReport";


export async function getProfitReport():
  Promise<ProfitReport> {

  const response =
    await axiosInstance
      .get<ProfitReport>(
        "/ProfitReports"
      );


  return response.data;
}