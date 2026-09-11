export interface AuditLog {
    id: number;
  
    userId: string | null;
  
    userEmail: string | null;
  
    action: string;
  
    entityName: string;
  
    entityId: string | null;
  
    details: string | null;
  
    createdAt: string;
  }
  
  
  export interface AuditLogsResponse {
    items: AuditLog[];
  
    page: number;
  
    pageSize: number;
  
    totalCount: number;
  
    totalPages: number;
  
    hasPreviousPage: boolean;
  
    hasNextPage: boolean;
  }
  
  
  export interface AuditLogQuery {
    search?: string;
  
    action?: string;
  
    entityName?: string;
  
    page?: number;
  
    pageSize?: number;
  }