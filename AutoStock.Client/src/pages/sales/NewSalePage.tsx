import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import type {
    FormEvent,
  } from "react";
  
  import {
    ArrowLeft,
    Car,
    Plus,
    ReceiptText,
    Trash2,
    UserRound,
  } from "lucide-react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import {
    getCustomers,
  } from "../../services/customerService";
  
  import {
    getCars,
  } from "../../services/carService";
  
  import {
    createSale,
  } from "../../services/saleService";
  
  import {
    getApiErrorMessage,
  } from "../../utils/apiError";
  
  import {
    useToast,
  } from "../../hooks/useToast";
  
  import LoadingSpinner
    from "../../components/common/LoadingSpinner";
  
  import ErrorState
    from "../../components/common/ErrorState";
  
  import type {
    Customer,
  } from "../../types/customer";
  
  import type {
    Car as CarType,
  } from "../../types/car";
  
  import type {
    CreateSaleRequest,
    SalePaymentMethod,
  } from "../../types/sale";
  
  
  interface SaleLine {
    key: number;
  
    carId: number;
  
    quantity: number;
  
    unitPrice: number;
  }
  
  
  function NewSalePage() {
    const navigate =
      useNavigate();
  
  
    const {
      showToast,
    } = useToast();
  
  
    /* =========================
       Data
    ========================= */
  
    const [
      customers,
      setCustomers,
    ] =
      useState<Customer[]>([]);
  
  
    const [
      cars,
      setCars,
    ] =
      useState<CarType[]>([]);
  
  
    /* =========================
       Sale Form
    ========================= */
  
    const [
      customerId,
      setCustomerId,
    ] =
      useState(0);
  
  
    const [
      paymentMethod,
      setPaymentMethod,
    ] =
      useState<SalePaymentMethod>(
        1
      );
  
  
    const [
      notes,
      setNotes,
    ] =
      useState("");
  
  
    const [
      items,
      setItems,
    ] =
      useState<SaleLine[]>([
        {
          key: 1,
          carId: 0,
          quantity: 1,
          unitPrice: 0,
        },
      ]);
  
  
    /* =========================
       States
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
      formError,
      setFormError,
    ] =
      useState("");
  
  
    const [
      saving,
      setSaving,
    ] =
      useState(false);
  
  
    /* =========================
       Load Customers + Cars
    ========================= */
  
    const loadData =
      async () => {
  
        setLoading(true);
  
        setLoadError("");
  
  
        try {
          const [
            customersResult,
            firstCarsPage,
          ] =
            await Promise.all([
              getCustomers(),
  
              getCars({
                page: 1,
                pageSize: 100,
              }),
            ]);
  
  
          let allCars =
            firstCarsPage.items;
  
  
          /*
           * If there are more than 100 cars,
           * load the remaining pages too.
           */
  
          if (
            firstCarsPage.totalPages >
            1
          ) {
            const requests =
              Array.from(
                {
                  length:
                    firstCarsPage.totalPages -
                    1,
                },
                (
                  _,
                  index
                ) =>
                  getCars({
                    page:
                      index +
                      2,
  
                    pageSize:
                      firstCarsPage.pageSize,
                  })
              );
  
  
            const remainingPages =
              await Promise.all(
                requests
              );
  
  
            allCars = [
              ...allCars,
  
              ...remainingPages.flatMap(
                page =>
                  page.items
              ),
            ];
          }
  
  
          setCustomers(
            customersResult
          );
  
  
          /*
           * Only active cars with stock
           * can be selected for a sale.
           */
  
          setCars(
            allCars.filter(
              car =>
                car.isActive &&
                car.quantity > 0
            )
          );
        }
        catch (error) {
  
          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load sale data."
            )
          );
        }
        finally {
  
          setLoading(false);
        }
      };
  
  
    useEffect(() => {
  
      void loadData();
  
    }, []);
  
  
    /* =========================
       Helpers
    ========================= */
  
    const findCar = (
      carId: number
    ) => {
  
      return cars.find(
        car =>
          car.id === carId
      );
    };
  
  
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
  
  
    /* =========================
       Grand Total
    ========================= */
  
    const grandTotal =
      useMemo(
        () => {
  
          return items.reduce(
            (
              total,
              item
            ) => {
  
              return (
                total +
                item.quantity *
                  item.unitPrice
              );
            },
            0
          );
        },
        [items]
      );
  
  
    /* =========================
       Add Line
    ========================= */
  
    const addItem =
      () => {
  
        setItems(
          current => [
            ...current,
            {
              key:
                Date.now() +
                Math.random(),
  
              carId: 0,
  
              quantity: 1,
  
              unitPrice: 0,
            },
          ]
        );
      };
  
  
    /* =========================
       Remove Line
    ========================= */
  
    const removeItem = (
      key: number
    ) => {
  
      if (
        items.length ===
        1
      ) {
        return;
      }
  
  
      setItems(
        current =>
          current.filter(
            item =>
              item.key !== key
          )
      );
    };
  
  
    /* =========================
       Select Car
    ========================= */
  
    const handleCarChange = (
      key: number,
      carId: number
    ) => {
  
      const selectedCar =
        findCar(
          carId
        );
  
  
      setItems(
        current =>
          current.map(
            item => {
  
              if (
                item.key !== key
              ) {
                return item;
              }
  
  
              return {
                ...item,
  
                carId,
  
                quantity: 1,
  
                unitPrice:
                  selectedCar?.price ??
                  0,
              };
            }
          )
      );
    };
  
  
    /* =========================
       Quantity Change
    ========================= */
  
    const handleQuantityChange = (
      key: number,
      value: number
    ) => {
  
      setItems(
        current =>
          current.map(
            item =>
              item.key === key
                ? {
                    ...item,
  
                    quantity:
                      value,
                  }
                : item
          )
      );
    };
  
  
    /* =========================
       Price Change
    ========================= */
  
    const handlePriceChange = (
      key: number,
      value: number
    ) => {
  
      setItems(
        current =>
          current.map(
            item =>
              item.key === key
                ? {
                    ...item,
  
                    unitPrice:
                      value,
                  }
                : item
          )
      );
    };
  
  
    /* =========================
       Validate
    ========================= */
  
    const validateForm =
      (): string | null => {
  
        if (
          customerId <= 0
        ) {
          return "Please select a customer.";
        }
  
  
        if (
          items.length ===
          0
        ) {
          return "The sale must contain at least one car.";
        }
  
  
        const selectedCarIds =
          items
            .map(
              item =>
                item.carId
            )
            .filter(
              id =>
                id > 0
            );
  
  
        if (
          selectedCarIds.length !==
          new Set(
            selectedCarIds
          ).size
        ) {
          return "The same car cannot be added more than once.";
        }
  
  
        for (
          const item of items
        ) {
          if (
            item.carId <= 0
          ) {
            return "Please select a car for every sale item.";
          }
  
  
          const car =
            findCar(
              item.carId
            );
  
  
          if (!car) {
            return "One of the selected cars is unavailable.";
          }
  
  
          if (
            item.quantity <= 0
          ) {
            return `Quantity for ${car.brandName} ${car.model} must be greater than zero.`;
          }
  
  
          if (
            item.quantity >
            car.quantity
          ) {
            return (
              `Not enough stock for ${car.brandName} ${car.model}. ` +
              `Available: ${car.quantity}.`
            );
          }
  
  
          if (
            item.unitPrice <= 0
          ) {
            return `Selling price for ${car.brandName} ${car.model} must be greater than zero.`;
          }
        }
  
  
        return null;
      };
  
  
    /* =========================
       Submit Sale
    ========================= */
  
    const handleSubmit =
      async (
        event:
          FormEvent<HTMLFormElement>
      ) => {
  
        event.preventDefault();
  
        setFormError("");
  
  
        const validationError =
          validateForm();
  
  
        if (
          validationError
        ) {
          setFormError(
            validationError
          );
  
          return;
        }
  
  
        const request:
          CreateSaleRequest = {
  
            customerId,
  
            paymentMethod,
  
            notes:
              notes.trim() ||
              null,
  
            items:
              items.map(
                item => ({
                  carId:
                    item.carId,
  
                  quantity:
                    item.quantity,
  
                  unitPrice:
                    item.unitPrice,
                })
              ),
          };
  
  
        setSaving(true);
  
  
        try {
          const sale =
            await createSale(
              request
            );
  
  
          showToast(
            `Sale #${sale.id} created successfully.`,
            "success"
          );
  
  
          navigate(
            `/sales/${sale.id}`
          );
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to create sale."
            );
  
  
          setFormError(
            message
          );
  
  
          showToast(
            message,
            "error"
          );
        }
        finally {
  
          setSaving(false);
        }
      };
  
  
    /* =========================
       Loading
    ========================= */
  
    if (loading) {
      return (
        <LoadingSpinner
          message="Preparing new sale..."
        />
      );
    }
  
  
    /* =========================
       Load Error
    ========================= */
  
    if (loadError) {
      return (
        <ErrorState
          title="Unable to prepare sale"
          message={
            loadError
          }
          onRetry={
            loadData
          }
        />
      );
    }
  
  
    return (
      <div className="cars-page">
  
        {/* =========================
            Header
        ========================= */}
  
        <div className="cars-header">
  
          <div>
  
            <button
              type="button"
              className="sale-back-button"
              onClick={() =>
                navigate(
                  "/sales"
                )
              }
            >
              <ArrowLeft
                size={17}
              />
  
              Sales
            </button>
  
  
            <h1>
              New Sale
            </h1>
  
  
            <p>
              Record a dealership sale
              and automatically update inventory.
            </p>
  
          </div>
  
        </div>
  
  
        <form
          className="new-sale-layout"
          onSubmit={
            handleSubmit
          }
        >
  
          {/* =========================
              Main Form
          ========================= */}
  
          <div className="new-sale-main">
  
            {/* Customer */}
  
            <section className="sale-section">
  
              <div className="sale-section-header">
  
                <div className="sales-summary-icon">
  
                  <UserRound
                    size={19}
                  />
  
                </div>
  
  
                <div>
  
                  <h2>
                    Customer
                  </h2>
  
                  <p>
                    Select the customer
                    making this purchase.
                  </p>
  
                </div>
  
              </div>
  
  
              <label>
  
                Customer
  
                <select
                  value={
                    customerId
                  }
                  disabled={
                    saving
                  }
                  onChange={(event) =>
                    setCustomerId(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
  
                  <option
                    value={0}
                  >
                    Select customer
                  </option>
  
  
                  {customers.map(
                    customer => (
  
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {customer.fullName}
                        {" — "}
                        {customer.phoneNumber}
                      </option>
  
                    )
                  )}
  
                </select>
  
              </label>
  
  
              {customers.length ===
                0 && (
  
                <p className="sale-warning">
  
                  No customers are available.
                  Add a customer before
                  creating a sale.
  
                </p>
  
              )}
  
            </section>
  
  
            {/* Cars */}
  
            <section className="sale-section">
  
              <div className="sale-section-header">
  
                <div className="sales-summary-icon">
  
                  <Car
                    size={19}
                  />
  
                </div>
  
  
                <div>
  
                  <h2>
                    Sale Items
                  </h2>
  
                  <p>
                    Add one or more cars
                    to this sale.
                  </p>
  
                </div>
  
              </div>
  
  
              {cars.length === 0 && (
  
                <p className="sale-warning">
  
                  No cars with available
                  stock were found.
  
                </p>
  
              )}
  
  
              <div className="sale-items">
  
                {items.map(
                  (
                    item,
                    index
                  ) => {
  
                    const selectedCar =
                      findCar(
                        item.carId
                      );
  
  
                    const lineTotal =
                      item.quantity *
                      item.unitPrice;
  
  
                    const selectedByOtherRows =
                      new Set(
                        items
                          .filter(
                            current =>
                              current.key !==
                              item.key
                          )
                          .map(
                            current =>
                              current.carId
                          )
                      );
  
  
                    return (
                      <div
                        className="sale-item-card"
                        key={
                          item.key
                        }
                      >
  
                        <div className="sale-item-heading">
  
                          <strong>
                            Item {index + 1}
                          </strong>
  
  
                          {items.length >
                            1 && (
  
                            <button
                              type="button"
                              className="sale-remove-item"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                removeItem(
                                  item.key
                                )
                              }
                            >
                              <Trash2
                                size={15}
                              />
  
                              Remove
                            </button>
  
                          )}
  
                        </div>
  
  
                        <div className="sale-item-fields">
  
                          {/* Car */}
  
                          <label>
  
                            Car
  
                            <select
                              value={
                                item.carId
                              }
                              disabled={
                                saving
                              }
                              onChange={(event) =>
                                handleCarChange(
                                  item.key,
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                            >
  
                              <option
                                value={0}
                              >
                                Select car
                              </option>
  
  
                              {cars.map(
                                car => (
  
                                  <option
                                    key={
                                      car.id
                                    }
                                    value={
                                      car.id
                                    }
                                    disabled={
                                      selectedByOtherRows.has(
                                        car.id
                                      )
                                    }
                                  >
                                    {car.brandName}
                                    {" "}
                                    {car.model}
                                    {" "}
                                    ({car.year})
                                    {" — "}
                                    Stock: {car.quantity}
                                  </option>
  
                                )
                              )}
  
                            </select>
  
                          </label>
  
  
                          {/* Quantity */}
  
                          <label>
  
                            Quantity
  
                            <input
                              type="number"
                              min={1}
                              max={
                                selectedCar
                                  ?.quantity
                              }
                              value={
                                item.quantity
                              }
                              disabled={
                                saving ||
                                !selectedCar
                              }
                              onChange={(event) =>
                                handleQuantityChange(
                                  item.key,
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                            />
  
                          </label>
  
  
                          {/* Unit Price */}
  
                          <label>
  
                            Selling Price
  
                            <input
                              type="number"
                              min={0.01}
                              step="0.01"
                              value={
                                item.unitPrice
                              }
                              disabled={
                                saving ||
                                !selectedCar
                              }
                              onChange={(event) =>
                                handlePriceChange(
                                  item.key,
                                  Number(
                                    event.target.value
                                  )
                                )
                              }
                            />
  
                          </label>
  
  
                          {/* Line Total */}
  
                          <div className="sale-line-total">
  
                            <span>
                              Line Total
                            </span>
  
                            <strong>
                              {formatCurrency(
                                lineTotal
                              )}
                            </strong>
  
                          </div>
  
                        </div>
  
  
                        {selectedCar && (
  
                          <div className="sale-car-info">
  
                            <span>
                              Available Stock:
                              {" "}
                              <strong>
                                {selectedCar.quantity}
                              </strong>
                            </span>
  
  
                            <span>
                              Listed Price:
                              {" "}
                              <strong>
                                {formatCurrency(
                                  selectedCar.price
                                )}
                              </strong>
                            </span>
  
  
                            <span>
                              {selectedCar.color}
                              {" • "}
                              {selectedCar.transmission}
                              {" • "}
                              {selectedCar.fuelType}
                            </span>
  
                          </div>
  
                        )}
  
                      </div>
                    );
                  }
                )}
  
              </div>
  
  
              <button
                type="button"
                className="sale-add-item-button"
                disabled={
                  saving ||
                  cars.length === 0
                }
                onClick={
                  addItem
                }
              >
                <Plus
                  size={16}
                />
  
                Add Another Car
              </button>
  
            </section>
  
  
            {/* Payment */}
  
            <section className="sale-section">
  
              <div className="sale-section-header">
  
                <div className="sales-summary-icon">
  
                  <ReceiptText
                    size={19}
                  />
  
                </div>
  
  
                <div>
  
                  <h2>
                    Payment
                  </h2>
  
                  <p>
                    Choose payment method
                    and add optional notes.
                  </p>
  
                </div>
  
              </div>
  
  
              <label>
  
                Payment Method
  
                <select
                  value={
                    paymentMethod
                  }
                  disabled={
                    saving
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      Number(
                        event.target.value
                      ) as SalePaymentMethod
                    )
                  }
                >
  
                  <option value={1}>
                    Cash
                  </option>
  
                  <option value={2}>
                    Card
                  </option>
  
                  <option value={3}>
                    Bank Transfer
                  </option>
  
                  <option value={4}>
                    Financing
                  </option>
  
                </select>
  
              </label>
  
  
              <label>
  
                Notes
  
                <textarea
                  rows={4}
                  value={
                    notes
                  }
                  disabled={
                    saving
                  }
                  placeholder="Optional notes about this sale..."
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                />
  
              </label>
  
            </section>
  
          </div>
  
  
          {/* =========================
              Summary
          ========================= */}
  
          <aside className="sale-summary-panel">
  
            <div className="sale-summary-title">
  
              <ReceiptText
                size={20}
              />
  
              <h2>
                Sale Summary
              </h2>
  
            </div>
  
  
            <div className="sale-summary-row">
  
              <span>
                Customer
              </span>
  
              <strong>
  
                {
                  customers.find(
                    customer =>
                      customer.id ===
                      customerId
                  )?.fullName ??
                  "Not selected"
                }
  
              </strong>
  
            </div>
  
  
            <div className="sale-summary-row">
  
              <span>
                Items
              </span>
  
              <strong>
  
                {items.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    (
                      item.carId >
                      0
                        ? item.quantity
                        : 0
                    ),
                  0
                )}
  
              </strong>
  
            </div>
  
  
            <div className="sale-summary-divider" />
  
  
            {items
              .filter(
                item =>
                  item.carId > 0
              )
              .map(
                item => {
  
                  const car =
                    findCar(
                      item.carId
                    );
  
  
                  return (
                    <div
                      className="sale-summary-product"
                      key={
                        item.key
                      }
                    >
  
                      <span>
                        {car?.brandName}
                        {" "}
                        {car?.model}
                        {" × "}
                        {item.quantity}
                      </span>
  
  
                      <strong>
                        {formatCurrency(
                          item.quantity *
                          item.unitPrice
                        )}
                      </strong>
  
                    </div>
                  );
                }
              )}
  
  
            <div className="sale-summary-divider" />
  
  
            <div className="sale-grand-total">
  
              <span>
                Grand Total
              </span>
  
              <strong>
                {formatCurrency(
                  grandTotal
                )}
              </strong>
  
            </div>
  
  
            {formError && (
  
              <p className="error">
                {formError}
              </p>
  
            )}
  
  
            <button
              type="submit"
              className="sale-submit-button"
              disabled={
                saving ||
                customers.length === 0 ||
                cars.length === 0
              }
            >
              <ReceiptText
                size={17}
              />
  
              {saving
                ? "Creating Sale..."
                : "Complete Sale"}
            </button>
  
  
            <p className="sale-summary-note">
              Completing this sale will
              automatically decrease car
              stock and create Stock Out
              transactions.
            </p>
  
          </aside>
  
        </form>
  
      </div>
    );
  }
  
  
  export default NewSalePage;