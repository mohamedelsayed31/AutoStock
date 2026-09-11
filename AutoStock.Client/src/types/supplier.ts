export interface Supplier {
    id: number;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    address: string | null;
  }
  
  export interface SupplierRequest {
    name: string;
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
  }