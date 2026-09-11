import axiosInstance
  from "../api/axiosInstance";

import type {
  InventoryReportItem,
  LowStockReportItem,
  StockMovementSummary,
} from "../types/report";


/*
 * Inventory Report
 */
export async function getInventoryReport():
  Promise<InventoryReportItem[]> {

  const response =
    await axiosInstance.get<
      InventoryReportItem[]
    >(
      "/Reports/inventory"
    );


  return response.data;
}


/*
 * Low Stock Report
 */
export async function getLowStockReport():
  Promise<LowStockReportItem[]> {

  const response =
    await axiosInstance.get<
      LowStockReportItem[]
    >(
      "/Reports/low-stock"
    );


  return response.data;
}


/*
 * Stock Movement Summary
 */
export async function getStockMovementReport(
  startDate?: string,
  endDate?: string
): Promise<StockMovementSummary> {

  const response =
    await axiosInstance.get<
      StockMovementSummary
    >(
      "/Reports/stock-movement",
      {
        params: {
          startDate:
            startDate ||
            undefined,

          endDate:
            endDate ||
            undefined,
        },
      }
    );


  return response.data;
}