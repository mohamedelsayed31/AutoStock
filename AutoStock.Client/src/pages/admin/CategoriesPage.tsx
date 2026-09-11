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
    FolderTree,
    Pencil,
    Plus,
    Trash2,
  } from "lucide-react";
  
  import {
    useAuth,
  } from "../../context/AuthContext";
  
  import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
  } from "../../services/categoryService";
  
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
    Category,
  } from "../../types/category";
  
  
  function CategoriesPage() {
    const navigate =
      useNavigate();
  
  
    const {
      isAdmin,
    } = useAuth();
  
  
    const {
      showToast,
    } = useToast();
  
  
    /* =========================
       Categories
    ========================= */
  
    const [
      categories,
      setCategories,
    ] =
      useState<Category[]>([]);
  
  
    /* =========================
       Form
    ========================= */
  
    const [
      name,
      setName,
    ] =
      useState("");
  
  
    const [
      description,
      setDescription,
    ] =
      useState("");
  
  
    const [
      editingCategoryId,
      setEditingCategoryId,
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
      categoryToDelete,
      setCategoryToDelete,
    ] =
      useState<Category | null>(
        null
      );
  
  
    /* =========================
       Load Categories
    ========================= */
  
    const loadCategories =
      async () => {
  
        setLoading(
          true
        );
  
        setLoadError("");
  
  
        try {
          const result =
            await getCategories();
  
  
          setCategories(
            result
          );
        }
        catch (error) {
  
          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load categories."
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
  
      loadCategories();
  
    }, []);
  
  
    /* =========================
       Reset Form
    ========================= */
  
    const resetForm =
      () => {
  
        setName("");
  
        setDescription("");
  
        setEditingCategoryId(
          null
        );
  
        setFormError("");
  
        setShowForm(
          false
        );
      };
  
  
    /* =========================
       Add Category
    ========================= */
  
    const handleAdd =
      () => {
  
        setName("");
  
        setDescription("");
  
        setEditingCategoryId(
          null
        );
  
        setFormError("");
  
        setShowForm(
          true
        );
      };
  
  
    /* =========================
       Edit Category
    ========================= */
  
    const handleEdit = (
      category: Category
    ) => {
  
      setName(
        category.name
      );
  
  
      setDescription(
        category.description ??
          ""
      );
  
  
      setEditingCategoryId(
        category.id
      );
  
  
      setFormError("");
  
      setShowForm(
        true
      );
    };
  
  
    /* =========================
       Submit Category
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
            "Category name is required."
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
  
            description:
              description.trim() ||
              null,
          };
  
  
          if (
            editingCategoryId !== null
          ) {
  
            await updateCategory(
              editingCategoryId,
              data
            );
  
  
            showToast(
              `${name.trim()} updated successfully.`,
              "success"
            );
          }
          else {
  
            await createCategory(
              data
            );
  
  
            showToast(
              `${name.trim()} created successfully.`,
              "success"
            );
          }
  
  
          resetForm();
  
          await loadCategories();
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              editingCategoryId !== null
                ? "Failed to update category."
                : "Failed to create category."
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
      category: Category
    ) => {
  
      setCategoryToDelete(
        category
      );
    };
  
  
    /* =========================
       Confirm Delete
    ========================= */
  
    const handleConfirmDelete =
      async () => {
  
        if (!categoryToDelete) {
          return;
        }
  
  
        setDeleting(
          true
        );
  
  
        try {
          await deleteCategory(
            categoryToDelete.id
          );
  
  
          showToast(
            `${categoryToDelete.name} deleted successfully.`,
            "success"
          );
  
  
          setCategoryToDelete(
            null
          );
  
  
          await loadCategories();
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to delete category."
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
  
  
        setCategoryToDelete(
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
              Categories Management
            </h1>
  
  
            <p>
              Manage vehicle
              inventory categories
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
  
                Add Category
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
            Category Form
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
  
                  {editingCategoryId !== null
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
  
                    {editingCategoryId !== null
                      ? "Edit Category"
                      : "Add New Category"}
  
                  </h2>
  
  
                  <p>
  
                    {editingCategoryId !== null
                      ? "Update the selected category information."
                      : "Create a new vehicle inventory category."}
  
                  </p>
  
                </div>
  
              </div>
  
  
              {formError && (
  
                <p className="error">
                  {formError}
                </p>
  
              )}
  
  
              <label>
  
                Category Name
  
                <input
                  type="text"
                  value={name}
                  placeholder="Example: SUV"
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
  
                Description
  
                <textarea
                  value={
                    description
                  }
                  placeholder="Describe this vehicle category..."
                  disabled={saving}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                />
  
              </label>
  
  
              <div className="form-actions">
  
                <button
                  type="submit"
                  disabled={saving}
                >
  
                  {editingCategoryId !== null ? (
  
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
                    : editingCategoryId !== null
                      ? "Save Changes"
                      : "Create Category"}
  
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
            message="Loading categories..."
          />
  
        )}
  
  
        {/* =========================
            Load Error
        ========================= */}
  
        {!loading &&
          loadError && (
  
            <ErrorState
              title="Unable to load categories"
              message={
                loadError
              }
              onRetry={
                loadCategories
              }
            />
  
          )}
  
  
        {/* =========================
            Empty State
        ========================= */}
  
        {!loading &&
          !loadError &&
          categories.length === 0 && (
  
            <EmptyState
              icon={FolderTree}
              title="No Categories Found"
              message="There are currently no vehicle categories available in the system."
              actionText={
                isAdmin
                  ? "Add First Category"
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
            Categories Table
        ========================= */}
  
        {!loading &&
          !loadError &&
          categories.length > 0 && (
  
            <div className="table-container">
  
              <table>
  
                <thead>
  
                  <tr>
  
                    <th>
                      ID
                    </th>
  
                    <th>
                      Category Name
                    </th>
  
                    <th>
                      Description
                    </th>
  
                    {isAdmin && (
  
                      <th>
                        Actions
                      </th>
  
                    )}
  
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {categories.map(
                    category => (
  
                      <tr
                        key={
                          category.id
                        }
                      >
  
                        <td>
                          {category.id}
                        </td>
  
  
                        <td>
  
                          <div className="management-name-cell">
  
                            <div className="management-table-icon">
  
                              <FolderTree
                                size={15}
                              />
  
                            </div>
  
  
                            <strong>
                              {category.name}
                            </strong>
  
                          </div>
  
                        </td>
  
  
                        <td>
  
                          {category.description ||
                            "-"}
  
                        </td>
  
  
                        {isAdmin && (
  
                          <td>
  
                            <div className="table-actions">
  
                              <button
                                type="button"
                                title="Edit category"
                                onClick={() =>
                                  handleEdit(
                                    category
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
                                title="Delete category"
                                onClick={() =>
                                  handleDeleteRequest(
                                    category
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
            categoryToDelete !== null
          }
          title={
            categoryToDelete
              ? `Delete ${categoryToDelete.name}?`
              : "Delete Category?"
          }
          message={
            categoryToDelete
              ? "This category will be permanently deleted. If it is currently assigned to any cars, the operation may be rejected to protect inventory data."
              : ""
          }
          confirmText="Delete Category"
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
  
  
  export default CategoriesPage;