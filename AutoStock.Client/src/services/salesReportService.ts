import axiosInstance
  from "../api/axiosInstance";

import type {
  SalesReport,
} from "../types/salesReport";


export async function getSalesReport():
  Promise<SalesReport> {

  const response =
    await axiosInstance.get<SalesReport>(
      "/SalesReports"
    );


  return response.data;
}