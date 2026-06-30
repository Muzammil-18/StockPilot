# StockPilot - Advanced Inventory & Invoice Management System

StockPilot is a robust, full-stack ERP solution designed for modern businesses to streamline their inventory tracking, sales reporting, and professional invoicing workflows. 

Built with the power of **PostgreSQL**, **Prisma**, **Node.js**, and **React**, it offers a secure multi-user environment with complete data isolation.

---

## Optimized for Desktop & Professional Use

> **Note:** StockPilot is intentionally designed and optimized for **Desktops and Laptops**. 

### Why Desktop Only?
Administrative tasks like **complex multi-item invoice generation**, **nested product configuration**, and **detailed sales analysis** require significant screen real estate for accuracy and speed. We prioritize a high-precision workflow that ensures zero errors during data entry—something that can only be achieved on a professional workstation environment.

---

## Key Features

- **Secure Multi-User System:** Complete data isolation using JWT authentication. User A can never see User B's data.
- **Inventory Management:** Complete CRUD operations for products with unique SKU tracking.
- **Product Bundling (Packages):** Create packages (sets) that contain multiple individual items. Selling a package automatically deducts stock from its components.
- **Variant-Based Inventory:** Full support for product sizes (e.g., Boots size 7, 8, 9). Track individual stock levels per size.
- **Professional Invoicing:** Generate VIP-style professional invoices with customizable delivery charges and discounts.
- **VIP Print Layouts:** Elegant, print-ready templates for both individual invoices and bulk sales reports.
- **Dynamic Reports:** Filter sales data by date range and generate instant revenue summaries.
- **Cloud Database:** Integrated with Neon PostgreSQL for high availability and performance.

---

## Tech Stack

**Frontend:**
- React.js (Vite)
- React Router (SPA)
- Modern CSS with Variable Accents
- Context-less API Integration

**Backend:**
- Node.js & Express
- Prisma ORM (Object-Relational Mapping)
- JWT (JSON Web Tokens) for Security
- PostgreSQL (Hosted on Neon.tech)

---

## Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL database (or Neon.tech URL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Muzammil-18/StockPilot.git
   cd StockPilot
