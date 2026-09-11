import api
  from "../api/axiosInstance";

import type {
  CreateSaleRequest,
  Sale,
} from "../types/sale";


export const getSales =
  async (): Promise<Sale[]> => {

    const response =
      await api.get<Sale[]>(
        "/Sales"
      );

    return response.data;
  };


export const getSaleById =
  async (
    id: number
  ): Promise<Sale> => {

    const response =
      await api.get<Sale>(
        `/Sales/${id}`
      );

    return response.data;
  };


export const createSale =
  async (
    data: CreateSaleRequest
  ): Promise<Sale> => {

    const response =
      await api.post<Sale>(
        "/Sales",
        data
      );

    return response.data;
  };