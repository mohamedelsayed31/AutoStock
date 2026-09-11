import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Filter,
  History,
  RotateCcw,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

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

import EmptyState
  from "../../components/common/EmptyState";

import ErrorState
  from "../../components/common/ErrorState";

import type {
  Car,
} from "../../types/car";

import type {
  StockTransaction,
} from "../../types/stock";


interface AppliedFilters {
  carId: string;
  transactionType: string;
  startDate: string;
  endDate: string;
}


function StockHistoryPage() {

  /* =========================
     Transactions
  ========================= */

  const [
    transactions,
    setTransactions,
  ] =
    useState<
      StockTransaction[]
    >([]);


  /* =========================
     Cars
  ========================= */

  const [
    cars,
    setCars,
  ] =
    useState<Car[]>([]);


  /* =========================
     Filter Inputs
  ========================= */

  const [
    carId,
    setCarId,
  ] =
    useState("");


  const [
    transactionType,
    setTransactionType,
  ] =
    useState("");


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
     Applied Filters
  ========================= */

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<AppliedFilters>({
      carId: "",
      transactionType: "",
      startDate: "",
      endDate: "",
    });


  /* =========================
     Pagination
  ========================= */

  const [
    page,
    setPage,
  ] =
    useState(1);


  const [
    pageSize,
    setPageSize,
  ] =
    useState(10);


  const [
    totalPages,
    setTotalPages,
  ] =
    useState(1);


  const [
    totalCount,
    setTotalCount,
  ] =
    useState(0);


  /* =========================
     Loading / Errors
  ========================= */

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


  const [
    filterError,
    setFilterError,
  ] =
    useState("");


  const [
    carsError,
    setCarsError,
  ] =
    useState("");


  /* =========================
     Load Transactions
  ========================= */

  const loadTransactions =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setLoadError("");


        try {

          const result =
            await getStockHistory({

              carId:
                appliedFilters.carId
                  ? Number(
                      appliedFilters.carId
                    )
                  : undefined,

              transactionType:
                appliedFilters.transactionType ||
                undefined,

              startDate:
                appliedFilters.startDate ||
                undefined,

              endDate:
                appliedFilters.endDate ||
                undefined,

              page,

              pageSize,
            });


          setTransactions(
            result.items
          );


          setTotalCount(
            result.totalCount
          );


          setTotalPages(
            result.totalPages
          );
        }
        catch (error) {

          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load stock history."
            )
          );
        }
        finally {

          setLoading(
            false
          );
        }
      },
      [
        appliedFilters,
        page,
        pageSize,
      ]
    );


  /* =========================
     Load Cars
  ========================= */

  useEffect(() => {

    const loadCars =
      async () => {

        setCarsError("");


        try {

          const result =
            await getCars({

              page: 1,

              pageSize: 100,

              sortBy:
                "model",

              sortDirection:
                "asc",
            });


          setCars(
            result.items
          );
        }
        catch (error) {

          setCarsError(
            getApiErrorMessage(
              error,
              "Failed to load cars for filtering."
            )
          );
        }
      };


    void loadCars();

  }, []);


  /* =========================
     Load History
  ========================= */

  useEffect(() => {

    void loadTransactions();

  }, [loadTransactions]);


  /* =========================
     Apply Filters
  ========================= */

  const handleApplyFilters =
    () => {

      setFilterError("");


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


      setPage(
        1
      );


      setAppliedFilters({
        carId,
        transactionType,
        startDate,
        endDate,
      });
    };


  /* =========================
     Clear Filters
  ========================= */

  const handleClearFilters =
    () => {

      setCarId("");

      setTransactionType("");

      setStartDate("");

      setEndDate("");

      setFilterError("");

      setPage(
        1
      );


      setAppliedFilters({
        carId: "",
        transactionType: "",
        startDate: "",
        endDate: "",
      });
    };


  /* =========================
     Active Filters
  ========================= */

  const hasActiveFilters =
    Boolean(
      appliedFilters.carId ||
      appliedFilters.transactionType ||
      appliedFilters.startDate ||
      appliedFilters.endDate
    );


  /* =========================
     Transaction Badge
  ========================= */

  const getTransactionClass = (
    type: string
  ) => {

    const normalizedType =
      type
        .trim()
        .toLowerCase();


    if (
      normalizedType ===
      "stock in"
    ) {

      return "transaction-in";
    }


    if (
      normalizedType ===
      "stock out"
    ) {

      return "transaction-out";
    }


    return "";
  };


  /* =========================
     Format Date
  ========================= */

  const formatTransactionDate = (
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
     Format Accounting Value
  ========================= */

  const formatMoney = (
    value: number | null
  ) => {

    if (
      value === null ||
      value === undefined
    ) {

      return "Unknown";
    }


    return new Intl.NumberFormat(
      "en-EG",
      {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 2,
      }
    ).format(value);
  };


  /* =========================
     Source Label
  ========================= */

  const getSourceLabel = (
    sourceType: string | null,
    sourceId: number | null
  ) => {

    if (
      !sourceType
    ) {

      return "Legacy / Unknown";
    }


    const normalizedType =
      sourceType
        .trim()
        .toLowerCase();


    if (
      normalizedType ===
      "manual"
    ) {

      return "Manual";
    }


    if (
      normalizedType ===
      "sale"
    ) {

      return sourceId
        ? `Sale #${sourceId}`
        : "Sale";
    }


    if (
      normalizedType ===
      "purchaseorder"
    ) {

      return sourceId
        ? `Purchase Order #${sourceId}`
        : "Purchase Order";
    }


    return sourceId
      ? `${sourceType} #${sourceId}`
      : sourceType;
  };


  /* =========================
     Source Details Route
  ========================= */

  const getSourceRoute = (
    sourceType: string | null,
    sourceId: number | null
  ) => {

    if (
      !sourceType
      ||
      !sourceId
    ) {

      return null;
    }


    const normalizedType =
      sourceType
        .trim()
        .toLowerCase();


    if (
      normalizedType ===
      "sale"
    ) {

      return `/sales/${sourceId}`;
    }


    if (
      normalizedType ===
      "purchaseorder"
    ) {

      return `/admin/purchase-orders/${sourceId}`;
    }


    return null;
  };


  return (
    <div className="stock-history-page">

      {/* =========================
          Header
      ========================= */}

      <div className="stock-history-header">

        <div>

          <h1>
            Stock History
          </h1>


          <p>
            View and filter all
            inventory transactions
          </p>

        </div>


        <div className="history-summary">

          <History
            size={22}
          />


          <div>

            <span>
              Total Transactions
            </span>


            <strong>
              {totalCount}
            </strong>

          </div>

        </div>

      </div>


      {/* =========================
          Filters
      ========================= */}

      <div className="stock-history-filters">

        {/* Car */}

        <div className="stock-filter-field">

          <label>
            Car
          </label>


          <select
            value={carId}
            disabled={loading}
            onChange={(event) =>
              setCarId(
                event.target.value
              )
            }
          >

            <option value="">
              All Cars
            </option>


            {cars.map(
              car => (

                <option
                  key={car.id}
                  value={car.id}
                >
                  {car.brandName}{" "}
                  {car.model}
                </option>

              )
            )}

          </select>

        </div>


        {/* Transaction Type */}

        <div className="stock-filter-field">

          <label>
            Transaction Type
          </label>


          <select
            value={
              transactionType
            }
            disabled={loading}
            onChange={(event) =>
              setTransactionType(
                event.target.value
              )
            }
          >

            <option value="">
              All Types
            </option>


            <option value="Stock In">
              Stock In
            </option>


            <option value="Stock Out">
              Stock Out
            </option>

          </select>

        </div>


        {/* Start Date */}

        <div className="stock-filter-field">

          <label>
            Start Date
          </label>


          <input
            type="date"
            value={
              startDate
            }
            disabled={loading}
            onChange={(event) =>
              setStartDate(
                event.target.value
              )
            }
          />

        </div>


        {/* End Date */}

        <div className="stock-filter-field">

          <label>
            End Date
          </label>


          <input
            type="date"
            value={
              endDate
            }
            disabled={loading}
            onChange={(event) =>
              setEndDate(
                event.target.value
              )
            }
          />

        </div>


        {/* Actions */}

        <div className="stock-filter-actions">

          <button
            type="button"
            onClick={
              handleApplyFilters
            }
            disabled={loading}
          >
            <Filter
              size={17}
            />

            Apply Filters
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={
              handleClearFilters
            }
            disabled={
              loading
            }
          >
            <RotateCcw
              size={17}
            />

            Clear
          </button>

        </div>

      </div>


      {/* =========================
          Filter Validation Error
      ========================= */}

      {filterError && (

        <p className="error">
          {filterError}
        </p>

      )}


      {/* =========================
          Cars Filter Error
      ========================= */}

      {carsError && (

        <p className="error">
          {carsError}
        </p>

      )}


      {/* =========================
          Loading
      ========================= */}

      {loading && (

        <LoadingSpinner
          message="Loading stock history..."
        />

      )}


      {/* =========================
          Load Error
      ========================= */}

      {!loading &&
        loadError && (

          <ErrorState
            title="Unable to load stock history"
            message={
              loadError
            }
            onRetry={
              loadTransactions
            }
          />

        )}


      {/* =========================
          Empty State
      ========================= */}

      {!loading &&
        !loadError &&
        transactions.length === 0 && (

          <EmptyState
            icon={History}
            title="No Transactions Found"
            message={
              hasActiveFilters
                ? "No stock transactions match the currently selected filters."
                : "There are currently no stock transactions recorded in the system."
            }
            actionText={
              hasActiveFilters
                ? "Clear Filters"
                : "Refresh"
            }
            onAction={
              hasActiveFilters
                ? handleClearFilters
                : loadTransactions
            }
          />

        )}


      {/* =========================
          Transactions Table
      ========================= */}

      {!loading &&
        !loadError &&
        transactions.length > 0 && (

          <>

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Car
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Unit Cost
                    </th>

                    <th>
                      Inventory Value
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Notes
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {transactions.map(
                    transaction => (

                      <tr
                        key={
                          transaction.id
                        }
                      >

                        {/* ID */}

                        <td>
                          {transaction.id}
                        </td>


                        {/* Car */}

                        <td>

                          <strong className="car-table-model">
                            {transaction.carModel}
                          </strong>

                        </td>


                        {/* Type */}

                        <td>

                          <span
                            className={
                              `transaction-badge ${getTransactionClass(
                                transaction.transactionType
                              )}`
                            }
                          >
                            {transaction.transactionType}
                          </span>

                        </td>


                        {/* Quantity */}

                        <td>

                          <strong>
                            {transaction.quantity}
                          </strong>

                        </td>


                        {/* Unit Cost */}

                        <td>

                          {formatMoney(
                            transaction.unitCost
                          )}

                        </td>


                        {/* Inventory Value */}

                        <td>

                          <strong>
                            {formatMoney(
                              transaction.inventoryValue
                            )}
                          </strong>

                        </td>


                        {/* Source */}

                        <td>

                          {(() => {

                            const sourceLabel =
                              getSourceLabel(
                                transaction.sourceType,
                                transaction.sourceId
                              );


                            const sourceRoute =
                              getSourceRoute(
                                transaction.sourceType,
                                transaction.sourceId
                              );


                            if (
                              sourceRoute
                            ) {

                              return (
                                <Link
                                  to={
                                    sourceRoute
                                  }
                                  className="stock-source-link"
                                  title={`Open ${sourceLabel}`}
                                >
                                  {sourceLabel}
                                </Link>
                              );
                            }


                            return (
                              <span className="stock-source-text">
                                {sourceLabel}
                              </span>
                            );
                          })()}

                        </td>


                        {/* Date */}

                        <td>

                          {formatTransactionDate(
                            transaction.transactionDate
                          )}

                        </td>


                        {/* Notes */}

                        <td>

                          {transaction.notes ||
                            "-"}

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

            <div className="stock-pagination">

              <div className="stock-page-size">

                <label>
                  Rows per page
                </label>


                <select
                  value={
                    pageSize
                  }
                  disabled={loading}
                  onChange={(event) => {

                    setPageSize(
                      Number(
                        event.target.value
                      )
                    );

                    setPage(
                      1
                    );
                  }}
                >

                  <option value={5}>
                    5
                  </option>

                  <option value={10}>
                    10
                  </option>

                  <option value={20}>
                    20
                  </option>

                  <option value={50}>
                    50
                  </option>

                </select>

              </div>


              <div className="pagination">

                <button
                  type="button"
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      current =>
                        current - 1
                    )
                  }
                >
                  Previous
                </button>


                <span>

                  Page{" "}

                  <strong>
                    {page}
                  </strong>

                  {" "}of{" "}

                  <strong>
                    {totalPages || 1}
                  </strong>

                </span>


                <button
                  type="button"
                  disabled={
                    page >= totalPages ||
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
                </button>

              </div>

            </div>

          </>

        )}

    </div>
  );
}


export default StockHistoryPage;