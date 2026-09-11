import type {
    SalePaymentMethod,
  } from "../types/sale";
  
  
  export const getPaymentMethodName = (
    method: SalePaymentMethod
  ): string => {
  
    switch (method) {
  
      case 1:
        return "Cash";
  
      case 2:
        return "Card";
  
      case 3:
        return "Bank Transfer";
  
      case 4:
        return "Financing";
  
      default:
        return "Unknown";
    }
  };