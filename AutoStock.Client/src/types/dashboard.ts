export interface DashboardRecentTransaction {
    id: number;
    carId: number;
    carModel: string;
    transactionType: string;
    quantity: number;
    transactionDate: string;
    notes: string | null;
  }
  
  
  export interface DashboardStockAlert {
    carId: number;
    model: string;
    brandName: string;
    quantity: number;
    reorderLevel: number;
    stockStatus: string;
  }
  
  
  export interface DashboardData {
    totalCars: number;
    totalStock: number;
    lowStockCars: number;
    outOfStockCars: number;
  
    totalBrands: number;
    totalCategories: number;
    totalSuppliers: number;
  
    totalInventoryValue: number;
  
    recentTransactions:
      DashboardRecentTransaction[];
  
    stockAlerts:
      DashboardStockAlert[];
  }