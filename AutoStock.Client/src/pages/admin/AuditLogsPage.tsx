import {
    useCallback,
    useEffect,
    useState,
  } from "react";
  
  import {
    Activity,
    ChevronLeft,
    ChevronRight,
    Filter,
    RotateCcw,
    Search,
    ShieldCheck,
  } from "lucide-react";
  
  import {
    getAuditLogs,
  } from "../../services/auditLogService";
  
  import {
    getApiErrorMessage,
  } from "../../utils/apiError";
  
  import LoadingSpinner
    from "../../components/common/LoadingSpinner";
  
  import EmptyState
    from "../../components/common/EmptyState";
  
  import ErrorState
    from "../../components/common/ErrorState";
  
  import type {
    AuditLog,
  } from "../../types/auditLog";
  
  
  function AuditLogsPage() {
    const [
      logs,
      setLogs,
    ] =
      useState<AuditLog[]>([]);
  
  
    const [
      search,
      setSearch,
    ] =
      useState("");
  
  
    const [
      action,
      setAction,
    ] =
      useState("");
  
  
    const [
      entityName,
      setEntityName,
    ] =
      useState("");
  
  
    const [
      appliedSearch,
      setAppliedSearch,
    ] =
      useState("");
  
  
    const [
      appliedAction,
      setAppliedAction,
    ] =
      useState("");
  
  
    const [
      appliedEntityName,
      setAppliedEntityName,
    ] =
      useState("");
  
  
    const [
      page,
      setPage,
    ] =
      useState(1);
  
  
    const pageSize = 20;
  
  
    const [
      totalCount,
      setTotalCount,
    ] =
      useState(0);
  
  
    const [
      totalPages,
      setTotalPages,
    ] =
      useState(0);
  
  
    const [
      hasPreviousPage,
      setHasPreviousPage,
    ] =
      useState(false);
  
  
    const [
      hasNextPage,
      setHasNextPage,
    ] =
      useState(false);
  
  
    const [
      loading,
      setLoading,
    ] =
      useState(true);
  
  
    const [
      loadError,
      setLoadError,
    ] =
      useState("");
  
  
    /* =========================
       Load Logs
    ========================= */
  
    const loadLogs =
      useCallback(
        async () => {
  
          setLoading(true);
  
          setLoadError("");
  
  
          try {
            const result =
              await getAuditLogs({
                search:
                  appliedSearch ||
                  undefined,
  
                action:
                  appliedAction ||
                  undefined,
  
                entityName:
                  appliedEntityName ||
                  undefined,
  
                page,
  
                pageSize,
              });
  
  
            setLogs(
              result.items
            );
  
  
            setTotalCount(
              result.totalCount
            );
  
  
            setTotalPages(
              result.totalPages
            );
  
  
            setHasPreviousPage(
              result.hasPreviousPage
            );
  
  
            setHasNextPage(
              result.hasNextPage
            );
          }
          catch (error) {
  
            setLoadError(
              getApiErrorMessage(
                error,
                "Failed to load activity log."
              )
            );
          }
          finally {
  
            setLoading(false);
          }
        },
        [
          appliedSearch,
          appliedAction,
          appliedEntityName,
          page,
        ]
      );
  
  
    useEffect(() => {
  
      void loadLogs();
  
    }, [loadLogs]);
  
  
    /* =========================
       Apply Filters
    ========================= */
  
    const handleApplyFilters =
      () => {
  
        setPage(1);
  
        setAppliedSearch(
          search.trim()
        );
  
        setAppliedAction(
          action
        );
  
        setAppliedEntityName(
          entityName
        );
      };
  
  
    /* =========================
       Clear Filters
    ========================= */
  
    const handleClearFilters =
      () => {
  
        setSearch("");
  
        setAction("");
  
        setEntityName("");
  
        setAppliedSearch("");
  
        setAppliedAction("");
  
        setAppliedEntityName("");
  
        setPage(1);
      };
  
  
    /* =========================
       Date Helper
    ========================= */
  
    const formatDate = (
      value: string
    ) => {
  
      const date =
        new Date(value);
  
  
      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }
  
  
      return date.toLocaleString(
        "en-EG",
        {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };
  
  
    /* =========================
       Action Badge
    ========================= */
  
    const getActionClass = (
      value: string
    ) => {
  
      const normalized =
        value.toLowerCase();
  
  
      if (
        normalized === "delete"
      ) {
        return "audit-action audit-action-delete";
      }
  
  
      if (
        normalized === "update"
      ) {
        return "audit-action audit-action-update";
      }
  
  
      return "audit-action audit-action-create";
    };
  
  
    return (
      <div className="cars-page">
  
        {/* =========================
            Header
        ========================= */}
  
        <div className="cars-header">
  
          <div>
  
            <h1>
              Activity Log
            </h1>
  
  
            <p>
              Review administrative
              activity across AutoStock.
            </p>
  
          </div>
  
  
          <ShieldCheck
            size={34}
          />
  
        </div>
  
  
        {/* =========================
            Filters
        ========================= */}
  
        <div className="audit-filter-panel">
  
          <div className="audit-search-field">
  
            <Search
              size={17}
            />
  
            <input
              type="search"
              value={
                search
              }
              placeholder="Search email, action, entity or details..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
  
          </div>
  
  
          <select
            value={
              action
            }
            onChange={(event) =>
              setAction(
                event.target.value
              )
            }
          >
            <option value="">
              All Actions
            </option>
  
            <option value="Create">
              Create
            </option>
  
            <option value="Update">
              Update
            </option>
  
            <option value="Delete">
              Delete
            </option>
          </select>
  
  
          <select
            value={
              entityName
            }
            onChange={(event) =>
              setEntityName(
                event.target.value
              )
            }
          >
            <option value="">
              All Entities
            </option>
  
            <option value="Customer">
              Customer
            </option>
  
            <option value="Sale">
              Sale
            </option>
  
            <option value="Car">
              Car
            </option>
  
            <option value="Brand">
              Brand
            </option>
  
            <option value="Category">
              Category
            </option>
  
            <option value="Supplier">
              Supplier
            </option>
  
            <option value="Stock">
              Stock
            </option>
          </select>
  
  
          <button
            type="button"
            onClick={
              handleApplyFilters
            }
          >
            <Filter
              size={16}
            />
  
            Apply
          </button>
  
  
          <button
            type="button"
            className="secondary-button"
            onClick={
              handleClearFilters
            }
          >
            <RotateCcw
              size={16}
            />
  
            Clear
          </button>
  
        </div>
  
  
        {/* =========================
            Summary
        ========================= */}
  
        <div className="audit-summary">
  
          <Activity
            size={18}
          />
  
          <span>
            {totalCount.toLocaleString()}
            {" "}
            recorded activities
          </span>
  
        </div>
  
  
        {/* =========================
            Loading
        ========================= */}
  
        {loading && (
  
          <LoadingSpinner
            message="Loading activity log..."
          />
  
        )}
  
  
        {/* =========================
            Error
        ========================= */}
  
        {!loading &&
          loadError && (
  
            <ErrorState
              title="Unable to load activity log"
              message={
                loadError
              }
              onRetry={
                loadLogs
              }
            />
  
          )}
  
  
        {/* =========================
            Empty
        ========================= */}
  
        {!loading &&
          !loadError &&
          logs.length === 0 && (
  
            <EmptyState
              icon={Activity}
              title="No Activity Found"
              message="No audit log entries match the current filters."
            />
  
          )}
  
  
        {/* =========================
            Table
        ========================= */}
  
        {!loading &&
          !loadError &&
          logs.length > 0 && (
  
            <>
  
              <div className="table-container">
  
                <table>
  
                  <thead>
  
                    <tr>
  
                      <th>
                        ID
                      </th>
  
                      <th>
                        User
                      </th>
  
                      <th>
                        Action
                      </th>
  
                      <th>
                        Entity
                      </th>
  
                      <th>
                        Entity ID
                      </th>
  
                      <th>
                        Details
                      </th>
  
                      <th>
                        Date
                      </th>
  
                    </tr>
  
                  </thead>
  
  
                  <tbody>
  
                    {logs.map(
                      log => (
  
                        <tr
                          key={
                            log.id
                          }
                        >
  
                          <td>
                            {log.id}
                          </td>
  
  
                          <td>
  
                            <strong>
                              {log.userEmail ??
                                "System"}
                            </strong>
  
                          </td>
  
  
                          <td>
  
                            <span
                              className={
                                getActionClass(
                                  log.action
                                )
                              }
                            >
                              {log.action}
                            </span>
  
                          </td>
  
  
                          <td>
                            {log.entityName}
                          </td>
  
  
                          <td>
                            {log.entityId ??
                              "-"}
                          </td>
  
  
                          <td className="audit-details-cell">
                            {log.details ??
                              "-"}
                          </td>
  
  
                          <td>
                            {formatDate(
                              log.createdAt
                            )}
                          </td>
  
                        </tr>
  
                      )
                    )}
  
                  </tbody>
  
                </table>
  
              </div>
  
  
              {/* =========================
                  Pagination
              ========================= */}
  
              <div className="audit-pagination">
  
                <span>
                  Page {page}
                  {" "}
                  of
                  {" "}
                  {Math.max(
                    totalPages,
                    1
                  )}
                </span>
  
  
                <div>
  
                  <button
                    type="button"
                    disabled={
                      !hasPreviousPage ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        current =>
                          current - 1
                      )
                    }
                  >
                    <ChevronLeft
                      size={16}
                    />
  
                    Previous
                  </button>
  
  
                  <button
                    type="button"
                    disabled={
                      !hasNextPage ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        current =>
                          current + 1
                      )
                    }
                  >
                    Next
  
                    <ChevronRight
                      size={16}
                    />
                  </button>
  
                </div>
  
              </div>
  
            </>
  
          )}
  
      </div>
    );
  }
  
  
  export default AuditLogsPage;