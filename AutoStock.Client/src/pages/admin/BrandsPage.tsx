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
    Pencil,
    Plus,
    Tag,
    Trash2,
  } from "lucide-react";
  
  import {
    useAuth,
  } from "../../context/AuthContext";
  
  import {
    createBrand,
    deleteBrand,
    getBrands,
    updateBrand,
  } from "../../services/brandService";
  
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
    Brand,
  } from "../../types/brand";
  
  
  function BrandsPage() {
    const navigate =
      useNavigate();
  
  
    const {
      isAdmin,
    } = useAuth();
  
  
    const {
      showToast,
    } = useToast();
  
  
    /* =========================
       Brands
    ========================= */
  
    const [
      brands,
      setBrands,
    ] =
      useState<Brand[]>([]);
  
  
    /* =========================
       Form
    ========================= */
  
    const [
      name,
      setName,
    ] =
      useState("");
  
  
    const [
      country,
      setCountry,
    ] =
      useState("");
  
  
    const [
      editingBrandId,
      setEditingBrandId,
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
      brandToDelete,
      setBrandToDelete,
    ] =
      useState<Brand | null>(
        null
      );
  
  
    /* =========================
       Load Brands
    ========================= */
  
    const loadBrands =
      async () => {
  
        setLoading(
          true
        );
  
        setLoadError("");
  
  
        try {
          const result =
            await getBrands();
  
  
          setBrands(
            result
          );
        }
        catch (error) {
  
          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load brands."
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
  
      loadBrands();
  
    }, []);
  
  
    /* =========================
       Reset Form
    ========================= */
  
    const resetForm =
      () => {
  
        setName("");
  
        setCountry("");
  
        setEditingBrandId(
          null
        );
  
        setFormError("");
  
        setShowForm(
          false
        );
      };
  
  
    /* =========================
       Add Brand
    ========================= */
  
    const handleAdd =
      () => {
  
        setName("");
  
        setCountry("");
  
        setEditingBrandId(
          null
        );
  
        setFormError("");
  
        setShowForm(
          true
        );
      };
  
  
    /* =========================
       Edit Brand
    ========================= */
  
    const handleEdit = (
      brand: Brand
    ) => {
  
      setName(
        brand.name
      );
  
  
      setCountry(
        brand.country ?? ""
      );
  
  
      setEditingBrandId(
        brand.id
      );
  
  
      setFormError("");
  
      setShowForm(
        true
      );
    };
  
  
    /* =========================
       Submit Brand
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
            "Brand name is required."
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
  
            country:
              country.trim() ||
              null,
          };
  
  
          if (
            editingBrandId !== null
          ) {
  
            await updateBrand(
              editingBrandId,
              data
            );
  
  
            showToast(
              `${name.trim()} updated successfully.`,
              "success"
            );
          }
          else {
  
            await createBrand(
              data
            );
  
  
            showToast(
              `${name.trim()} created successfully.`,
              "success"
            );
          }
  
  
          resetForm();
  
          await loadBrands();
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              editingBrandId !== null
                ? "Failed to update brand."
                : "Failed to create brand."
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
      brand: Brand
    ) => {
  
      setBrandToDelete(
        brand
      );
    };
  
  
    /* =========================
       Confirm Delete
    ========================= */
  
    const handleConfirmDelete =
      async () => {
  
        if (!brandToDelete) {
          return;
        }
  
  
        setDeleting(
          true
        );
  
  
        try {
          await deleteBrand(
            brandToDelete.id
          );
  
  
          showToast(
            `${brandToDelete.name} deleted successfully.`,
            "success"
          );
  
  
          setBrandToDelete(
            null
          );
  
  
          await loadBrands();
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to delete brand."
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
  
  
        setBrandToDelete(
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
              Brands Management
            </h1>
  
            <p>
              Manage vehicle brands
              and manufacturers
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
  
                Add Brand
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
            Brand Form
        ========================= */}
  
        {isAdmin &&
          showForm && (
  
            <form
              className="brand-form"
              onSubmit={
                handleSubmit
              }
            >
  
              <div className="management-form-header">
  
                <div className="management-form-icon">
  
                  {editingBrandId !== null
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
                    {editingBrandId !== null
                      ? "Edit Brand"
                      : "Add New Brand"}
                  </h2>
  
                  <p>
                    {editingBrandId !== null
                      ? "Update the selected brand information."
                      : "Create a new vehicle brand."}
                  </p>
  
                </div>
  
              </div>
  
  
              {formError && (
  
                <p className="error">
                  {formError}
                </p>
  
              )}
  
  
              <label>
  
                Brand Name
  
                <input
                  type="text"
                  value={name}
                  placeholder="Example: Toyota"
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
  
                Country
  
                <input
                  type="text"
                  value={country}
                  placeholder="Example: Japan"
                  disabled={saving}
                  onChange={(event) =>
                    setCountry(
                      event.target.value
                    )
                  }
                />
  
              </label>
  
  
              <div className="form-actions">
  
                <button
                  type="submit"
                  disabled={saving}
                >
  
                  {editingBrandId !== null ? (
  
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
                    : editingBrandId !== null
                      ? "Save Changes"
                      : "Create Brand"}
  
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
            message="Loading brands..."
          />
  
        )}
  
  
        {/* =========================
            Load Error
        ========================= */}
  
        {!loading &&
          loadError && (
  
            <ErrorState
              title="Unable to load brands"
              message={
                loadError
              }
              onRetry={
                loadBrands
              }
            />
  
          )}
  
  
        {/* =========================
            Empty State
        ========================= */}
  
        {!loading &&
          !loadError &&
          brands.length === 0 && (
  
            <EmptyState
              icon={Tag}
              title="No Brands Found"
              message="There are currently no vehicle brands available in the system."
              actionText={
                isAdmin
                  ? "Add First Brand"
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
            Brands Table
        ========================= */}
  
        {!loading &&
          !loadError &&
          brands.length > 0 && (
  
            <div className="table-container">
  
              <table>
  
                <thead>
  
                  <tr>
  
                    <th>
                      ID
                    </th>
  
                    <th>
                      Brand Name
                    </th>
  
                    <th>
                      Country
                    </th>
  
                    {isAdmin && (
  
                      <th>
                        Actions
                      </th>
  
                    )}
  
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {brands.map(
                    brand => (
  
                      <tr
                        key={
                          brand.id
                        }
                      >
  
                        <td>
                          {brand.id}
                        </td>
  
  
                        <td>
  
                          <div className="management-name-cell">
  
                            <div className="management-table-icon">
                              <Tag
                                size={15}
                              />
                            </div>
  
                            <strong>
                              {brand.name}
                            </strong>
  
                          </div>
  
                        </td>
  
  
                        <td>
                          {brand.country ||
                            "-"}
                        </td>
  
  
                        {isAdmin && (
  
                          <td>
  
                            <div className="table-actions">
  
                              <button
                                type="button"
                                title="Edit brand"
                                onClick={() =>
                                  handleEdit(
                                    brand
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
                                title="Delete brand"
                                onClick={() =>
                                  handleDeleteRequest(
                                    brand
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
            brandToDelete !== null
          }
          title={
            brandToDelete
              ? `Delete ${brandToDelete.name}?`
              : "Delete Brand?"
          }
          message={
            brandToDelete
              ? "This brand will be permanently deleted. If it is currently used by any cars, the operation may be rejected to protect inventory data."
              : ""
          }
          confirmText="Delete Brand"
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
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
  
  
  export default BrandsPage;