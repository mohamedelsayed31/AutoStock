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
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    ClipboardCheck,
    PackageCheck,
    ReceiptText,
    Send,
    Truck,
  } from "lucide-react";
  
  import {
    useNavigate,
    useParams,
  } from "react-router-dom";
  
  import {
    cancelPurchaseOrder,
    getPurchaseOrderById,
    receivePurchaseOrder,
    submitPurchaseOrder,
  } from "../../../services/purchaseOrderService";
  
  import {
    getPurchaseOrderStatusClass,
    getPurchaseOrderStatusLabel,
  } from "../../../utils/purchaseOrderStatus";
  
  import {
    getApiErrorMessage,
  } from "../../../utils/apiError";
  
  import {
    useToast,
  } from "../../../hooks/useToast";
  
  import type {
    PurchaseOrder,
  } from "../../../types/purchaseOrder";
  
  import LoadingSpinner
    from "../../../components/common/LoadingSpinner";
  
  import ErrorState
    from "../../../components/common/ErrorState";
  
  import ConfirmModal
    from "../../../components/common/ConfirmModal";
  
  
  type PurchaseOrderAction =
    "submit"
    | "receive"
    | "cancel"
    | null;
  
  
  function PurchaseOrderDetailsPage() {
    const navigate =
      useNavigate();
  
  
    const {
      id,
    } =
      useParams();
  
  
    const purchaseOrderId =
      Number(id);
  
  
    const {
      showToast,
    } =
      useToast();
  
  
    /* =========================
       State
    ========================= */
  
    const [
      order,
      setOrder,
    ] =
      useState<PurchaseOrder | null>(
        null
      );
  
  
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
      action,
      setAction,
    ] =
      useState<PurchaseOrderAction>(
        null
      );
  
  
    const [
      actionLoading,
      setActionLoading,
    ] =
      useState(false);
  
  
    /* =========================
       Load Order
    ========================= */
  
    const loadOrder =
      useCallback(
        async () => {
  
          if (
            !purchaseOrderId
            ||
            Number.isNaN(
              purchaseOrderId
            )
          ) {
            setError(
              "Invalid purchase order ID."
            );
  
            setLoading(false);
  
            return;
          }
  
  
          setLoading(true);
  
          setError(null);
  
  
          try {
            const result =
              await getPurchaseOrderById(
                purchaseOrderId
              );
  
  
            setOrder(
              result
            );
          }
          catch (error) {
  
            setError(
              getApiErrorMessage(
                error,
                "Failed to load purchase order."
              )
            );
          }
          finally {
  
            setLoading(false);
          }
        },
        [
          purchaseOrderId,
        ]
      );
  
  
    useEffect(() => {
  
      void loadOrder();
  
    }, [loadOrder]);
  
  
    /* =========================
       Summary
    ========================= */
  
    const totalUnits =
      useMemo(
        () =>
          order?.items.reduce(
            (
              total,
              item
            ) =>
              total +
              item.quantity,
            0
          ) ?? 0,
        [order]
      );
  
  
    /* =========================
       Formatting
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
  
  
    /* =========================
       Request Action
    ========================= */
  
    const requestAction = (
      nextAction:
        Exclude<
          PurchaseOrderAction,
          null
        >
    ) => {
  
      setAction(
        nextAction
      );
    };
  
  
    /* =========================
       Confirm Action
    ========================= */
  
    const handleConfirmAction =
      async () => {
  
        if (
          !order
          ||
          !action
        ) {
          return;
        }
  
  
        setActionLoading(true);
  
  
        try {
  
          if (
            action === "submit"
          ) {
            await submitPurchaseOrder(
              order.id
            );
  
  
            showToast(
              `Purchase Order #${order.id} submitted successfully.`,
              "success"
            );
          }
  
  
          if (
            action === "receive"
          ) {
            await receivePurchaseOrder(
              order.id
            );
  
  
            showToast(
              `Purchase Order #${order.id} received. Inventory has been updated.`,
              "success"
            );
          }
  
  
          if (
            action === "cancel"
          ) {
            await cancelPurchaseOrder(
              order.id
            );
  
  
            showToast(
              `Purchase Order #${order.id} cancelled.`,
              "success"
            );
          }
  
  
          setAction(
            null
          );
  
  
          await loadOrder();
        }
        catch (error) {
  
          showToast(
            getApiErrorMessage(
              error,
              "Failed to update purchase order."
            ),
            "error"
          );
        }
        finally {
  
          setActionLoading(false);
        }
      };
  
  
    /* =========================
       Confirmation Content
    ========================= */
  
    const confirmationTitle =
      action === "submit"
        ? "Submit Purchase Order?"
        : action === "receive"
          ? "Receive Purchase Order?"
          : action === "cancel"
            ? "Cancel Purchase Order?"
            : "";
  
  
    const confirmationMessage =
      action === "submit"
        ? "This purchase order will move from Draft to Submitted. Inventory will not change yet."
        : action === "receive"
          ? `Receiving this purchase order will add ${totalUnits} unit(s) to inventory and create Stock In transactions.`
          : action === "cancel"
            ? "This purchase order will be cancelled and can no longer be received."
            : "";
  
  
    const confirmationButton =
      action === "submit"
        ? "Submit Order"
        : action === "receive"
          ? "Receive Stock"
          : action === "cancel"
            ? "Cancel Order"
            : "Confirm";
  
  
    /* =========================
       Loading
    ========================= */
  
    if (loading) {
      return (
        <div className="purchase-order-details-page">
  
          <LoadingSpinner
            message="Loading purchase order..."
          />
  
        </div>
      );
    }
  
  
    /* =========================
       Error
    ========================= */
  
    if (
      error
      ||
      !order
    ) {
      return (
        <div className="purchase-order-details-page">
  
          <ErrorState
            title="Unable to load purchase order"
            message={
              error ??
              "Purchase order not found."
            }
            onRetry={
              loadOrder
            }
          />
  
        </div>
      );
    }
  
  
    return (
      <div className="purchase-order-details-page">
  
        {/* Header */}
  
        <div className="purchase-details-header">
  
          <div>
  
            <button
              type="button"
              className="purchase-back-button"
              onClick={() =>
                navigate(
                  "/admin/purchase-orders"
                )
              }
            >
              <ArrowLeft
                size={16}
              />
  
              Purchase Orders
            </button>
  
  
            <span className="purchase-orders-eyebrow">
              Procurement
            </span>
  
  
            <div className="purchase-details-title-row">
  
              <h1>
                Purchase Order
                {" "}
                #{order.id}
              </h1>
  
  
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
  
            </div>
  
  
            <p>
              Review supplier order,
              inventory quantities,
              and receiving status.
            </p>
  
          </div>
  
  
          <ReceiptText
            size={38}
          />
  
        </div>
  
  
        {/* Actions */}
  
        {(order.status === 1 ||
          order.status === 2) && (
  
          <div className="purchase-details-actions">
  
            {order.status === 1 && (
  
              <button
                type="button"
                className="purchase-action-submit"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  requestAction(
                    "submit"
                  )
                }
              >
                <Send
                  size={17}
                />
  
                Submit Order
              </button>
  
            )}
  
  
            {order.status === 2 && (
  
              <button
                type="button"
                className="purchase-action-receive"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  requestAction(
                    "receive"
                  )
                }
              >
                <PackageCheck
                  size={17}
                />
  
                Receive Stock
              </button>
  
            )}
  
  
            <button
              type="button"
              className="purchase-action-cancel"
              disabled={
                actionLoading
              }
              onClick={() =>
                requestAction(
                  "cancel"
                )
              }
            >
              <Ban
                size={17}
              />
  
              Cancel Order
            </button>
  
          </div>
  
        )}
  
  
        {/* Completed Status */}
  
        {order.status === 3 && (
  
          <div className="purchase-status-message purchase-status-message-success">
  
            <CheckCircle2
              size={19}
            />
  
            <div>
  
              <strong>
                Order Received
              </strong>
  
              <span>
                This purchase order has already
                been received and the inventory
                was updated.
              </span>
  
            </div>
  
          </div>
  
        )}
  
  
        {order.status === 4 && (
  
          <div className="purchase-status-message purchase-status-message-cancelled">
  
            <Ban
              size={19}
            />
  
            <div>
  
              <strong>
                Order Cancelled
              </strong>
  
              <span>
                This purchase order was cancelled.
                No inventory was added.
              </span>
  
            </div>
  
          </div>
  
        )}
  
  
        {/* Summary Cards */}
  
        <div className="purchase-details-summary">
  
          <div>
  
            <Truck
              size={20}
            />
  
            <span>
              Supplier
            </span>
  
            <strong>
              {order.supplierName}
            </strong>
  
          </div>
  
  
          <div>
  
            <CalendarDays
              size={20}
            />
  
            <span>
              Order Date
            </span>
  
            <strong>
              {formatDate(
                order.orderDate
              )}
            </strong>
  
          </div>
  
  
          <div>
  
            <Boxes
              size={20}
            />
  
            <span>
              Total Units
            </span>
  
            <strong>
              {totalUnits}
            </strong>
  
          </div>
  
  
          <div>
  
            <CircleDollarSign
              size={20}
            />
  
            <span>
              Total Amount
            </span>
  
            <strong>
              {formatMoney(
                order.totalAmount
              )}
            </strong>
  
          </div>
  
        </div>
  
  
        {/* Timeline */}
  
        <section className="purchase-details-card">
  
          <div className="purchase-details-section-header">
  
            <div>
  
              <h2>
                Order Timeline
              </h2>
  
              <p>
                Current procurement lifecycle.
              </p>
  
            </div>
  
  
            <ClipboardCheck
              size={20}
            />
  
          </div>
  
  
          <div className="purchase-timeline">
  
            {/* Draft */}
  
            <div
              className="purchase-timeline-step purchase-timeline-step-complete"
            >
  
              <span>
                1
              </span>
  
              <div>
  
                <strong>
                  Created
                </strong>
  
                <small>
                  {formatDate(
                    order.orderDate
                  )}
                </small>
  
              </div>
  
            </div>
  
  
            {/* Submitted */}
  
            <div
              className={
                order.status === 2
                ||
                order.status === 3
                ||
                (
                  order.status === 4
                )
                  ? "purchase-timeline-step purchase-timeline-step-complete"
                  : "purchase-timeline-step"
              }
            >
  
              <span>
                2
              </span>
  
              <div>
  
                <strong>
                  Submitted
                </strong>
  
                <small>
                  {order.status === 1
                    ? "Waiting for submission"
                    : order.status === 4
                      ? "Order lifecycle ended"
                      : "Order submitted"}
                </small>
  
              </div>
  
            </div>
  
  
            {/* Received */}
  
            <div
              className={
                order.status === 3
                  ? "purchase-timeline-step purchase-timeline-step-complete"
                  : "purchase-timeline-step"
              }
            >
  
              <span>
                3
              </span>
  
              <div>
  
                <strong>
                  Received
                </strong>
  
                <small>
                  {order.receivedAt
                    ? formatDate(
                        order.receivedAt
                      )
                    : order.status === 4
                      ? "Cancelled"
                      : "Waiting for receipt"}
                </small>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
  
        {/* Items */}
  
        <section className="purchase-details-card">
  
          <div className="purchase-details-section-header">
  
            <div>
  
              <h2>
                Order Items
              </h2>
  
              <p>
                {order.items.length}
                {" "}
                vehicle type(s) in this order.
              </p>
  
            </div>
  
  
            <Boxes
              size={20}
            />
  
          </div>
  
  
          <div className="purchase-details-table-wrapper">
  
            <table className="purchase-details-table">
  
              <thead>
  
                <tr>
  
                  <th>
                    Car
                  </th>
  
                  <th>
                    Quantity
                  </th>
  
                  <th>
                    Unit Cost
                  </th>
  
                  <th>
                    Line Total
                  </th>
  
                </tr>
  
              </thead>
  
  
              <tbody>
  
                {order.items.map(
                  item => (
  
                    <tr
                      key={
                        item.id
                      }
                    >
  
                      <td>
  
                        <strong>
                          {item.carName}
                        </strong>
  
                        <span>
                          Car #{item.carId}
                        </span>
  
                      </td>
  
  
                      <td>
                        {item.quantity}
                      </td>
  
  
                      <td>
                        {formatMoney(
                          item.unitCost
                        )}
                      </td>
  
  
                      <td className="purchase-details-line-total">
                        {formatMoney(
                          item.lineTotal
                        )}
                      </td>
  
                    </tr>
  
                  )
                )}
  
              </tbody>
  
  
              <tfoot>
  
                <tr>
  
                  <td
                    colSpan={3}
                  >
                    Grand Total
                  </td>
  
                  <td>
                    {formatMoney(
                      order.totalAmount
                    )}
                  </td>
  
                </tr>
  
              </tfoot>
  
            </table>
  
          </div>
  
        </section>
  
  
        {/* Notes */}
  
        <section className="purchase-details-card">
  
          <div className="purchase-details-section-header">
  
            <div>
  
              <h2>
                Notes
              </h2>
  
              <p>
                Internal purchase order notes.
              </p>
  
            </div>
  
          </div>
  
  
          <div className="purchase-details-notes">
  
            {order.notes
              ? order.notes
              : "No notes were added to this purchase order."}
  
          </div>
  
        </section>
  
  
        {/* Receive Information */}
  
        {order.receivedAt && (
  
          <section className="purchase-received-card">
  
            <PackageCheck
              size={22}
            />
  
  
            <div>
  
              <span>
                Received At
              </span>
  
              <strong>
                {formatDate(
                  order.receivedAt
                )}
              </strong>
  
            </div>
  
  
            <div>
  
              <span>
                Inventory Added
              </span>
  
              <strong>
                {totalUnits}
                {" "}
                unit(s)
              </strong>
  
            </div>
  
          </section>
  
        )}
  
  
        {/* Confirm Action */}
  
        <ConfirmModal
          open={
            action !== null
          }
          title={
            confirmationTitle
          }
          message={
            confirmationMessage
          }
          confirmText={
            confirmationButton
          }
          cancelText="Back"
          variant="danger"
          loading={
            actionLoading
          }
          onConfirm={
            handleConfirmAction
          }
          onCancel={() =>
            setAction(
              null
            )
          }
        />
  
      </div>
    );
  }
  
  
  export default PurchaseOrderDetailsPage;