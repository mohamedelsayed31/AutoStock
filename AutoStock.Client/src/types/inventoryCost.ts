export interface SetInventoryCostBasisRequest {
    unitCost: number;
    reason?: string | null;
  }
  
  export interface InventoryCostBasisResult {
    carId: number;
    carModel: string;
    quantity: number;
    previousAverageUnitCost: number | null;
    averageUnitCost: number;
    inventoryValue: number;
    effectiveAt: string;
    reason: string | null;
  }
  