import axiosInstance from "../api/axiosInstance";

import type {
  Supplier,
  SupplierRequest,
} from "../types/supplier";


export async function getSuppliers(): Promise<Supplier[]> {
  const response =
    await axiosInstance.get<Supplier[]>(
      "/Suppliers"
    );

  return response.data;
}


export async function createSupplier(
  data: SupplierRequest
): Promise<Supplier> {
  const response =
    await axiosInstance.post<Supplier>(
      "/Suppliers",
      data
    );

  return response.data;
}


export async function updateSupplier(
  id: number,
  data: SupplierRequest
): Promise<void> {
  await axiosInstance.put(
    `/Suppliers/${id}`,
    data
  );
}


export async function deleteSupplier(
  id: number
): Promise<void> {
  await axiosInstance.delete(
    `/Suppliers/${id}`
  );
}