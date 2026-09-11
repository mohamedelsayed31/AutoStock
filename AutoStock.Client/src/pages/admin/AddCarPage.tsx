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
  } from "react-router-dom";
  
  import {
    ScanSearch,
    Upload,
  } from "lucide-react";
  
  import {
    createCar,
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
    validateCarForm,
  } from "../../utils/carValidation";
  
  import {
    useToast,
  } from "../../hooks/useToast";
  
  import type {
    LookupItem,
  } from "../../types/referenceData";
  
  
  function AddCarPage() {
    const navigate =
      useNavigate();
  
    const {
      showToast,
    } = useToast();
  
  
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
      useState(false);
  
    const [
      error,
      setError,
    ] =
      useState("");
  
  
    /*
     * Load Reference Data
     */
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
  
  
            if (
              brandsData.length > 0
            ) {
              setBrandId(
                brandsData[0].id
              );
            }
  
  
            if (
              categoriesData.length > 0
            ) {
              setCategoryId(
                categoriesData[0].id
              );
            }
  
  
            if (
              suppliersData.length > 0
            ) {
              setSupplierId(
                suppliersData[0].id
              );
            }
          }
          catch (error) {
  
            const message =
              getApiErrorMessage(
                error,
                "Failed to load reference data."
              );
  
  
            setError(
              message
            );
  
  
            showToast(
              message,
              "error"
            );
          }
        };
  
  
      loadReferenceData();
  
    }, [showToast]);
  
  
    /*
     * Image Preview
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
            "VIN decoded successfully. Vehicle data was auto-filled."
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
     * Create Car
     */
    const handleSubmit =
      async (
        event:
          FormEvent<HTMLFormElement>
      ) => {
  
        event.preventDefault();
  
        setError("");
        setVinMessage("");
  
  
        /*
         * Shared Validation
         */
        const validationError =
          validateCarForm({
            model,
            year,
            price,
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
  
  
        setLoading(
          true
        );
  
  
        try {
  
          /*
           * Step 1:
           * Create Car
           */
          const createdCar =
            await createCar({
              model:
                model.trim(),
  
              year,
  
              price,
  
              quantity,
  
              reorderLevel,
  
              color:
                color.trim(),
  
              fuelType,
  
              transmission,
  
              imagePath:
                null,
  
              brandId,
  
              categoryId,
  
              supplierId,
            });
  
  
          /*
           * Step 2:
           * Upload Image
           */
          let imageUploadFailed =
            false;
  
  
          if (
            imageFile
          ) {
            try {
              await uploadCarImage(
                createdCar.id,
                imageFile
              );
            }
            catch (imageError) {
  
              imageUploadFailed =
                true;
  
  
              showToast(
                getApiErrorMessage(
                  imageError,
                  "Car was created, but the image could not be uploaded."
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
              `${createdCar.model} created successfully.`,
              "success"
            );
          }
  
  
          /*
           * Step 3:
           * Open Details
           */
          navigate(
            `/cars/${createdCar.id}`,
            {
              replace: true,
            }
          );
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to create car."
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
  
  
    return (
      <div className="car-form-page">
  
        <h1>
          Add Car
        </h1>
  
  
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
                  loading
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
  
  
          {/* Quantity */}
  
          <label>
            Quantity
  
            <input
              type="number"
              value={quantity}
              min={0}
              step={1}
              onChange={(event) =>
                setQuantity(
                  Number(
                    event.target.value
                  )
                )
              }
              required
            />
          </label>
  
  
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
  
              {brands.length ===
                0 && (
  
                <option value={0}>
                  No brands available
                </option>
  
              )}
  
  
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
  
              {categories.length ===
                0 && (
  
                <option value={0}>
                  No categories available
                </option>
  
              )}
  
  
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
  
              {suppliers.length ===
                0 && (
  
                <option value={0}>
                  No suppliers available
                </option>
  
              )}
  
  
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
  
  
          {/* Image */}
  
          <div className="car-image-field">
  
            <label>
              Car Image
            </label>
  
  
            <div className="image-upload-box">
  
              <Upload
                size={24}
              />
  
  
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                disabled={
                  loading
                }
              />
  
            </div>
  
  
            <small>
              JPG, PNG or WEBP.
              Maximum size 5 MB.
            </small>
  
  
            {imagePreview && (
  
              <div className="car-image-preview">
  
                <img
                  src={
                    imagePreview
                  }
                  alt="Car preview"
                />
  
              </div>
  
            )}
  
  
            {imageFile && (
  
              <button
                type="button"
                className="secondary-button"
                disabled={
                  loading
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
  
          </div>
  
  
          {/* Error */}
  
          {error && (
  
            <p className="error">
              {error}
            </p>
  
          )}
  
  
          {/* Actions */}
  
          <div className="form-actions">
  
            <button
              type="submit"
              disabled={
                loading ||
                decodingVin
              }
            >
              {loading
                ? "Creating..."
                : "Create Car"}
            </button>
  
  
            <button
              type="button"
              className="secondary-button"
              disabled={
                loading
              }
              onClick={() =>
                navigate(
                  "/cars"
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
  
  
  export default AddCarPage;