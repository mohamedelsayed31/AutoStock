import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ImagePlus,
  ScanSearch,
  Trash2,
} from "lucide-react";

import {
  deleteCarImage,
  getCarById,
  updateCar,
  uploadCarImage,
} from "../../services/carService";

import {
  getBrands,
  getCategories,
  getSuppliers,
} from "../../services/referenceDataService";

import {
  decodeVin,
} from "../../services/vinService";

import {
  getApiErrorMessage,
} from "../../utils/apiError";

import {
  getImageUrl,
} from "../../utils/imageUrl";

import {
  validateCarForm,
} from "../../utils/carValidation";

import {
  useToast,
} from "../../hooks/useToast";

import type {
  LookupItem,
} from "../../types/referenceData";

import LoadingSpinner
  from "../../components/common/LoadingSpinner";

import ConfirmModal
  from "../../components/common/ConfirmModal";


function EditCarPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    showToast,
  } = useToast();


  const carId =
    Number(id);


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


  const [
    model,
    setModel,
  ] =
    useState("");

  const [
    year,
    setYear,
  ] =
    useState(
      new Date().getFullYear()
    );

  const [
    price,
    setPrice,
  ] =
    useState(0);

  const [
    quantity,
    setQuantity,
  ] =
    useState(0);

  const [
    reorderLevel,
    setReorderLevel,
  ] =
    useState(0);

  const [
    color,
    setColor,
  ] =
    useState("");

  const [
    fuelType,
    setFuelType,
  ] =
    useState("");

  const [
    transmission,
    setTransmission,
  ] =
    useState("");

  const [
    brandId,
    setBrandId,
  ] =
    useState(0);

  const [
    categoryId,
    setCategoryId,
  ] =
    useState(0);

  const [
    supplierId,
    setSupplierId,
  ] =
    useState(0);


  const [
    vin,
    setVin,
  ] =
    useState("");

  const [
    decodingVin,
    setDecodingVin,
  ] =
    useState(false);

  const [
    vinMessage,
    setVinMessage,
  ] =
    useState("");


  const [
    currentImagePath,
    setCurrentImagePath,
  ] =
    useState<string | null>(
      null
    );

  const [
    imageFile,
    setImageFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    imagePreview,
    setImagePreview,
  ] =
    useState<string | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    deletingImage,
    setDeletingImage,
  ] =
    useState(false);

  const [
    deleteImageModalOpen,
    setDeleteImageModalOpen,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * Load Car + Reference Data
   */
  useEffect(() => {

    const loadData =
      async () => {

        if (
          !carId ||
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
          const [
            car,
            brandsData,
            categoriesData,
            suppliersData,
          ] =
            await Promise.all([
              getCarById(
                carId
              ),

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


          setModel(
            car.model
          );

          setYear(
            car.year
          );

          setPrice(
            car.price
          );

          setQuantity(
            car.quantity
          );

          setReorderLevel(
            car.reorderLevel
          );

          setColor(
            car.color
          );

          setFuelType(
            car.fuelType
          );

          setTransmission(
            car.transmission
          );

          setBrandId(
            car.brandId
          );

          setCategoryId(
            car.categoryId
          );

          setSupplierId(
            car.supplierId
          );

          setCurrentImagePath(
            car.imagePath
          );
        }
        catch (error) {

          const message =
            getApiErrorMessage(
              error,
              "Failed to load car."
            );


          setError(
            message
          );


          showToast(
            message,
            "error"
          );
        }
        finally {
          setLoading(
            false
          );
        }
      };


    loadData();

  }, [carId, showToast]);


  /*
   * New Image Preview
   */
  useEffect(() => {

    if (!imageFile) {
      setImagePreview(
        null
      );

      return;
    }


    const objectUrl =
      URL.createObjectURL(
        imageFile
      );


    setImagePreview(
      objectUrl
    );


    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };

  }, [imageFile]);


  /*
   * Image Validation
   */
  const handleImageChange = (
    event:
      ChangeEvent<HTMLInputElement>
  ) => {

    setError("");


    const file =
      event.target
        .files?.[0];


    if (!file) {
      setImageFile(
        null
      );

      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      event.target.value =
        "";

      setImageFile(
        null
      );

      return;
    }


    const maxSize =
      5 * 1024 * 1024;


    if (
      file.size >
      maxSize
    ) {
      setError(
        "Image size cannot exceed 5 MB."
      );

      event.target.value =
        "";

      setImageFile(
        null
      );

      return;
    }


    setImageFile(
      file
    );
  };


  /*
   * VIN Decoder
   */
  const handleDecodeVin =
    async () => {

      setError("");
      setVinMessage("");


      const cleanVin =
        vin
          .trim()
          .toUpperCase();


      if (
        cleanVin.length !== 17
      ) {
        setError(
          "VIN must contain exactly 17 characters."
        );

        return;
      }


      setDecodingVin(
        true
      );


      try {
        const result =
          await decodeVin(
            cleanVin
          );


        /*
         * Model
         */
        if (
          result.model
        ) {
          setModel(
            result.model
          );
        }


        /*
         * Year
         */
        if (
          result.modelYear
        ) {
          const parsedYear =
            Number(
              result.modelYear
            );


          if (
            !Number.isNaN(
              parsedYear
            )
          ) {
            setYear(
              parsedYear
            );
          }
        }


        /*
         * Fuel Type
         */
        if (
          result.fuelTypePrimary
        ) {
          const fuel =
            result
              .fuelTypePrimary
              .toLowerCase();


          if (
            fuel.includes(
              "plug-in"
            ) &&
            fuel.includes(
              "hybrid"
            )
          ) {
            setFuelType(
              "Plug-in Hybrid"
            );
          }
          else if (
            fuel.includes(
              "gasoline"
            )
          ) {
            setFuelType(
              "Gasoline"
            );
          }
          else if (
            fuel.includes(
              "diesel"
            )
          ) {
            setFuelType(
              "Diesel"
            );
          }
          else if (
            fuel.includes(
              "electric"
            )
          ) {
            setFuelType(
              "Electric"
            );
          }
          else if (
            fuel.includes(
              "hybrid"
            )
          ) {
            setFuelType(
              "Hybrid"
            );
          }
          else if (
            fuel.includes(
              "flex"
            )
          ) {
            setFuelType(
              "Flex Fuel Vehicle (FFV)"
            );
          }
        }


        /*
         * Transmission
         */
        if (
          result.transmissionStyle
        ) {
          const value =
            result
              .transmissionStyle
              .toLowerCase();


          if (
            value.includes(
              "automated manual"
            ) ||
            value.includes(
              "amt"
            )
          ) {
            setTransmission(
              "Automated Manual Transmission (AMT)"
            );
          }
          else if (
            value.includes(
              "cvt"
            )
          ) {
            setTransmission(
              "CVT"
            );
          }
          else if (
            value.includes(
              "automatic"
            )
          ) {
            setTransmission(
              "Automatic"
            );
          }
          else if (
            value.includes(
              "manual"
            )
          ) {
            setTransmission(
              "Manual"
            );
          }
        }


        /*
         * Brand
         */
        if (
          result.make
        ) {
          const matchingBrand =
            brands.find(
              brand =>
                brand.name
                  .trim()
                  .toLowerCase() ===
                result.make
                  .trim()
                  .toLowerCase()
            );


          if (
            matchingBrand
          ) {
            setBrandId(
              matchingBrand.id
            );
          }
        }


        setVinMessage(
          "VIN decoded successfully. Vehicle data was updated."
        );
      }
      catch (error) {

        const message =
          getApiErrorMessage(
            error,
            "Failed to decode VIN."
          );


        setError(
          message
        );


        showToast(
          message,
          "error"
        );
      }
      finally {
        setDecodingVin(
          false
        );
      }
    };


  /*
   * Request Delete Current Image
   */
  const handleDeleteImageRequest =
    () => {

      if (
        !currentImagePath
      ) {
        return;
      }

      setDeleteImageModalOpen(
        true
      );
    };


  /*
   * Confirm Delete Current Image
   */
  const handleConfirmDeleteImage =
    async () => {

      if (
        !currentImagePath ||
        !carId
      ) {
        return;
      }


      setError("");

      setDeletingImage(
        true
      );


      try {
        await deleteCarImage(
          carId
        );


        setCurrentImagePath(
          null
        );


        setImageFile(
          null
        );


        setDeleteImageModalOpen(
          false
        );


        showToast(
          "Car image deleted successfully.",
          "success"
        );
      }
      catch (error) {

        const message =
          getApiErrorMessage(
            error,
            "Failed to delete car image."
          );


        setError(
          message
        );


        showToast(
          message,
          "error"
        );
      }
      finally {
        setDeletingImage(
          false
        );
      }
    };


  /*
   * Cancel Delete Current Image
   */
  const handleCancelDeleteImage =
    () => {

      if (deletingImage) {
        return;
      }

      setDeleteImageModalOpen(
        false
      );
    };


  /*
   * Save Changes
   */
  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError("");
      setVinMessage("");


      if (
        !carId ||
        Number.isNaN(
          carId
        )
      ) {
        setError(
          "Invalid car ID."
        );

        return;
      }


      /*
       * Shared Validation
       */
      const validationError =
        validateCarForm({
          model,
          year,
          price,

          /*
           * Quantity is current stock.
           * It is not sent to Update.
           */
          quantity,

          reorderLevel,
          color,
          fuelType,
          transmission,
          brandId,
          categoryId,
          supplierId,
        });


      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }


      setSaving(
        true
      );


      try {

        /*
         * Step 1:
         * Update Car Data
         */
        await updateCar(
          carId,
          {
            model:
              model.trim(),

            year,

            price,

            reorderLevel,

            color:
              color.trim(),

            fuelType,

            transmission,

            brandId,

            categoryId,

            supplierId,
          }
        );


        /*
         * Step 2:
         * Replace Image
         */
        let imageUploadFailed =
          false;


        if (
          imageFile
        ) {
          try {
            const newImagePath =
              await uploadCarImage(
                carId,
                imageFile
              );


            setCurrentImagePath(
              newImagePath
            );

            setImageFile(
              null
            );
          }
          catch (imageError) {

            imageUploadFailed =
              true;


            showToast(
              getApiErrorMessage(
                imageError,
                "Car data was updated, but the image could not be uploaded."
              ),
              "error",
              5000
            );
          }
        }


        /*
         * Success Notification
         */
        if (
          !imageUploadFailed
        ) {
          showToast(
            `${model.trim()} updated successfully.`,
            "success"
          );
        }


        /*
         * Step 3:
         * Open Details
         */
        navigate(
          `/cars/${carId}`,
          {
            replace: true,
          }
        );
      }
      catch (error) {

        const message =
          getApiErrorMessage(
            error,
            "Failed to update car."
          );


        setError(
          message
        );


        showToast(
          message,
          "error"
        );
      }
      finally {
        setSaving(
          false
        );
      }
    };


  /*
   * Loading
   */
  if (loading) {
    return (
      <LoadingSpinner
        message="Loading car..."
      />
    );
  }


  return (
    <div className="car-form-page">

      <h1>
        Edit Car
      </h1>


      {/* Error */}

      {error && (

        <p className="error">
          {error}
        </p>

      )}


      <form
        className="car-form"
        onSubmit={
          handleSubmit
        }
      >

        {/* VIN Auto Fill */}

        <div className="vin-autofill-section">

          <label>
            VIN Auto-Fill
          </label>


          <div className="vin-autofill-row">

            <input
              type="text"
              value={vin}
              maxLength={17}
              placeholder="Enter 17-character VIN"
              onChange={(event) =>
                setVin(
                  event.target
                    .value
                    .toUpperCase()
                )
              }
            />


            <button
              type="button"
              onClick={
                handleDecodeVin
              }
              disabled={
                decodingVin ||
                saving ||
                deletingImage
              }
            >
              <ScanSearch
                size={18}
              />

              {decodingVin
                ? "Decoding..."
                : "Auto Fill"}
            </button>

          </div>


          <small>
            {vin.length}/17 characters
          </small>


          {vinMessage && (

            <p className="success">
              {vinMessage}
            </p>

          )}

        </div>


        {/* Model */}

        <label>
          Model

          <input
            type="text"
            value={model}
            onChange={(event) =>
              setModel(
                event.target.value
              )
            }
            required
          />
        </label>


        {/* Year */}

        <label>
          Year

          <input
            type="number"
            value={year}
            min={1900}
            max={
              new Date()
                .getFullYear() + 1
            }
            onChange={(event) =>
              setYear(
                Number(
                  event.target.value
                )
              )
            }
            required
          />
        </label>


        {/* Price */}

        <label>
          Price

          <input
            type="number"
            value={price}
            min={0.01}
            step="0.01"
            onChange={(event) =>
              setPrice(
                Number(
                  event.target.value
                )
              )
            }
            required
          />
        </label>


        {/* Current Quantity */}

        <label>
          Current Quantity

          <input
            type="number"
            value={quantity}
            readOnly
          />
        </label>


        <small>
          Quantity can only be
          changed using Stock In
          / Stock Out.
        </small>


        {/* Reorder Level */}

        <label>
          Reorder Level

          <input
            type="number"
            value={
              reorderLevel
            }
            min={0}
            step={1}
            onChange={(event) =>
              setReorderLevel(
                Number(
                  event.target.value
                )
              )
            }
            required
          />
        </label>


        {/* Color */}

        <label>
          Color

          <input
            type="text"
            value={color}
            onChange={(event) =>
              setColor(
                event.target.value
              )
            }
            required
          />
        </label>


        {/* Fuel Type */}

        <label>
          Fuel Type

          <select
            value={fuelType}
            onChange={(event) =>
              setFuelType(
                event.target.value
              )
            }
            required
          >

            <option value="">
              Select Fuel Type
            </option>

            <option value="Gasoline">
              Gasoline
            </option>

            <option value="Diesel">
              Diesel
            </option>

            <option value="Electric">
              Electric
            </option>

            <option value="Hybrid">
              Hybrid
            </option>

            <option value="Plug-in Hybrid">
              Plug-in Hybrid
            </option>

            <option value="Flex Fuel Vehicle (FFV)">
              Flex Fuel
            </option>

          </select>
        </label>


        {/* Transmission */}

        <label>
          Transmission

          <select
            value={
              transmission
            }
            onChange={(event) =>
              setTransmission(
                event.target.value
              )
            }
            required
          >

            <option value="">
              Select Transmission
            </option>

            <option value="Automatic">
              Automatic
            </option>

            <option value="Manual">
              Manual
            </option>

            <option value="CVT">
              CVT
            </option>

            <option value="Automated Manual Transmission (AMT)">
              AMT
            </option>

          </select>
        </label>


        {/* Brand */}

        <label>
          Brand

          <select
            value={brandId}
            onChange={(event) =>
              setBrandId(
                Number(
                  event.target.value
                )
              )
            }
            required
          >

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
        </label>


        {/* Category */}

        <label>
          Category

          <select
            value={
              categoryId
            }
            onChange={(event) =>
              setCategoryId(
                Number(
                  event.target.value
                )
              )
            }
            required
          >

            {categories.map(
              category => (

              <option
                key={
                  category.id
                }
                value={
                  category.id
                }
              >
                {category.name}
              </option>

              )
            )}

          </select>
        </label>


        {/* Supplier */}

        <label>
          Supplier

          <select
            value={
              supplierId
            }
            onChange={(event) =>
              setSupplierId(
                Number(
                  event.target.value
                )
              )
            }
            required
          >

            {suppliers.map(
              supplier => (

              <option
                key={
                  supplier.id
                }
                value={
                  supplier.id
                }
              >
                {supplier.name}
              </option>

              )
            )}

          </select>
        </label>


        {/* Car Image */}

        <div className="car-image-field">

          <label>
            Car Image
          </label>


          {(
            imagePreview ||
            currentImagePath
          ) ? (

            <div className="car-image-preview">

              <img
                src={
                  imagePreview ||
                  getImageUrl(
                    currentImagePath
                  ) ||
                  ""
                }
                alt={
                  `${model} car`
                }
              />

            </div>

          ) : (

            <div className="car-image-empty">

              <ImagePlus
                size={35}
              />

              <span>
                No image available
              </span>

            </div>

          )}


          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={
              handleImageChange
            }
            disabled={
              saving ||
              deletingImage
            }
          />


          <small>
            Select a new JPG,
            PNG or WEBP image
            to replace the current
            image. Maximum size:
            5 MB.
          </small>


          {imageFile && (

            <button
              type="button"
              className="secondary-button"
              disabled={
                saving ||
                deletingImage
              }
              onClick={() =>
                setImageFile(
                  null
                )
              }
            >
              Remove Selected Image
            </button>

          )}


          {currentImagePath && (

            <button
              type="button"
              className="delete-button"
              disabled={
                saving ||
                deletingImage
              }
              onClick={
                handleDeleteImageRequest
              }
            >
              <Trash2
                size={17}
              />

              Delete Current Image
            </button>

          )}

        </div>


        {/* Actions */}

        <div className="form-actions">

          <button
            type="submit"
            disabled={
              saving ||
              decodingVin ||
              deletingImage
            }
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>


          <button
            type="button"
            className="secondary-button"
            disabled={
              saving ||
              deletingImage
            }
            onClick={() =>
              navigate(
                `/cars/${carId}`
              )
            }
          >
            Cancel
          </button>

        </div>

      </form>


      <ConfirmModal
        open={
          deleteImageModalOpen
        }
        title="Delete Current Image?"
        message={
          `The current image for ${model || "this car"} will be permanently removed. This action cannot be undone.`
        }
        confirmText="Delete Image"
        cancelText="Cancel"
        variant="danger"
        loading={
          deletingImage
        }
        onConfirm={
          handleConfirmDeleteImage
        }
        onCancel={
          handleCancelDeleteImage
        }
      />

    </div>
  );
}


export default EditCarPage;