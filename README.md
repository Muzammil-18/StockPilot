# Inventory & Invoice Management System

A beginner-friendly, modern, and fully responsive full-stack Inventory & Invoice Management System built using React.js (Frontend), Node.js + Express.js (Backend), and PostgreSQL with Prisma ORM.

## Prerequisites

Ensure you have the following installed on your system:
1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **PostgreSQL** (v14 or higher running locally)

---

## PostgreSQL Database Setup

1. Open your PostgreSQL terminal (pgAdmin, psql, or any client tool).
2. Create a new database named `inventory_db`:
   ```sql
   CREATE DATABASE inventory_db;
   ```
3. Verify that your PostgreSQL server is running on `localhost:5432`.
4. Open the file `backend/.env` and update the connection credentials if necessary:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db?schema=public"
   ```
   Replace the first `postgres` with your database username and the second `postgres` with your database password.

---

## Installation & Database Migrations

### 1. Set Up Backend

1. Open your terminal or Command Prompt.
2. Navigate to the backend directory:
   ```bash
   cd "C:\Users\MURTAZA SB\inventory-system\backend"
   ```
3. Install the backend dependencies:
   ```bash
   npm install
   ```
4. Run the Prisma migration to create the tables in your PostgreSQL database:
   ```bash
   npx prisma migrate dev --name init
   ```
   This command creates the database tables and generates the Prisma Client.

### 2. Set Up Frontend

1. Open a second terminal window.
2. Navigate to the frontend directory:
   ```bash
   cd "C:\Users\MURTAZA SB\inventory-system\frontend"
   ```
3. Install the frontend dependencies:
   ```bash
   npm install
   ```

---

## Running the Application

### 1. Start the Backend Server

From the backend terminal:
```bash
npm run dev
```
The server will start on port `5000` (e.g., `http://localhost:5000`).

### 2. Start the Frontend Dev Server

From the frontend terminal:
```bash
npm run dev
```
The React development server will start on port `3000` (e.g., `http://localhost:3000`).

Open `http://localhost:3000` in your web browser.

---

## How to Test the Flow

1. **Register**: Navigate to the Register page, enter your Name, Email, and Password. Click register. It will automatically log you in and redirect you to the Dashboard.
2. **Add Products**: Go to the Products page, click **Add Product** and fill in details (SKU, Category, Cost Price, Selling Price, Stock). Submit it.
3. **Add Customers**: Go to the Customers page, click **Add Customer**, enter the Name and Phone (and optional Email/Address) and save.
4. **Create Invoices**: Go to the Invoices page, click **Create Invoice**:
   - Select the customer you created.
   - Choose a product.
   - Set the quantity (ensure it does not exceed the available stock).
   - Check the automatically updated Subtotal and Grand Total.
   - Click **Save Invoice**.
   - Review how the stock level of your product automatically decreases.
5. **Print Invoices**: Go to the Invoice details or listing, click the **Print** icon, and see the printer layout preview trigger automatically.
6. **Reports**: Navigate to the Reports page to see aggregate totals (Total Sales, Invoices, Products, Customers) and lists of completed transactions.
