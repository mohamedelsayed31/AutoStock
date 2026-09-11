import axiosInstance from "../api/axiosInstance";
import type { LookupItem } from "../types/referenceData";

export async function getBrands(): Promise<LookupItem[]> {
  const response =
    await axiosInstance.get<LookupItem[]>(
      "/ReferenceData/brands"
    );

  return response.data;
}

export async function getCategories(): Promise<LookupItem[]> {
  const response =
    await axiosInstance.get<LookupItem[]>(
      "/ReferenceData/categories"
    );

  return response.data;
}

export async function getSuppliers(): Promise<LookupItem[]> {
  const response =
    await axiosInstance.get<LookupItem[]>(
      "/ReferenceData/suppliers"
    );

  return response.data;
}