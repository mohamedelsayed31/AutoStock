/* =========================================
   Sale Payment Method
========================================= */

export const SalePaymentMethod = {
    Cash: 1,
    Card: 2,
    BankTransfer: 3,
    Financing: 4,
  } as const;
  
  export type SalePaymentMethod =
    (typeof SalePaymentMethod)[keyof typeof SalePaymentMethod];
  
  
  /* =========================================
     Create Sale
  ========================================= */
  
  export interface CreateSaleItem {
    carId: number;
  
    quantity: number;
  
    unitPrice: number;
  }
  
  
  export interface CreateSaleRequest {
    customerId: number;
  
    paymentMethod: SalePaymentMethod;
  
    notes?: string | null;
  
    items: CreateSaleItem[];
  }
  
  
  /* =========================================
     Sale Item
  ========================================= */
  
  export interface SaleItem {
    id: number;
  
    carId: number;
  
    carName: string;
  
    quantity: number;
  
    unitPrice: number;
  
    lineTotal: number;
  
  
    /* =========================
       Cost Accounting
    ========================= */
  
    unitCost: number | null;
  
    costOfGoodsSold: number | null;
  
    grossProfit: number | null;
  
    grossMarginPercent: number | null;
  }
  
  
  /* =========================================
     Sale
  ========================================= */
  
  export interface Sale {
    id: number;
  
    customerId: number;
  
    customerName: string;
  
    saleDate: string;
  
    paymentMethod: SalePaymentMethod;
  
    totalAmount: number;
  
    notes?: string | null;
  
  
    /* =========================
       Financial Summary
    ========================= */
  
    revenueWithKnownCost: number;
  
    revenueWithUnknownCost: number;
  
    totalCogs: number;
  
    grossProfit: number;
  
    grossMarginPercent: number;
  
    costCoveragePercent: number;
  
  
    items: SaleItem[];
  }