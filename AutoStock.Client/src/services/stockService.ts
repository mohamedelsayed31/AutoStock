import axiosInstance from "../api/axiosInstance";

import type {
  StockTransaction,
  StockHistoryFilters,
  StockHistoryResponse,
  StockOperationRequest,
} from "../types/stock";


export async function stockIn(
  carId: number,
  request: StockOperationRequest
): Promise<StockTransaction> {

  const response =
    await axiosInstance.post<StockTransaction>(
      `/Stock/${carId}/in`,
      request
    );


  return response.data;
}


export async function stockOut(
  carId: number,
  request: StockOperationRequest
): Promise<StockTransaction> {

  const response =
    await axiosInstance.post<StockTransaction>(
      `/Stock/${carId}/out`,
      request
    );


  return response.data;
}


export async function getStockHistory(
  filters?: StockHistoryFilters
): Promise<StockHistoryResponse> {

  const response =
    await axiosInstance.get<
      StockHistoryResponse
    >(
      "/Stock/history",
      {
        params: {
          carId:
            filters?.carId,

          transactionType:
            filters?.transactionType,

          startDate:
            filters?.startDate,

          endDate:
            filters?.endDate,

          page:
            filters?.page,

          pageSize:
            filters?.pageSize,
        },
      }
    );


  return response.data;
}
