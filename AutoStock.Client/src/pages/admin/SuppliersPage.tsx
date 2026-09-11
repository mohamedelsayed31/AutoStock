import {
    useEffect,
    useState,
  } from "react";
  
  import type {
    FormEvent,
  } from "react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  import {
    ArrowLeft,
    Building2,
    History,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Trash2,
  } from "lucide-react";
  
  import {
    useAuth,
  } from "../../context/AuthContext";
  
  import {
    createSupplier,
    deleteSupplier,
    getSuppliers,
    updateSupplier,
  } from "../../services/supplierService";
  
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
    Supplier,
  } from "../../types/supplier";
  
  
  function SuppliersPage() {
    const navigate =
      useNavigate();
  
  
    const {
      isAdmin,
    } = useAuth();
  
  
    const {
      showToast,
    } = useToast();
  
  
    /* =========================
       Suppliers
    ========================= */
  
    const [
      suppliers,
      setSuppliers,
    ] =
      useState<Supplier[]>([]);
  
  
    /* =========================
       Form
    ========================= */
  
    const [
      name,
      setName,
    ] =
      useState("");
  
  
    const [
      email,
      setEmail,
    ] =
      useState("");
  
  
    const [
      phoneNumber,
      setPhoneNumber,
    ] =
      useState("");
  
  
    const [
      address,
      setAddress,
    ] =
      useState("");
  
  
    const [
      editingSupplierId,
      setEditingSupplierId,
    ] =
      useState<number | null>(
        null
      );
  
  
    const [
      showForm,
      setShowForm,
    ] =
      useState(false);
  
  
    /* =========================
       Loading States
    ========================= */
  
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
      deleting,
      setDeleting,
    ] =
      useState(false);
  
  
    /* =========================
       Errors
    ========================= */
  
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
  
  
    /* =========================
       Delete Modal
    ========================= */
  
    const [
      supplierToDelete,
      setSupplierToDelete,
    ] =
      useState<Supplier | null>(
        null
      );
  
  
    /* =========================
       Load Suppliers
    ========================= */
  
    const loadSuppliers =
      async () => {
  
        setLoading(
          true
        );
  
        setLoadError("");
  
  
        try {
          const result =
            await getSuppliers();
  
  
          setSuppliers(
            result
          );
        }
        catch (error) {
  
          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load suppliers."
            )
          );
        }
        finally {
  
          setLoading(
            false
          );
        }
      };
  
  
    useEffect(() => {
  
      loadSuppliers();
  
    }, []);
  
  
    /* =========================
       Reset Form
    ========================= */
  
    const resetForm =
      () => {
  
        setName("");
  
        setEmail("");
  
        setPhoneNumber("");
  
        setAddress("");
  
        setEditingSupplierId(
          null
        );
  
        setFormError("");
  
        setShowForm(
          false
        );
      };
  
  
    /* =========================
       Add Supplier
    ========================= */
  
    const handleAdd =
      () => {
  
        setName("");
  
        setEmail("");
  
        setPhoneNumber("");
  
        setAddress("");
  
        setEditingSupplierId(
          null
        );
  
        setFormError("");
  
        setShowForm(
          true
        );
      };
  
  
    /* =========================
       Edit Supplier
    ========================= */
  
    const handleEdit = (
      supplier: Supplier
    ) => {
  
      setName(
        supplier.name
      );
  
  
      setEmail(
        supplier.email ?? ""
      );
  
  
      setPhoneNumber(
        supplier.phoneNumber ?? ""
      );
  
  
      setAddress(
        supplier.address ?? ""
      );
  
  
      setEditingSupplierId(
        supplier.id
      );
  
  
      setFormError("");
  
      setShowForm(
        true
      );
    };
  
  
    /* =========================
       Submit Supplier
    ========================= */
  
    const handleSubmit =
      async (
        event:
          FormEvent<HTMLFormElement>
      ) => {
  
        event.preventDefault();
  
        setFormError("");
  
  
        if (!name.trim()) {
  
          setFormError(
            "Supplier name is required."
          );
  
          return;
        }
  
  
        setSaving(
          true
        );
  
  
        try {
          const data = {
  
            name:
              name.trim(),
  
            email:
              email.trim() ||
              null,
  
            phoneNumber:
              phoneNumber.trim() ||
              null,
  
            address:
              address.trim() ||
              null,
          };
  
  
          if (
            editingSupplierId !== null
          ) {
  
            await updateSupplier(
              editingSupplierId,
              data
            );
  
  
            showToast(
              `${name.trim()} updated successfully.`,
              "success"
            );
          }
          else {
  
            await createSupplier(
              data
            );
  
  
            showToast(
              `${name.trim()} created successfully.`,
              "success"
            );
          }
  
  
          resetForm();
  
          await loadSuppliers();
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              editingSupplierId !== null
                ? "Failed to update supplier."
                : "Failed to create supplier."
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
  
          setSaving(
            false
          );
        }
      };
  
  
    /* =========================
       Request Delete
    ========================= */
  
    const handleDeleteRequest = (
      supplier: Supplier
    ) => {
  
      setSupplierToDelete(
        supplier
      );
    };
  
  
    /* =========================
       Confirm Delete
    ========================= */
  
    const handleConfirmDelete =
      async () => {
  
        if (!supplierToDelete) {
          return;
        }
  
  
        setDeleting(
          true
        );
  
  
        try {
          await deleteSupplier(
            supplierToDelete.id
          );
  
  
          showToast(
            `${supplierToDelete.name} deleted successfully.`,
            "success"
          );
  
  
          setSupplierToDelete(
            null
          );
  
  
          await loadSuppliers();
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to delete supplier."
            );
  
  
          showToast(
            message,
            "error"
          );
        }
        finally {
  
          setDeleting(
            false
          );
        }
      };
  
  
    /* =========================
       Cancel Delete
    ========================= */
  
    const handleCancelDelete =
      () => {
  
        if (deleting) {
          return;
        }
  
  
        setSupplierToDelete(
          null
        );
      };
  
  
    return (
      <div className="cars-page">
  
        {/* =========================
            Header
        ========================= */}
  
        <div className="cars-header">
  
          <div>
  
            <h1>
              Suppliers Management
            </h1>
  
  
            <p>
              Manage vehicle suppliers
              and contact information
            </p>
  
          </div>
  
  
          <div className="header-actions">
  
            {isAdmin && (
  
              <button
                type="button"
                onClick={
                  handleAdd
                }
              >
                <Plus
                  size={17}
                />
  
                Add Supplier
              </button>
  
            )}
  
  
            <button
              type="button"
              className="secondary-button"
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
  
          </div>
  
        </div>
  
  
        {/* =========================
            Supplier Form
        ========================= */}
  
        {isAdmin &&
          showForm && (
  
            <form
              className="management-form"
              onSubmit={
                handleSubmit
              }
            >
  
              <div className="management-form-header">
  
                <div className="management-form-icon">
  
                  {editingSupplierId !== null
                    ? (
                      <Pencil
                        size={20}
                      />
                    )
                    : (
                      <Plus
                        size={20}
                      />
                    )}
  
                </div>
  
  
                <div>
  
                  <h2>
  
                    {editingSupplierId !== null
                      ? "Edit Supplier"
                      : "Add New Supplier"}
  
                  </h2>
  
  
                  <p>
  
                    {editingSupplierId !== null
                      ? "Update the selected supplier information."
                      : "Create a new supplier for the vehicle inventory."}
  
                  </p>
  
                </div>
  
              </div>
  
  
              {formError && (
  
                <p className="error">
                  {formError}
                </p>
  
              )}
  
  
              <label>
  
                Supplier Name
  
                <input
                  type="text"
                  value={name}
                  placeholder="Example: Nile Auto Supply"
                  disabled={saving}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                />
  
              </label>
  
  
              <label>
  
                Email
  
                <input
                  type="email"
                  value={email}
                  placeholder="supplier@example.com"
                  disabled={saving}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                />
  
              </label>
  
  
              <label>
  
                Phone Number
  
                <input
                  type="text"
                  value={phoneNumber}
                  placeholder="Example: +20 10 1234 5678"
                  disabled={saving}
                  onChange={(event) =>
                    setPhoneNumber(
                      event.target.value
                    )
                  }
                />
  
              </label>
  
  
              <label>
  
                Address
  
                <textarea
                  value={address}
                  placeholder="Supplier address..."
                  disabled={saving}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  rows={3}
                />
  
              </label>
  
  
              <div className="form-actions">
  
                <button
                  type="submit"
                  disabled={saving}
                >
  
                  {editingSupplierId !== null ? (
  
                    <Pencil
                      size={16}
                    />
  
                  ) : (
  
                    <Plus
                      size={16}
                    />
  
                  )}
  
  
                  {saving
                    ? "Saving..."
                    : editingSupplierId !== null
                      ? "Save Changes"
                      : "Create Supplier"}
  
                </button>
  
  
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={
                    resetForm
                  }
                >
                  Cancel
                </button>
  
              </div>
  
            </form>
  
          )}
  
  
        {/* =========================
            Loading
        ========================= */}
  
        {loading && (
  
          <LoadingSpinner
            message="Loading suppliers..."
          />
  
        )}
  
  
        {/* =========================
            Load Error
        ========================= */}
  
        {!loading &&
          loadError && (
  
            <ErrorState
              title="Unable to load suppliers"
              message={
                loadError
              }
              onRetry={
                loadSuppliers
              }
            />
  
          )}
  
  
        {/* =========================
            Empty State
        ========================= */}
  
        {!loading &&
          !loadError &&
          suppliers.length === 0 && (
  
            <EmptyState
              icon={Building2}
              title="No Suppliers Found"
              message="There are currently no vehicle suppliers available in the system."
              actionText={
                isAdmin
                  ? "Add First Supplier"
                  : "Back to Cars"
              }
              onAction={
                isAdmin
                  ? handleAdd
                  : () =>
                      navigate(
                        "/cars"
                      )
              }
            />
  
          )}
  
  
        {/* =========================
            Suppliers Table
        ========================= */}
  
        {!loading &&
          !loadError &&
          suppliers.length > 0 && (
  
            <div className="table-container">
  
              <table>
  
                <thead>
  
                  <tr>
  
                    <th>
                      ID
                    </th>
  
                    <th>
                      Supplier Name
                    </th>
  
                    <th>
                      Email
                    </th>
  
                    <th>
                      Phone
                    </th>
  
                    <th>
                      Address
                    </th>
  
                    {isAdmin && (
  
                      <th>
                        Actions
                      </th>
  
                    )}
  
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {suppliers.map(
                    supplier => (
  
                      <tr
                        key={
                          supplier.id
                        }
                      >
  
                        <td>
                          {supplier.id}
                        </td>
  
  
                        <td>
  
                          <div className="management-name-cell">
  
                            <div className="management-table-icon">
  
                              <Building2
                                size={15}
                              />
  
                            </div>
  
  
                            <strong>
                              {supplier.name}
                            </strong>
  
                          </div>
  
                        </td>
  
  
                        <td>
  
                          {supplier.email ? (
  
                            <span className="supplier-contact-cell">
  
                              <Mail
                                size={14}
                              />
  
                              {supplier.email}
  
                            </span>
  
                          ) : (
                            "-"
                          )}
  
                        </td>
  
  
                        <td>
  
                          {supplier.phoneNumber ? (
  
                            <span className="supplier-contact-cell">
  
                              <Phone
                                size={14}
                              />
  
                              {supplier.phoneNumber}
  
                            </span>
  
                          ) : (
                            "-"
                          )}
  
                        </td>
  
  
                        <td>
  
                          {supplier.address ? (
  
                            <span className="supplier-contact-cell supplier-address-cell">
  
                              <MapPin
                                size={14}
                              />
  
                              {supplier.address}
  
                            </span>
  
                          ) : (
                            "-"
                          )}
  
                        </td>
  
  
                        {isAdmin && (
  
                          <td>
  
                            <div className="table-actions">
  
                              <button
                                type="button"
                                title="View purchase history"
                                onClick={() =>
                                  navigate(
                                    `/admin/purchase-orders/supplier/${supplier.id}`
                                  )
                                }
                              >
                                <History
                                  size={15}
                                />

                                Purchases
                              </button>

                              <button
                                type="button"
                                title="Edit supplier"
                                onClick={() =>
                                  handleEdit(
                                    supplier
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
                                className="delete-button"
                                title="Delete supplier"
                                onClick={() =>
                                  handleDeleteRequest(
                                    supplier
                                  )
                                }
                              >
                                <Trash2
                                  size={15}
                                />
  
                                Delete
                              </button>
  
                            </div>
  
                          </td>
  
                        )}
  
                      </tr>
  
                    )
                  )}
  
                </tbody>
  
              </table>
  
            </div>
  
          )}
  
  
        {/* =========================
            Delete Confirmation
        ========================= */}
  
        <ConfirmModal
          open={
            supplierToDelete !== null
          }
          title={
            supplierToDelete
              ? `Delete ${supplierToDelete.name}?`
              : "Delete Supplier?"
          }
          message={
            supplierToDelete
              ? "This supplier will be permanently deleted. Suppliers assigned to vehicles or linked to purchase history cannot be deleted."
              : ""
          }
          confirmText="Delete Supplier"
          cancelText="Cancel"
          variant="danger"
          loading={
            deleting
          }
          onConfirm={
            handleConfirmDelete
          }
          onCancel={
            handleCancelDelete
          }
        />
  
      </div>
    );
  }
  
  
  export default SuppliersPage;
  