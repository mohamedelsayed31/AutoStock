export interface ProfitSummary {
    totalRevenue: number;
  
    revenueWithKnownCost: number;
  
    revenueWithUnknownCost: number;
  
    totalCogs: number;
  
    grossProfit: number;
  
    grossMarginPercent: number;
  
    costCoveragePercent: number;
  
    totalUnitsSold: number;
  
    unitsWithKnownCost: number;
  }
  
  
  export interface TopProfitableCar {
    carId: number;
  
    carName: string;
  
    unitsSold: number;
  
    revenue: number;
  
    cogs: number;
  
    grossProfit: number;
  
    grossMarginPercent: number;
  }
  
  
  export interface MonthlyProfit {
    year: number;
  
    month: number;
  
    monthLabel: string;
  
    revenue: number;
  
    revenueWithKnownCost: number;
  
    cogs: number;
  
    grossProfit: number;
  
    grossMarginPercent: number;
  
    costCoveragePercent: number;
  }
  
  
  export interface ProfitReport {
    summary: ProfitSummary;
  
    topCars: TopProfitableCar[];
  
    monthlyProfit: MonthlyProfit[];
  }