import axiosInstance from "../api/axiosInstance";

import type {
  Brand,
  BrandRequest,
} from "../types/brand";


export async function getBrands(): Promise<Brand[]> {
  const response =
    await axiosInstance.get<Brand[]>(
      "/Brands"
    );

  return response.data;
}


export async function createBrand(
  data: BrandRequest
): Promise<Brand> {
  const response =
    await axiosInstance.post<Brand>(
      "/Brands",
      data
    );

  return response.data;
}


export async function updateBrand(
  id: number,
  data: BrandRequest
): Promise<void> {
  await axiosInstance.put(
    `/Brands/${id}`,
    data
  );
}


export async function deleteBrand(
  id: number
): Promise<void> {
  await axiosInstance.delete(
    `/Brands/${id}`
  );
}