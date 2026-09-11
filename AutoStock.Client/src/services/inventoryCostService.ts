import axiosInstance from "../api/axiosInstance";

import type {
  InventoryCostBasisResult,
  SetInventoryCostBasisRequest,
} from "../types/inventoryCost";


export async function setInventoryCostBasis(
  carId: number,
  request: SetInventoryCostBasisRequest
): Promise<InventoryCostBasisResult> {

  const response =
    await axiosInstance.put<
      InventoryCostBasisResult
    >(
      `/InventoryCost/${carId}/basis`,
      request
    );


  return response.data;
}
