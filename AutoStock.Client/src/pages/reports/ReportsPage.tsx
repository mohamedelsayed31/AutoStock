import {
    useCallback,
    useEffect,
    useState,
  } from "react";
  
  import {
    BadgeDollarSign,
    Percent,
    ShieldCheck,
    Building2,
    CarFront,
    CircleDollarSign,
    Download,
    PackageCheck,
    ShoppingCart,
    Banknote,
    FileChartColumn,
    Filter,
    Package,
    ReceiptText,
    RotateCcw,
    TriangleAlert,
    TrendingUp,
    WalletCards,
  } from "lucide-react";
  
  import {
    getInventoryReport,
    getLowStockReport,
    getStockMovementReport,
  } from "../../services/reportService";
  
  import {
    getSalesReport,
  } from "../../services/salesReportService";
  
  import {
    exportToCsv,
  } from "../../utils/csvExport";
  
  import {
    getApiErrorMessage,
  } from "../../utils/apiError";
  
  import {
    getPaymentMethodName,
  } from "../../utils/saleUtils";
  
  import {
    useToast,
  } from "../../hooks/useToast";
  
  import {
    useAuth,
  } from "../../context/AuthContext";
  
  import LoadingSpinner
    from "../../components/common/LoadingSpinner";
  
  import EmptyState
    from "../../components/common/EmptyState";
  
  import ErrorState
    from "../../components/common/ErrorState";

    import {
        getProfitReport,
      } from "../../services/profitReportService";
      
      import type {
        ProfitReport,
      } from "../../types/profitReport";
  
  import type {
    InventoryReportItem,
    LowStockReportItem,
    StockMovementSummary,
  } from "../../types/report";
  
  import type {
    SalesReport,
  } from "../../types/salesReport";

  import {
    getPurchaseReport,
  } from "../../services/purchaseReportService";
  
  import type {
    PurchaseReport,
  } from "../../types/purchaseReport";
  
  
  function ReportsPage() {
    const {
      showToast,
    } = useToast();
  
  
    const {
      isAdmin,
    } = useAuth();
  
  
    /* =========================
       Inventory Report
    ========================= */
  
    const [
      inventory,
      setInventory,
    ] =
      useState<
        InventoryReportItem[]
      >([]);
  
  
    /* =========================
       Low Stock Report
    ========================= */
  
    const [
      lowStock,
      setLowStock,
    ] =
      useState<
        LowStockReportItem[]
      >([]);
  
  
    /* =========================
       Stock Movement
    ========================= */
  
    const [
      movement,
      setMovement,
    ] =
      useState<
        StockMovementSummary | null
      >(null);
  
  
    /* =========================
       Sales Report
    ========================= */
  
    const [
      salesReport,
      setSalesReport,
    ] =
      useState<
        SalesReport | null
      >(null);
  
  
    const [
      salesLoading,
      setSalesLoading,
    ] =
      useState(false);
  
  
    const [
      salesError,
      setSalesError,
    ] =
      useState("");

    /* =========================
       Purchase Report
    ========================= */

    const [
      purchaseReport,
      setPurchaseReport,
    ] =
      useState<PurchaseReport | null>(
        null
      );


    /* =========================
       Profit Report
    ========================= */

    const [
      profitReport,
      setProfitReport,
    ] =
      useState<ProfitReport | null>(
        null
      );


    const [
      financialLoading,
      setFinancialLoading,
    ] =
      useState(false);


    const [
      financialError,
      setFinancialError,
    ] =
      useState("");
  
  
    /* =========================
       Date Filters
    ========================= */
  
    const [
      startDate,
      setStartDate,
    ] =
      useState("");
  
  
    const [
      endDate,
      setEndDate,
    ] =
      useState("");
  
  
    /* =========================
       Loading States
    ========================= */
  
    const [
      loading,
      setLoading,
    ] =
      useState(true);
  
  
    const [
      movementLoading,
      setMovementLoading,
    ] =
      useState(false);
  
  
    /* =========================
       Errors
    ========================= */
  
    const [
      loadError,
      setLoadError,
    ] =
      useState("");
  
  
    const [
      movementError,
      setMovementError,
    ] =
      useState("");
  
  
    const [
      filterError,
      setFilterError,
    ] =
      useState("");
  
  
    /* =========================
       Load Main Reports
    ========================= */
  
    const loadReports =
      useCallback(
        async () => {
  
          setLoading(
            true
          );
  
          setLoadError("");
  
  
          try {
            const [
              inventoryData,
              lowStockData,
              movementData,
            ] =
              await Promise.all([
                getInventoryReport(),
                getLowStockReport(),
                getStockMovementReport(),
              ]);


            setInventory(
              inventoryData
            );


            setLowStock(
              lowStockData
            );


            setMovement(
              movementData
            );
          }
          catch (error) {
  
            setLoadError(
              getApiErrorMessage(
                error,
                "Failed to load reports."
              )
            );
          }
          finally {
  
            setLoading(
              false
            );
          }
        },
        []
      );
  
  
    /* =========================
       Load Sales Report
       Admin Only
    ========================= */
  
    const loadSalesReport =
      useCallback(
        async () => {
  
          if (!isAdmin) {
            setSalesReport(
              null
            );
  
            setSalesError("");
  
            return;
          }
  
  
          setSalesLoading(
            true
          );
  
          setSalesError("");
  
  
          try {
            const result =
              await getSalesReport();
  
  
            setSalesReport(
              result
            );
          }
          catch (error) {
  
            setSalesError(
              getApiErrorMessage(
                error,
                "Failed to load sales analytics."
              )
            );
          }
          finally {
  
            setSalesLoading(
              false
            );
          }
        },
        [isAdmin]
      );
  
  
    /* =========================
       Load Purchasing + Profit
       Admin Only
    ========================= */

    const loadFinancialReports =
      useCallback(
        async () => {
          if (!isAdmin) {
            setPurchaseReport(
              null
            );

            setProfitReport(
              null
            );

            setFinancialError("");

            return;
          }


          setFinancialLoading(
            true
          );

          setFinancialError("");


          try {
            const [
              purchaseData,
              profitData,
            ] =
              await Promise.all([
                getPurchaseReport(),
                getProfitReport(),
              ]);


            setPurchaseReport(
              purchaseData
            );

            setProfitReport(
              profitData
            );
          }
          catch (error) {
            setFinancialError(
              getApiErrorMessage(
                error,
                "Failed to load purchasing and profit analytics."
              )
            );
          }
          finally {
            setFinancialLoading(
              false
            );
          }
        },
        [isAdmin]
      );


    useEffect(() => {
  
      void loadReports();
  
    }, [loadReports]);
  
  
    useEffect(() => {
  
      void loadSalesReport();
  
    }, [loadSalesReport]);


    useEffect(() => {

      void loadFinancialReports();

    }, [loadFinancialReports]);
  
  
    /* =========================
       Apply Movement Filter
    ========================= */
  
    const handleMovementFilter =
      async () => {
  
        setFilterError("");
  
        setMovementError("");
  
  
        if (
          startDate &&
          endDate &&
          startDate > endDate
        ) {
  
          setFilterError(
            "Start date cannot be after end date."
          );
  
          return;
        }
  
  
        setMovementLoading(
          true
        );
  
  
        try {
          const result =
            await getStockMovementReport(
              startDate ||
                undefined,
  
              endDate ||
                undefined
            );
  
  
          setMovement(
            result
          );
  
  
          showToast(
            "Stock movement report updated.",
            "success"
          );
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to load stock movement report."
            );
  
  
          setMovementError(
            message
          );
  
  
          showToast(
            message,
            "error"
          );
        }
        finally {
  
          setMovementLoading(
            false
          );
        }
      };
  
  
    /* =========================
       Clear Movement Filter
    ========================= */
  
    const handleClearMovementFilter =
      async () => {
  
        setStartDate("");
  
        setEndDate("");
  
        setFilterError("");
  
        setMovementError("");
  
  
        setMovementLoading(
          true
        );
  
  
        try {
          const result =
            await getStockMovementReport();
  
  
          setMovement(
            result
          );
  
  
          showToast(
            "Date filter cleared.",
            "info"
          );
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to reload stock movement report."
            );
  
  
          setMovementError(
            message
          );
  
  
          showToast(
            message,
            "error"
          );
        }
        finally {
  
          setMovementLoading(
            false
          );
        }
      };
  
  
    /* =========================
       Export Inventory CSV
    ========================= */
  
    const handleExportInventory =
      () => {
  
        if (
          inventory.length === 0
        ) {
  
          showToast(
            "There is no inventory data to export.",
            "info"
          );
  
          return;
        }
  
  
        try {
          exportToCsv(
            "autostock-inventory-report.csv",
            inventory,
            [
              {
                header: "Car ID",
                value: car =>
                  car.carId,
              },
  
              {
                header: "Model",
                value: car =>
                  car.model,
              },
  
              {
                header: "Brand",
                value: car =>
                  car.brandName,
              },
  
              {
                header: "Category",
                value: car =>
                  car.categoryName,
              },
  
              {
                header: "Supplier",
                value: car =>
                  car.supplierName,
              },
  
              {
                header: "Year",
                value: car =>
                  car.year,
              },
  
              {
                header: "Price",
                value: car =>
                  car.price,
              },
  
              {
                header: "Quantity",
                value: car =>
                  car.quantity,
              },
  
              {
                header: "Reorder Level",
                value: car =>
                  car.reorderLevel,
              },
  
              {
                header: "Stock Status",
                value: car =>
                  car.stockStatus,
              },
  
              {
                header: "Inventory Value",
                value: car =>
                  car.inventoryValue,
              },
            ]
          );
  
  
          showToast(
            "Inventory report exported successfully.",
            "success"
          );
        }
        catch (error) {
  
          const message =
            error instanceof Error
              ? error.message
              : "Failed to export inventory report.";
  
  
          showToast(
            message,
            "error"
          );
        }
      };
  
  
    /* =========================
       Export Low Stock CSV
    ========================= */
  
    const handleExportLowStock =
      () => {
  
        if (
          lowStock.length === 0
        ) {
  
          showToast(
            "There is no low stock data to export.",
            "info"
          );
  
          return;
        }
  
  
        try {
          exportToCsv(
            "autostock-low-stock-report.csv",
            lowStock,
            [
              {
                header: "Car ID",
                value: car =>
                  car.carId,
              },
  
              {
                header: "Model",
                value: car =>
                  car.model,
              },
  
              {
                header: "Brand",
                value: car =>
                  car.brandName,
              },
  
              {
                header: "Quantity",
                value: car =>
                  car.quantity,
              },
  
              {
                header: "Reorder Level",
                value: car =>
                  car.reorderLevel,
              },
  
              {
                header: "Needed Quantity",
                value: car =>
                  car.neededQuantity,
              },
  
              {
                header: "Stock Status",
                value: car =>
                  car.stockStatus,
              },
            ]
          );
  
  
          showToast(
            "Low stock report exported successfully.",
            "success"
          );
        }
        catch (error) {
  
          const message =
            error instanceof Error
              ? error.message
              : "Failed to export low stock report.";
  
  
          showToast(
            message,
            "error"
          );
        }
      };
  
  
    /* =========================
       Currency Helpers
    ========================= */

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
      ).format(value);
    };


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
      ).format(value);


    const formatPercent = (
      value: number
    ) =>
      `${value.toFixed(2)}%`;


    /* =========================
       Export Purchase Report
    ========================= */

    const handleExportPurchases =
      () => {
        if (
          !purchaseReport
          ||
          purchaseReport.monthlySpend.length === 0
        ) {
          showToast(
            "There is no purchase data to export.",
            "info"
          );

          return;
        }


        try {
          exportToCsv(
            "autostock-purchase-report.csv",
            purchaseReport.monthlySpend,
            [
              {
                header: "Month",
                value: item => item.monthLabel,
              },
              {
                header: "Received Orders",
                value: item => item.ordersReceived,
              },
              {
                header: "Units Received",
                value: item => item.unitsReceived,
              },
              {
                header: "Total Spend",
                value: item => item.totalSpend,
              },
            ]
          );

          showToast(
            "Purchase report exported successfully.",
            "success"
          );
        }
        catch {
          showToast(
            "Failed to export purchase report.",
            "error"
          );
        }
      };


    /* =========================
       Export Profit Report
    ========================= */

    const handleExportProfit =
      () => {
        if (
          !profitReport
          ||
          profitReport.monthlyProfit.length === 0
        ) {
          showToast(
            "There is no profit data to export.",
            "info"
          );

          return;
        }


        try {
          exportToCsv(
            "autostock-profit-report.csv",
            profitReport.monthlyProfit,
            [
              {
                header: "Month",
                value: item => item.monthLabel,
              },
              {
                header: "Revenue",
                value: item => item.revenue,
              },
              {
                header: "Revenue With Known Cost",
                value: item => item.revenueWithKnownCost,
              },
              {
                header: "COGS",
                value: item => item.cogs,
              },
              {
                header: "Gross Profit",
                value: item => item.grossProfit,
              },
              {
                header: "Gross Margin %",
                value: item => item.grossMarginPercent,
              },
              {
                header: "Cost Coverage %",
                value: item => item.costCoveragePercent,
              },
            ]
          );

          showToast(
            "Profit report exported successfully.",
            "success"
          );
        }
        catch {
          showToast(
            "Failed to export profit report.",
            "error"
          );
        }
      };


    /* =========================
       Main Loading
    ========================= */
  
    if (loading) {
  
      return (
        <div className="reports-page">
  
          <LoadingSpinner
            message="Loading reports..."
          />
  
        </div>
      );
    }
  
  
    /* =========================
       Main Load Error
    ========================= */
  
    if (loadError) {
  
      return (
        <div className="reports-page">
  
          <ErrorState
            title="Unable to load reports"
            message={
              loadError
            }
            onRetry={
              loadReports
            }
          />
  
        </div>
      );
    }
  
  
    return (
      <div className="reports-page">
  
        {/* =========================
            Header
        ========================= */}
  
        <div className="reports-header">
  
          <div>
  
            <h1>
              Reports
            </h1>
  
  
            <p>
              Inventory, stock and sales
              analytics for AutoStock.
            </p>
  
          </div>
  
  
          <FileChartColumn
            size={34}
          />
  
        </div>
  
  
        {/* =========================================
            Sales Analytics
            Admin Only
        ========================================= */}
  
        {isAdmin && (
  
          <section className="report-section">
  
            <div className="report-section-header">
  
              <div>
  
                <h2>
  
                  <ReceiptText
                    size={21}
                  />
  
                  Sales Analytics
  
                </h2>
  
  
                <p>
                  Dealership sales,
                  revenue and performance.
                </p>
  
              </div>
  
            </div>
  
  
            {/* Sales Loading */}
  
            {salesLoading && (
  
              <LoadingSpinner
                message="Loading sales analytics..."
              />
  
            )}
  
  
            {/* Sales Error */}
  
            {!salesLoading &&
              salesError && (
  
                <ErrorState
                  title="Unable to load sales analytics"
                  message={
                    salesError
                  }
                  onRetry={
                    loadSalesReport
                  }
                />
  
              )}
  
  
            {/* Sales Data */}
  
            {!salesLoading &&
              !salesError &&
              salesReport && (
  
                <>
  
                  {/* =========================
                      Summary Cards
                  ========================= */}
  
                  <div className="sales-report-summary-grid">
  
                    {/* Total Sales */}
  
                    <div className="sales-report-summary-card">
  
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
                          {salesReport
                            .summary
                            .totalSales}
                        </strong>
  
                      </div>
  
                    </div>
  
  
                    {/* Revenue */}
  
                    <div className="sales-report-summary-card">
  
                      <div className="sales-summary-icon">
  
                        <Banknote
                          size={20}
                        />
  
                      </div>
  
  
                      <div>
  
                        <span>
                          Total Revenue
                        </span>
  
                        <strong className="sales-report-revenue">
                          {formatCurrency(
                            salesReport
                              .summary
                              .totalRevenue
                          )}
                        </strong>
  
                      </div>
  
                    </div>
  
  
                    {/* Cars Sold */}
  
                    <div className="sales-report-summary-card">
  
                      <div className="sales-summary-icon">
  
                        <CarFront
                          size={20}
                        />
  
                      </div>
  
  
                      <div>
  
                        <span>
                          Cars Sold
                        </span>
  
                        <strong>
                          {salesReport
                            .summary
                            .totalCarsSold}
                        </strong>
  
                      </div>
  
                    </div>
  
  
                    {/* Average Sale */}
  
                    <div className="sales-report-summary-card">
  
                      <div className="sales-summary-icon">
  
                        <TrendingUp
                          size={20}
                        />
  
                      </div>
  
  
                      <div>
  
                        <span>
                          Average Sale Value
                        </span>
  
                        <strong>
                          {formatCurrency(
                            salesReport
                              .summary
                              .averageSaleValue
                          )}
                        </strong>
  
                      </div>
  
                    </div>
  
                  </div>
  
  
                  {/* =========================
                      Sales Report Details
                  ========================= */}
  
                  <div className="sales-report-details-grid">
  
                    {/* Top Selling Cars */}
  
                    <div className="sales-report-panel">
  
                      <div className="sales-report-panel-header">
  
                        <div className="sales-summary-icon">
  
                          <CarFront
                            size={19}
                          />
  
                        </div>
  
  
                        <div>
  
                          <h3>
                            Top Selling Cars
                          </h3>
  
                          <p>
                            Highest selling cars
                            by quantity.
                          </p>
  
                        </div>
  
                      </div>
  
  
                      {salesReport
                        .topSellingCars
                        .length ===
                      0 ? (
  
                        <EmptyState
                          icon={CarFront}
                          title="No Sales Data"
                          message="Top selling cars will appear after sales are recorded."
                        />
  
                      ) : (
  
                        <div className="table-container">
  
                          <table>
  
                            <thead>
  
                              <tr>
  
                                <th>
                                  Car
                                </th>
  
                                <th>
                                  Sold
                                </th>
  
                                <th>
                                  Revenue
                                </th>
  
                              </tr>
  
                            </thead>
  
  
                            <tbody>
  
                              {salesReport
                                .topSellingCars
                                .map(
                                  (
                                    car,
                                    index
                                  ) => (
  
                                    <tr
                                      key={
                                        car.carId
                                      }
                                    >
  
                                      <td>
  
                                        <div className="sales-report-car-name">
  
                                          <span className="sales-report-rank">
                                            {index + 1}
                                          </span>
  
  
                                          <strong>
                                            {car.carName}
                                          </strong>
  
                                        </div>
  
                                      </td>
  
  
                                      <td>
  
                                        <strong>
                                          {car.quantitySold}
                                        </strong>
  
                                      </td>
  
  
                                      <td>
  
                                        <strong className="sales-report-revenue">
                                          {formatCurrency(
                                            car.revenue
                                          )}
                                        </strong>
  
                                      </td>
  
                                    </tr>
  
                                  )
                                )}
  
                            </tbody>
  
                          </table>
  
                        </div>
  
                      )}
  
                    </div>
  
  
                    {/* Payment Methods */}
  
                    <div className="sales-report-panel">
  
                      <div className="sales-report-panel-header">
  
                        <div className="sales-summary-icon">
  
                          <WalletCards
                            size={19}
                          />
  
                        </div>
  
  
                        <div>
  
                          <h3>
                            Payment Methods
                          </h3>
  
                          <p>
                            Sales distribution
                            by payment method.
                          </p>
  
                        </div>
  
                      </div>
  
  
                      {salesReport
                        .salesByPaymentMethod
                        .length ===
                      0 ? (
  
                        <EmptyState
                          icon={WalletCards}
                          title="No Payment Data"
                          message="Payment method analytics will appear after sales are recorded."
                        />
  
                      ) : (
  
                        <div className="table-container">
  
                          <table>
  
                            <thead>
  
                              <tr>
  
                                <th>
                                  Method
                                </th>
  
                                <th>
                                  Sales
                                </th>
  
                                <th>
                                  Revenue
                                </th>
  
                              </tr>
  
                            </thead>
  
  
                            <tbody>
  
                              {salesReport
                                .salesByPaymentMethod
                                .map(
                                  method => (
  
                                    <tr
                                      key={
                                        method.paymentMethod
                                      }
                                    >
  
                                      <td>
  
                                        <span className="sale-payment-badge">
  
                                          {getPaymentMethodName(
                                            method.paymentMethod
                                          )}
  
                                        </span>
  
                                      </td>
  
  
                                      <td>
  
                                        <strong>
                                          {method.salesCount}
                                        </strong>
  
                                      </td>
  
  
                                      <td>
  
                                        <strong className="sales-report-revenue">
  
                                          {formatCurrency(
                                            method.revenue
                                          )}
  
                                        </strong>
  
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
  
                </>
  
              )}
  
          </section>
  
        )}
  
        {/* =========================================
            Purchasing + Profit Analytics
            Admin Only
        ========================================= */}

        {isAdmin && financialLoading && (
          <section className="report-section">
            <LoadingSpinner
              message="Loading purchasing and profit analytics..."
            />
          </section>
        )}


        {isAdmin &&
          !financialLoading &&
          financialError && (
            <section className="report-section">
              <ErrorState
                title="Unable to load financial analytics"
                message={financialError}
                onRetry={loadFinancialReports}
              />
            </section>
          )}


        {/* =========================
            Purchasing Analytics
        ========================= */}

{isAdmin &&
  !financialLoading &&
  !financialError &&
  purchaseReport && (

<section className="report-section purchase-report-section">

  <div className="report-section-header">

    <div>

      <h2>

        <ShoppingCart
          size={21}
        />

        Purchasing Analytics

      </h2>


      <p>
        Procurement spending,
        suppliers, vehicles,
        and received inventory.
      </p>

    </div>


    <button
      type="button"
      className="report-export-button"
      disabled={
        purchaseReport.monthlySpend.length === 0
      }
      onClick={
        handleExportPurchases
      }
    >
      <Download
        size={17}
      />

      Download CSV
    </button>

  </div>


  {/* =========================
      Main Summary
  ========================= */}

  <div className="purchase-report-summary">

    <div className="purchase-report-metric">

      <ShoppingCart
        size={20}
      />

      <span>
        Total Orders
      </span>

      <strong>
        {purchaseReport.summary.totalOrders}
      </strong>

    </div>


    <div className="purchase-report-metric">

      <PackageCheck
        size={20}
      />

      <span>
        Received Orders
      </span>

      <strong>
        {purchaseReport.summary.receivedOrders}
      </strong>

    </div>


    <div className="purchase-report-metric">

      <Package
        size={20}
      />

      <span>
        Units Purchased
      </span>

      <strong>
        {purchaseReport.summary.totalUnitsPurchased}
      </strong>

    </div>


    <div className="purchase-report-metric purchase-report-spend">

      <CircleDollarSign
        size={20}
      />

      <span>
        Actual Purchase Spend
      </span>

      <strong>
        {formatMoney(
          purchaseReport.summary.totalPurchaseSpend
        )}
      </strong>

    </div>

  </div>


  {/* =========================
      Status Breakdown
  ========================= */}

  <div className="purchase-report-status-grid">

    <div>

      <span>
        Draft
      </span>

      <strong>
        {purchaseReport.summary.draftOrders}
      </strong>

    </div>


    <div>

      <span>
        Submitted
      </span>

      <strong>
        {purchaseReport.summary.submittedOrders}
      </strong>

    </div>


    <div>

      <span>
        Received
      </span>

      <strong>
        {purchaseReport.summary.receivedOrders}
      </strong>

    </div>


    <div>

      <span>
        Cancelled
      </span>

      <strong>
        {purchaseReport.summary.cancelledOrders}
      </strong>

    </div>

  </div>


  {/* =========================
      Suppliers + Cars
  ========================= */}

  <div className="purchase-report-rankings">

    {/* Top Suppliers */}

    <div className="purchase-report-ranking-card">

      <div className="purchase-ranking-header">

        <Building2
          size={19}
        />

        <div>

          <strong>
            Top Suppliers
          </strong>

          <span>
            Ranked by received purchase value
          </span>

        </div>

      </div>


      {purchaseReport.topSuppliers.length === 0 ? (

        <p className="purchase-report-empty">
          No received supplier purchases yet.
        </p>

      ) : (

        <div className="purchase-ranking-list">

          {purchaseReport.topSuppliers.map(
            (
              supplier,
              index
            ) => (

              <div
                key={
                  supplier.supplierId
                }
                className="purchase-ranking-item"
              >

                <span className="purchase-ranking-number">
                  {index + 1}
                </span>


                <div className="purchase-ranking-info">

                  <strong>
                    {supplier.supplierName}
                  </strong>

                  <span>
                    {supplier.unitsReceived}
                    {" "}
                    units ·
                    {" "}
                    {supplier.receivedOrders}
                    {" "}
                    received order(s)
                  </span>

                </div>


                <strong className="purchase-ranking-value">

                  {formatMoney(
                    supplier.purchaseValue
                  )}

                </strong>

              </div>

            )
          )}

        </div>

      )}

    </div>


    {/* Top Cars */}

    <div className="purchase-report-ranking-card">

      <div className="purchase-ranking-header">

        <CarFront
          size={19}
        />

        <div>

          <strong>
            Top Purchased Cars
          </strong>

          <span>
            Ranked by units received
          </span>

        </div>

      </div>


      {purchaseReport.topCars.length === 0 ? (

        <p className="purchase-report-empty">
          No received vehicle purchases yet.
        </p>

      ) : (

        <div className="purchase-ranking-list">

          {purchaseReport.topCars.map(
            (
              car,
              index
            ) => (

              <div
                key={
                  car.carId
                }
                className="purchase-ranking-item"
              >

                <span className="purchase-ranking-number">
                  {index + 1}
                </span>


                <div className="purchase-ranking-info">

                  <strong>
                    {car.carName}
                  </strong>

                  <span>
                    {car.unitsPurchased}
                    {" "}
                    units purchased
                  </span>

                </div>


                <strong className="purchase-ranking-value">

                  {formatMoney(
                    car.purchaseValue
                  )}

                </strong>

              </div>

            )
          )}

        </div>

      )}

    </div>

  </div>


  {/* =========================
      Monthly Spend
  ========================= */}

  <div className="purchase-monthly-section">

    <div className="purchase-ranking-header">

      <TrendingUp
        size={19}
      />

      <div>

        <strong>
          Monthly Purchase Spend
        </strong>

        <span>
          Based only on received purchase orders
        </span>

      </div>

    </div>


    {purchaseReport.monthlySpend.length === 0 ? (

      <p className="purchase-report-empty">
        No monthly purchase data available.
      </p>

    ) : (

      <div className="table-container">

        <table>

          <thead>

            <tr>

              <th>
                Month
              </th>

              <th>
                Received Orders
              </th>

              <th>
                Units Received
              </th>

              <th>
                Purchase Spend
              </th>

            </tr>

          </thead>


          <tbody>

            {purchaseReport.monthlySpend.map(
              item => (

                <tr
                  key={
                    `${item.year}-${item.month}`
                  }
                >

                  <td>
                    <strong>
                      {item.monthLabel}
                    </strong>
                  </td>


                  <td>
                    {item.ordersReceived}
                  </td>


                  <td>
                    {item.unitsReceived}
                  </td>


                  <td className="purchase-monthly-value">

                    {formatMoney(
                      item.totalSpend
                    )}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    )}

  </div>

</section>

)}
        {/* =========================
            Profit Analytics
        ========================= */}

        {isAdmin &&
          !financialLoading &&
          !financialError &&
          profitReport && (

          <section className="report-section profit-report-section">

            <div className="report-section-header">
              <div>
                <h2>
                  <BadgeDollarSign size={21} />
                  Profit Analytics
                </h2>

                <p>
                  Revenue, inventory cost, gross profit
                  and accounting coverage.
                </p>
              </div>

              <button
                type="button"
                className="report-export-button"
                disabled={profitReport.monthlyProfit.length === 0}
                onClick={handleExportProfit}
              >
                <Download size={17} />
                Download CSV
              </button>
            </div>


            <div className="profit-summary-grid">
              <div className="profit-summary-card">
                <CircleDollarSign size={20} />
                <span>Total Revenue</span>
                <strong>
                  {formatMoney(profitReport.summary.totalRevenue)}
                </strong>
              </div>

              <div className="profit-summary-card">
                <Package size={20} />
                <span>COGS</span>
                <strong>
                  {formatMoney(profitReport.summary.totalCogs)}
                </strong>
              </div>

              <div className="profit-summary-card profit-main-card">
                <BadgeDollarSign size={20} />
                <span>Gross Profit</span>
                <strong>
                  {formatMoney(profitReport.summary.grossProfit)}
                </strong>
              </div>

              <div className="profit-summary-card">
                <Percent size={20} />
                <span>Gross Margin</span>
                <strong>
                  {formatPercent(profitReport.summary.grossMarginPercent)}
                </strong>
              </div>
            </div>


            <div className="profit-coverage-card">
              <div className="profit-coverage-heading">
                <div>
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Cost Coverage</strong>
                    <span>
                      Portion of revenue backed by known inventory cost.
                    </span>
                  </div>
                </div>

                <strong className="profit-coverage-percent">
                  {formatPercent(profitReport.summary.costCoveragePercent)}
                </strong>
              </div>

              <div className="profit-coverage-track">
                <div
                  className="profit-coverage-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, profitReport.summary.costCoveragePercent)
                    )}%`,
                  }}
                />
              </div>

              <div className="profit-coverage-details">
                <div>
                  <span>Known Cost Revenue</span>
                  <strong>
                    {formatMoney(
                      profitReport.summary.revenueWithKnownCost
                    )}
                  </strong>
                </div>

                <div>
                  <span>Unknown Cost Revenue</span>
                  <strong>
                    {formatMoney(
                      profitReport.summary.revenueWithUnknownCost
                    )}
                  </strong>
                </div>

                <div>
                  <span>Units Sold</span>
                  <strong>{profitReport.summary.totalUnitsSold}</strong>
                </div>

                <div>
                  <span>Units With Known Cost</span>
                  <strong>{profitReport.summary.unitsWithKnownCost}</strong>
                </div>
              </div>
            </div>


            <div className="profit-ranking-card">
              <div className="purchase-ranking-header">
                <CarFront size={19} />
                <div>
                  <strong>Top Profitable Cars</strong>
                  <span>Ranked by gross profit</span>
                </div>
              </div>

              {profitReport.topCars.length === 0 ? (
                <p className="purchase-report-empty">
                  No cost-covered sales available yet.
                </p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Car</th>
                        <th>Units</th>
                        <th>Revenue</th>
                        <th>COGS</th>
                        <th>Gross Profit</th>
                        <th>Margin</th>
                      </tr>
                    </thead>

                    <tbody>
                      {profitReport.topCars.map(car => (
                        <tr key={car.carId}>
                          <td><strong>{car.carName}</strong></td>
                          <td>{car.unitsSold}</td>
                          <td>{formatMoney(car.revenue)}</td>
                          <td>{formatMoney(car.cogs)}</td>
                          <td className="profit-positive-value">
                            {formatMoney(car.grossProfit)}
                          </td>
                          <td>
                            <span className="profit-margin-badge">
                              {formatPercent(car.grossMarginPercent)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>


            <div className="profit-ranking-card">
              <div className="purchase-ranking-header">
                <TrendingUp size={19} />
                <div>
                  <strong>Monthly Profit Performance</strong>
                  <span>
                    Revenue, cost and gross profitability by month
                  </span>
                </div>
              </div>

              {profitReport.monthlyProfit.length === 0 ? (
                <p className="purchase-report-empty">
                  No monthly profit data available.
                </p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Revenue</th>
                        <th>COGS</th>
                        <th>Gross Profit</th>
                        <th>Margin</th>
                        <th>Cost Coverage</th>
                      </tr>
                    </thead>

                    <tbody>
                      {profitReport.monthlyProfit.map(month => (
                        <tr key={`${month.year}-${month.month}`}>
                          <td><strong>{month.monthLabel}</strong></td>
                          <td>{formatMoney(month.revenue)}</td>
                          <td>{formatMoney(month.cogs)}</td>
                          <td className="profit-positive-value">
                            {formatMoney(month.grossProfit)}
                          </td>
                          <td>
                            <span className="profit-margin-badge">
                              {formatPercent(month.grossMarginPercent)}
                            </span>
                          </td>
                          <td>
                            <span className="profit-coverage-badge">
                              {formatPercent(month.costCoveragePercent)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </section>
        )}


        {/* =========================
            Stock Movement
        ========================= */}
  
        <section className="report-section">
  
          <div className="report-section-header">
  
            <div>
  
              <h2>
  
                <TrendingUp
                  size={21}
                />
  
                Stock Movement
  
              </h2>
  
  
              <p>
                Review Stock In and
                Stock Out activity.
              </p>
  
            </div>
  
          </div>
  
  
          {/* Date Filters */}
  
          <div className="report-date-filters">
  
            <label>
  
              Start Date
  
              <input
                type="date"
                value={
                  startDate
                }
                disabled={
                  movementLoading
                }
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
  
            </label>
  
  
            <label>
  
              End Date
  
              <input
                type="date"
                value={
                  endDate
                }
                disabled={
                  movementLoading
                }
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
  
            </label>
  
  
            <div className="report-filter-actions">
  
              <button
                type="button"
                onClick={
                  handleMovementFilter
                }
                disabled={
                  movementLoading
                }
              >
                <Filter
                  size={16}
                />
  
                {movementLoading
                  ? "Loading..."
                  : "Apply Filter"}
              </button>
  
  
              <button
                type="button"
                className="secondary-button"
                onClick={
                  handleClearMovementFilter
                }
                disabled={
                  movementLoading
                }
              >
                <RotateCcw
                  size={16}
                />
  
                Clear
              </button>
  
            </div>
  
          </div>
  
  
          {/* Filter Error */}
  
          {filterError && (
  
            <p className="error">
              {filterError}
            </p>
  
          )}
  
  
          {/* Movement Loading */}
  
          {movementLoading && (
  
            <LoadingSpinner
              message="Loading movement report..."
            />
  
          )}
  
  
          {/* Movement Error */}
  
          {!movementLoading &&
            movementError && (
  
              <ErrorState
                title="Unable to load stock movement"
                message={
                  movementError
                }
                onRetry={
                  handleMovementFilter
                }
              />
  
            )}
  
  
          {/* Movement Data */}
  
          {!movementLoading &&
            !movementError &&
            movement && (
  
              <div className="report-summary-grid">
  
                <div className="report-summary-card">
  
                  <span>
                    Transactions
                  </span>
  
                  <strong>
                    {movement.totalTransactions}
                  </strong>
  
                </div>
  
  
                <div className="report-summary-card">
  
                  <span>
                    Stock In
                  </span>
  
                  <strong className="report-positive-value">
                    {movement.totalStockIn}
                  </strong>
  
                </div>
  
  
                <div className="report-summary-card">
  
                  <span>
                    Stock Out
                  </span>
  
                  <strong className="report-negative-value">
                    {movement.totalStockOut}
                  </strong>
  
                </div>
  
  
                <div className="report-summary-card">
  
                  <span>
                    Net Movement
                  </span>
  
                  <strong>
                    {movement.netMovement}
                  </strong>
  
                </div>
  
              </div>
  
            )}
  
        </section>
  
  
        {/* =========================
            Inventory Report
        ========================= */}
  
        <section className="report-section">
  
          <div className="report-section-header">
  
            <div>
  
              <h2>
  
                <Package
                  size={21}
                />
  
                Inventory Report
  
              </h2>
  
  
              <p>
  
                {inventory.length}
                {" "}
                active vehicles
  
              </p>
  
            </div>
  
  
            <button
              type="button"
              className="report-export-button"
              onClick={
                handleExportInventory
              }
              disabled={
                inventory.length === 0
              }
            >
              <Download
                size={17}
              />
  
              Download CSV
            </button>
  
          </div>
  
  
          {inventory.length === 0 ? (
  
            <EmptyState
              icon={Package}
              title="No Inventory Data"
              message="There are currently no active vehicles available for this report."
            />
  
          ) : (
  
            <div className="table-container">
  
              <table>
  
                <thead>
  
                  <tr>
  
                    <th>
                      ID
                    </th>
  
                    <th>
                      Model
                    </th>
  
                    <th>
                      Brand
                    </th>
  
                    <th>
                      Category
                    </th>
  
                    <th>
                      Supplier
                    </th>
  
                    <th>
                      Year
                    </th>
  
                    <th>
                      Price
                    </th>
  
                    <th>
                      Quantity
                    </th>
  
                    <th>
                      Reorder
                    </th>
  
                    <th>
                      Status
                    </th>
  
                    <th>
                      Value
                    </th>
  
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {inventory.map(
                    car => (
  
                      <tr
                        key={
                          car.carId
                        }
                      >
  
                        <td>
                          {car.carId}
                        </td>
  
  
                        <td>
  
                          <strong className="car-table-model">
                            {car.model}
                          </strong>
  
                        </td>
  
  
                        <td>
                          {car.brandName}
                        </td>
  
  
                        <td>
                          {car.categoryName}
                        </td>
  
  
                        <td>
                          {car.supplierName}
                        </td>
  
  
                        <td>
                          {car.year}
                        </td>
  
  
                        <td>
  
                          {car.price
                            .toLocaleString()}
  
                          {" "}
                          EGP
  
                        </td>
  
  
                        <td>
                          {car.quantity}
                        </td>
  
  
                        <td>
                          {car.reorderLevel}
                        </td>
  
  
                        <td>
  
                          <span
                            className={
                              `status-badge ${
                                car.stockStatus
                                  .toLowerCase() ===
                                "out of stock"
                                  ? "status-out-of-stock"
                                  : car.stockStatus
                                        .toLowerCase() ===
                                      "low stock"
                                    ? "status-low-stock"
                                    : "status-in-stock"
                              }`
                            }
                          >
                            {car.stockStatus}
                          </span>
  
                        </td>
  
  
                        <td>
  
                          <strong className="car-table-price">
  
                            {car.inventoryValue
                              .toLocaleString()}
  
                            {" "}
                            EGP
  
                          </strong>
  
                        </td>
  
                      </tr>
  
                    )
                  )}
  
                </tbody>
  
              </table>
  
            </div>
  
          )}
  
        </section>
  
  
        {/* =========================
            Low Stock Report
        ========================= */}
  
        <section className="report-section">
  
          <div className="report-section-header">
  
            <div>
  
              <h2>
  
                <TriangleAlert
                  size={21}
                />
  
                Low Stock Report
  
              </h2>
  
  
              <p>
  
                {lowStock.length}
                {" "}
                vehicles require
                attention
  
              </p>
  
            </div>
  
  
            <button
              type="button"
              className="report-export-button"
              onClick={
                handleExportLowStock
              }
              disabled={
                lowStock.length === 0
              }
            >
              <Download
                size={17}
              />
  
              Download CSV
            </button>
  
          </div>
  
  
          {lowStock.length === 0 ? (
  
            <EmptyState
              icon={TriangleAlert}
              title="No Low Stock Vehicles"
              message="Inventory levels are currently healthy. No vehicles require restocking."
            />
  
          ) : (
  
            <div className="table-container">
  
              <table>
  
                <thead>
  
                  <tr>
  
                    <th>
                      ID
                    </th>
  
                    <th>
                      Model
                    </th>
  
                    <th>
                      Brand
                    </th>
  
                    <th>
                      Quantity
                    </th>
  
                    <th>
                      Reorder Level
                    </th>
  
                    <th>
                      Needed
                    </th>
  
                    <th>
                      Status
                    </th>
  
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {lowStock.map(
                    car => (
  
                      <tr
                        key={
                          car.carId
                        }
                      >
  
                        <td>
                          {car.carId}
                        </td>
  
  
                        <td>
  
                          <strong className="car-table-model">
                            {car.model}
                          </strong>
  
                        </td>
  
  
                        <td>
                          {car.brandName}
                        </td>
  
  
                        <td>
  
                          <strong>
                            {car.quantity}
                          </strong>
  
                        </td>
  
  
                        <td>
                          {car.reorderLevel}
                        </td>
  
  
                        <td>
  
                          <strong className="report-needed-value">
                            {car.neededQuantity}
                          </strong>
  
                        </td>
  
  
                        <td>
  
                          <span className="status-badge status-low-stock">
                            {car.stockStatus}
                          </span>
  
                        </td>
  
                      </tr>
  
                    )
                  )}
  
                </tbody>
  
              </table>
  
            </div>
  
          )}
  
        </section>
  
      </div>
    );
  }
  
  
  export default ReportsPage;