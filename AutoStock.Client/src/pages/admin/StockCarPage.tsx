import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Boxes,
  Calculator,
  CircleDollarSign,
  Info,
} from "lucide-react";

import {
  getCarById,
} from "../../services/carService";

import {
  stockIn,
  stockOut,
} from "../../services/stockService";

import {
  setInventoryCostBasis,
} from "../../services/inventoryCostService";

import {
  getApiErrorMessage,
} from "../../utils/apiError";

import {
  validateStockOperation,
} from "../../utils/stockValidation";

import type {
  Car,
} from "../../types/car";

import type {
  InventoryCostBasisResult,
} from "../../types/inventoryCost";

import LoadingSpinner
  from "../../components/common/LoadingSpinner";


type StockOperation =
  "in" | "out";


function StockCarPage() {
  const navigate =
    useNavigate();


  const {
    id,
  } =
    useParams();


  const carId =
    Number(id);


  const [
    car,
    setCar,
  ] =
    useState<Car | null>(
      null
    );


  const [
    operation,
    setOperation,
  ] =
    useState<StockOperation>(
      "in"
    );


  const [
    quantity,
    setQuantity,
  ] =
    useState(1);


  const [
    unitCost,
    setUnitCost,
  ] =
    useState("");


  const [
    costBasisUnitCost,
    setCostBasisUnitCost,
  ] =
    useState("");


  const [
    costBasisReason,
    setCostBasisReason,
  ] =
    useState("");


  const [
    costBasisSubmitting,
    setCostBasisSubmitting,
  ] =
    useState(false);


  const [
    costBasisError,
    setCostBasisError,
  ] =
    useState("");


  const [
    costBasisSuccess,
    setCostBasisSuccess,
  ] =
    useState("");


  const [
    costBasisResult,
    setCostBasisResult,
  ] =
    useState<InventoryCostBasisResult | null>(
      null
    );


  const [
    notes,
    setNotes,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");


  /* =========================================
     Load Car
  ========================================= */

  useEffect(
    () => {
      const loadCar =
        async () => {

          if (
            !carId
            ||
            Number.isNaN(
              carId
            )
          ) {
            setError(
              "Invalid car ID."
            );

            setLoading(
              false
            );

            return;
          }


          try {
            const result =
              await getCarById(
                carId
              );


            setCar(
              result
            );
          }
          catch (error) {
            setError(
              getApiErrorMessage(
                error,
                "Failed to load car."
              )
            );
          }
          finally {
            setLoading(
              false
            );
          }
        };


      void loadCar();
    },
    [carId]
  );


  /* =========================================
     Helpers
  ========================================= */

  const formatCurrency = (
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


  const parsedUnitCost =
    Number(
      unitCost
    );


  const incomingInventoryValue =
    operation === "in"
    &&
    Number.isFinite(
      parsedUnitCost
    )
    &&
    parsedUnitCost > 0
      ? parsedUnitCost
        *
        quantity
      : 0;


  const carAverageUnitCost =
    car?.averageUnitCost
    ?? null;


  const currentAverageUnitCost =
    costBasisResult
      ?.averageUnitCost
    ??
    carAverageUnitCost;


  const currentInventoryValue =
    currentAverageUnitCost !== null
      ? currentAverageUnitCost
        *
        (
          car?.quantity
          ?? 0
        )
      : null;


  const parsedCostBasisUnitCost =
    Number(
      costBasisUnitCost
    );


  const costBasisInventoryValue =
    car
    &&
    Number.isFinite(
      parsedCostBasisUnitCost
    )
    &&
    parsedCostBasisUnitCost > 0
      ? car.quantity
        *
        parsedCostBasisUnitCost
      : 0;


  /* =========================================
     Stock In / Stock Out
  ========================================= */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      setError("");

      setSuccessMessage("");


      if (!car) {
        setError(
          "Car data is unavailable."
        );

        return;
      }


      /* =====================================
         Shared Validation
      ===================================== */

      const validationError =
        validateStockOperation(
          quantity,
          operation,
          car.quantity
        );


      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }


      /* =====================================
         Stock In Cost Validation
      ===================================== */

      if (
        operation === "in"
      ) {
        if (
          unitCost.trim() === ""
        ) {
          setError(
            "Unit cost is required for Stock In."
          );

          return;
        }


        if (
          !Number.isFinite(
            parsedUnitCost
          )
          ||
          parsedUnitCost <= 0
        ) {
          setError(
            "Unit cost must be greater than zero."
          );

          return;
        }


        if (
          parsedUnitCost >
          1_000_000_000
        ) {
          setError(
            "Unit cost cannot exceed 1,000,000,000 EGP."
          );

          return;
        }
      }


      /* =====================================
         Notes Validation
      ===================================== */

      if (
        notes.trim().length >
        250
      ) {
        setError(
          "Notes cannot exceed 250 characters."
        );

        return;
      }


      setSubmitting(
        true
      );


      try {

        /* =================================
           Stock In
        ================================= */

        if (
          operation === "in"
        ) {
          await stockIn(
            carId,
            {
              quantity,

              unitCost:
                parsedUnitCost,

              notes:
                notes.trim()
                ||
                null,
            }
          );
        }

        /* =================================
           Stock Out
        ================================= */

        else {
          await stockOut(
            carId,
            {
              quantity,

              notes:
                notes.trim()
                ||
                null,
            }
          );
        }


        /* =================================
           Reload Car
        ================================= */

        const updatedCar =
          await getCarById(
            carId
          );


        setCar(
          updatedCar
        );


        setQuantity(
          1
        );


        setUnitCost(
          ""
        );


        setNotes(
          ""
        );


        setSuccessMessage(
          operation === "in"
            ? "Stock added and inventory cost updated successfully."
            : "Stock removed successfully."
        );
      }
      catch (error) {
        setError(
          getApiErrorMessage(
            error,

            operation === "in"
              ? "Failed to add stock."
              : "Failed to remove stock."
          )
        );
      }
      finally {
        setSubmitting(
          false
        );
      }
    };


  /* =========================================
     Legacy Inventory Cost Basis
  ========================================= */

  const handleSetCostBasis =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      setCostBasisError("");

      setCostBasisSuccess("");


      if (!car) {
        setCostBasisError(
          "Car data is unavailable."
        );

        return;
      }


      if (
        car.quantity <= 0
      ) {
        setCostBasisError(
          "Cost basis is only required when current stock is greater than zero."
        );

        return;
      }


      if (
        currentAverageUnitCost !== null
      ) {
        setCostBasisError(
          "Inventory cost basis is already known."
        );

        return;
      }


      if (
        costBasisUnitCost.trim() === ""
      ) {
        setCostBasisError(
          "Unit cost is required."
        );

        return;
      }


      if (
        !Number.isFinite(
          parsedCostBasisUnitCost
        )
        ||
        parsedCostBasisUnitCost <= 0
      ) {
        setCostBasisError(
          "Unit cost must be greater than zero."
        );

        return;
      }


      if (
        parsedCostBasisUnitCost >
        1_000_000_000
      ) {
        setCostBasisError(
          "Unit cost cannot exceed 1,000,000,000 EGP."
        );

        return;
      }


      if (
        costBasisReason
          .trim()
          .length >
        250
      ) {
        setCostBasisError(
          "Reason cannot exceed 250 characters."
        );

        return;
      }


      setCostBasisSubmitting(
        true
      );


      try {
        const result =
          await setInventoryCostBasis(
            carId,
            {
              unitCost:
                parsedCostBasisUnitCost,

              reason:
                costBasisReason
                  .trim()
                ||
                null,
            }
          );


        setCostBasisResult(
          result
        );


        const updatedCar =
          await getCarById(
            carId
          );


        setCar(
          updatedCar
        );


        setCostBasisUnitCost(
          ""
        );

        setCostBasisReason(
          ""
        );


        setCostBasisSuccess(
          "Legacy inventory cost basis set successfully. Future sales will now use this cost snapshot."
        );
      }
      catch (error) {
        setCostBasisError(
          getApiErrorMessage(
            error,
            "Failed to set inventory cost basis."
          )
        );
      }
      finally {
        setCostBasisSubmitting(
          false
        );
      }
    };


  /* =========================================
     Loading
  ========================================= */

  if (
    loading
  ) {
    return (
      <LoadingSpinner
        message="Loading stock data..."
      />
    );
  }


  /* =========================================
     Fatal Error
  ========================================= */

  if (
    error
    &&
    !car
  ) {
    return (
      <div className="car-form-page">

        <p className="error">
          {error}
        </p>


        <button
          type="button"
          onClick={
            () =>
              navigate(
                "/cars"
              )
          }
        >
          Back to Cars
        </button>

      </div>
    );
  }


  if (
    !car
  ) {
    return null;
  }


  return (
    <div className="car-form-page">

      {/* =========================================
          Back
      ========================================= */}

      <button
        type="button"
        className="back-button"
        onClick={
          () =>
            navigate(
              `/cars/${car.id}`
            )
        }
      >
        <ArrowLeft
          size={17}
        />

        Back to Car
      </button>


      {/* =========================================
          Header
      ========================================= */}

      <h1>
        Manage Stock
      </h1>


      <p>
        {car.brandName}
        {" "}
        {car.model}
      </p>


      {/* =========================================
          Current Stock
      ========================================= */}

      <div className="stock-current-card">

        <div className="stock-current-icon">

          <Boxes
            size={30}
          />

        </div>


        <div>

          <span>
            Current Quantity
          </span>

          <strong>
            {car.quantity}
          </strong>

        </div>

      </div>


      {/* =========================================
          Accounting Notice
      ========================================= */}

      <div className="stock-cost-notice">

        <Info
          size={18}
        />


        <div>

          <strong>
            Cost-aware inventory
          </strong>

          <span>
            Stock In requires the purchase
            cost per unit so AutoStock can
            keep the inventory cost and
            future profit calculations accurate.
          </span>

        </div>

      </div>


      {/* =========================================
          Legacy Inventory Cost Basis
      ========================================= */}

      <div className="stock-cost-notice">

        <CircleDollarSign
          size={18}
        />


        <div>

          <strong>
            Legacy Inventory Cost Basis
          </strong>

          <span>
            Use this once only when existing
            inventory has an unknown historical
            acquisition cost.
          </span>

        </div>

      </div>


      {currentAverageUnitCost !== null
        ? (

          <div className="stock-cost-preview">

            <Calculator
              size={18}
            />


            <div>

              <span>
                Current Average Unit Cost
              </span>

              <strong>
                {formatCurrency(
                  currentAverageUnitCost
                )}
              </strong>

              <small>
                Current Inventory Value:
                {" "}
                {currentInventoryValue !== null
                  ? formatCurrency(
                      currentInventoryValue
                    )
                  : "Unknown"}
              </small>

            </div>

          </div>

        )
        : car.quantity === 0
          ? (

            <div className="stock-cost-notice">

              <Info
                size={18}
              />


              <div>

                <strong>
                  No opening cost basis required
                </strong>

                <span>
                  Current stock is zero.
                  The next Stock In will establish
                  the inventory cost basis automatically.
                </span>

              </div>

            </div>

          )
          : (

            <form
              className="car-form"
              onSubmit={
                handleSetCostBasis
              }
            >

              <div className="stock-cost-input-section">

                <label>
                  Opening Unit Cost (EGP)

                  <div className="stock-cost-input-wrapper">

                    <CircleDollarSign
                      size={17}
                    />

                    <input
                      type="number"
                      value={
                        costBasisUnitCost
                      }
                      min="0.01"
                      max="1000000000"
                      step="0.01"
                      placeholder="e.g. 6200000"
                      onChange={
                        event =>
                          setCostBasisUnitCost(
                            event.target.value
                          )
                      }
                      disabled={
                        costBasisSubmitting
                        ||
                        submitting
                      }
                      required
                    />

                  </div>

                </label>


                <small>
                  Enter the verified acquisition
                  cost per unit for the current
                  legacy stock. This does not
                  change the quantity.
                </small>


                {costBasisInventoryValue > 0
                  && (

                    <div className="stock-cost-preview">

                      <Calculator
                        size={18}
                      />


                      <div>

                        <span>
                          Opening Inventory Value
                        </span>

                        <strong>
                          {formatCurrency(
                            costBasisInventoryValue
                          )}
                        </strong>

                        <small>
                          {car.quantity}
                          {" "}
                          ×
                          {" "}
                          {formatCurrency(
                            parsedCostBasisUnitCost
                          )}
                        </small>

                      </div>

                    </div>

                  )}

              </div>


              <label>
                Reason

                <textarea
                  value={
                    costBasisReason
                  }
                  maxLength={250}
                  rows={3}
                  placeholder="e.g. Opening inventory reconciliation"
                  onChange={
                    event =>
                      setCostBasisReason(
                        event.target.value
                      )
                  }
                  disabled={
                    costBasisSubmitting
                    ||
                    submitting
                  }
                />
              </label>


              <small>
                {costBasisReason.length}/250
                {" "}
                characters
              </small>


              <div className="stock-cost-notice">

                <Info
                  size={18}
                />


                <div>

                  <strong>
                    One-time accounting action
                  </strong>

                  <span>
                    After the cost basis becomes
                    known, AutoStock will not allow
                    this screen to overwrite it.
                  </span>

                </div>

              </div>


              {costBasisError
                && (

                  <p className="error">
                    {costBasisError}
                  </p>

                )}


              {costBasisSuccess
                && (

                  <p className="success">
                    {costBasisSuccess}
                  </p>

                )}


              <div className="form-actions">

                <button
                  type="submit"
                  disabled={
                    costBasisSubmitting
                    ||
                    submitting
                  }
                >
                  {costBasisSubmitting
                    ? "Saving Cost Basis..."
                    : "Set Cost Basis"}
                </button>

              </div>

            </form>

          )}


      {/* =========================================
          Stock Operation Form
      ========================================= */}

      <form
        className="car-form"
        onSubmit={
          handleSubmit
        }
      >

        {/* =====================================
            Operation
        ===================================== */}

        <label>
          Operation

          <select
            value={
              operation
            }
            onChange={
              event => {

                const newOperation =
                  event.target
                    .value as StockOperation;


                setOperation(
                  newOperation
                );


                /*
                 * Stock Out does not
                 * need cost input.
                 */
                if (
                  newOperation ===
                  "out"
                ) {
                  setUnitCost(
                    ""
                  );
                }


                setError(
                  ""
                );

                setSuccessMessage(
                  ""
                );
              }
            }
            disabled={
              submitting
            }
          >

            <option value="in">
              Stock In
            </option>

            <option value="out">
              Stock Out
            </option>

          </select>
        </label>


        {/* =====================================
            Quantity
        ===================================== */}

        <label>
          Quantity

          <input
            type="number"
            value={
              quantity
            }
            min={1}
            max={10000}
            step={1}
            onChange={
              event =>
                setQuantity(
                  Number(
                    event.target.value
                  )
                )
            }
            disabled={
              submitting
            }
            required
          />
        </label>


        {operation === "out"
          && (

            <small>
              Maximum available:
              {" "}
              {car.quantity}
            </small>

          )}


        {/* =====================================
            Unit Cost
            Stock In Only
        ===================================== */}

        {operation === "in"
          && (

            <div className="stock-cost-input-section">

              <label>
                Unit Cost (EGP)

                <div className="stock-cost-input-wrapper">

                  <CircleDollarSign
                    size={17}
                  />

                  <input
                    type="number"
                    value={
                      unitCost
                    }
                    min="0.01"
                    max="1000000000"
                    step="0.01"
                    placeholder="e.g. 850000"
                    onChange={
                      event =>
                        setUnitCost(
                          event.target.value
                        )
                    }
                    disabled={
                      submitting
                    }
                    required
                  />

                </div>

              </label>


              <small>
                Enter the actual acquisition
                cost of one incoming unit.
              </small>


              {/* =================================
                  Incoming Cost Preview
              ================================= */}

              {incomingInventoryValue >
                0
                && (

                  <div className="stock-cost-preview">

                    <Calculator
                      size={18}
                    />


                    <div>

                      <span>
                        Incoming Inventory Cost
                      </span>

                      <strong>
                        {formatCurrency(
                          incomingInventoryValue
                        )}
                      </strong>

                      <small>
                        {quantity}
                        {" "}
                        ×
                        {" "}
                        {formatCurrency(
                          parsedUnitCost
                        )}
                      </small>

                    </div>

                  </div>

                )}

            </div>

          )}


        {/* =====================================
            Notes
        ===================================== */}

        <label>
          Notes

          <textarea
            value={
              notes
            }
            maxLength={250}
            rows={4}
            placeholder="Optional notes..."
            onChange={
              event =>
                setNotes(
                  event.target.value
                )
            }
            disabled={
              submitting
            }
          />
        </label>


        <small>
          {notes.length}/250
          {" "}
          characters
        </small>


        {/* =====================================
            Error
        ===================================== */}

        {error
          && (

            <p className="error">
              {error}
            </p>

          )}


        {/* =====================================
            Success
        ===================================== */}

        {successMessage
          && (

            <p className="success">
              {successMessage}
            </p>

          )}


        {/* =====================================
            Actions
        ===================================== */}

        <div className="form-actions">

          <button
            type="submit"
            disabled={
              submitting
              ||
              costBasisSubmitting
              ||
              (
                operation === "out"
                &&
                car.quantity === 0
              )
            }
          >

            {submitting
              ? "Processing..."
              : operation === "in"
                ? "Add Stock"
                : "Remove Stock"}

          </button>


          <button
            type="button"
            className="secondary-button"
            disabled={
              submitting
              ||
              costBasisSubmitting
            }
            onClick={
              () =>
                navigate(
                  `/cars/${car.id}`
                )
            }
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}


export default StockCarPage;