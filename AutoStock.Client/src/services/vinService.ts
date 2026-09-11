import axiosInstance from "../api/axiosInstance";

import type {
  VinDecodeResult,
} from "../types/vin";


export async function decodeVin(
  vin: string
): Promise<VinDecodeResult> {
  const response =
    await axiosInstance.get<VinDecodeResult>(
      `/Vin/${vin}`
    );

  return response.data;
}