export interface InventoryReportItem {
    carId: number;
    model: string;
    brandName: string;
    categoryName: string;
    supplierName: string;
    year: number;
    price: number;
    quantity: number;
    reorderLevel: number;
    stockStatus: string;
    inventoryValue: number;
  }
  
  
  export interface LowStockReportItem {
    carId: number;
    model: string;
    brandName: string;
    quantity: number;
    reorderLevel: number;
    neededQuantity: number;
    stockStatus: string;
  }
  
  
  export interface StockMovementSummary {
    totalTransactions: number;
    totalStockIn: number;
    totalStockOut: number;
    netMovement: number;
    startDate: string | null;
    endDate: string | null;
  }