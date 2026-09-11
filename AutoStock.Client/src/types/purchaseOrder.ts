export type PurchaseOrderStatus =
  1 | 2 | 3 | 4;


export interface PurchaseOrderItem {
  id: number;

  carId: number;

  carName: string;

  quantity: number;

  unitCost: number;

  lineTotal: number;
}


export interface PurchaseOrder {
  id: number;

  supplierId: number;

  supplierName: string;

  orderDate: string;

  status: PurchaseOrderStatus;

  totalAmount: number;

  notes: string | null;

  receivedAt: string | null;

  items: PurchaseOrderItem[];
}


export interface CreatePurchaseOrderItem {
  carId: number;

  quantity: number;

  unitCost: number;
}


export interface CreatePurchaseOrderRequest {
  supplierId: number;

  notes?: string | null;

  items: CreatePurchaseOrderItem[];
}


export interface SupplierPurchaseHistory {
    supplierId: number;
  
    supplierName: string;
  
    totalOrders: number;
  
    draftOrders: number;
  
    submittedOrders: number;
  
    receivedOrders: number;
  
    cancelledOrders: number;
  
    totalReceivedUnits: number;
  
    totalReceivedValue: number;
  
    orders: PurchaseOrder[];
  }