import axiosInstance
  from "../api/axiosInstance";

import type {
  AuditLogQuery,
  AuditLogsResponse,
} from "../types/auditLog";


export async function getAuditLogs(
  query: AuditLogQuery
): Promise<AuditLogsResponse> {

  const response =
    await axiosInstance
      .get<AuditLogsResponse>(
        "/AuditLogs",
        {
          params: query,
        }
      );


  return response.data;
}