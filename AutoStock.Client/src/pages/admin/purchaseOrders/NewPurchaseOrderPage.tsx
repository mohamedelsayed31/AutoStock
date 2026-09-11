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
    CirclePlus,
    PackagePlus,
    Trash2,
  } from "lucide-react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import {
    getSuppliers,
  } from "../../../services/referenceDataService";
  
  import {
    getCars,
  } from "../../../services/carService";
  
  import {
    createPurchaseOrder,
  } from "../../../services/purchaseOrderService";
  
  import {
    getApiErrorMessage,
  } from "../../../utils/apiError";
  
  import {
    useToast,
  } from "../../../hooks/useToast";
  
  import type {
    LookupItem,
  } from "../../../types/referenceData";
  
  import type {
    Car,
  } from "../../../types/car";
  
  import LoadingSpinner
    from "../../../components/common/LoadingSpinner";
  
  
  interface DraftPurchaseItem {
    key: number;
  
    carId: number;
  
    quantity: number;
  
    unitCost: number;
  }
  
  
  function NewPurchaseOrderPage() {
    const navigate =
      useNavigate();
  
  
    const {
      showToast,
    } = useToast();
  
  
    /* =========================
       Reference Data
    ========================= */
  
    const [
      suppliers,
      setSuppliers,
    ] =
      useState<LookupItem[]>([]);
  
  
    const [
      cars,
      setCars,
    ] =
      useState<Car[]>([]);
  
  
    /* =========================
       Form
    ========================= */
  
    const [
      supplierId,
      setSupplierId,
    ] =
      useState(0);
  
  
    const [
      notes,
      setNotes,
    ] =
      useState("");
  
  
    const [
      items,
      setItems,
    ] =
      useState<DraftPurchaseItem[]>([]);
  
  
    /* =========================
       States
    ========================= */
  
    const [
      loading,
      setLoading,
    ] =
      useState(true);
  
  
    const [
      carsLoading,
      setCarsLoading,
    ] =
      useState(false);
  
  
    const [
      saving,
      setSaving,
    ] =
      useState(false);
  
  
    const [
      error,
      setError,
    ] =
      useState("");
  
  
    /* =========================
       Load Suppliers
    ========================= */
  
    useEffect(() => {
  
      const loadSuppliers =
        async () => {
  
          setLoading(true);
  
          setError("");
  
  
          try {
            const result =
              await getSuppliers();
  
  
            setSuppliers(
              result
            );
          }
          catch (error) {
  
            setError(
              getApiErrorMessage(
                error,
                "Failed to load suppliers."
              )
            );
          }
          finally {
  
            setLoading(false);
          }
        };
  
  
      void loadSuppliers();
  
    }, []);
  
  
    /* =========================
       Load Supplier Cars
    ========================= */
  
    useEffect(() => {
  
      const loadSupplierCars =
        async () => {
  
          if (
            supplierId <= 0
          ) {
            setCars([]);
  
            setItems([]);
  
            return;
          }
  
  
          setCarsLoading(true);
  
          setError("");
  
  
          try {
            const result =
              await getCars({
                supplierId,
  
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
  
  
            /*
             * Supplier changed, so clear
             * the previous supplier items.
             */
  
            setItems([]);
          }
          catch (error) {
  
            setCars([]);
  
            setItems([]);
  
  
            setError(
              getApiErrorMessage(
                error,
                "Failed to load supplier cars."
              )
            );
          }
          finally {
  
            setCarsLoading(false);
          }
        };
  
  
      void loadSupplierCars();
  
    }, [supplierId]);
  
  
    /* =========================
       Add Item
    ========================= */
  
    const handleAddItem =
      () => {
  
        if (
          supplierId <= 0
        ) {
          setError(
            "Select a supplier first."
          );
  
          return;
        }
  
  
        if (
          cars.length === 0
        ) {
          setError(
            "This supplier has no available cars."
          );
  
          return;
        }
  
  
        const selectedCarIds =
          items.map(
            item =>
              item.carId
          );
  
  
        const firstAvailableCar =
          cars.find(
            car =>
              !selectedCarIds
                .includes(
                  car.id
                )
          );
  
  
        if (!firstAvailableCar) {
          setError(
            "All cars for this supplier have already been added."
          );
  
          return;
        }
  
  
        setError("");
  
  
        setItems(
          current => [
            ...current,
  
            {
              key:
                Date.now() +
                Math.random(),
  
              carId:
                firstAvailableCar.id,
  
              quantity:
                1,
  
              unitCost:
                firstAvailableCar.price,
            },
          ]
        );
      };
  
  
    /* =========================
       Remove Item
    ========================= */
  
    const handleRemoveItem = (
      key: number
    ) => {
  
      setItems(
        current =>
          current.filter(
            item =>
              item.key !== key
          )
      );
    };
  
  
    /* =========================
       Change Car
    ========================= */
  
    const handleCarChange = (
      key: number,
      carId: number
    ) => {
  
      const car =
        cars.find(
          item =>
            item.id === carId
        );
  
  
      setItems(
        current =>
          current.map(
            item =>
              item.key === key
                ? {
                    ...item,
  
                    carId,
  
                    /*
                     * We use the current car price
                     * only as an initial suggestion.
                     *
                     * Admin can still edit Unit Cost.
                     */
                    unitCost:
                      car?.price ??
                      item.unitCost,
                  }
                : item
          )
      );
    };
  
  
    /* =========================
       Change Quantity
    ========================= */
  
    const handleQuantityChange = (
      key: number,
      quantity: number
    ) => {
  
      setItems(
        current =>
          current.map(
            item =>
              item.key === key
                ? {
                    ...item,
  
                    quantity,
                  }
                : item
          )
      );
    };
  
  
    /* =========================
       Change Unit Cost
    ========================= */
  
    const handleUnitCostChange = (
      key: number,
      unitCost: number
    ) => {
  
      setItems(
        current =>
          current.map(
            item =>
              item.key === key
                ? {
                    ...item,
  
                    unitCost,
                  }
                : item
          )
      );
    };
  
  
    /* =========================
       Grand Total
    ========================= */
  
    const grandTotal =
      useMemo(
        () =>
          items.reduce(
            (
              total,
              item
            ) =>
              total +
              (
                item.quantity *
                item.unitCost
              ),
            0
          ),
        [items]
      );
  
  
    /* =========================
       Money
    ========================= */
  
    const formatMoney = (
      value: number
    ) =>
      new Intl.NumberFormat(
        "en-EG",
        {
          style:
            "currency",
  
          currency:
            "EGP",
  
          maximumFractionDigits:
            2,
        }
      ).format(
        value
      );
  
  
    /* =========================
       Submit
    ========================= */
  
    const handleSubmit =
      async (
        event:
          FormEvent<HTMLFormElement>
      ) => {
  
        event.preventDefault();
  
        setError("");
  
  
        if (
          supplierId <= 0
        ) {
          setError(
            "Supplier is required."
          );
  
          return;
        }
  
  
        if (
          items.length === 0
        ) {
          setError(
            "Add at least one car to the purchase order."
          );
  
          return;
        }
  
  
        const invalidItem =
          items.find(
            item =>
              item.carId <= 0
              ||
              item.quantity <= 0
              ||
              item.unitCost <= 0
          );
  
  
        if (invalidItem) {
          setError(
            "Every item must have a valid car, quantity, and unit cost."
          );
  
          return;
        }
  
  
        const duplicateCars =
          new Set(
            items.map(
              item =>
                item.carId
            )
          );
  
  
        if (
          duplicateCars.size !==
          items.length
        ) {
          setError(
            "The same car cannot be added more than once."
          );
  
          return;
        }
  
  
        setSaving(true);
  
  
        try {
          const createdOrder =
            await createPurchaseOrder({
              supplierId,
  
              notes:
                notes.trim()
                  ? notes.trim()
                  : null,
  
              items:
                items.map(
                  item => ({
                    carId:
                      item.carId,
  
                    quantity:
                      item.quantity,
  
                    unitCost:
                      item.unitCost,
                  })
                ),
            });
  
  
          showToast(
            `Purchase Order #${createdOrder.id} created successfully.`,
            "success"
          );
  
  
          navigate(
            `/admin/purchase-orders/${createdOrder.id}`
          );
        }
        catch (error) {
  
          setError(
            getApiErrorMessage(
              error,
              "Failed to create purchase order."
            )
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
        <div className="purchase-order-form-page">
  
          <LoadingSpinner
            message="Loading purchase order form..."
          />
  
        </div>
      );
    }
  
  
    return (
      <div className="purchase-order-form-page">
  
        {/* Header */}
  
        <div className="purchase-order-form-header">
  
          <div>
  
            <button
              type="button"
              className="purchase-back-button"
              onClick={() =>
                navigate(
                  "/admin/purchase-orders"
                )
              }
            >
              <ArrowLeft
                size={16}
              />
  
              Purchase Orders
            </button>
  
  
            <span className="purchase-orders-eyebrow">
              Procurement
            </span>
  
  
            <h1>
              New Purchase Order
            </h1>
  
  
            <p>
              Create an incoming inventory
              order from one supplier.
            </p>
  
          </div>
  
  
          <PackagePlus
            size={38}
          />
  
        </div>
  
  
        <form
          className="purchase-order-form"
          onSubmit={
            handleSubmit
          }
        >
  
          {/* Error */}
  
          {error && (
  
            <div className="purchase-form-error">
              {error}
            </div>
  
          )}
  
  
          {/* Supplier */}
  
          <section className="purchase-form-card">
  
            <div className="purchase-form-section-header">
  
              <div>
  
                <h2>
                  Supplier
                </h2>
  
                <p>
                  Select the supplier for this order.
                </p>
  
              </div>
  
            </div>
  
  
            <label className="purchase-form-field">
  
              <span>
                Supplier *
              </span>
  
  
              <select
                value={
                  supplierId
                }
                disabled={
                  saving
                }
                onChange={
                  event =>
                    setSupplierId(
                      Number(
                        event.target.value
                      )
                    )
                }
              >
                <option value={0}>
                  Select supplier
                </option>
  
  
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
  
          </section>
  
  
          {/* Items */}
  
          <section className="purchase-form-card">
  
            <div className="purchase-form-section-header">
  
              <div>
  
                <h2>
                  Order Items
                </h2>
  
                <p>
                  Add vehicles, quantities,
                  and purchase costs.
                </p>
  
              </div>
  
  
              <button
                type="button"
                className="purchase-add-item-button"
                disabled={
                  supplierId <= 0
                  ||
                  carsLoading
                  ||
                  saving
                }
                onClick={
                  handleAddItem
                }
              >
                <CirclePlus
                  size={17}
                />
  
                Add Car
              </button>
  
            </div>
  
  
            {carsLoading ? (
  
              <div className="purchase-form-message">
                Loading supplier cars...
              </div>
  
            ) : supplierId <= 0 ? (
  
              <div className="purchase-form-message">
  
                Select a supplier to
                load its cars.
  
              </div>
  
            ) : cars.length === 0 ? (
  
              <div className="purchase-form-message">
  
                This supplier has no
                active cars.
  
              </div>
  
            ) : items.length === 0 ? (
  
              <div className="purchase-form-message">
  
                No items added yet.
                Click Add Car to start.
  
              </div>
  
            ) : (
  
              <div className="purchase-item-list">
  
                {items.map(
                  (
                    item,
                    index
                  ) => {
  
                    const lineTotal =
                      item.quantity *
                      item.unitCost;
  
  
                    const selectedByOthers =
                      items
                        .filter(
                          current =>
                            current.key !==
                            item.key
                        )
                        .map(
                          current =>
                            current.carId
                        );
  
  
                    return (
                      <div
                        className="purchase-item-row"
                        key={
                          item.key
                        }
                      >
  
                        <div className="purchase-item-number">
                          {index + 1}
                        </div>
  
  
                        <label>
  
                          <span>
                            Car
                          </span>
  
                          <select
                            value={
                              item.carId
                            }
                            disabled={
                              saving
                            }
                            onChange={
                              event =>
                                handleCarChange(
                                  item.key,
                                  Number(
                                    event.target.value
                                  )
                                )
                            }
                          >
  
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
                                    selectedByOthers
                                      .includes(
                                        car.id
                                      )
                                  }
                                >
                                  {car.brandName}
                                  {" "}
                                  {car.model}
                                  {" "}
                                  ({car.year})
                                </option>
  
                              )
                            )}
  
                          </select>
  
                        </label>
  
  
                        <label>
  
                          <span>
                            Quantity
                          </span>
  
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={
                              item.quantity
                            }
                            disabled={
                              saving
                            }
                            onChange={
                              event =>
                                handleQuantityChange(
                                  item.key,
                                  Number(
                                    event.target.value
                                  )
                                )
                            }
                          />
  
                        </label>
  
  
                        <label>
  
                          <span>
                            Unit Cost
                          </span>
  
                          <input
                            type="number"
                            min={0.01}
                            step="0.01"
                            value={
                              item.unitCost
                            }
                            disabled={
                              saving
                            }
                            onChange={
                              event =>
                                handleUnitCostChange(
                                  item.key,
                                  Number(
                                    event.target.value
                                  )
                                )
                            }
                          />
  
                        </label>
  
  
                        <div className="purchase-item-total">
  
                          <span>
                            Line Total
                          </span>
  
                          <strong>
                            {formatMoney(
                              lineTotal
                            )}
                          </strong>
  
                        </div>
  
  
                        <button
                          type="button"
                          className="purchase-remove-item-button"
                          aria-label="Remove item"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            handleRemoveItem(
                              item.key
                            )
                          }
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
  
                      </div>
                    );
                  }
                )}
  
              </div>
  
            )}
  
          </section>
  
  
          {/* Notes */}
  
          <section className="purchase-form-card">
  
            <div className="purchase-form-section-header">
  
              <div>
  
                <h2>
                  Notes
                </h2>
  
                <p>
                  Optional internal purchase notes.
                </p>
  
              </div>
  
            </div>
  
  
            <label className="purchase-form-field">
  
              <span>
                Notes
              </span>
  
              <textarea
                value={
                  notes
                }
                maxLength={1000}
                rows={4}
                disabled={
                  saving
                }
                placeholder="Add any notes about this purchase order..."
                onChange={
                  event =>
                    setNotes(
                      event.target.value
                    )
                }
              />
  
            </label>
  
          </section>
  
  
          {/* Total */}
  
          <section className="purchase-total-card">
  
            <div>
  
              <span>
                Total Items
              </span>
  
              <strong>
                {items.length}
              </strong>
  
            </div>
  
  
            <div>
  
              <span>
                Total Units
              </span>
  
              <strong>
                {items.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    item.quantity,
                  0
                )}
              </strong>
  
            </div>
  
  
            <div className="purchase-grand-total">
  
              <span>
                Grand Total
              </span>
  
              <strong>
                {formatMoney(
                  grandTotal
                )}
              </strong>
  
            </div>
  
          </section>
  
  
          {/* Actions */}
  
          <div className="purchase-form-actions">
  
            <button
              type="button"
              className="purchase-secondary-button"
              disabled={
                saving
              }
              onClick={() =>
                navigate(
                  "/admin/purchase-orders"
                )
              }
            >
              Cancel
            </button>
  
  
            <button
              type="submit"
              className="purchase-primary-button"
              disabled={
                saving
                ||
                supplierId <= 0
                ||
                items.length === 0
            }
            >
              <PackagePlus
                size={18}
              />
  
              {saving
                ? "Creating..."
                : "Create Purchase Order"}
            </button>
  
          </div>
  
        </form>
  
      </div>
    );
  }
  
  
  export default NewPurchaseOrderPage;