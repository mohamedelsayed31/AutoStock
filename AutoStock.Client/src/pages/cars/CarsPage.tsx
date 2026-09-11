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
  Boxes,
  CarFront,
  Eye,
  Pencil,
  Plus,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  deleteCar,
  getCars,
} from "../../services/carService";

import {
  getBrands,
  getCategories,
  getSuppliers,
} from "../../services/referenceDataService";

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

import ConfirmModal
  from "../../components/common/ConfirmModal";

import type {
  Car,
} from "../../types/car";

import type {
  LookupItem,
} from "../../types/referenceData";

import EmptyState
  from "../../components/common/EmptyState";

import ErrorState
  from "../../components/common/ErrorState";

function CarsPage() {
  const navigate =
    useNavigate();


  const {
    isAdmin,
  } = useAuth();


  const {
    showToast,
  } = useToast();


  /* =========================
     Reference Data
  ========================= */

  const [
    brands,
    setBrands,
  ] =
    useState<LookupItem[]>([]);


  const [
    categories,
    setCategories,
  ] =
    useState<LookupItem[]>([]);


  const [
    suppliers,
    setSuppliers,
  ] =
    useState<LookupItem[]>([]);


  /* =========================
     Cars
  ========================= */

  const [
    cars,
    setCars,
  ] =
    useState<Car[]>([]);


  /* =========================
     Filters
  ========================= */

  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    brandId,
    setBrandId,
  ] =
    useState("");


  const [
    categoryId,
    setCategoryId,
  ] =
    useState("");


  const [
    supplierId,
    setSupplierId,
  ] =
    useState("");


  const [
    year,
    setYear,
  ] =
    useState("");


  const [
    minPrice,
    setMinPrice,
  ] =
    useState("");


  const [
    maxPrice,
    setMaxPrice,
  ] =
    useState("");


  const [
    stockStatus,
    setStockStatus,
  ] =
    useState("");


  const [
    sortBy,
    setSortBy,
  ] =
    useState("id");


  const [
    sortDirection,
    setSortDirection,
  ] =
    useState("asc");


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
  ] =
    useState(5);


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
     Archive Modal
  ========================= */

  const [
    carToArchive,
    setCarToArchive,
  ] =
    useState<Car | null>(
      null
    );


  const [
    archiving,
    setArchiving,
  ] =
    useState(false);


  /* =========================
     Load Cars
  ========================= */

  const loadCars =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setError("");


        try {
          const result =
            await getCars({

              search:
                search ||
                undefined,

              brandId:
                brandId
                  ? Number(
                      brandId
                    )
                  : undefined,

              categoryId:
                categoryId
                  ? Number(
                      categoryId
                    )
                  : undefined,

              supplierId:
                supplierId
                  ? Number(
                      supplierId
                    )
                  : undefined,

              year:
                year
                  ? Number(
                      year
                    )
                  : undefined,

              minPrice:
                minPrice
                  ? Number(
                      minPrice
                    )
                  : undefined,

              maxPrice:
                maxPrice
                  ? Number(
                      maxPrice
                    )
                  : undefined,

              stockStatus:
                stockStatus ||
                undefined,

              sortBy,

              sortDirection,

              page,

              pageSize,
            });


          setCars(
            result.items
          );


          setTotalPages(
            result.totalPages
          );


          setTotalCount(
            result.totalCount
          );
        }
        catch (error) {

          setError(
            getApiErrorMessage(
              error,
              "Failed to load cars."
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
        search,
        brandId,
        categoryId,
        supplierId,
        year,
        minPrice,
        maxPrice,
        stockStatus,
        sortBy,
        sortDirection,
        page,
        pageSize,
      ]
    );


  /* =========================
     Load Reference Data
  ========================= */

  useEffect(() => {

    const loadReferenceData =
      async () => {

        try {
          const [
            brandsData,
            categoriesData,
            suppliersData,
          ] =
            await Promise.all([
              getBrands(),
              getCategories(),
              getSuppliers(),
            ]);


          setBrands(
            brandsData
          );


          setCategories(
            categoriesData
          );


          setSuppliers(
            suppliersData
          );
        }
        catch (error) {

          setError(
            getApiErrorMessage(
              error,
              "Failed to load filter data."
            )
          );
        }
      };


    loadReferenceData();

  }, []);


  /* =========================
     Reload Cars
  ========================= */

  useEffect(() => {

    loadCars();

  }, [loadCars]);


  /* =========================
     Request Archive
  ========================= */

  const handleArchiveRequest = (
    car: Car
  ) => {

    setCarToArchive(
      car
    );
  };


  /* =========================
     Confirm Archive
  ========================= */

  const handleConfirmArchive =
    async () => {

      if (!carToArchive) {
        return;
      }


      setArchiving(
        true
      );


      try {
        await deleteCar(
          carToArchive.id
        );


        showToast(
          `${carToArchive.brandName} ${carToArchive.model} archived successfully.`,
          "success"
        );


        setCarToArchive(
          null
        );


        /*
         * If the archived car
         * was the last item
         * on this page,
         * return to previous page.
         */
        if (
          cars.length === 1 &&
          page > 1
        ) {

          setPage(
            current =>
              current - 1
          );

          return;
        }


        await loadCars();
      }
      catch (error) {

        const message =
          getApiErrorMessage(
            error,
            "Failed to archive car."
          );


        showToast(
          message,
          "error"
        );
      }
      finally {

        setArchiving(
          false
        );
      }
    };


  /* =========================
     Cancel Archive
  ========================= */

  const handleCancelArchive =
    () => {

      if (archiving) {
        return;
      }


      setCarToArchive(
        null
      );
    };


  /* =========================
     Stock Status CSS
  ========================= */

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


  /* =========================
     Clear Filters
  ========================= */

  const handleClearFilters =
    () => {

      setSearch("");

      setBrandId("");

      setCategoryId("");

      setSupplierId("");

      setYear("");

      setMinPrice("");

      setMaxPrice("");

      setStockStatus("");

      setSortBy(
        "id"
      );

      setSortDirection(
        "asc"
      );

      setPage(1);
    };


  return (
    <div className="cars-page">

      {/* =========================
          Header
      ========================= */}

      <div className="cars-header">

        <div>

          <h1>
            Cars Inventory
          </h1>

          <p>
            Manage and monitor
            vehicle inventory
          </p>

        </div>


        {isAdmin && (

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/cars/new"
              )
            }
          >
            <Plus
              size={17}
            />

            Add Car
          </button>

        )}

      </div>


      {/* =========================
          Filters
      ========================= */}

      <div className="filters">

        <input
          type="text"
          placeholder="Search model, brand..."
          value={search}
          onChange={(event) => {

            setSearch(
              event.target.value
            );

            setPage(1);
          }}
        />


        <select
          value={brandId}
          onChange={(event) => {

            setBrandId(
              event.target.value
            );

            setPage(1);
          }}
        >

          <option value="">
            All Brands
          </option>


          {brands.map(
            brand => (

              <option
                key={brand.id}
                value={brand.id}
              >
                {brand.name}
              </option>

            )
          )}

        </select>


        <select
          value={categoryId}
          onChange={(event) => {

            setCategoryId(
              event.target.value
            );

            setPage(1);
          }}
        >

          <option value="">
            All Categories
          </option>


          {categories.map(
            category => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            )
          )}

        </select>


        <select
          value={supplierId}
          onChange={(event) => {

            setSupplierId(
              event.target.value
            );

            setPage(1);
          }}
        >

          <option value="">
            All Suppliers
          </option>


          {suppliers.map(
            supplier => (

              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>

            )
          )}

        </select>


        <input
          type="number"
          placeholder="Year"
          min={1900}
          max={
            new Date()
              .getFullYear() + 1
          }
          value={year}
          onChange={(event) => {

            setYear(
              event.target.value
            );

            setPage(1);
          }}
        />


        <input
          type="number"
          placeholder="Min Price"
          min={0}
          value={minPrice}
          onChange={(event) => {

            setMinPrice(
              event.target.value
            );

            setPage(1);
          }}
        />


        <input
          type="number"
          placeholder="Max Price"
          min={0}
          value={maxPrice}
          onChange={(event) => {

            setMaxPrice(
              event.target.value
            );

            setPage(1);
          }}
        />


        <select
          value={stockStatus}
          onChange={(event) => {

            setStockStatus(
              event.target.value
            );

            setPage(1);
          }}
        >

          <option value="">
            All Stock Status
          </option>

          <option value="in stock">
            In Stock
          </option>

          <option value="low stock">
            Low Stock
          </option>

          <option value="out of stock">
            Out of Stock
          </option>

        </select>


        <select
          value={sortBy}
          onChange={(event) => {

            setSortBy(
              event.target.value
            );

            setPage(1);
          }}
        >

          <option value="id">
            ID
          </option>

          <option value="model">
            Model
          </option>

          <option value="year">
            Year
          </option>

          <option value="price">
            Price
          </option>

          <option value="quantity">
            Quantity
          </option>

          <option value="createdat">
            Created Date
          </option>

        </select>


        <select
          value={
            sortDirection
          }
          onChange={(event) => {

            setSortDirection(
              event.target.value
            );

            setPage(1);
          }}
        >

          <option value="asc">
            Ascending
          </option>

          <option value="desc">
            Descending
          </option>

        </select>


        <button
          type="button"
          className="clear-filters-button"
          onClick={
            handleClearFilters
          }
        >
          Clear Filters
        </button>

      </div>


      {/* =========================
          Total
      ========================= */}

      <p className="cars-total-count">
        Total Cars:{" "}
        <strong>
          {totalCount}
        </strong>
      </p>


      {/* =========================
          Loading
      ========================= */}

      {loading && (

        <LoadingSpinner
          message="Loading cars..."
        />

      )}


      {/* =========================
          Error
      ========================= */}

      {!loading && error && (
        <ErrorState
          message={error}
          onRetry={loadCars}
        />
      )}


      {/* =========================
          Empty
      ========================= */}

      {!loading &&
        !error &&
        cars.length === 0 && (

          <EmptyState
            icon={CarFront}
            title="No Cars Found"
            message="We couldn't find any vehicles matching your current search or filters."
            actionText="Clear Filters"
            onAction={handleClearFilters}
          />

        )}


      {/* =========================
          Cars Table
      ========================= */}

      {!loading &&
        !error &&
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
                    Year
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {cars.map(
                  car => (

                    <tr
                      key={car.id}
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


                      {/* Year */}

                      <td>
                        {car.year}
                      </td>


                      {/* Price */}

                      <td>
                        <strong className="car-table-price">
                          {car.price
                            .toLocaleString()}{" "}
                          EGP
                        </strong>
                      </td>


                      {/* Quantity */}

                      <td>
                        {car.quantity}
                      </td>


                      {/* Status */}

                      <td>

                        <span
                          className={
                            `status-badge ${getStatusClass(
                              car.stockStatus
                            )}`
                          }
                        >
                          {car.stockStatus}
                        </span>

                      </td>


                      {/* Actions */}

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            title="View car"
                            onClick={() =>
                              navigate(
                                `/cars/${car.id}`
                              )
                            }
                          >
                            <Eye
                              size={15}
                            />

                            View
                          </button>


                          {isAdmin && (

                            <>

                              <button
                                type="button"
                                title="Edit car"
                                onClick={() =>
                                  navigate(
                                    `/admin/cars/${car.id}/edit`
                                  )
                                }
                              >
                                <Pencil
                                  size={15}
                                />

                                Edit
                              </button>


                              <button
                                type="button"
                                title="Manage stock"
                                onClick={() =>
                                  navigate(
                                    `/admin/cars/${car.id}/stock`
                                  )
                                }
                              >
                                <Boxes
                                  size={15}
                                />

                                Stock
                              </button>


                              <button
                                type="button"
                                className="delete-button"
                                title="Archive car"
                                onClick={() =>
                                  handleArchiveRequest(
                                    car
                                  )
                                }
                              >
                                <Archive
                                  size={15}
                                />

                                Archive
                              </button>

                            </>

                          )}

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
          Pagination
      ========================= */}

      {!loading &&
        totalCount > 0 && (

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
              </strong>{" "}
              of{" "}
              <strong>
                {totalPages || 1}
              </strong>
            </span>


            <button
              type="button"
              disabled={
                page >=
                  totalPages ||
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

        )}


      {/* =========================
          Archive Confirmation
      ========================= */}

      <ConfirmModal
        open={
          carToArchive !== null
        }
        title={
          carToArchive
            ? `Archive ${carToArchive.brandName} ${carToArchive.model}?`
            : "Archive Car?"
        }
        message={
          carToArchive
            ? `This vehicle will be moved to Archived Cars. Its current data will be preserved and you can restore it later.`
            : ""
        }
        confirmText="Archive Car"
        cancelText="Cancel"
        variant="warning"
        loading={archiving}
        onConfirm={
          handleConfirmArchive
        }
        onCancel={
          handleCancelArchive
        }
      />

    </div>
  );
}


export default CarsPage;