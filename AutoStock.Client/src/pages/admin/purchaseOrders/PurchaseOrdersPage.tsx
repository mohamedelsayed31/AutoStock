import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Eye,
    PackagePlus,
    Search,
    ShoppingCart,
    Truck,
    WalletCards,
  } from "lucide-react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import type {
    PurchaseOrder,
    PurchaseOrderStatus,
  } from "../../../types/purchaseOrder";
  
  import {
    getPurchaseOrders,
  } from "../../../services/purchaseOrderService";
  
  import {
    getPurchaseOrderStatusClass,
    getPurchaseOrderStatusLabel,
  } from "../../../utils/purchaseOrderStatus";
  
  import {
    getApiErrorMessage,
  } from "../../../utils/apiError";
  
  import LoadingSpinner
    from "../../../components/common/LoadingSpinner";
  
  import ErrorState
    from "../../../components/common/ErrorState";
  
  
  function PurchaseOrdersPage() {
    const navigate =
      useNavigate();
  
  
    const [
      orders,
      setOrders,
    ] =
      useState<PurchaseOrder[]>([]);
  
  
    const [
      loading,
      setLoading,
    ] =
      useState(true);
  
  
    const [
      error,
      setError,
    ] =
      useState<string | null>(
        null
      );
  
  
    const [
      search,
      setSearch,
    ] =
      useState("");
  
  
    const [
      statusFilter,
      setStatusFilter,
    ] =
      useState<
        PurchaseOrderStatus | "all"
      >("all");
  
  
    /* =========================
       Load Orders
    ========================= */
  
    const loadOrders =
      useCallback(
        async () => {
  
          setLoading(true);
  
          setError(null);
  
  
          try {
            const result =
              await getPurchaseOrders();
  
  
            setOrders(
              result
            );
          }
          catch (error) {
  
            setError(
              getApiErrorMessage(
                error,
                "Failed to load purchase orders."
              )
            );
          }
          finally {
  
            setLoading(false);
          }
        },
        []
      );
  
  
    useEffect(() => {
  
      void loadOrders();
  
    }, [loadOrders]);
  
  
    /* =========================
       Filter
    ========================= */
  
    const filteredOrders =
      useMemo(
        () => {
  
          const normalizedSearch =
            search
              .trim()
              .toLowerCase();
  
  
          return orders.filter(
            order => {
  
              const matchesSearch =
                normalizedSearch.length === 0
                ||
                order.supplierName
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
                ||
                order.id
                  .toString()
                  .includes(
                    normalizedSearch
                  );
  
  
              const matchesStatus =
                statusFilter === "all"
                ||
                order.status ===
                  statusFilter;
  
  
              return (
                matchesSearch &&
                matchesStatus
              );
            }
          );
        },
        [
          orders,
          search,
          statusFilter,
        ]
      );
  
  
    /* =========================
       Summary
    ========================= */
  
    const totalPurchaseValue =
      useMemo(
        () =>
          orders.reduce(
            (
              total,
              order
            ) =>
              total +
              order.totalAmount,
            0
          ),
        [orders]
      );
  
  
    const submittedCount =
      useMemo(
        () =>
          orders.filter(
            order =>
              order.status === 2
          ).length,
        [orders]
      );
  
  
    const receivedCount =
      useMemo(
        () =>
          orders.filter(
            order =>
              order.status === 3
          ).length,
        [orders]
      );
  
  
    /* =========================
       Format
    ========================= */
  
    const formatMoney = (
      value: number
    ) =>
      new Intl.NumberFormat(
        "en-EG",
        {
          style: "currency",
          currency: "EGP",
          maximumFractionDigits: 2,
        }
      ).format(
        value
      );
  
  
    const formatDate = (
      value: string
    ) =>
      new Date(
        value
      ).toLocaleString(
        "en-EG",
        {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
  
  
    /* =========================
       Loading
    ========================= */
  
    if (loading) {
      return (
        <div className="purchase-orders-page">
  
          <LoadingSpinner
            message="Loading purchase orders..."
          />
  
        </div>
      );
    }
  
  
    /* =========================
       Error
    ========================= */
  
    if (error) {
      return (
        <div className="purchase-orders-page">
  
          <ErrorState
            title="Unable to load purchase orders"
            message={
              error
            }
            onRetry={
              loadOrders
            }
          />
  
        </div>
      );
    }
  
  
    return (
      <div className="purchase-orders-page">
  
        {/* Header */}
  
        <div className="purchase-orders-header">
  
          <div>
  
            <span className="purchase-orders-eyebrow">
              Procurement
            </span>
  
            <h1>
              Purchase Orders
            </h1>
  
            <p>
              Manage supplier orders and incoming
              vehicle inventory.
            </p>
  
          </div>
  
  
          <button
            type="button"
            className="purchase-primary-button"
            onClick={() =>
              navigate(
                "/admin/purchase-orders/new"
              )
            }
          >
            <PackagePlus
              size={18}
            />
  
            New Purchase Order
          </button>
  
        </div>
  
  
        {/* Summary */}
  
        <div className="purchase-summary-grid">
  
          <div className="purchase-summary-card">
  
            <div className="purchase-summary-icon">
              <ShoppingCart
                size={20}
              />
            </div>
  
            <div>
  
              <span>
                Total Orders
              </span>
  
              <strong>
                {orders.length}
              </strong>
  
            </div>
  
          </div>
  
  
          <div className="purchase-summary-card">
  
            <div className="purchase-summary-icon">
              <Truck
                size={20}
              />
            </div>
  
            <div>
  
              <span>
                Awaiting Receipt
              </span>
  
              <strong>
                {submittedCount}
              </strong>
  
            </div>
  
          </div>
  
  
          <div className="purchase-summary-card">
  
            <div className="purchase-summary-icon">
              <PackagePlus
                size={20}
              />
            </div>
  
            <div>
  
              <span>
                Received Orders
              </span>
  
              <strong>
                {receivedCount}
              </strong>
  
            </div>
  
          </div>
  
  
          <div className="purchase-summary-card">
  
            <div className="purchase-summary-icon">
              <WalletCards
                size={20}
              />
            </div>
  
            <div>
  
              <span>
                Purchase Value
              </span>
  
              <strong>
                {formatMoney(
                  totalPurchaseValue
                )}
              </strong>
  
            </div>
  
          </div>
  
        </div>
  
  
        {/* Filters */}
  
        <div className="purchase-orders-toolbar">
  
          <div className="purchase-search">
  
            <Search
              size={17}
            />
  
            <input
              type="text"
              value={
                search
              }
              placeholder="Search by order ID or supplier..."
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
            />
  
          </div>
  
  
          <select
            value={
              statusFilter
            }
            onChange={
              event => {
  
                const value =
                  event.target.value;
  
  
                setStatusFilter(
                  value === "all"
                    ? "all"
                    : Number(
                        value
                      ) as PurchaseOrderStatus
                );
              }
            }
          >
            <option value="all">
              All Statuses
            </option>
  
            <option value="1">
              Draft
            </option>
  
            <option value="2">
              Submitted
            </option>
  
            <option value="3">
              Received
            </option>
  
            <option value="4">
              Cancelled
            </option>
          </select>
  
        </div>
  
  
        {/* Table */}
  
        <div className="purchase-orders-table-card">
  
          {filteredOrders.length === 0 ? (
  
            <div className="purchase-orders-empty">
  
              <ShoppingCart
                size={34}
              />
  
              <strong>
                No purchase orders found
              </strong>
  
              <span>
                Create a purchase order or change
                your filters.
              </span>
  
            </div>
  
          ) : (
  
            <div className="purchase-orders-table-wrapper">
  
              <table className="purchase-orders-table">
  
                <thead>
  
                  <tr>
                    <th>
                      Order
                    </th>
  
                    <th>
                      Supplier
                    </th>
  
                    <th>
                      Date
                    </th>
  
                    <th>
                      Items
                    </th>
  
                    <th>
                      Total
                    </th>
  
                    <th>
                      Status
                    </th>
  
                    <th />
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {filteredOrders.map(
                    order => (
  
                      <tr
                        key={
                          order.id
                        }
                      >
  
                        <td>
  
                          <strong>
                            PO-#
                            {order.id}
                          </strong>
  
                        </td>
  
  
                        <td>
                          {order.supplierName}
                        </td>
  
  
                        <td>
                          {formatDate(
                            order.orderDate
                          )}
                        </td>
  
  
                        <td>
                          {order.items.length}
                        </td>
  
  
                        <td className="purchase-table-total">
                          {formatMoney(
                            order.totalAmount
                          )}
                        </td>
  
  
                        <td>
  
                          <span
                            className={
                              `purchase-status-badge ${getPurchaseOrderStatusClass(
                                order.status
                              )}`
                            }
                          >
                            {getPurchaseOrderStatusLabel(
                              order.status
                            )}
                          </span>
  
                        </td>
  
  
                        <td>
  
                          <button
                            type="button"
                            className="purchase-view-button"
                            aria-label="View purchase order"
                            onClick={() =>
                              navigate(
                                `/admin/purchase-orders/${order.id}`
                              )
                            }
                          >
                            <Eye
                              size={17}
                            />
                          </button>
  
                        </td>
  
                      </tr>
  
                    )
                  )}
  
                </tbody>
  
              </table>
  
            </div>
  
          )}
  
        </div>
  
      </div>
    );
  }
  
  
  export default PurchaseOrdersPage;