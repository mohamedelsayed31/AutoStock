import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Boxes,
  Car as CarIcon,
  History,
  Pencil,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  getCarById,
} from "../../services/carService";

import {
  getImageUrl,
} from "../../utils/imageUrl";

import type {
  Car,
} from "../../types/car";

import LoadingSpinner
  from "../../components/common/LoadingSpinner";

function CarDetailsPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    isAdmin,
  } = useAuth();


  const [
    car,
    setCar,
  ] =
    useState<Car | null>(
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
    useState("");


  useEffect(() => {

    const loadCar =
      async () => {

        if (!id) {
          setError(
            "Invalid car ID."
          );

          setLoading(false);

          return;
        }


        const carId =
          Number(id);


        if (
          Number.isNaN(
            carId
          )
        ) {
          setError(
            "Invalid car ID."
          );

          setLoading(false);

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

          if (
            axios.isAxiosError(
              error
            )
          ) {

            if (
              error.response
                ?.status === 404
            ) {
              setError(
                "Car not found."
              );

              return;
            }


            setError(
              error.response
                ?.data
                ?.detail ||
              "Failed to load car details."
            );

            return;
          }


          setError(
            "Failed to load car details."
          );
        }
        finally {
          setLoading(
            false
          );
        }
      };


    loadCar();

  }, [id]);


  const getStatusClass = (
    status: string
  ) => {

    switch (
      status.toLowerCase()
    ) {

      case "in stock":
        return "status-in-stock";

      case "low stock":
        return "status-low-stock";

      case "out of stock":
        return "status-out-of-stock";

      case "inactive":
        return "status-inactive";

      default:
        return "";
    }
  };


    if (loading) {
    return (
        <LoadingSpinner
        message="Loading car details..."
        />
    );
    }


  if (
    error ||
    !car
  ) {
    return (
      <div>

        <p className="error">
          {error ||
            "Car data is unavailable."}
        </p>


        <button
          onClick={() =>
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


  return (
    <div className="car-details-page">

      {/* Header */}

      <div className="car-details-header">

        <div>

          <button
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
            {car.brandName}{" "}
            {car.model}
          </h1>


          <p>
            Vehicle inventory
            details
          </p>

        </div>


        {/* Actions */}

        <div className="car-details-actions">

          <button
            onClick={() =>
              navigate(
                `/cars/${car.id}/stock-history`
              )
            }
          >
            <History
              size={17}
            />

            Stock History
          </button>


          {isAdmin && (
            <>

              <button
                onClick={() =>
                  navigate(
                    `/admin/cars/${car.id}/edit`
                  )
                }
              >
                <Pencil
                  size={17}
                />

                Edit
              </button>


              <button
                onClick={() =>
                  navigate(
                    `/admin/cars/${car.id}/stock`
                  )
                }
              >
                <Boxes
                  size={17}
                />

                Manage Stock
              </button>

            </>
          )}

        </div>

      </div>


      {/* Car Image */}

      <div className="car-details-image-container">

        {car.imagePath ? (

          <img
            className="car-details-image"
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

          <div className="car-details-no-image">

            <CarIcon
              size={55}
            />

            <span>
              No Image Available
            </span>

          </div>

        )}

      </div>


      {/* Summary */}

      <div className="car-details-summary">

        <div className="car-details-icon">

          <CarIcon
            size={38}
          />

        </div>


        <div>

          <h2>
            {car.brandName}{" "}
            {car.model}
          </h2>


          <span
            className={
              `status-badge ${getStatusClass(
                car.stockStatus
              )}`
            }
          >
            {car.stockStatus}
          </span>

        </div>

      </div>


      {/* Details */}

      <div className="car-details-grid">

        <div className="detail-item">

          <span>
            Car ID
          </span>

          <strong>
            {car.id}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Model
          </span>

          <strong>
            {car.model}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Brand
          </span>

          <strong>
            {car.brandName}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Category
          </span>

          <strong>
            {car.categoryName}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Supplier
          </span>

          <strong>
            {car.supplierName}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Year
          </span>

          <strong>
            {car.year}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Price
          </span>

          <strong>
            {car.price
              .toLocaleString()}{" "}
            EGP
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Quantity
          </span>

          <strong>
            {car.quantity}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Reorder Level
          </span>

          <strong>
            {car.reorderLevel}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Color
          </span>

          <strong>
            {car.color || "-"}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Fuel Type
          </span>

          <strong>
            {car.fuelType || "-"}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Transmission
          </span>

          <strong>
            {car.transmission ||
              "-"}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Inventory Status
          </span>

          <strong>
            {car.stockStatus}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Record Status
          </span>

          <strong>
            {car.isActive
              ? "Active"
              : "Inactive"}
          </strong>

        </div>


        <div className="detail-item">

          <span>
            Created At
          </span>

          <strong>
            {new Date(
              car.createdAt
            ).toLocaleDateString()}
          </strong>

        </div>

      </div>

    </div>
  );
}


export default CarDetailsPage;