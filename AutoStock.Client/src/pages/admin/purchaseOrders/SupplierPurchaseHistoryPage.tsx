import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    ArrowLeft,
    Ban,
    Boxes,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    PackageCheck,
    ShoppingCart,
    Truck,
    WalletCards,
  } from "lucide-react";
  
  import {
    useNavigate,
    useParams,
  } from "react-router-dom";
  
  import {
    getSupplierPurchaseHistory,
  } from "../../../services/purchaseOrderService";
  
  import {
    getPurchaseOrderStatusClass,
    getPurchaseOrderStatusLabel,
  } from "../../../utils/purchaseOrderStatus";
  
  import {
    getApiErrorMessage,
  } from "../../../utils/apiError";
  
  import type {
    SupplierPurchaseHistory,
  } from "../../../types/purchaseOrder";
  
  import LoadingSpinner
    from "../../../components/common/LoadingSpinner";
  
  import ErrorState
    from "../../../components/common/ErrorState";
  
  
  function SupplierPurchaseHistoryPage() {
    const navigate =
      useNavigate();
  
  
    const {
      supplierId,
    } =
      useParams();
  
  
    const parsedSupplierId =
      Number(
        supplierId
      );
  
  
    const [
      history,
      setHistory,
    ] =
      useState<
        SupplierPurchaseHistory | null
      >(null);
  
  
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
  
  
    /* =========================
       Load
    ========================= */
  
    const loadHistory =
      useCallback(
        async () => {
  
          if (
            !parsedSupplierId
            ||
            Number.isNaN(
              parsedSupplierId
            )
          ) {
            setError(
              "Invalid supplier ID."
            );
  
            setLoading(false);
  
            return;
          }
  
  
          setLoading(true);
  
          setError(null);
  
  
          try {
            const result =
              await getSupplierPurchaseHistory(
                parsedSupplierId
              );
  
  
            setHistory(
              result
            );
          }
          catch (error) {
  
            setError(
              getApiErrorMessage(
                error,
                "Failed to load supplier purchase history."
              )
            );
          }
          finally {
  
            setLoading(false);
          }
        },
        [
          parsedSupplierId,
        ]
      );
  
  
    useEffect(() => {
  
      void loadHistory();
  
    }, [loadHistory]);
  
  
    /* =========================
       Awaiting Orders
    ========================= */
  
    const awaitingOrders =
      useMemo(
        () =>
          history
            ? history.draftOrders +
              history.submittedOrders
            : 0,
        [history]
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
          style:
            "currency",
  
          currency:
            "EGP",
  
          maximumFractionDigits:
            2,
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
          year:
            "numeric",
  
          month:
            "short",
  
          day:
            "2-digit",
  
          hour:
            "2-digit",
  
          minute:
            "2-digit",
        }
      );
  
  
    if (loading) {
      return (
        <div className="supplier-purchase-history-page">
  
          <LoadingSpinner
            message="Loading supplier purchase history..."
          />
  
        </div>
      );
    }
  
  
    if (
      error
      ||
      !history
    ) {
      return (
        <div className="supplier-purchase-history-page">
  
          <ErrorState
            title="Unable to load purchase history"
            message={
              error ??
              "Supplier not found."
            }
            onRetry={
              loadHistory
            }
          />
  
        </div>
      );
    }
  
  
    return (
      <div className="supplier-purchase-history-page">
  
        {/* Header */}
  
        <div className="supplier-purchase-header">
  
          <div>
  
            <button
              type="button"
              className="purchase-back-button"
              onClick={() =>
                navigate(
                  "/suppliers"
                )
              }
            >
              <ArrowLeft
                size={16}
              />
  
              Suppliers
            </button>
  
  
            <span className="purchase-orders-eyebrow">
              Procurement
            </span>
  
  
            <h1>
              {history.supplierName}
            </h1>
  
  
            <p>
              Purchase history and procurement
              activity for this supplier.
            </p>
  
          </div>
  
  
          <Truck
            size={40}
          />
  
        </div>
  
  
        {/* Main Summary */}
  
        <div className="supplier-purchase-summary-grid">
  
          <div className="supplier-purchase-summary-card">
  
            <ShoppingCart
              size={21}
            />
  
            <span>
              Total Orders
            </span>
  
            <strong>
              {history.totalOrders}
            </strong>
  
          </div>
  
  
          <div className="supplier-purchase-summary-card">
  
            <Clock3
              size={21}
            />
  
            <span>
              Awaiting
            </span>
  
            <strong>
              {awaitingOrders}
            </strong>
  
          </div>
  
  
          <div className="supplier-purchase-summary-card">
  
            <PackageCheck
              size={21}
            />
  
            <span>
              Received
            </span>
  
            <strong>
              {history.receivedOrders}
            </strong>
  
          </div>
  
  
          <div className="supplier-purchase-summary-card">
  
            <Boxes
              size={21}
            />
  
            <span>
              Units Received
            </span>
  
            <strong>
              {history.totalReceivedUnits}
            </strong>
  
          </div>
  
  
          <div className="supplier-purchase-summary-card supplier-purchase-value-card">
  
            <WalletCards
              size={21}
            />
  
            <span>
              Actual Purchase Value
            </span>
  
            <strong>
              {formatMoney(
                history.totalReceivedValue
              )}
            </strong>
  
          </div>
  
        </div>
  
  
        {/* Status Breakdown */}
  
        <section className="supplier-purchase-status-card">
  
          <div className="purchase-details-section-header">
  
            <div>
  
              <h2>
                Order Status
              </h2>
  
              <p>
                Purchase orders grouped by
                current lifecycle state.
              </p>
  
            </div>
  
  
            <FileText
              size={20}
            />
  
          </div>
  
  
          <div className="supplier-purchase-status-grid">
  
            <div>
  
              <FileText
                size={17}
              />
  
              <span>
                Draft
              </span>
  
              <strong>
                {history.draftOrders}
              </strong>
  
            </div>
  
  
            <div>
  
              <Clock3
                size={17}
              />
  
              <span>
                Submitted
              </span>
  
              <strong>
                {history.submittedOrders}
              </strong>
  
            </div>
  
  
            <div>
  
              <CheckCircle2
                size={17}
              />
  
              <span>
                Received
              </span>
  
              <strong>
                {history.receivedOrders}
              </strong>
  
            </div>
  
  
            <div>
  
              <Ban
                size={17}
              />
  
              <span>
                Cancelled
              </span>
  
              <strong>
                {history.cancelledOrders}
              </strong>
  
            </div>
  
          </div>
  
        </section>
  
  
        {/* Orders */}
  
        <section className="supplier-purchase-orders-card">
  
          <div className="purchase-details-section-header">
  
            <div>
  
              <h2>
                Purchase Orders
              </h2>
  
              <p>
                Complete order history for
                {` ${history.supplierName}`}.
              </p>
  
            </div>
  
          </div>
  
  
          {history.orders.length === 0 ? (
  
            <div className="purchase-orders-empty">
  
              <ShoppingCart
                size={34}
              />
  
              <strong>
                No purchase orders yet
              </strong>
  
              <span>
                There is no procurement history
                for this supplier.
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
                      Date
                    </th>
  
                    <th>
                      Items
                    </th>
  
                    <th>
                      Units
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
  
                  {history.orders.map(
                    order => {
  
                      const units =
                        order.items.reduce(
                          (
                            total,
                            item
                          ) =>
                            total +
                            item.quantity,
                          0
                        );
  
  
                      return (
                        <tr
                          key={
                            order.id
                          }
                        >
  
                          <td>
  
                            <strong>
                              PO-#{order.id}
                            </strong>
  
                          </td>
  
  
                          <td>
                            {formatDate(
                              order.orderDate
                            )}
                          </td>
  
  
                          <td>
                            {order.items.length}
                          </td>
  
  
                          <td>
                            {units}
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
                              title="View purchase order"
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
                      );
                    }
                  )}
  
                </tbody>
  
              </table>
  
            </div>
  
          )}
  
        </section>
  
  
        {/* Create Purchase Order */}
  
        <div className="supplier-purchase-footer">
  
          <button
            type="button"
            className="purchase-primary-button"
            onClick={() =>
              navigate(
                "/admin/purchase-orders/new"
              )
            }
          >
            <ShoppingCart
              size={17}
            />
  
            New Purchase Order
          </button>
  
        </div>
  
      </div>
    );
  }
  
  
  export default SupplierPurchaseHistoryPage;