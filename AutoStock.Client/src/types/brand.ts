export interface Brand {
    id: number;
    name: string;
    country: string | null;
  }
  
  export interface BrandRequest {
    name: string;
    country?: string | null;
  }