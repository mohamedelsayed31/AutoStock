export interface Customer {
    id: number;
  
    fullName: string;
  
    phoneNumber: string;
  
    email: string | null;
  
    address: string | null;
  
    createdAt: string;
  }
  
  
  export interface CustomerRequest {
    fullName: string;
  
    phoneNumber: string;
  
    email: string | null;
  
    address: string | null;
  }