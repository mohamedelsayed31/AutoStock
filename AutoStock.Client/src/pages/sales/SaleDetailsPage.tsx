import {
    useEffect,
    useState,
  } from "react";
  
  import {
    ArrowLeft,
    Banknote,
    CalendarDays,
    Car,
    CircleDollarSign,
    CreditCard,
    Percent,
    ReceiptText,
    ShieldCheck,
    StickyNote,
    TrendingUp,
    UserRound,
  } from "lucide-react";
  
  import {
    useNavigate,
    useParams,
  } from "react-router-dom";
  
  import {
    getSaleById,
  } from "../../services/saleService";
  
  import {
    getPaymentMethodName,
  } from "../../utils/saleUtils";
  
  import {
    getApiErrorMessage,
  } from "../../utils/apiError";
  
  import LoadingSpinner
    from "../../components/common/LoadingSpinner";
  
  import ErrorState
    from "../../components/common/ErrorState";
  
  import type {
    Sale,
  } from "../../types/sale";
  
  
  function SaleDetailsPage() {
    const navigate =
      useNavigate();
  
  
    const {
      id,
    } =
      useParams();
  
  
    const [
      sale,
      setSale,
    ] =
      useState<Sale | null>(
        null
      );
  
  
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
  
  
    /* =========================================
       Load Sale
    ========================================= */
  
    const loadSale =
      async () => {
        const saleId =
          Number(id);
  
  
        if (
          !Number.isInteger(
            saleId
          )
          ||
          saleId <= 0
        ) {
          setLoadError(
            "Invalid sale ID."
          );
  
          setLoading(false);
  
          return;
        }
  
  
        setLoading(true);
  
        setLoadError("");
  
  
        try {
          const result =
            await getSaleById(
              saleId
            );
  
  
          setSale(
            result
          );
        }
        catch (error) {
          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load sale details."
            )
          );
        }
        finally {
          setLoading(false);
        }
      };
  
  
    useEffect(
      () => {
        void loadSale();
      },
      [id]
    );
  
  
    /* =========================================
       Helpers
    ========================================= */
  
    const formatCurrency = (
      value: number
    ) => {
      return new Intl.NumberFormat(
        "en-EG",
        {
          style: "currency",
          currency: "EGP",
          maximumFractionDigits: 2,
        }
      ).format(
        value
      );
    };
  
  
    const formatPercent = (
      value: number
    ) =>
      `${value.toFixed(2)}%`;
  
  
    const formatDate = (
      value: string
    ) => {
      const date =
        new Date(
          value
        );
  
  
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
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };
  
  
    /* =========================================
       Loading
    ========================================= */
  
    if (loading) {
      return (
        <LoadingSpinner
          message="Loading sale details..."
        />
      );
    }
  
  
    /* =========================================
       Error
    ========================================= */
  
    if (
      loadError
      ||
      !sale
    ) {
      return (
        <ErrorState
          title="Unable to load sale"
          message={
            loadError
            ||
            "Sale not found."
          }
          onRetry={
            loadSale
          }
        />
      );
    }
  
  
    const hasKnownCost =
      (
        sale.revenueWithKnownCost
        ?? 0
      ) > 0;
  
  
    const costCoverage =
      sale.costCoveragePercent
      ?? 0;
  
  
    return (
      <div className="cars-page">
  
        {/* =========================================
            Header
        ========================================= */}
  
        <div className="cars-header">
  
          <div>
  
            <button
              type="button"
              className="sale-back-button"
              onClick={
                () =>
                  navigate(
                    "/sales"
                  )
              }
            >
              <ArrowLeft
                size={17}
              />
  
              Sales
            </button>
  
  
            <h1>
              Sale #{sale.id}
            </h1>
  
  
            <p>
              Complete dealership transaction,
              cost and profitability details.
            </p>
  
          </div>
  
        </div>
  
  
        {/* =========================================
            Sale Information
        ========================================= */}
  
        <div className="sale-details-grid">
  
          {/* Customer */}
  
          <div className="sale-detail-card">
  
            <div className="sales-summary-icon">
  
              <UserRound
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Customer
              </span>
  
              <strong>
                {sale.customerName}
              </strong>
  
            </div>
  
          </div>
  
  
          {/* Date */}
  
          <div className="sale-detail-card">
  
            <div className="sales-summary-icon">
  
              <CalendarDays
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Sale Date
              </span>
  
              <strong>
                {formatDate(
                  sale.saleDate
                )}
              </strong>
  
            </div>
  
          </div>
  
  
          {/* Payment */}
  
          <div className="sale-detail-card">
  
            <div className="sales-summary-icon">
  
              <CreditCard
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Payment Method
              </span>
  
              <strong>
                {getPaymentMethodName(
                  sale.paymentMethod
                )}
              </strong>
  
            </div>
  
          </div>
  
  
          {/* Total */}
  
          <div className="sale-detail-card">
  
            <div className="sales-summary-icon">
  
              <ReceiptText
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Total Revenue
              </span>
  
              <strong className="sale-detail-total">
  
                {formatCurrency(
                  sale.totalAmount
                  ?? 0
                )}
  
              </strong>
  
            </div>
  
          </div>
  
        </div>
  
  
        {/* =========================================
            Financial Summary
        ========================================= */}
  
        <section className="sale-section">
  
          <div className="sale-section-header">
  
            <div className="sales-summary-icon">
  
              <TrendingUp
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <h2>
                Financial Summary
              </h2>
  
              <p>
                Revenue, cost of goods sold,
                gross profit and cost coverage
                for this transaction.
              </p>
  
            </div>
  
          </div>
  
  
          <div className="sale-profit-summary-grid">
  
            {/* Revenue */}
  
            <div className="sale-profit-summary-card">
  
              <Banknote
                size={20}
              />
  
              <span>
                Revenue
              </span>
  
              <strong>
                {formatCurrency(
                  sale.totalAmount
                  ?? 0
                )}
              </strong>
  
            </div>
  
  
            {/* Known Revenue */}
  
            <div className="sale-profit-summary-card">
  
              <ShieldCheck
                size={20}
              />
  
              <span>
                Known Cost Revenue
              </span>
  
              <strong>
                {formatCurrency(
                  sale.revenueWithKnownCost
                  ?? 0
                )}
              </strong>
  
            </div>
  
  
            {/* COGS */}
  
            <div className="sale-profit-summary-card">
  
              <CircleDollarSign
                size={20}
              />
  
              <span>
                COGS
              </span>
  
              <strong>
                {hasKnownCost
                  ? formatCurrency(
                      sale.totalCogs
                      ?? 0
                    )
                  : "N/A"}
              </strong>
  
            </div>
  
  
            {/* Profit */}
  
            <div className="
              sale-profit-summary-card
              sale-profit-highlight-card
            ">
  
              <TrendingUp
                size={20}
              />
  
              <span>
                Gross Profit
              </span>
  
              <strong>
                {hasKnownCost
                  ? formatCurrency(
                      sale.grossProfit
                      ?? 0
                    )
                  : "N/A"}
              </strong>
  
            </div>
  
  
            {/* Margin */}
  
            <div className="sale-profit-summary-card">
  
              <Percent
                size={20}
              />
  
              <span>
                Gross Margin
              </span>
  
              <strong>
                {hasKnownCost
                  ? formatPercent(
                      sale.grossMarginPercent
                      ?? 0
                    )
                  : "N/A"}
              </strong>
  
            </div>
  
  
            {/* Coverage */}
  
            <div className="sale-profit-summary-card">
  
              <ShieldCheck
                size={20}
              />
  
              <span>
                Cost Coverage
              </span>
  
              <strong>
                {formatPercent(
                  costCoverage
                )}
              </strong>
  
            </div>
  
          </div>
  
  
          {/* Cost Coverage Progress */}
  
          <div className="sale-cost-coverage-panel">
  
            <div className="sale-cost-coverage-header">
  
              <div>
  
                <strong>
                  Cost Coverage
                </strong>
  
                <span>
                  Percentage of this sale's revenue
                  backed by known inventory cost.
                </span>
  
              </div>
  
  
              <strong>
                {formatPercent(
                  costCoverage
                )}
              </strong>
  
            </div>
  
  
            <div className="sale-cost-coverage-track">
  
              <div
                className="sale-cost-coverage-fill"
                style={{
                  width:
                    `${Math.min(
                      100,
                      Math.max(
                        0,
                        costCoverage
                      )
                    )}%`,
                }}
              />
  
            </div>
  
  
            <div className="sale-cost-coverage-values">
  
              <div>
  
                <span>
                  Known Cost Revenue
                </span>
  
                <strong>
                  {formatCurrency(
                    sale.revenueWithKnownCost
                    ?? 0
                  )}
                </strong>
  
              </div>
  
  
              <div>
  
                <span>
                  Unknown Cost Revenue
                </span>
  
                <strong>
                  {formatCurrency(
                    sale.revenueWithUnknownCost
                    ?? 0
                  )}
                </strong>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
  
        {/* =========================================
            Sale Items
        ========================================= */}
  
        <section className="sale-section">
  
          <div className="sale-section-header">
  
            <div className="sales-summary-icon">
  
              <Car
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <h2>
                Sold Cars
              </h2>
  
              <p>
                Selling price, historical
                inventory cost and profit
                for every vehicle line.
              </p>
  
            </div>
  
          </div>
  
  
          <div className="
            table-container
            sale-financial-items-table-container
          ">
  
            <table className="sale-financial-items-table">
  
              <thead>
  
                <tr>
  
                  <th>
                    Car
                  </th>
  
                  <th>
                    Quantity
                  </th>
  
                  <th>
                    Unit Price
                  </th>
  
                  <th>
                    Unit Cost
                  </th>
  
                  <th>
                    Revenue
                  </th>
  
                  <th>
                    COGS
                  </th>
  
                  <th>
                    Gross Profit
                  </th>
  
                  <th>
                    Margin
                  </th>
  
                </tr>
  
              </thead>
  
  
              <tbody>
  
                {sale.items.map(
                  item => {
  
                    const itemHasCost =
                      item.costOfGoodsSold
                        !== null
                      &&
                      item.grossProfit
                        !== null;
  
  
                    return (
  
                      <tr
                        key={
                          item.id
                        }
                      >
  
                        {/* Car */}
  
                        <td>
  
                          <strong>
                            {item.carName}
                          </strong>
  
                        </td>
  
  
                        {/* Quantity */}
  
                        <td>
                          {item.quantity}
                        </td>
  
  
                        {/* Unit Price */}
  
                        <td>
  
                          {formatCurrency(
                            item.unitPrice
                          )}
  
                        </td>
  
  
                        {/* Unit Cost */}
  
                        <td>
  
                          {item.unitCost
                            !== null
                            ? (
                              <span className="sale-item-cost">
  
                                {formatCurrency(
                                  item.unitCost
                                )}
  
                              </span>
                            )
                            : (
                              <span className="sale-cost-unavailable">
  
                                N/A
  
                              </span>
                            )}
  
                        </td>
  
  
                        {/* Revenue */}
  
                        <td>
  
                          <strong className="sale-total">
  
                            {formatCurrency(
                              item.lineTotal
                            )}
  
                          </strong>
  
                        </td>
  
  
                        {/* COGS */}
  
                        <td>
  
                          {item.costOfGoodsSold
                            !== null
                            ? (
                              <span className="sale-item-cost">
  
                                {formatCurrency(
                                  item.costOfGoodsSold
                                )}
  
                              </span>
                            )
                            : (
                              <span className="sale-cost-unavailable">
  
                                N/A
  
                              </span>
                            )}
  
                        </td>
  
  
                        {/* Profit */}
  
                        <td>
  
                          {itemHasCost
                            ? (
                              <strong
                                className={
                                  (
                                    item.grossProfit
                                    ?? 0
                                  ) >= 0
                                    ? "sale-profit-positive"
                                    : "sale-profit-negative"
                                }
                              >
  
                                {formatCurrency(
                                  item.grossProfit
                                  ?? 0
                                )}
  
                              </strong>
                            )
                            : (
                              <span className="sale-cost-unavailable">
  
                                N/A
  
                              </span>
                            )}
  
                        </td>
  
  
                        {/* Margin */}
  
                        <td>
  
                          {item.grossMarginPercent
                            !== null
                            ? (
                              <span
                                className={
                                  item.grossMarginPercent
                                    >= 0
                                    ? "sale-margin-badge"
                                    : "sale-margin-badge negative"
                                }
                              >
  
                                {formatPercent(
                                  item.grossMarginPercent
                                )}
  
                              </span>
                            )
                            : (
                              <span className="sale-cost-unavailable">
  
                                N/A
  
                              </span>
                            )}
  
                        </td>
  
                      </tr>
  
                    );
                  }
                )}
  
              </tbody>
  
            </table>
  
          </div>
  
  
          {/* =========================================
              Final Totals
          ========================================= */}
  
          <div className="sale-financial-final-summary">
  
            <div>
  
              <span>
                Total Revenue
              </span>
  
              <strong>
                {formatCurrency(
                  sale.totalAmount
                  ?? 0
                )}
              </strong>
  
            </div>
  
  
            <div>
  
              <span>
                Total COGS
              </span>
  
              <strong>
                {hasKnownCost
                  ? formatCurrency(
                      sale.totalCogs
                      ?? 0
                    )
                  : "N/A"}
              </strong>
  
            </div>
  
  
            <div className="sale-final-profit">
  
              <span>
                Gross Profit
              </span>
  
              <strong>
                {hasKnownCost
                  ? formatCurrency(
                      sale.grossProfit
                      ?? 0
                    )
                  : "N/A"}
              </strong>
  
            </div>
  
          </div>
  
        </section>
  
  
        {/* =========================================
            Notes
        ========================================= */}
  
        <section className="sale-section">
  
          <div className="sale-section-header">
  
            <div className="sales-summary-icon">
  
              <StickyNote
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <h2>
                Notes
              </h2>
  
              <p>
                Additional information
                recorded with this sale.
              </p>
  
            </div>
  
          </div>
  
  
          <div className="sale-notes-box">
  
            {sale.notes
              ? sale.notes
              : "No notes were added to this sale."}
  
          </div>
  
        </section>
  
  
        {/* =========================================
            Inventory Information
        ========================================= */}
  
        <div className="sale-completed-info">
  
          <ReceiptText
            size={18}
          />
  
  
          <div>
  
            <strong>
              Sale completed
            </strong>
  
            <span>
              Inventory quantities were
              automatically reduced,
              cost snapshots were preserved,
              and Stock Out transactions were
              recorded when this sale was created.
            </span>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  
  export default SaleDetailsPage;