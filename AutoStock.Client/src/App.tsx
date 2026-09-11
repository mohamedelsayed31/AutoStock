import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import DashboardPage from "./pages/dashboard/DashboardPage";

import CarsPage from "./pages/cars/CarsPage";
import StockHistoryPage from "./pages/cars/StockHistoryPage";
import CarDetailsPage from "./pages/cars/CarDetailsPage";
import CarStockHistoryPage from "./pages/cars/CarStockHistoryPage";

import VinDecoderPage from "./pages/vin/VinDecoderPage";

import BrandsPage from "./pages/admin/BrandsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import SuppliersPage from "./pages/admin/SuppliersPage";

import AddCarPage from "./pages/admin/AddCarPage";
import EditCarPage from "./pages/admin/EditCarPage";
import StockCarPage from "./pages/admin/StockCarPage";
import ArchivedCarsPage from "./pages/admin/ArchivedCarsPage";

import CustomersPage from "./pages/customers/CustomersPage";

import ReportsPage from "./pages/reports/ReportsPage";

import NotFoundPage from "./pages/NotFoundPage";

import SalesPage from "./pages/sales/SalesPage";

import NewSalePage from "./pages/sales/NewSalePage";

import SaleDetailsPage from "./pages/sales/SaleDetailsPage";

import AuditLogsPage from "./pages/admin/AuditLogsPage";

import PurchaseOrdersPage
  from "./pages/admin/purchaseOrders/PurchaseOrdersPage";

import NewPurchaseOrderPage
  from "./pages/admin/purchaseOrders/NewPurchaseOrderPage";

import PurchaseOrderDetailsPage
  from "./pages/admin/purchaseOrders/PurchaseOrderDetailsPage";

import SupplierPurchaseHistoryPage
  from "./pages/admin/purchaseOrders/SupplierPurchaseHistoryPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import GuestRoute from "./routes/GuestRoute";

import AppLayout from "./components/layout/AppLayout";

import {
  useAuth,
} from "./context/AuthContext";


function App() {
  const {
    isAuthenticated,
  } = useAuth();


  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            Root Redirect
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? "/dashboard"
                  : "/login"
              }
              replace
            />
          }
        />


        {/* =========================
            Guest Routes
        ========================= */}

        <Route
          element={<GuestRoute />}
        >

          <Route
            path="/login"
            element={<LoginPage />}
          />


          <Route
            path="/register"
            element={<RegisterPage />}
          />

        </Route>


        {/* =========================
            Protected Routes
        ========================= */}

        <Route
          element={<ProtectedRoute />}
        >

          <Route
            element={<AppLayout />}
          >

            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />


            {/* Cars */}

            <Route
              path="/cars"
              element={<CarsPage />}
            />


            <Route
              path="/cars/:id"
              element={<CarDetailsPage />}
            />


            <Route
              path="/cars/:id/stock-history"
              element={
                <CarStockHistoryPage />
              }
            />


            {/* VIN */}

            <Route
              path="/vin-decoder"
              element={<VinDecoderPage />}
            />


            {/* Lookups */}

            <Route
              path="/brands"
              element={<BrandsPage />}
            />


            <Route
              path="/categories"
              element={<CategoriesPage />}
            />


            <Route
              path="/suppliers"
              element={<SuppliersPage />}
            />


            {/* Stock */}

            <Route
              path="/stock-history"
              element={<StockHistoryPage />}
            />


            {/* Reports */}

            <Route
              path="/reports"
              element={<ReportsPage />}
            />


            {/* =========================
                Admin Only Routes
            ========================= */}

            <Route
              element={<AdminRoute />}
            >

              {/* Customers */}

              <Route
                path="/customers"
                element={<CustomersPage />}
              />


              {/* Sales */}

              <Route
                path="/sales"
                element={<SalesPage />}
              />


              <Route
                path="/sales/new"
                element={<NewSalePage />}
              />


              <Route
                path="/sales/:id"
                element={<SaleDetailsPage />}
              />


              {/* Cars Administration */}

              <Route
                path="/admin/cars/new"
                element={<AddCarPage />}
              />


              <Route
                path="/admin/cars/:id/edit"
                element={<EditCarPage />}
              />


              <Route
                path="/admin/cars/:id/stock"
                element={<StockCarPage />}
              />


              <Route
                path="/admin/cars/archived"
                element={<ArchivedCarsPage />}
              />

              <Route
                path="/admin/activity-log"
                element={<AuditLogsPage />}
              />

              <Route
                path="/admin/purchase-orders"
                element={
                  <PurchaseOrdersPage />
                }
              />

              <Route
                path="/admin/purchase-orders/new"
                element={
                  <NewPurchaseOrderPage />
                }
              />

              <Route
                path="/admin/purchase-orders/:id"
                element={
                  <PurchaseOrderDetailsPage />
                }
              />

              <Route
                path="/admin/purchase-orders/supplier/:supplierId"
                element={
                  <SupplierPurchaseHistoryPage />
                }
              />

            </Route>

          </Route>

        </Route>


        {/* =========================
            Not Found
        ========================= */}

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;