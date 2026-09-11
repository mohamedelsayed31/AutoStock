export interface Car {
    id: number;
    model: string;
    year: number;
    price: number;
    quantity: number;
    averageUnitCost: number | null;
    reorderLevel: number;
    color: string;
    fuelType: string;
    transmission: string;
    imagePath: string | null;
    createdAt: string;
    isActive: boolean;
  
    brandId: number;
    brandName: string;
  
    categoryId: number;
    categoryName: string;
  
    supplierId: number;
    supplierName: string;
  
    stockStatus: string;
  }
  
  export interface CarsResponse {
    items: Car[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }

  export interface CreateCarRequest {
    model: string;
    year: number;
    price: number;
    quantity: number;
    reorderLevel: number;
    color: string;
    fuelType: string;
    transmission: string;
    imagePath: string | null;
    brandId: number;
    categoryId: number;
    supplierId: number;
  }

  export interface UpdateCarRequest {
    model: string;
    year: number;
    price: number;
    reorderLevel: number;
    color: string;
    fuelType: string;
    transmission: string;
    brandId: number;
    categoryId: number;
    supplierId: number;
  }