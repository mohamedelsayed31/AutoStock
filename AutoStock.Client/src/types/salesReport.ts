import type {
    SalePaymentMethod,
  } from "./sale";
  
  
  export interface SalesSummary {
    totalSales: number;
  
    totalRevenue: number;
  
    totalCarsSold: number;
  
    averageSaleValue: number;
  }
  
  
  export interface TopSellingCar {
    carId: number;
  
    carName: string;
  
    quantitySold: number;
  
    revenue: number;
  }
  
  
  export interface PaymentMethodSales {
    paymentMethod: SalePaymentMethod;
  
    salesCount: number;
  
    revenue: number;
  }
  
  
  export interface SalesReport {
    summary: SalesSummary;
  
    topSellingCars: TopSellingCar[];
  
    salesByPaymentMethod: PaymentMethodSales[];
  }