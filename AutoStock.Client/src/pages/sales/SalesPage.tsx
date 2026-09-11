import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Banknote,
    CalendarDays,
    CircleDollarSign,
    Eye,
    Percent,
    ReceiptText,
    Search,
    ShieldCheck,
    TrendingUp,
    UserRound,
  } from "lucide-react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import {
    getSales,
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
  
  import EmptyState
    from "../../components/common/EmptyState";
  
  import type {
    Sale,
  } from "../../types/sale";
  
  
  function SalesPage() {
    const navigate =
      useNavigate();
  
  
    const [
      sales,
      setSales,
    ] =
      useState<Sale[]>([]);
  
  
    const [
      search,
      setSearch,
    ] =
      useState("");
  
  
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
       Load Sales
    ========================================= */
  
    const loadSales =
      async () => {
        setLoading(true);
  
        setLoadError("");
  
  
        try {
          const result =
            await getSales();
  
  
          setSales(
            result
          );
        }
        catch (error) {
          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load sales."
            )
          );
        }
        finally {
          setLoading(false);
        }
      };
  
  
    useEffect(
      () => {
        void loadSales();
      },
      []
    );
  
  
    /* =========================================
       Filter Sales
    ========================================= */
  
    const filteredSales =
      useMemo(
        () => {
          const value =
            search
              .trim()
              .toLowerCase();
  
  
          if (!value) {
            return sales;
          }
  
  
          return sales.filter(
            sale => {
              const paymentMethod =
                getPaymentMethodName(
                  sale.paymentMethod
                )
                  .toLowerCase();
  
  
              return (
                sale.customerName
                  .toLowerCase()
                  .includes(value)
                ||
                sale.id
                  .toString()
                  .includes(value)
                ||
                paymentMethod
                  .includes(value)
                ||
                sale.items.some(
                  item =>
                    item.carName
                      .toLowerCase()
                      .includes(value)
                )
              );
            }
          );
        },
        [
          sales,
          search,
        ]
      );
  
  
    /* =========================================
       Financial Totals
    ========================================= */
  
    const totalRevenue =
      useMemo(
        () =>
          sales.reduce(
            (
              total,
              sale
            ) =>
              total +
              (
                sale.totalAmount
                ?? 0
              ),
            0
          ),
        [sales]
      );
  
  
    const totalKnownRevenue =
      useMemo(
        () =>
          sales.reduce(
            (
              total,
              sale
            ) =>
              total +
              (
                sale.revenueWithKnownCost
                ?? 0
              ),
            0
          ),
        [sales]
      );
  
  
    const totalCogs =
      useMemo(
        () =>
          sales.reduce(
            (
              total,
              sale
            ) =>
              total +
              (
                sale.totalCogs
                ?? 0
              ),
            0
          ),
        [sales]
      );
  
  
    const totalGrossProfit =
      useMemo(
        () =>
          sales.reduce(
            (
              total,
              sale
            ) =>
              total +
              (
                sale.grossProfit
                ?? 0
              ),
            0
          ),
        [sales]
      );
  
  
    const overallGrossMargin =
      useMemo(
        () => {
          if (
            totalKnownRevenue <= 0
          ) {
            return 0;
          }
  
  
          return (
            totalGrossProfit
            /
            totalKnownRevenue
          ) * 100;
        },
        [
          totalGrossProfit,
          totalKnownRevenue,
        ]
      );
  
  
    const overallCostCoverage =
      useMemo(
        () => {
          if (
            totalRevenue <= 0
          ) {
            return 0;
          }
  
  
          return (
            totalKnownRevenue
            /
            totalRevenue
          ) * 100;
        },
        [
          totalKnownRevenue,
          totalRevenue,
        ]
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
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };
  
  
    const hasKnownCost = (
      sale: Sale
    ) =>
      (
        sale.revenueWithKnownCost
        ?? 0
      ) > 0;
  
  
    return (
      <div className="cars-page">
  
        {/* =========================================
            Header
        ========================================= */}
  
        <div className="cars-header">
  
          <div>
  
            <h1>
              Sales Management
            </h1>
  
            <p>
              View sales history,
              revenue, inventory cost
              and dealership profitability.
            </p>
  
          </div>
  
  
          <div className="header-actions">
  
            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    "/sales/new"
                  )
              }
            >
              <ReceiptText
                size={17}
              />
  
              New Sale
            </button>
  
          </div>
  
        </div>
  
  
        {/* =========================================
            Financial Summary
        ========================================= */}
  
        <div className="sales-financial-summary-grid">
  
          {/* Total Sales */}
  
          <div className="sales-financial-card">
  
            <div className="sales-summary-icon">
  
              <ReceiptText
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Total Sales
              </span>
  
              <strong>
                {sales.length}
              </strong>
  
            </div>
  
          </div>
  
  
          {/* Revenue */}
  
          <div className="sales-financial-card">
  
            <div className="sales-summary-icon">
  
              <Banknote
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Total Revenue
              </span>
  
              <strong>
                {formatCurrency(
                  totalRevenue
                )}
              </strong>
  
            </div>
  
          </div>
  
  
          {/* COGS */}
  
          <div className="sales-financial-card">
  
            <div className="sales-summary-icon">
  
              <CircleDollarSign
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                COGS
              </span>
  
              <strong>
                {formatCurrency(
                  totalCogs
                )}
              </strong>
  
              <small>
                Known-cost sales only
              </small>
  
            </div>
  
          </div>
  
  
          {/* Gross Profit */}
  
          <div className="
            sales-financial-card
            sales-profit-card
          ">
  
            <div className="sales-summary-icon">
  
              <TrendingUp
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Gross Profit
              </span>
  
              <strong>
                {formatCurrency(
                  totalGrossProfit
                )}
              </strong>
  
              <small>
                Covered revenue only
              </small>
  
            </div>
  
          </div>
  
  
          {/* Gross Margin */}
  
          <div className="sales-financial-card">
  
            <div className="sales-summary-icon">
  
              <Percent
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Gross Margin
              </span>
  
              <strong>
                {totalKnownRevenue > 0
                  ? formatPercent(
                      overallGrossMargin
                    )
                  : "N/A"}
              </strong>
  
            </div>
  
          </div>
  
  
          {/* Cost Coverage */}
  
          <div className="sales-financial-card">
  
            <div className="sales-summary-icon">
  
              <ShieldCheck
                size={20}
              />
  
            </div>
  
  
            <div>
  
              <span>
                Cost Coverage
              </span>
  
              <strong>
                {formatPercent(
                  overallCostCoverage
                )}
              </strong>
  
            </div>
  
          </div>
  
        </div>
  
  
        {/* =========================================
            Search
        ========================================= */}
  
        <div className="customer-search-bar">
  
          <Search
            size={18}
          />
  
  
          <input
            type="search"
            value={
              search
            }
            placeholder="Search by sale ID, customer, vehicle or payment method..."
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
          />
  
        </div>
  
  
        {/* =========================================
            Loading
        ========================================= */}
  
        {loading && (
  
          <LoadingSpinner
            message="Loading sales..."
          />
  
        )}
  
  
        {/* =========================================
            Error
        ========================================= */}
  
        {!loading
          &&
          loadError
          && (
  
            <ErrorState
              title="Unable to load sales"
              message={
                loadError
              }
              onRetry={
                loadSales
              }
            />
  
          )}
  
  
        {/* =========================================
            No Sales
        ========================================= */}
  
        {!loading
          &&
          !loadError
          &&
          sales.length === 0
          && (
  
            <EmptyState
              icon={
                ReceiptText
              }
              title="No Sales Yet"
              message="No sales transactions have been recorded yet."
              actionText="Create First Sale"
              onAction={
                () =>
                  navigate(
                    "/sales/new"
                  )
              }
            />
  
          )}
  
  
        {/* =========================================
            No Search Results
        ========================================= */}
  
        {!loading
          &&
          !loadError
          &&
          sales.length > 0
          &&
          filteredSales.length === 0
          && (
  
            <EmptyState
              icon={
                Search
              }
              title="No Matching Sales"
              message="No sales match the current search."
              actionText="Clear Search"
              onAction={
                () =>
                  setSearch("")
              }
            />
  
          )}
  
  
        {/* =========================================
            Sales Table
        ========================================= */}
  
        {!loading
          &&
          !loadError
          &&
          filteredSales.length > 0
          && (
  
            <div className="
              table-container
              sales-financial-table-container
            ">
  
              <table className="sales-financial-table">
  
                <thead>
  
                  <tr>
  
                    <th>
                      Sale
                    </th>
  
                    <th>
                      Customer
                    </th>
  
                    <th>
                      Date
                    </th>
  
                    <th>
                      Payment
                    </th>
  
                    <th>
                      Items
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
  
                    <th>
                      Cost Coverage
                    </th>
  
                    <th>
                      Actions
                    </th>
  
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {filteredSales.map(
                    sale => {
  
                      const costKnown =
                        hasKnownCost(
                          sale
                        );
  
  
                      const itemCount =
                        sale.items.reduce(
                          (
                            total,
                            item
                          ) =>
                            total
                            +
                            item.quantity,
                          0
                        );
  
  
                      return (
  
                        <tr
                          key={
                            sale.id
                          }
                        >
  
                          {/* Sale ID */}
  
                          <td>
  
                            <strong>
                              #{sale.id}
                            </strong>
  
                          </td>
  
  
                          {/* Customer */}
  
                          <td>
  
                            <span className="supplier-contact-cell">
  
                              <UserRound
                                size={14}
                              />
  
                              {sale.customerName}
  
                            </span>
  
                          </td>
  
  
                          {/* Date */}
  
                          <td>
  
                            <span className="supplier-contact-cell">
  
                              <CalendarDays
                                size={14}
                              />
  
                              {formatDate(
                                sale.saleDate
                              )}
  
                            </span>
  
                          </td>
  
  
                          {/* Payment */}
  
                          <td>
  
                            <span className="sale-payment-badge">
  
                              {getPaymentMethodName(
                                sale.paymentMethod
                              )}
  
                            </span>
  
                          </td>
  
  
                          {/* Items */}
  
                          <td>
                            {itemCount}
                          </td>
  
  
                          {/* Revenue */}
  
                          <td>
  
                            <strong className="sale-total">
  
                              {formatCurrency(
                                sale.totalAmount
                                ?? 0
                              )}
  
                            </strong>
  
                          </td>
  
  
                          {/* COGS */}
  
                          <td>
  
                            {costKnown
                              ? (
                                <span className="sale-cogs-value">
  
                                  {formatCurrency(
                                    sale.totalCogs
                                    ?? 0
                                  )}
  
                                </span>
                              )
                              : (
                                <span className="sale-cost-unavailable">
  
                                  N/A
  
                                </span>
                              )}
  
                          </td>
  
  
                          {/* Gross Profit */}
  
                          <td>
  
                            {costKnown
                              ? (
                                <strong
                                  className={
                                    (
                                      sale.grossProfit
                                      ?? 0
                                    ) >= 0
                                      ? "sale-profit-positive"
                                      : "sale-profit-negative"
                                  }
                                >
  
                                  {formatCurrency(
                                    sale.grossProfit
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
  
                            {costKnown
                              ? (
                                <span
                                  className={
                                    (
                                      sale.grossMarginPercent
                                      ?? 0
                                    ) >= 0
                                      ? "sale-margin-badge"
                                      : "sale-margin-badge negative"
                                  }
                                >
  
                                  {formatPercent(
                                    sale.grossMarginPercent
                                    ?? 0
                                  )}
  
                                </span>
                              )
                              : (
                                <span className="sale-cost-unavailable">
  
                                  N/A
  
                                </span>
                              )}
  
                          </td>
  
  
                          {/* Cost Coverage */}
  
                          <td>
  
                            <div className="sale-coverage-cell">
  
                              <span
                                className={
                                  (
                                    sale.costCoveragePercent
                                    ?? 0
                                  ) >= 100
                                    ? "sale-coverage-badge complete"
                                    : (
                                        sale.costCoveragePercent
                                        ?? 0
                                      ) > 0
                                      ? "sale-coverage-badge partial"
                                      : "sale-coverage-badge unknown"
                                }
                              >
  
                                {formatPercent(
                                  sale.costCoveragePercent
                                  ?? 0
                                )}
  
                              </span>
  
  
                              {(
                                sale.costCoveragePercent
                                ?? 0
                              ) < 100
                                && (
  
                                  <small>
                                    Partial cost
                                  </small>
  
                                )}
  
                            </div>
  
                          </td>
  
  
                          {/* Actions */}
  
                          <td>
  
                            <div className="table-actions">
  
                              <button
                                type="button"
                                onClick={
                                  () =>
                                    navigate(
                                      `/sales/${sale.id}`
                                    )
                                }
                              >
                                <Eye
                                  size={15}
                                />
  
                                Details
                              </button>
  
                            </div>
  
                          </td>
  
                        </tr>
  
                      );
                    }
                  )}
  
                </tbody>
  
              </table>
  
            </div>
  
          )}
  
      </div>
    );
  }
  
  
  export default SalesPage;