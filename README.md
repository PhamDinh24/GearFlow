# GearFlow - Premium Mechanical Keyboard E-commerce

GearFlow is a modern, high-performance e-commerce platform dedicated to mechanical keyboard enthusiasts. Built with a focus on speed, aesthetics, and a seamless user experience.

## 🚀 Technologies

### Backend
- **Java 17** with **Spring Boot 3**
- **Spring Data JPA** for database interaction
- **Spring Security** with **JWT** for authentication
- **VNPay** Integration for secure payments
- **Cloudinary** for image management
- **Lombok** for clean code

### Frontend
- **React** with **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling
- **Redux Toolkit** for state management
- **Framer Motion** for smooth animations

## 🛠️ Key Features

- **Advanced Product Filtering**: Filter by brand, price, switch type, color, and more.
- **Dynamic Recommendations**: Personalized product suggestions based on category and brand.
- **Secure Checkout**: Integrated with VNPay and COD options.
- **Stock Management**: Real-time stock reservation and management system.
- **Admin Dashboard**: Comprehensive analytics, order management, and product bulk operations.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

## 📦 Project Structure

```text
GearFlow/
├── backend/            # Spring Boot Application
│   ├── src/main/java/  # Source code
│   └── src/resources/  # Configuration & static assets
├── frontend/           # Next.js Application
│   ├── src/app/        # App router pages & components
│   └── src/services/   # API integration
└── README.md           # This file
```

## 🏁 Getting Started

### Prerequisites
- JDK 17+
- Node.js 18+
- MySQL/PostgreSQL database

### Running the Backend
1. Navigate to the `backend` directory.
2. Configure your database in `src/resources/application.properties`.
3. Run `./mvnw spring-boot:run`.

### Running the Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License
This project is for educational purposes.
