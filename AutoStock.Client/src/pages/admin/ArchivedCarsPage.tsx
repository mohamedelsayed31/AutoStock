import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Archive,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

import {
  getArchivedCars,
  restoreCar,
} from "../../services/carService";

import {
  getImageUrl,
} from "../../utils/imageUrl";

import {
  getApiErrorMessage,
} from "../../utils/apiError";

import {
  useToast,
} from "../../hooks/useToast";

import LoadingSpinner
  from "../../components/common/LoadingSpinner";

import EmptyState
  from "../../components/common/EmptyState";

import ErrorState
  from "../../components/common/ErrorState";

import ConfirmModal
  from "../../components/common/ConfirmModal";

import type {
  Car,
} from "../../types/car";


function ArchivedCarsPage() {
  const navigate =
    useNavigate();


  const {
    showToast,
  } = useToast();


  /* =========================
     Archived Cars
  ========================= */

  const [
    cars,
    setCars,
  ] =
    useState<Car[]>([]);


  /* =========================
     Loading / Error
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


  /* =========================
     Restore Modal
  ========================= */

  const [
    carToRestore,
    setCarToRestore,
  ] =
    useState<Car | null>(
      null
    );


  const [
    restoring,
    setRestoring,
  ] =
    useState(false);


  /* =========================
     Load Archived Cars
  ========================= */

  const loadArchivedCars =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setLoadError("");


        try {
          const result =
            await getArchivedCars();


          setCars(
            result
          );
        }
        catch (error) {

          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load archived cars."
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


  useEffect(() => {

    void loadArchivedCars();

  }, [loadArchivedCars]);


  /* =========================
     Request Restore
  ========================= */

  const handleRestoreRequest = (
    car: Car
  ) => {

    setCarToRestore(
      car
    );
  };


  /* =========================
     Confirm Restore
  ========================= */

  const handleConfirmRestore =
    async () => {

      if (!carToRestore) {
        return;
      }


      setRestoring(
        true
      );


      try {
        await restoreCar(
          carToRestore.id
        );


        /*
         * Remove restored car
         * immediately from
         * archived list
         */
        setCars(
          currentCars =>
            currentCars.filter(
              currentCar =>
                currentCar.id !==
                carToRestore.id
            )
        );


        showToast(
          `${carToRestore.brandName} ${carToRestore.model} restored successfully.`,
          "success"
        );


        setCarToRestore(
          null
        );
      }
      catch (error) {

        const message =
          getApiErrorMessage(
            error,
            "Failed to restore car."
          );


        showToast(
          message,
          "error"
        );
      }
      finally {

        setRestoring(
          false
        );
      }
    };


  /* =========================
     Cancel Restore
  ========================= */

  const handleCancelRestore =
    () => {

      if (restoring) {
        return;
      }


      setCarToRestore(
        null
      );
    };


  return (
    <div className="archived-cars-page">

      {/* =========================
          Header
      ========================= */}

      <div className="archived-cars-header">

        <div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate(
                "/cars"
              )
            }
          >
            <ArrowLeft
              size={17}
            />

            Back to Cars
          </button>


          <h1>
            Archived Cars
          </h1>


          <p>
            View and restore
            soft-deleted vehicles.
          </p>

        </div>


        <div className="archived-count">

          <div className="archived-count-icon">

            <Archive
              size={21}
            />

          </div>


          <div>

            <span>
              Archived Cars
            </span>

            <strong>
              {cars.length}
            </strong>

          </div>

        </div>

      </div>


      {/* =========================
          Loading
      ========================= */}

      {loading && (

        <LoadingSpinner
          message="Loading archived cars..."
        />

      )}


      {/* =========================
          Load Error
      ========================= */}

      {!loading &&
        loadError && (

          <ErrorState
            title="Unable to load archived cars"
            message={
              loadError
            }
            onRetry={
              loadArchivedCars
            }
          />

        )}


      {/* =========================
          Empty State
      ========================= */}

      {!loading &&
        !loadError &&
        cars.length === 0 && (

          <EmptyState
            icon={Archive}
            title="No Archived Cars"
            message="Cars that you archive will appear here and can be restored at any time."
            actionText="Back to Cars"
            onAction={() =>
              navigate(
                "/cars"
              )
            }
          />

        )}


      {/* =========================
          Archived Cars Table
      ========================= */}

      {!loading &&
        !loadError &&
        cars.length > 0 && (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Image
                  </th>

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
                    Quantity
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {cars.map(
                  car => (

                    <tr
                      key={
                        car.id
                      }
                    >

                      {/* Image */}

                      <td>

                        {car.imagePath ? (

                          <img
                            className="car-table-image"
                            src={
                              getImageUrl(
                                car.imagePath
                              ) || ""
                            }
                            alt={
                              `${car.brandName} ${car.model}`
                            }
                          />

                        ) : (

                          <div className="car-table-image-placeholder">
                            No Image
                          </div>

                        )}

                      </td>


                      {/* ID */}

                      <td>
                        {car.id}
                      </td>


                      {/* Model */}

                      <td>

                        <strong className="car-table-model">
                          {car.model}
                        </strong>

                      </td>


                      {/* Brand */}

                      <td>
                        {car.brandName}
                      </td>


                      {/* Category */}

                      <td>
                        {car.categoryName}
                      </td>


                      {/* Supplier */}

                      <td>
                        {car.supplierName}
                      </td>


                      {/* Year */}

                      <td>
                        {car.year}
                      </td>


                      {/* Quantity */}

                      <td>

                        <strong>
                          {car.quantity}
                        </strong>

                      </td>


                      {/* Status */}

                      <td>

                        <span className="status-badge status-inactive">
                          Archived
                        </span>

                      </td>


                      {/* Action */}

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            className="restore-button"
                            title="Restore car"
                            disabled={
                              restoring
                            }
                            onClick={() =>
                              handleRestoreRequest(
                                car
                              )
                            }
                          >
                            <RotateCcw
                              size={15}
                            />

                            Restore
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


      {/* =========================
          Restore Confirmation
      ========================= */}

      <ConfirmModal
        open={
          carToRestore !== null
        }
        title={
          carToRestore
            ? `Restore ${carToRestore.brandName} ${carToRestore.model}?`
            : "Restore Car?"
        }
        message={
          carToRestore
            ? "This vehicle will be returned to the active Cars Inventory and will become available in the system again."
            : ""
        }
        confirmText="Restore Car"
        cancelText="Cancel"
        variant="restore"
        loading={
          restoring
        }
        onConfirm={
          handleConfirmRestore
        }
        onCancel={
          handleCancelRestore
        }
      />

    </div>
  );
}


export default ArchivedCarsPage;