# Keyboard Shop - Mechanical Keyboard E-commerce Platform

A full-stack web application for selling mechanical keyboards built with React, Spring Boot, JWT, and MySQL.

## Project Structure

```
keyboard-shop/
├── backend/                 # Spring Boot REST API
│   ├── src/main/java/com/keyboard/
│   │   ├── controller/     # REST endpoints
│   │   ├── service/        # Business logic
│   │   ├── entity/         # JPA entities
│   │   ├── repository/     # Data access
│   │   ├── dto/            # Data transfer objects
│   │   ├── security/       # JWT & authentication
│   │   └── config/         # Spring configuration
│   └── pom.xml
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth, Cart)
│   │   ├── api/           # API calls
│   │   └── styles/        # CSS styles
│   └── package.json
└── database/              # Database setup
    └── init.sql
```

## Features

- **User Authentication**: Register, login with JWT tokens
- **Product Management**: Browse, search, filter keyboards by brand, price, switch type
- **Shopping Cart**: Add/remove items, manage quantities
- **Order Management**: Place orders, view order history
- **Admin Panel**: Create, update, delete products (admin only)
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Security with JWT
- Spring Data JPA
- MySQL 8.0
- Maven

### Frontend
- React 18
- React Router v6
- Axios
- CSS3

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### Database Setup

1. Create MySQL database:
```bash
mysql -u root -p < database/init.sql
```

2. Update `backend/src/main/resources/application.yml` with your MySQL credentials:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/keyboard_shop
    username: root
    password: your_password
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search?keyword=...` - Search products
- `GET /api/products/filter?brand=...&minPrice=...&maxPrice=...&switchType=...` - Filter products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/{userId}` - Get user orders
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/status` - Update order status (admin only)

## Default Credentials

**Admin Account:**
- Email: `admin@keyboard.com`
- Password: `password`

**Test User:**
- Email: `user@keyboard.com`
- Password: `password`

## Important Notes

1. **JWT Secret**: Change the JWT secret in `application.yml` for production
2. **CORS**: Frontend URL is configured for `http://localhost:3000`
3. **Database**: Sample data is included in `init.sql`
4. **Password Encoding**: Passwords are hashed using BCrypt

## Development Tips

- Backend logs are available in console
- Frontend uses React Context for state management
- Cart data is persisted in localStorage
- JWT token is stored in localStorage

## Future Enhancements

- Payment gateway integration
- Email notifications
- Product reviews and ratings
- Wishlist feature
- Admin dashboard
- Order tracking
- Inventory management

## License

This project is for educational purposes.
