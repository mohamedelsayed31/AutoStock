import axiosInstance
  from "../api/axiosInstance";

import type {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  SupplierPurchaseHistory,
} from "../types/purchaseOrder";


export async function getPurchaseOrders():
  Promise<PurchaseOrder[]> {

  const response =
    await axiosInstance
      .get<PurchaseOrder[]>(
        "/PurchaseOrders"
      );


  return response.data;
}


export async function getPurchaseOrderById(
  id: number
): Promise<PurchaseOrder> {

  const response =
    await axiosInstance
      .get<PurchaseOrder>(
        `/PurchaseOrders/${id}`
      );


  return response.data;
}


export async function createPurchaseOrder(
  request: CreatePurchaseOrderRequest
): Promise<PurchaseOrder> {

  const response =
    await axiosInstance
      .post<PurchaseOrder>(
        "/PurchaseOrders",
        request
      );


  return response.data;
}


export async function submitPurchaseOrder(
  id: number
): Promise<void> {

  await axiosInstance.patch(
    `/PurchaseOrders/${id}/submit`
  );
}


export async function cancelPurchaseOrder(
  id: number
): Promise<void> {

  await axiosInstance.patch(
    `/PurchaseOrders/${id}/cancel`
  );
}


export async function receivePurchaseOrder(
  id: number
): Promise<void> {

  await axiosInstance.patch(
    `/PurchaseOrders/${id}/receive`
  );
}


export async function getSupplierPurchaseHistory(
    supplierId: number
  ): Promise<SupplierPurchaseHistory> {
  
    const response =
      await axiosInstance
        .get<SupplierPurchaseHistory>(
          `/PurchaseOrders/supplier/${supplierId}`
        );
  
  
    return response.data;
  }