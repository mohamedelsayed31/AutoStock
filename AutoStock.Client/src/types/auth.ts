export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    userId: string;
    fullName: string;
    email: string;
    role: string;
    token: string;
  }
  
  export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
  }