import type {
    PurchaseOrderStatus,
  } from "../types/purchaseOrder";
  
  
  export function getPurchaseOrderStatusLabel(
    status: PurchaseOrderStatus
  ): string {
  
    switch (status) {
      case 1:
        return "Draft";
  
      case 2:
        return "Submitted";
  
      case 3:
        return "Received";
  
      case 4:
        return "Cancelled";
  
      default:
        return "Unknown";
    }
  }
  
  
  export function getPurchaseOrderStatusClass(
    status: PurchaseOrderStatus
  ): string {
  
    switch (status) {
      case 1:
        return "purchase-status-draft";
  
      case 2:
        return "purchase-status-submitted";
  
      case 3:
        return "purchase-status-received";
  
      case 4:
        return "purchase-status-cancelled";
  
      default:
        return "";
    }
  }