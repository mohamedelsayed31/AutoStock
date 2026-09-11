export interface PurchaseSummary {
    totalOrders: number;
  
    draftOrders: number;
  
    submittedOrders: number;
  
    receivedOrders: number;
  
    cancelledOrders: number;
  
    totalUnitsPurchased: number;
  
    totalPurchaseSpend: number;
  }
  
  
  export interface TopPurchaseSupplier {
    supplierId: number;
  
    supplierName: string;
  
    receivedOrders: number;
  
    unitsReceived: number;
  
    purchaseValue: number;
  }
  
  
  export interface TopPurchasedCar {
    carId: number;
  
    carName: string;
  
    unitsPurchased: number;
  
    purchaseValue: number;
  }
  
  
  export interface MonthlyPurchaseSpend {
    year: number;
  
    month: number;
  
    monthLabel: string;
  
    ordersReceived: number;
  
    unitsReceived: number;
  
    totalSpend: number;
  }
  
  
  export interface PurchaseReport {
    summary: PurchaseSummary;
  
    topSuppliers: TopPurchaseSupplier[];
  
    topCars: TopPurchasedCar[];
  
    monthlySpend: MonthlyPurchaseSpend[];
  }