import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ClipboardList,
  Archive,
  Car,
  ChartNoAxesCombined,
  FileChartColumn,
  History,
  Layers,
  LogOut,
  Menu,
  PackagePlus,
  ReceiptText,
  Activity,
  ScanSearch,
  Tags,
  Truck,
  Users,
  X,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import autoStockLogo
  from "../../assets/images/autostock-logo.png";

import NotificationBell
  from "../notifications/NotificationBell";


function AppLayout() {
  const navigate =
    useNavigate();


  const location =
    useLocation();


  const {
    fullName,
    role,
    isAdmin,
    signOut,
  } = useAuth();


  const [
    sidebarOpen,
    setSidebarOpen,
  ] =
    useState(false);


  /* =========================
     Logout
  ========================= */

  const logout =
    () => {

      signOut();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };


  /* =========================
     Navigation Class
  ========================= */

  const getLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? "sidebar-link active"
      : "sidebar-link";


  /* =========================
     Close Sidebar
     After Navigation
  ========================= */

  useEffect(() => {

    setSidebarOpen(
      false
    );

  }, [location.pathname]);


  /* =========================
     Disable Body Scroll
     While Mobile Menu Open
  ========================= */

  useEffect(() => {

    if (sidebarOpen) {

      document.body.style.overflow =
        "hidden";
    }
    else {

      document.body.style.overflow =
        "";
    }


    return () => {

      document.body.style.overflow =
        "";
    };

  }, [sidebarOpen]);


  /* =========================
     Escape Closes Menu
  ========================= */

  useEffect(() => {

    const handleEscape = (
      event: KeyboardEvent
    ) => {

      if (
        event.key ===
        "Escape"
      ) {

        setSidebarOpen(
          false
        );
      }
    };


    window.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };

  }, []);


  return (
    <div className="app-layout">

      {/* =========================
          Mobile Header
      ========================= */}

      <header className="mobile-topbar">

        <img
          src={autoStockLogo}
          alt="AutoStock"
          className="mobile-topbar-logo"
        />


        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setSidebarOpen(
              true
            )
          }
          aria-label="Open navigation menu"
        >
          <Menu
            size={24}
          />
        </button>

      </header>


      {/* =========================
          Mobile Backdrop
      ========================= */}

      <button
        type="button"
        aria-label="Close navigation menu"
        className={
          sidebarOpen
            ? "sidebar-backdrop sidebar-backdrop-visible"
            : "sidebar-backdrop"
        }
        onClick={() =>
          setSidebarOpen(
            false
          )
        }
      />


      {/* =========================
          Sidebar
      ========================= */}

      <aside
        className={
          sidebarOpen
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >

        {/* Mobile Close */}

        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
          aria-label="Close navigation menu"
        >
          <X
            size={21}
          />
        </button>


        {/* =========================
            Brand
        ========================= */}

        <div className="sidebar-brand">

          <img
            src={autoStockLogo}
            alt="AutoStock"
            className="sidebar-brand-logo"
          />


          <p className="sidebar-brand-subtitle">
            Inventory Management System
          </p>

        </div>


        {/* =========================
            Navigation
        ========================= */}

        <nav className="sidebar-nav">

          {/* Dashboard */}

          <NavLink
            to="/dashboard"
            className={
              getLinkClass
            }
          >
            <ChartNoAxesCombined
              size={18}
            />

            Dashboard
          </NavLink>


          {/* Cars */}

          <NavLink
            to="/cars"
            className={
              getLinkClass
            }
          >
            <Car
              size={18}
            />

            Cars
          </NavLink>


          {/* VIN Decoder */}

          <NavLink
            to="/vin-decoder"
            className={
              getLinkClass
            }
          >
            <ScanSearch
              size={18}
            />

            VIN Decoder
          </NavLink>


          {/* Brands */}

          <NavLink
            to="/brands"
            className={
              getLinkClass
            }
          >
            <Tags
              size={18}
            />

            Brands
          </NavLink>


          {/* Categories */}

          <NavLink
            to="/categories"
            className={
              getLinkClass
            }
          >
            <Layers
              size={18}
            />

            Categories
          </NavLink>


          {/* Suppliers */}

          <NavLink
            to="/suppliers"
            className={
              getLinkClass
            }
          >
            <Truck
              size={18}
            />

            Suppliers
          </NavLink>


          {/* Stock History */}

          <NavLink
            to="/stock-history"
            className={
              getLinkClass
            }
          >
            <History
              size={18}
            />

            Stock History
          </NavLink>


          {/* Reports */}

          <NavLink
            to="/reports"
            className={
              getLinkClass
            }
          >
            <FileChartColumn
              size={18}
            />

            Reports
          </NavLink>


          {/* =========================
              Admin Only
          ========================= */}

          {isAdmin && (

            <>

              <NavLink
                to="/sales"
                className={
                  getLinkClass
                }
              >
                <ReceiptText
                  size={19}
                />

                Sales
              </NavLink>

              {/* Customers */}

              <NavLink
                to="/customers"
                className={
                  getLinkClass
                }
              >
                <Users
                  size={19}
                />

                Customers
              </NavLink>


              <NavLink
                to="/admin/activity-log"
                className={
                  getLinkClass
                }
              >
                <Activity
                  size={19}
                />

                Activity Log
              </NavLink>


              {isAdmin && (
                <NavLink
                  to="/admin/purchase-orders"
                  className={({ isActive }) =>
                    isActive
                      ? "sidebar-link active"
                      : "sidebar-link"
                  }
                >
                  <ClipboardList
                    size={18}
                  />

                  <span>
                    Purchase Orders
                  </span>
                </NavLink>
              )}

              {/* Add Car */}

              <NavLink
                to="/admin/cars/new"
                className={
                  getLinkClass
                }
              >
                <PackagePlus
                  size={19}
                />

                Add Car
              </NavLink>


              {/* Archived Cars */}

              <NavLink
                to="/admin/cars/archived"
                className={
                  getLinkClass
                }
              >
                <Archive
                  size={19}
                />

                Archived Cars
              </NavLink>

            </>

          )}

        </nav>


        {/* =========================
            User
        ========================= */}

        <div className="sidebar-user">

          <strong>
            {fullName}
          </strong>


          <span>
            {role}
          </span>


          <button
            type="button"
            className="logout-button"
            onClick={
              logout
            }
          >
            <LogOut
              size={17}
            />

            Logout
          </button>

        </div>

      </aside>


      {/* =========================
          Main Content
      ========================= */}

      <main className="main-content">

        {/* =========================
            Admin Notifications
        ========================= */}

        {isAdmin && (

          <div className="layout-notification-area">

            <NotificationBell />

          </div>

        )}


        <div
          key={
            location.pathname
          }
          className="page-transition"
        >
          <Outlet />
        </div>

      </main>

    </div>
  );
}


export default AppLayout;