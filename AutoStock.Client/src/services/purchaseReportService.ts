import axiosInstance
  from "../api/axiosInstance";

import type {
  PurchaseReport,
} from "../types/purchaseReport";


export async function getPurchaseReport():
  Promise<PurchaseReport> {

  const response =
    await axiosInstance
      .get<PurchaseReport>(
        "/PurchaseReports"
      );


  return response.data;
}