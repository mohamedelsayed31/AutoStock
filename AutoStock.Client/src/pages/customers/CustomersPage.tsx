import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    UserRound,
  } from "lucide-react";
  
  import {
    createCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer,
  } from "../../services/customerService";
  
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
    Customer,
    CustomerRequest,
  } from "../../types/customer";
  
  
  function CustomersPage() {
    const {
      showToast,
    } = useToast();
  
  
    /* =========================
       Customers
    ========================= */
  
    const [
      customers,
      setCustomers,
    ] =
      useState<Customer[]>([]);
  
  
    /* =========================
       Search
    ========================= */
  
    const [
      search,
      setSearch,
    ] =
      useState("");
  
  
    /* =========================
       Form
    ========================= */
  
    const [
      fullName,
      setFullName,
    ] =
      useState("");
  
  
    const [
      phoneNumber,
      setPhoneNumber,
    ] =
      useState("");
  
  
    const [
      email,
      setEmail,
    ] =
      useState("");
  
  
    const [
      address,
      setAddress,
    ] =
      useState("");
  
  
    const [
      editingCustomerId,
      setEditingCustomerId,
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
      customerToDelete,
      setCustomerToDelete,
    ] =
      useState<Customer | null>(
        null
      );
  
  
    /* =========================
       Load Customers
    ========================= */
  
    const loadCustomers =
      async () => {
  
        setLoading(
          true
        );
  
        setLoadError("");
  
  
        try {
          const result =
            await getCustomers();
  
  
          setCustomers(
            result
          );
        }
        catch (error) {
  
          setLoadError(
            getApiErrorMessage(
              error,
              "Failed to load customers."
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
  
      void loadCustomers();
  
    }, []);
  
  
    /* =========================
       Filter Customers
    ========================= */
  
    const filteredCustomers =
      useMemo(
        () => {
  
          const normalizedSearch =
            search
              .trim()
              .toLowerCase();
  
  
          if (!normalizedSearch) {
            return customers;
          }
  
  
          return customers.filter(
            customer => {
  
              return (
                customer.fullName
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  ) ||
  
                customer.phoneNumber
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  ) ||
  
                (
                  customer.email ??
                  ""
                )
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  ) ||
  
                (
                  customer.address ??
                  ""
                )
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              );
            }
          );
        },
        [
          customers,
          search,
        ]
      );
  
  
    /* =========================
       Reset Form
    ========================= */
  
    const resetForm =
      () => {
  
        setFullName("");
  
        setPhoneNumber("");
  
        setEmail("");
  
        setAddress("");
  
        setEditingCustomerId(
          null
        );
  
        setFormError("");
  
        setShowForm(
          false
        );
      };
  
  
    /* =========================
       Add Customer
    ========================= */
  
    const handleAdd =
      () => {
  
        resetForm();
  
        setShowForm(
          true
        );
      };
  
  
    /* =========================
       Edit Customer
    ========================= */
  
    const handleEdit = (
      customer: Customer
    ) => {
  
      setFullName(
        customer.fullName
      );
  
      setPhoneNumber(
        customer.phoneNumber
      );
  
      setEmail(
        customer.email ??
          ""
      );
  
      setAddress(
        customer.address ??
          ""
      );
  
      setEditingCustomerId(
        customer.id
      );
  
      setFormError("");
  
      setShowForm(
        true
      );
    };
  
  
    /* =========================
       Submit Customer
    ========================= */
  
    const handleSubmit =
      async (
        event:
          React.FormEvent<HTMLFormElement>
      ) => {
  
        event.preventDefault();
  
        setFormError("");
  
  
        if (
          !fullName.trim()
        ) {
  
          setFormError(
            "Customer full name is required."
          );
  
          return;
        }
  
  
        if (
          !phoneNumber.trim()
        ) {
  
          setFormError(
            "Customer phone number is required."
          );
  
          return;
        }
  
  
        const data:
          CustomerRequest = {
  
            fullName:
              fullName.trim(),
  
            phoneNumber:
              phoneNumber.trim(),
  
            email:
              email.trim() ||
              null,
  
            address:
              address.trim() ||
              null,
          };
  
  
        setSaving(
          true
        );
  
  
        try {
  
          if (
            editingCustomerId !==
            null
          ) {
  
            await updateCustomer(
              editingCustomerId,
              data
            );
  
  
            showToast(
              `${data.fullName} updated successfully.`,
              "success"
            );
          }
          else {
  
            await createCustomer(
              data
            );
  
  
            showToast(
              `${data.fullName} created successfully.`,
              "success"
            );
          }
  
  
          resetForm();
  
          await loadCustomers();
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              editingCustomerId !== null
                ? "Failed to update customer."
                : "Failed to create customer."
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
       Delete Request
    ========================= */
  
    const handleDeleteRequest = (
      customer: Customer
    ) => {
  
      setCustomerToDelete(
        customer
      );
    };
  
  
    /* =========================
       Confirm Delete
    ========================= */
  
    const handleConfirmDelete =
      async () => {
  
        if (!customerToDelete) {
          return;
        }
  
  
        setDeleting(
          true
        );
  
  
        try {
  
          await deleteCustomer(
            customerToDelete.id
          );
  
  
          setCustomers(
            current =>
              current.filter(
                customer =>
                  customer.id !==
                  customerToDelete.id
              )
          );
  
  
          showToast(
            `${customerToDelete.fullName} deleted successfully.`,
            "success"
          );
  
  
          setCustomerToDelete(
            null
          );
        }
        catch (error) {
  
          const message =
            getApiErrorMessage(
              error,
              "Failed to delete customer."
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
  
  
        setCustomerToDelete(
          null
        );
      };
  
  
    /* =========================
       Format Date
    ========================= */
  
    const formatDate = (
      value: string
    ) => {
  
      const date =
        new Date(
          value
        );
  
  
      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }
  
  
      return date
        .toLocaleDateString();
    };
  
  
    return (
      <div className="cars-page">
  
        {/* =========================
            Header
        ========================= */}
  
        <div className="cars-header">
  
          <div>
  
            <h1>
              Customers Management
            </h1>
  
            <p>
              Manage dealership customers
              and contact information.
            </p>
  
          </div>
  
  
          <div className="header-actions">
  
            <button
              type="button"
              onClick={
                handleAdd
              }
            >
              <Plus
                size={17}
              />
  
              Add Customer
            </button>
  
          </div>
  
        </div>
  
  
        {/* =========================
            Search
        ========================= */}
  
        <div className="customer-search-bar">
  
          <Search
            size={18}
          />
  
  
          <input
            type="search"
            value={search}
            placeholder="Search by name, phone, email or address..."
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
  
        </div>
  
  
        {/* =========================
            Customer Form
        ========================= */}
  
        {showForm && (
  
          <form
            className="management-form"
            onSubmit={
              handleSubmit
            }
          >
  
            <div className="management-form-header">
  
              <div className="management-form-icon">
  
                {editingCustomerId !==
                null ? (
  
                  <Pencil
                    size={20}
                  />
  
                ) : (
  
                  <Plus
                    size={20}
                  />
  
                )}
  
              </div>
  
  
              <div>
  
                <h2>
  
                  {editingCustomerId !==
                  null
                    ? "Edit Customer"
                    : "Add New Customer"}
  
                </h2>
  
  
                <p>
  
                  {editingCustomerId !==
                  null
                    ? "Update customer contact information."
                    : "Create a new dealership customer."}
  
                </p>
  
              </div>
  
            </div>
  
  
            {formError && (
  
              <p className="error">
                {formError}
              </p>
  
            )}
  
  
            <label>
  
              Full Name
  
              <input
                type="text"
                value={
                  fullName
                }
                placeholder="Example: Ahmed Mohamed"
                disabled={
                  saving
                }
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                required
              />
  
            </label>
  
  
            <label>
  
              Phone Number
  
              <input
                type="tel"
                value={
                  phoneNumber
                }
                placeholder="Example: 01012345678"
                disabled={
                  saving
                }
                onChange={(event) =>
                  setPhoneNumber(
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
                value={
                  email
                }
                placeholder="Example: customer@email.com"
                disabled={
                  saving
                }
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
              />
  
            </label>
  
  
            <label>
  
              Address
  
              <textarea
                value={
                  address
                }
                placeholder="Customer address..."
                disabled={
                  saving
                }
                rows={3}
                onChange={(event) =>
                  setAddress(
                    event.target.value
                  )
                }
              />
  
            </label>
  
  
            <div className="form-actions">
  
              <button
                type="submit"
                disabled={
                  saving
                }
              >
  
                {editingCustomerId !==
                null ? (
  
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
                  : editingCustomerId !==
                      null
                    ? "Save Changes"
                    : "Create Customer"}
  
              </button>
  
  
              <button
                type="button"
                className="secondary-button"
                disabled={
                  saving
                }
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
            message="Loading customers..."
          />
  
        )}
  
  
        {/* =========================
            Error
        ========================= */}
  
        {!loading &&
          loadError && (
  
            <ErrorState
              title="Unable to load customers"
              message={
                loadError
              }
              onRetry={
                loadCustomers
              }
            />
  
          )}
  
  
        {/* =========================
            Empty Database
        ========================= */}
  
        {!loading &&
          !loadError &&
          customers.length === 0 && (
  
            <EmptyState
              icon={UserRound}
              title="No Customers Found"
              message="No customers have been added to AutoStock yet."
              actionText="Add First Customer"
              onAction={
                handleAdd
              }
            />
  
          )}
  
  
        {/* =========================
            Empty Search
        ========================= */}
  
        {!loading &&
          !loadError &&
          customers.length > 0 &&
          filteredCustomers.length ===
            0 && (
  
            <EmptyState
              icon={Search}
              title="No Matching Customers"
              message="No customers match the current search."
              actionText="Clear Search"
              onAction={() =>
                setSearch("")
              }
            />
  
          )}
  
  
        {/* =========================
            Customers Table
        ========================= */}
  
        {!loading &&
          !loadError &&
          filteredCustomers.length >
            0 && (
  
            <div className="table-container">
  
              <table>
  
                <thead>
  
                  <tr>
  
                    <th>
                      ID
                    </th>
  
                    <th>
                      Customer
                    </th>
  
                    <th>
                      Phone
                    </th>
  
                    <th>
                      Email
                    </th>
  
                    <th>
                      Address
                    </th>
  
                    <th>
                      Created
                    </th>
  
                    <th>
                      Actions
                    </th>
  
                  </tr>
  
                </thead>
  
  
                <tbody>
  
                  {filteredCustomers.map(
                    customer => (
  
                      <tr
                        key={
                          customer.id
                        }
                      >
  
                        <td>
                          {customer.id}
                        </td>
  
  
                        <td>
  
                          <div className="management-name-cell">
  
                            <div className="management-table-icon">
  
                              <UserRound
                                size={15}
                              />
  
                            </div>
  
  
                            <strong>
                              {customer.fullName}
                            </strong>
  
                          </div>
  
                        </td>
  
  
                        <td>
  
                          <span className="supplier-contact-cell">
  
                            <Phone
                              size={14}
                            />
  
                            {customer.phoneNumber}
  
                          </span>
  
                        </td>
  
  
                        <td>
  
                          {customer.email ? (
  
                            <span className="supplier-contact-cell">
  
                              <Mail
                                size={14}
                              />
  
                              {customer.email}
  
                            </span>
  
                          ) : (
                            "-"
                          )}
  
                        </td>
  
  
                        <td>
  
                          {customer.address ? (
  
                            <span className="supplier-contact-cell supplier-address-cell">
  
                              <MapPin
                                size={14}
                              />
  
                              {customer.address}
  
                            </span>
  
                          ) : (
                            "-"
                          )}
  
                        </td>
  
  
                        <td>
                          {formatDate(
                            customer.createdAt
                          )}
                        </td>
  
  
                        <td>
  
                          <div className="table-actions">
  
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  customer
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
                              onClick={() =>
                                handleDeleteRequest(
                                  customer
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
            customerToDelete !== null
          }
          title={
            customerToDelete
              ? `Delete ${customerToDelete.fullName}?`
              : "Delete Customer?"
          }
          message="This customer will be permanently deleted. Once sales are linked to customers, deletion may be restricted to protect transaction history."
          confirmText="Delete Customer"
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
  
  
  export default CustomersPage;