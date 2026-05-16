# GearFlow - Premium Mechanical Keyboard E-commerce

GearFlow is a modern, high-performance e-commerce platform dedicated to mechanical keyboard enthusiasts. It features a sophisticated UI, real-time inventory management, and a comprehensive administrative suite.

## 🚀 Technologies

### Backend
- **Java 17** with **Spring Boot 3.1.5**
- **Spring Data JPA** & **Hibernate 6**
- **PostgreSQL 17.4** (Database)
- **Redis** (Caching & Rate Limiting)
- **Spring Security** with **JWT** authentication
- **Flyway** (Database Migrations)
- **VNPay Integration** (Secure Payment Gateway)
- **Cloudinary** (Cloud Image Management)

### Frontend
- **React 18** with **Vite 6**
- **TypeScript** for enterprise-grade type safety
- **Tailwind CSS 4** for advanced styling
- **Shadcn UI** & **Radix UI** components
- **React Router 7** (Routing)
- **Recharts** (Data Visualization)
- **Axios** (API Communication)
- **Lucide React** (Modern Iconography)

## 🛠️ Key Features

### 🛒 Customer Experience
- **Premium Product Catalog**: Advanced filtering by brand, category, price, and stock status.
- **Ultra-Modern Review System**: Sophisticated, minimalist review interface with rating distribution and editorial layouts.
- **Secure Shopping Cart**: Granular item selection and real-time total calculation.
- **Multi-Payment Options**: Integrated with VNPay (Sandbox) and Cash on Delivery (COD).
- **User Dashboard**: Profile management, order history tracking, and wishlist.

### 🛡️ Administrative Suite
- **Advanced Dashboard**: Real-time sales analytics, brand/category performance charts, and inventory alerts.
- **Inventory Management**: Bulk operations for products, variants (switches/colors), and stock controls.
- **Order Processing**: Detailed order tracking, status updates, and fulfillment workflow.
- **Comprehensive Reporting**: Export professional PDF, Excel, and Word reports for sales and inventory.
- **Customer Management**: Detailed customer insights and order history.

## 📦 Project Structure

```text
GearFlow/
├── backend/            # Spring Boot REST API
│   ├── src/main/java/  # Java Source code (Controllers, Services, Entities)
│   ├── src/resources/  # application.yml, migrations (Flyway)
│   └── pom.xml         # Maven dependencies
├── frontend/           # Vite + React SPA
│   ├── src/app/        # Components, Services, Hooks, and Styles
│   ├── src/styles/     # Global Tailwind & Custom CSS
│   └── package.json    # Frontend dependencies
└── README.md           # Documentation
```

## 🏁 Getting Started

### Prerequisites
- **JDK 17** or higher
- **Node.js 18** or higher
- **PostgreSQL 17**
- **Redis Server** (optional but recommended for caching)

### Running the Backend
1. Navigate to the `backend` directory.
2. Ensure PostgreSQL is running and a database named `gearflow` exists.
3. Update `src/main/resources/application.yml` with your database credentials.
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   *The server will start on [http://localhost:8080/api](http://localhost:8080/api)*

### Running the Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the application at [http://localhost:5173](http://localhost:5173)

## 📄 License
This project is for educational and portfolio purposes.

---
Built with ❤️ by PhamDinh24
