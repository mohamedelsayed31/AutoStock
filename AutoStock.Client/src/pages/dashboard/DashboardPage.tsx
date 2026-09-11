import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CarFront,
  CircleDollarSign,
  Clock3,
  FileChartColumn,
  History,
  Layers3,
  PackagePlus,
  PackageSearch,
  ScanSearch,
  Tags,
  Truck,
} from "lucide-react";

import {
  getDashboard,
} from "../../services/dashboardService";

import {
  getCars,
} from "../../services/carService";

import {
  getStockHistory,
} from "../../services/stockService";

import {
  getApiErrorMessage,
} from "../../utils/apiError";

import LoadingSpinner
  from "../../components/common/LoadingSpinner";

import ErrorState
  from "../../components/common/ErrorState";

import EmptyState
  from "../../components/common/EmptyState";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  DashboardData,
} from "../../types/dashboard";

import type {
  Car,
} from "../../types/car";

import type {
  StockTransaction,
} from "../../types/stock";


function DashboardPage() {
  const navigate =
    useNavigate();


  const {
    fullName,
    isAdmin,
  } = useAuth();


  /* =========================
     Dashboard Data
  ========================= */

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardData | null>(
      null
    );


  /* =========================
     Recent Transactions
  ========================= */

  const [
    recentTransactions,
    setRecentTransactions,
  ] =
    useState<
      StockTransaction[]
    >([]);


  const [
    recentTransactionsError,
    setRecentTransactionsError,
  ] =
    useState("");


  /* =========================
     Stock Alerts
  ========================= */

  const [
    stockAlerts,
    setStockAlerts,
  ] =
    useState<Car[]>([]);


  const [
    stockAlertsError,
    setStockAlertsError,
  ] =
    useState("");


  /* =========================
     Loading / Error
  ========================= */

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  /* =========================
     Load Dashboard
  ========================= */

  const loadDashboard =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setError("");

        setRecentTransactionsError(
          ""
        );

        setStockAlertsError(
          ""
        );


        const [
          dashboardResult,
          transactionsResult,
          lowStockResult,
          outOfStockResult,
        ] =
          await Promise.allSettled([
            getDashboard(),

            getStockHistory({
              page: 1,
              pageSize: 5,
            }),

            getCars({
              stockStatus:
                "low stock",

              sortBy:
                "quantity",

              sortDirection:
                "asc",

              page: 1,

              pageSize: 5,
            }),

            getCars({
              stockStatus:
                "out of stock",

              sortBy:
                "quantity",

              sortDirection:
                "asc",

              page: 1,

              pageSize: 5,
            }),
          ]);


        /* =========================
           Main Dashboard
        ========================= */

        if (
          dashboardResult.status ===
          "fulfilled"
        ) {

          setDashboard(
            dashboardResult.value
          );
        }
        else {

          setDashboard(
            null
          );


          setError(
            getApiErrorMessage(
              dashboardResult.reason,
              "Failed to load dashboard."
            )
          );
        }


        /* =========================
           Recent Transactions
        ========================= */

        if (
          transactionsResult.status ===
          "fulfilled"
        ) {

          setRecentTransactions(
            transactionsResult
              .value
              .items
          );
        }
        else {

          setRecentTransactions(
            []
          );


          setRecentTransactionsError(
            getApiErrorMessage(
              transactionsResult.reason,
              "Failed to load recent transactions."
            )
          );
        }


        /* =========================
           Stock Alerts
        ========================= */

        const alerts:
          Car[] = [];


        let alertsFailed =
          false;


        if (
          outOfStockResult.status ===
          "fulfilled"
        ) {

          alerts.push(
            ...outOfStockResult
              .value
              .items
          );
        }
        else {

          alertsFailed =
            true;
        }


        if (
          lowStockResult.status ===
          "fulfilled"
        ) {

          alerts.push(
            ...lowStockResult
              .value
              .items
          );
        }
        else {

          alertsFailed =
            true;
        }


        setStockAlerts(
          alerts.slice(
            0,
            6
          )
        );


        if (alertsFailed) {

          setStockAlertsError(
            "Some stock alerts could not be loaded."
          );
        }


        setLoading(
          false
        );
      },
      []
    );


  useEffect(() => {

    void loadDashboard();

  }, [loadDashboard]);


  /* =========================
     Inventory Health
  ========================= */

  const summary =
    useMemo(
      () => {

        if (!dashboard) {
          return null;
        }


        const totalCars =
          dashboard.totalCars ||
          0;


        const lowStockCars =
          dashboard.lowStockCars ||
          0;


        const outOfStockCars =
          dashboard.outOfStockCars ||
          0;


        const healthyCars =
          Math.max(
            totalCars -
              lowStockCars -
              outOfStockCars,
            0
          );


        const healthyPercent =
          totalCars > 0
            ? Math.round(
                (
                  healthyCars /
                  totalCars
                ) *
                100
              )
            : 0;


        const lowStockPercent =
          totalCars > 0
            ? Math.round(
                (
                  lowStockCars /
                  totalCars
                ) *
                100
              )
            : 0;


        const outOfStockPercent =
          totalCars > 0
            ? Math.round(
                (
                  outOfStockCars /
                  totalCars
                ) *
                100
              )
            : 0;


        return {
          healthyCars,
          healthyPercent,
          lowStockPercent,
          outOfStockPercent,
        };
      },
      [dashboard]
    );


  /* =========================
     Transaction Badge
  ========================= */

  const getTransactionClass = (
    type: string
  ) => {

    const normalized =
      type
        .trim()
        .toLowerCase();


    if (
      normalized ===
      "stock in"
    ) {

      return "transaction-in";
    }


    if (
      normalized ===
      "stock out"
    ) {

      return "transaction-out";
    }


    return "";
  };


  /* =========================
     Date Formatter
  ========================= */

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


    return date
      .toLocaleString();
  };


  /* =========================
     Loading
  ========================= */

  if (loading) {

    return (
      <div className="dashboard-page-modern">

        <LoadingSpinner
          message="Loading dashboard..."
        />

      </div>
    );
  }


  /* =========================
     Main Error
  ========================= */

  if (
    error ||
    !dashboard ||
    !summary
  ) {

    return (
      <div className="dashboard-page-modern">

        <ErrorState
          title="Unable to load dashboard"
          message={
            error ||
            "Dashboard data is unavailable."
          }
          onRetry={
            loadDashboard
          }
        />

      </div>
    );
  }


  /* =========================
     Metric Cards
  ========================= */

  const metricCards = [
    {
      title:
        "Total Cars",

      value:
        dashboard
          .totalCars
          .toLocaleString(),

      subtitle:
        "Active vehicles",

      icon:
        CarFront,

      accent:
        "dashboard-accent-orange",
    },

    {
      title:
        "Available Units",

      value:
        dashboard
          .totalStock
          .toLocaleString(),

      subtitle:
        "Current inventory quantity",

      icon:
        Boxes,

      accent:
        "dashboard-accent-blue",
    },

    {
      title:
        "Low Stock Cars",

      value:
        dashboard
          .lowStockCars
          .toLocaleString(),

      subtitle:
        "Need attention soon",

      icon:
        AlertTriangle,

      accent:
        "dashboard-accent-red",
    },

    {
      title:
        "Inventory Value",

      value:
        `${dashboard.totalInventoryValue.toLocaleString()} EGP`,

      subtitle:
        "Estimated stock value",

      icon:
        CircleDollarSign,

      accent:
        "dashboard-accent-green",
    },

    {
      title:
        "Brands",

      value:
        dashboard
          .totalBrands
          .toLocaleString(),

      subtitle:
        "Registered brands",

      icon:
        Tags,

      accent:
        "dashboard-accent-orange",
    },

    {
      title:
        "Categories",

      value:
        dashboard
          .totalCategories
          .toLocaleString(),

      subtitle:
        "Vehicle categories",

      icon:
        Layers3,

      accent:
        "dashboard-accent-blue",
    },

    {
      title:
        "Suppliers",

      value:
        dashboard
          .totalSuppliers
          .toLocaleString(),

      subtitle:
        "Active suppliers",

      icon:
        Truck,

      accent:
        "dashboard-accent-green",
    },

    {
      title:
        "Out of Stock",

      value:
        dashboard
          .outOfStockCars
          .toLocaleString(),

      subtitle:
        "Unavailable right now",

      icon:
        PackageSearch,

      accent:
        "dashboard-accent-red",
    },
  ];


  const heroCarImage =
    "/images/dashboard-hero-car.jpg";


  const sideCarImage =
    "/images/dashboard-side-car.jpg";


  return (
    <div className="dashboard-page-modern">

      {/* =========================
          Header
      ========================= */}

      <div className="dashboard-header-modern">

        <div>

          <h1>
            Dashboard
          </h1>


          <p>
            Welcome back,{" "}
            {fullName ||
              "User"}
          </p>

        </div>


        <div className="dashboard-header-actions">

          <button
            type="button"
            className="dashboard-outline-button"
            onClick={() =>
              navigate(
                "/reports"
              )
            }
          >
            <FileChartColumn
              size={17}
            />

            View Reports
          </button>


          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() =>
              navigate(
                "/cars"
              )
            }
          >
            Go to Cars

            <ArrowRight
              size={17}
            />
          </button>

        </div>

      </div>


      {/* =========================
          Hero
      ========================= */}

      <section
        className="
          dashboard-hero-light
          dashboard-hero-enter
        "
      >

        <div className="dashboard-hero-content">

          <span className="dashboard-hero-badge">

            {isAdmin
              ? "Administrator Overview"
              : "AutoStock Overview"}

          </span>


          <h2>
            Smarter inventory,
            clearer decisions,
            faster management.
          </h2>


          <p>
            Track vehicles, stock
            activity, suppliers,
            categories and inventory
            health from one dashboard.
          </p>


          <div className="dashboard-hero-buttons">

            {isAdmin ? (

              <>

                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={() =>
                    navigate(
                      "/admin/cars/new"
                    )
                  }
                >
                  <PackagePlus
                    size={17}
                  />

                  Add New Car
                </button>


                <button
                  type="button"
                  className="dashboard-outline-button"
                  onClick={() =>
                    navigate(
                      "/stock-history"
                    )
                  }
                >
                  <History
                    size={17}
                  />

                  Stock History
                </button>

              </>

            ) : (

              <>

                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={() =>
                    navigate(
                      "/cars"
                    )
                  }
                >
                  <CarFront
                    size={17}
                  />

                  Browse Inventory
                </button>


                <button
                  type="button"
                  className="dashboard-outline-button"
                  onClick={() =>
                    navigate(
                      "/vin-decoder"
                    )
                  }
                >
                  <ScanSearch
                    size={17}
                  />

                  VIN Decoder
                </button>

              </>

            )}

          </div>

        </div>


        <div className="dashboard-hero-image">

          <img
            src={
              heroCarImage
            }
            alt="AutoStock vehicle inventory"
          />

        </div>

      </section>


      {/* =========================
          Statistics
      ========================= */}

      <div className="dashboard-stats-grid-modern">

        {metricCards.map(
          (
            card,
            index
          ) => {

            const Icon =
              card.icon;


            return (
              <div
                key={
                  card.title
                }
                className="
                  dashboard-stat-card-modern
                  dashboard-stagger-card
                "
                style={{
                  animationDelay:
                    `${150 + index * 80}ms`,
                }}
              >

                <div className="dashboard-stat-card-top">

                  <div
                    className={
                      `dashboard-stat-icon ${card.accent}`
                    }
                  >
                    <Icon
                      size={20}
                    />
                  </div>


                  <span className="dashboard-stat-title">
                    {card.title}
                  </span>

                </div>


                <strong className="dashboard-stat-value">
                  {card.value}
                </strong>


                <p className="dashboard-stat-subtitle">
                  {card.subtitle}
                </p>

              </div>
            );
          }
        )}

      </div>


      {/* =========================
          Live Insights
      ========================= */}

      <div className="dashboard-insights-grid">

        {/* Recent Transactions */}

        <section
          className="
            dashboard-panel-modern
            dashboard-section-enter
            dashboard-delay-1
          "
        >

          <div className="dashboard-panel-header dashboard-insight-header">

            <div>

              <h3>
                Recent Transactions
              </h3>

              <span>
                Latest inventory activity
              </span>

            </div>


            <button
              type="button"
              className="dashboard-panel-link"
              onClick={() =>
                navigate(
                  "/stock-history"
                )
              }
            >
              View All

              <ArrowRight
                size={15}
              />
            </button>

          </div>


          {recentTransactionsError ? (

            <div className="dashboard-compact-state">

              <ErrorState
                title="Unable to load transactions"
                message={
                  recentTransactionsError
                }
                onRetry={
                  loadDashboard
                }
              />

            </div>

          ) :
          recentTransactions.length === 0 ? (

            <div className="dashboard-compact-state">

              <EmptyState
                icon={History}
                title="No Transactions Yet"
                message="Stock transactions will appear here when inventory activity is recorded."
              />

            </div>

          ) : (

            <div className="dashboard-transaction-list">

              {recentTransactions.map(
                transaction => (

                  <div
                    key={
                      transaction.id
                    }
                    className="dashboard-transaction-item"
                  >

                    <div
                      className={
                        `dashboard-transaction-icon ${getTransactionClass(
                          transaction.transactionType
                        )}`
                      }
                    >
                      <History
                        size={17}
                      />
                    </div>


                    <div className="dashboard-transaction-content">

                      <div className="dashboard-transaction-main">

                        <strong>
                          {transaction.carModel}
                        </strong>


                        <span
                          className={
                            `transaction-badge ${getTransactionClass(
                              transaction.transactionType
                            )}`
                          }
                        >
                          {transaction.transactionType}
                        </span>

                      </div>


                      <div className="dashboard-transaction-meta">

                        <span>
                          Qty:{" "}
                          <strong>
                            {transaction.quantity}
                          </strong>
                        </span>


                        <span>
                          <Clock3
                            size={13}
                          />

                          {formatDate(
                            transaction.transactionDate
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* Stock Alerts */}

        <section
          className="
            dashboard-panel-modern
            dashboard-section-enter
            dashboard-delay-2
          "
        >

          <div className="dashboard-panel-header dashboard-insight-header">

            <div>

              <h3>
                Stock Alerts
              </h3>

              <span>
                Vehicles requiring attention
              </span>

            </div>


            <button
              type="button"
              className="dashboard-panel-link"
              onClick={() =>
                navigate(
                  "/cars"
                )
              }
            >
              View Cars

              <ArrowRight
                size={15}
              />
            </button>

          </div>


          {stockAlertsError &&
           stockAlerts.length === 0 ? (

            <div className="dashboard-compact-state">

              <ErrorState
                title="Unable to load alerts"
                message={
                  stockAlertsError
                }
                onRetry={
                  loadDashboard
                }
              />

            </div>

          ) :
          stockAlerts.length === 0 ? (

            <div className="dashboard-compact-state">

              <EmptyState
                icon={Boxes}
                title="Inventory Looks Healthy"
                message="There are currently no low-stock or out-of-stock vehicles."
              />

            </div>

          ) : (

            <div className="dashboard-alert-list">

              {stockAlerts.map(
                car => {

                  const outOfStock =
                    car.stockStatus
                      .toLowerCase() ===
                    "out of stock";


                  return (
                    <button
                      key={
                        car.id
                      }
                      type="button"
                      className="dashboard-alert-item"
                      onClick={() =>
                        navigate(
                          `/cars/${car.id}`
                        )
                      }
                    >

                      <div
                        className={
                          `dashboard-alert-icon ${
                            outOfStock
                              ? "danger"
                              : "warning"
                          }`
                        }
                      >

                        {outOfStock ? (

                          <PackageSearch
                            size={18}
                          />

                        ) : (

                          <AlertTriangle
                            size={18}
                          />

                        )}

                      </div>


                      <div className="dashboard-alert-content">

                        <div className="dashboard-alert-title">

                          <strong>
                            {car.brandName}{" "}
                            {car.model}
                          </strong>


                          <span
                            className={
                              `status-badge ${
                                outOfStock
                                  ? "status-out-of-stock"
                                  : "status-low-stock"
                              }`
                            }
                          >
                            {car.stockStatus}
                          </span>

                        </div>


                        <p>

                          Current quantity:{" "}

                          <strong>
                            {car.quantity}
                          </strong>

                          {" "}· Reorder level:{" "}

                          <strong>
                            {car.reorderLevel}
                          </strong>

                        </p>

                      </div>


                      <ArrowRight
                        size={16}
                      />

                    </button>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>


      {/* =========================
          Bottom Grid
      ========================= */}

      <div className="dashboard-bottom-grid">

        {/* Inventory Health */}

        <section
          className="
            dashboard-panel-modern
            dashboard-section-enter
            dashboard-delay-1
          "
        >

          <div className="dashboard-panel-header">

            <h3>
              Inventory Health
            </h3>

            <span>
              Quick status overview
            </span>

          </div>


          <div className="dashboard-health-list">

            <div className="dashboard-health-item">

              <div className="dashboard-health-row">

                <span>
                  Healthy Stock
                </span>

                <strong>
                  {summary.healthyCars} cars
                </strong>

              </div>


              <div className="dashboard-progress">

                <div
                  className="
                    dashboard-progress-fill
                    healthy
                  "
                  style={{
                    width:
                      `${summary.healthyPercent}%`,
                  }}
                />

              </div>

            </div>


            <div className="dashboard-health-item">

              <div className="dashboard-health-row">

                <span>
                  Low Stock
                </span>

                <strong>
                  {dashboard.lowStockCars} cars
                </strong>

              </div>


              <div className="dashboard-progress">

                <div
                  className="
                    dashboard-progress-fill
                    warning
                  "
                  style={{
                    width:
                      `${summary.lowStockPercent}%`,
                  }}
                />

              </div>

            </div>


            <div className="dashboard-health-item">

              <div className="dashboard-health-row">

                <span>
                  Out of Stock
                </span>

                <strong>
                  {dashboard.outOfStockCars} cars
                </strong>

              </div>


              <div className="dashboard-progress">

                <div
                  className="
                    dashboard-progress-fill
                    danger
                  "
                  style={{
                    width:
                      `${summary.outOfStockPercent}%`,
                  }}
                />

              </div>

            </div>

          </div>


          <div className="dashboard-mini-grid">

            <div className="dashboard-mini-card">

              <span>
                Brands
              </span>

              <strong>
                {dashboard.totalBrands}
              </strong>

            </div>


            <div className="dashboard-mini-card">

              <span>
                Categories
              </span>

              <strong>
                {dashboard.totalCategories}
              </strong>

            </div>


            <div className="dashboard-mini-card">

              <span>
                Suppliers
              </span>

              <strong>
                {dashboard.totalSuppliers}
              </strong>

            </div>


            <div className="dashboard-mini-card">

              <span>
                Total Units
              </span>

              <strong>
                {dashboard.totalStock}
              </strong>

            </div>

          </div>

        </section>


        {/* Quick Actions */}

        <section
          className="
            dashboard-panel-modern
            dashboard-section-enter
            dashboard-delay-2
          "
        >

          <div className="dashboard-panel-header">

            <h3>
              Quick Actions
            </h3>

            <span>
              {isAdmin
                ? "Management shortcuts"
                : "Explore AutoStock features"}
            </span>

          </div>


          <div className="dashboard-actions-list">

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate(
                  "/cars"
                )
              }
            >
              <CarFront
                size={20}
              />

              <div>

                <strong>
                  {isAdmin
                    ? "Manage Cars"
                    : "Browse Cars"}
                </strong>

                <p>
                  View vehicle inventory
                </p>

              </div>

            </button>


            {isAdmin ? (

              <button
                type="button"
                className="dashboard-action-card"
                onClick={() =>
                  navigate(
                    "/admin/cars/new"
                  )
                }
              >
                <PackagePlus
                  size={20}
                />

                <div>

                  <strong>
                    Add New Car
                  </strong>

                  <p>
                    Create inventory record
                  </p>

                </div>

              </button>

            ) : (

              <button
                type="button"
                className="dashboard-action-card"
                onClick={() =>
                  navigate(
                    "/vin-decoder"
                  )
                }
              >
                <ScanSearch
                  size={20}
                />

                <div>

                  <strong>
                    VIN Decoder
                  </strong>

                  <p>
                    Decode vehicle information
                  </p>

                </div>

              </button>

            )}


            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate(
                  "/stock-history"
                )
              }
            >
              <History
                size={20}
              />

              <div>

                <strong>
                  Stock History
                </strong>

                <p>
                  Review stock movements
                </p>

              </div>

            </button>


            {isAdmin ? (

              <button
                type="button"
                className="dashboard-action-card"
                onClick={() =>
                  navigate(
                    "/suppliers"
                  )
                }
              >
                <Truck
                  size={20}
                />

                <div>

                  <strong>
                    Suppliers
                  </strong>

                  <p>
                    Manage supplier records
                  </p>

                </div>

              </button>

            ) : (

              <button
                type="button"
                className="dashboard-action-card"
                onClick={() =>
                  navigate(
                    "/reports"
                  )
                }
              >
                <FileChartColumn
                  size={20}
                />

                <div>

                  <strong>
                    Reports
                  </strong>

                  <p>
                    Explore inventory analytics
                  </p>

                </div>

              </button>

            )}

          </div>

        </section>


        {/* Promo */}

        <section
          className="
            dashboard-promo-card
            dashboard-section-enter
            dashboard-delay-3
          "
        >

          <div className="dashboard-promo-content">

            <span>
              {isAdmin
                ? "AutoStock Management"
                : "AutoStock Explorer"}
            </span>


            <h3>
              {isAdmin
                ? "Keep your inventory organized and always moving."
                : "Explore your vehicle inventory quickly and easily."}
            </h3>


            <p>
              {isAdmin
                ? "Monitor stock, manage vehicles and make better inventory decisions."
                : "Browse vehicles, decode VIN information and review inventory activity."}
            </p>


            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/reports"
                    : "/cars"
                )
              }
            >
              {isAdmin
                ? "Open Reports"
                : "Explore Cars"}

              <ArrowRight
                size={17}
              />
            </button>

          </div>


          <div className="dashboard-promo-image">

            <img
              src={
                sideCarImage
              }
              alt="AutoStock vehicle"
            />

          </div>

        </section>

      </div>

    </div>
  );
}


export default DashboardPage;