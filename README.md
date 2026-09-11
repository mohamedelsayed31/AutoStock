# AutoStock — Automotive Inventory Management System

AutoStock is a full-stack automotive inventory management system for managing vehicles, stock movements, suppliers, customers, purchase orders, sales, inventory valuation, profitability, notifications, and audit history from one centralized platform.

The project combines an **ASP.NET Core / .NET 8 Web API** backend with a **React + TypeScript + Vite** frontend and **SQL Server**. It follows a layered, Clean Architecture-inspired structure to keep business rules, infrastructure concerns, API delivery, and UI responsibilities separated and maintainable.

\---

## Table of Contents

* [Project Overview](#project-overview)
* [Core Features](#core-features)
* [Inventory Cost Accounting](#inventory-cost-accounting)
* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
* [Backend Setup](#backend-setup)
* [Frontend Setup](#frontend-setup)
* [API Overview](#api-overview)
* [Authentication and Authorization](#authentication-and-authorization)
* [Testing and Validation](#testing-and-validation)
* [Screenshots](#screenshots)
* [Important Business Rules](#important-business-rules)
* [Security and Local Configuration](#security-and-local-configuration)
* [Development Notes](#development-notes)
* [Current Status](#current-status)

\---

## Project Overview

AutoStock provides an end-to-end workflow for automotive inventory operations.

The system supports:

* Vehicle inventory management
* Brands and categories
* Suppliers and customers
* Manual Stock In / Stock Out
* Purchase order workflow
* Sales processing
* Weighted-average inventory costing
* Cost of Goods Sold (COGS)
* Gross profit and gross margin reporting
* Legacy inventory cost-basis reconciliation
* Stock transaction history
* Low-stock and out-of-stock alerts
* Notifications
* Audit logging
* JWT authentication
* Role-based authorization
* Dashboard and business reports
* CSV exports
* VIN-related utilities
* Car image uploads
* Search, filtering, and pagination
* Responsive React administration interface

The accounting layer keeps historical sale values immutable. A completed sale stores the cost snapshot used at the time of sale instead of recalculating historical COGS from the car's current inventory cost.

\---

## Core Features

### Vehicle Inventory

Cars can be managed with information such as model, year, selling price, quantity, reorder level, color, fuel type, transmission, brand, category, supplier, active/archive status, average unit cost, and vehicle images.

### Stock Management

AutoStock supports manual Stock In, manual Stock Out, filtered stock history, historical unit-cost snapshots, movement-value snapshots, movement-source tracking, and inventory validation to prevent invalid stock operations.

Stock history can identify movements created by manual operations, sales, purchase orders, and legacy records. When a related source entity exists, the frontend can navigate from a stock transaction to the related Sale or Purchase Order.

### Purchase Orders

The purchasing workflow supports:

```text
Draft → Submitted → Received
              ↘ Cancelled
```

Features include supplier selection, multiple purchase items, quantity and unit-cost validation, immutable totals, submission, receiving, cancellation, automatic inventory updates, weighted-average cost updates, notifications, audit logging, and duplicate-receive protection.

Partial receiving is not supported in the current version.

### Sales

Sales support customer selection, multiple sale items, quantity validation, payment method, revenue calculation, historical unit-cost snapshot, COGS, gross profit, gross margin, stock reduction, stock-history creation, and sale-completed notifications.

### Dashboard and Reports

The dashboard provides operational metrics for total units, brands, categories, suppliers, healthy inventory, low-stock vehicles, and out-of-stock vehicles. Reporting covers inventory, sales, purchasing, profitability, and stock movement, with CSV export where supported.

### Notifications and Audit Log

Notifications include Low Stock, Out of Stock, Sale Completed, and system events. Administrative and accounting-sensitive operations are recorded in the audit log for traceability.

\---

## Inventory Cost Accounting

AutoStock uses **weighted-average inventory costing**.

### Example

Existing inventory:

```text
10 units × EGP 800,000 = EGP 8,000,000
```

New stock:

```text
5 units × EGP 900,000 = EGP 4,500,000
```

New weighted-average unit cost:

```text
(EGP 8,000,000 + EGP 4,500,000) / 15
= EGP 833,333.33
```

### Sale Cost Snapshot

When a sale is created, AutoStock snapshots the current inventory cost into the sale item.

```text
Quantity sold: 2
Selling price: EGP 1,000,000
Average unit cost: EGP 800,000

Revenue      = EGP 2,000,000
COGS         = EGP 1,600,000
Gross Profit = EGP   400,000
Gross Margin = 20%
```

The stored snapshot ensures later inventory-cost changes do not rewrite historical profit.

### Legacy Inventory

Older inventory may have a known quantity but no reliable historical acquisition cost. If:

```text
Quantity > 0
AverageUnitCost = null
```

AutoStock does **not** fabricate an average cost for unknown historical units.

An administrator can use the dedicated one-time endpoint:

```http
PUT /api/InventoryCost/{carId}/basis
```

This operation requires existing stock, requires the current cost to be unknown, does not change quantity, cannot overwrite an already-known basis, creates an audit entry, and affects future accounting only.

\---

## Architecture

AutoStock uses a layered / Clean Architecture-inspired structure.

```text
AutoStock.sln
│
├── AutoStock.API
│   ├── Controllers
│   ├── ExceptionHandling
│   ├── Services
│   ├── Authentication / Authorization
│   └── API startup configuration
│
├── AutoStock.Application
│   ├── DTOs
│   ├── Interfaces
│   ├── Settings
│   └── Common application contracts
│
├── AutoStock.Domain
│   ├── Entities
│   └── Enums
│
├── AutoStock.Infrastructure
│   ├── Data / Entity Framework Core
│   ├── Identity
│   ├── Services
│   └── Migrations
│
├── AutoStock.Tests
│   ├── Integration tests
│   ├── Service tests
│   ├── Accounting tests
│   ├── Concurrency tests
│   ├── Helpers
│   └── Fakes
│
└── AutoStock.Client
    ├── React
    ├── TypeScript
    ├── API integration
    ├── Services
    ├── Pages
    ├── Components
    ├── Context
    └── Utilities
```

### Dependency Direction

```text
Domain
  ↑
Application
  ↑
Infrastructure
  ↑
API

React Client
    ↓ HTTP / JSON
   API
```

Project references:

```text
Application     → Domain
Infrastructure  → Domain + Application
API             → Application + Infrastructure
Tests           → Domain + Application + Infrastructure + API
```

|Layer|Responsibility|
|-|-|
|Domain|Business entities and enums|
|Application|DTOs, interfaces, contracts, settings, shared application models|
|Infrastructure|EF Core, SQL Server, Identity, service implementations|
|API|HTTP endpoints, JWT auth, authorization, exception handling|
|Client|React UI and API integration|
|Tests|Automated business, accounting, integration, and persistence validation|

\---

## Tech Stack

### Backend

* .NET 8
* ASP.NET Core Web API
* Entity Framework Core 8
* ASP.NET Core Identity
* JWT Bearer Authentication
* SQL Server
* Swagger / OpenAPI
* LINQ

### Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* Lucide React
* Responsive CSS

### Testing

* xUnit
* Moq
* EF Core SQLite test database
* SQL Server concurrency coverage for inventory-sensitive scenarios
* ASP.NET Core integration testing

### Development Tools

* Visual Studio
* SQL Server Management Studio
* npm
* Git
* GitHub

\---

## Project Structure

```text
AutoStock/
│
├── AutoStock.API/
├── AutoStock.Application/
├── AutoStock.Client/
├── AutoStock.Domain/
├── AutoStock.Infrastructure/
├── AutoStock.Tests/
├── AutoStock.sln
├── .gitignore
└── README.md
```

\---

## Getting Started

### Prerequisites

Install:

* .NET 8 SDK
* SQL Server
* SQL Server Management Studio (recommended)
* Node.js + npm
* Visual Studio 2022 or newer
* Git

Verify:

```powershell
dotnet --version
node --version
npm.cmd --version
git --version
```

Clone the repository:

```powershell
git clone https://github.com/mohamedelsayed31/AutoStock.git
cd AutoStock
```

\---

## Backend Setup

### 1\. Open the solution

Open:

```text
AutoStock.sln
```

### 2\. Configure the database

The default local development connection uses Windows Authentication:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AutoStockDB;Trusted\_Connection=True;TrustServerCertificate=True"
  }
}
```

For another environment, update the connection string using local configuration, User Secrets, or environment variables as appropriate.

### 3\. Configure local User Secrets

Do **not** commit real JWT signing keys or administrator passwords.

From the repository root:

```powershell
dotnet user-secrets set "Jwt:Key" "YOUR\_STRONG\_JWT\_KEY" --project .\\AutoStock.API\\AutoStock.API.csproj

dotnet user-secrets set "AdminUser:Email" "admin@example.com" --project .\\AutoStock.API\\AutoStock.API.csproj

dotnet user-secrets set "AdminUser:Password" "YOUR\_STRONG\_ADMIN\_PASSWORD" --project .\\AutoStock.API\\AutoStock.API.csproj

dotnet user-secrets set "AdminUser:FullName" "AutoStock Administrator" --project .\\AutoStock.API\\AutoStock.API.csproj
```

> `AdminUser:Password` is used by the current seeder when the configured administrator does not already exist in the database.

### 4\. Restore packages

```powershell
dotnet restore .\\AutoStock.sln
```

### 5\. Apply migrations

Using Visual Studio Package Manager Console:

```powershell
Update-Database -Project AutoStock.Infrastructure -StartupProject AutoStock.API
```

Or, when the EF CLI tool is installed:

```powershell
dotnet ef database update --project .\\AutoStock.Infrastructure --startup-project .\\AutoStock.API
```

### 6\. Run the API

Using the command line:

```powershell
dotnet run --project .\\AutoStock.API\\AutoStock.API.csproj
```

Or set `AutoStock.API` as the Startup Project in Visual Studio and run it.

Swagger can be used in the development environment to inspect and test API endpoints.

\---

## Frontend Setup

Frontend directory:

```text
AutoStock.Client
```

Install dependencies:

```powershell
cd .\\AutoStock.Client
npm.cmd install
```

Create a local `.env` from `.env.example` if needed:

```env
VITE\_API\_BASE\_URL=https://localhost:7140/api
```

> If your API uses a different local port, update `VITE\_API\_BASE\_URL` to match the URL shown by the API/Visual Studio launch profile.

Start development mode:

```powershell
npm.cmd run dev
```

Vite normally displays a URL similar to:

```text
http://localhost:5173
```

Production build:

```powershell
npm.cmd run build
```

\---

## API Overview

Swagger is the source of truth for the complete interactive API contract.

|Area|Example route / pattern|Purpose|
|-|-|-|
|Authentication|`/api/Auth/...`|Login and authentication|
|Cars|`/api/Cars`|Vehicle inventory CRUD and queries|
|Brands|`/api/Brands`|Brand management|
|Categories|`/api/Categories`|Category management|
|Suppliers|`/api/Suppliers`|Supplier management|
|Customers|`/api/Customers`|Customer management|
|Stock|`/api/Stock/...`|Stock in, stock out, stock history|
|Sales|`/api/Sales`|Sale creation and retrieval|
|Purchase Orders|`/api/PurchaseOrders/...`|Purchase workflow and receiving|
|Inventory Cost|`/api/InventoryCost/{carId}/basis`|One-time legacy cost-basis assignment|
|Profit Reports|`/api/ProfitReports`|Revenue, COGS, and profit reporting|
|Notifications|`/api/Notifications/...`|Notifications|
|Audit Logs|`/api/AuditLogs/...`|Administrative audit history|
|Dashboard|`/api/Dashboard/...`|Dashboard metrics|
|Reports|`/api/Reports/...`|Operational reports|
|VIN|`/api/Vin/...`|VIN-related utilities|

### Example — Set Inventory Cost Basis

```http
PUT /api/InventoryCost/12/basis
Authorization: Bearer <admin-jwt>
Content-Type: application/json
```

```json
{
  "unitCost": 6200000,
  "reason": "Opening inventory reconciliation"
}
```

Example response shape:

```json
{
  "carId": 12,
  "carModel": "X5",
  "quantity": 4,
  "previousAverageUnitCost": null,
  "averageUnitCost": 6200000,
  "inventoryValue": 24800000,
  "effectiveAt": "2026-09-11T00:00:00Z",
  "reason": "Opening inventory reconciliation"
}
```

### Stock History Accounting Fields

```json
{
  "id": 1,
  "carId": 12,
  "carModel": "X5",
  "transactionType": "Stock Out",
  "quantity": 2,
  "transactionDate": "2026-09-11T00:00:00Z",
  "unitCost": 6200000,
  "inventoryValue": 12400000,
  "sourceType": "Sale",
  "sourceId": 3,
  "notes": null
}
```

`inventoryValue` represents the value of the movement, not the current total inventory balance.

\---

## Authentication and Authorization

AutoStock uses **ASP.NET Core Identity** with **JWT Bearer authentication**.

Role-based authorization protects administrative functionality. Examples include inventory cost-basis reconciliation, purchase-order administration, selected reporting functionality, and audit-log access.

The Inventory Cost endpoint is explicitly Admin-only.

\---

## Testing and Validation

Run the complete backend test suite:

```powershell
dotnet test .\\AutoStock.Tests\\AutoStock.Tests.csproj
```

Current verified result:

```text
Total:     57
Succeeded: 57
Failed:    0
Skipped:   0
```

Major tested areas include manual stock operations, unit-cost validation, weighted-average cost, unknown legacy cost handling, stock accounting metadata, sale cost snapshots and COGS, purchase-order receiving, duplicate receive protection, concurrent inventory updates, legacy cost-basis assignment, cost-basis overwrite protection, and zero-stock cost-basis rejection.

### Frontend Production Validation

From `AutoStock.Client`:

```powershell
npm.cmd run build
```

The current frontend production build completes successfully.

Security audit:

```powershell
npm.cmd audit
```

Current audit result:

```text
found 0 vulnerabilities
```

\---

## Screenshots

### Login

!\[AutoStock Login](docs/screenshots/login.png)

### Dashboard

!\[AutoStock Dashboard](docs/screenshots/dashboard.png)

### Vehicle Inventory

!\[AutoStock Inventory](docs/screenshots/inventory.png)

### Car Details

!\[AutoStock Car Details](docs/screenshots/car-details.png)

### Manage Stock

!\[AutoStock Manage Stock](docs/screenshots/manage-stock.png)

### Stock History

!\[AutoStock Stock History](docs/screenshots/stock-history.png)

### Purchase Orders

!\[AutoStock Purchase Orders](docs/screenshots/purchase-orders.png)

### Sales

!\[AutoStock Sales](docs/screenshots/sales.png)

### Reports

!\[AutoStock Reports](docs/screenshots/reports.png)

### Profit Report

!\[AutoStock Profit Report](docs/screenshots/profit-report.png)

### Notifications

!\[AutoStock Notifications](docs/screenshots/notifications.png)

### Audit Log

!\[AutoStock Audit Log](docs/screenshots/audit-log.png)

### VIN Decoder

!\[AutoStock VIN Decoder](docs/screenshots/vin-decoder.png)

\---

## Important Business Rules

### Inventory

* Stock quantity cannot become negative.
* Stock In requires a positive unit cost.
* Stock Out snapshots the inventory average cost available before the movement.
* Inventory-sensitive operations use transactional/concurrency-aware updates.

### Weighted Average Cost

* Empty inventory + incoming stock → incoming cost starts the new cost basis.
* Known existing cost + incoming stock → weighted average is recalculated.
* Unknown legacy inventory cost + incoming stock → no fabricated average is created.

### Sales

* A sale snapshots cost at creation time.
* Historical COGS is not recalculated later.
* Revenue with unknown historical cost remains distinguishable from revenue with known cost.

### Purchase Orders

* Only valid status transitions are allowed.
* Receiving adds inventory once.
* Receiving the same purchase order twice is rejected.
* Purchase item cost is stored as the stock-movement cost.

### Legacy Cost Basis

* Requires current stock greater than zero.
* Requires unknown `AverageUnitCost`.
* Cannot overwrite a known basis.
* Does not rewrite historical sales.

### Notifications

* Crossing the reorder threshold can create a Low Stock alert.
* Reaching zero creates an Out of Stock alert.
* Completed sales can create Sale Completed notifications.

\---

## Security and Local Configuration

Sensitive values such as JWT signing keys and administrator passwords are not stored in the repository.

Use ASP.NET Core User Secrets for local backend secrets and environment variables or a production secret manager for deployed environments.

The repository `.gitignore` excludes local or generated content such as:

```text
.vs/
\*\*/bin/
\*\*/obj/
\*\*/node\_modules/
\*\*/dist/
\*\*/.vite/
TestResults/
coverage/
\*.trx
.env
.env.\*
appsettings.Development.json
appsettings.Local.json
\*.log
AutoStock.API/wwwroot/uploads/
```

`AutoStock.Client/.env.example` is intentionally safe to commit as a configuration template.

\---

## Development Notes

### Windows npm commands

If PowerShell execution policy blocks the `npm` shim, use:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd audit
```

### Runtime Uploads

Car images uploaded at runtime are stored under:

```text
AutoStock.API/wwwroot/uploads/
```

This runtime upload directory is excluded from Git so user-uploaded files are not committed to source control.

### Git

The main branch is configured to track:

```text
origin/main
```

Repository:

```text
https://github.com/mohamedelsayed31/AutoStock
```

\---

## Current Status

Verified locally:

```text
Backend build                   ✅
Backend automated tests         ✅ 57 / 57
Frontend TypeScript build       ✅
Frontend Vite production build  ✅
Frontend npm audit              ✅ 0 vulnerabilities
Git repository cleanup          ✅
Tracked-secret scan             ✅
GitHub main branch              ✅
```

Remaining release work:



```text

Optional deployment configuration

Production environment configuration

```

\---

## License

This project was developed as an educational full-stack software engineering project.

