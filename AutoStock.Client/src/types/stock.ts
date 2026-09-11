export interface StockOperationRequest {
    quantity: number;
    unitCost?: number | null;
    notes?: string | null;
  }
  
  export interface StockTransaction {
    id: number;
    carId: number;
    carModel: string;
    transactionType: string;
    quantity: number;
    transactionDate: string;
  
    unitCost: number | null;
    inventoryValue: number | null;
  
    sourceType: string | null;
    sourceId: number | null;
  
    notes: string | null;
  }
  
  export interface StockHistoryFilters {
    carId?: number;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
  
    page?: number;
    pageSize?: number;
  }
  
  export interface StockHistoryResponse {
    items: StockTransaction[];
  
    page: number;
    pageSize: number;
  
    totalCount: number;
    totalPages: number;
  }
  