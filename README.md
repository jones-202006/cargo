# 🚚 CargoIQ - Agricultural Cargo Loading Optimization

CargoIQ is a full-stack web application that helps optimize agricultural cargo loading using the **0/1 Knapsack Algorithm** (with optional volume constraint for 3D optimization). It assists users in selecting the most profitable combination of cargo items while staying within the truck's weight (and volume) capacity.

---

## 📌 Features

- **User Authentication** — Register & login with JWT-based auth (Admin/Employee roles)
- **CRUD Operations** — Add, edit, delete cargo items
- **Search & Filter** — Search cargo items by name
- **Knapsack Optimization** — 0/1 Knapsack Algorithm (weight-only or weight+volume 3D DP)
- **Visual Dashboard** — Truck visualization with color-coded loaded/rejected items
- **Delivery Pipeline** — Track shipments through Queued → Dispatched → In Transit → Delivered
- **Analytics Charts** — Capacity usage & category distribution (Chart.js)
- **DP Table Viewer** — Learn tab with step-by-step algorithm explanation
- **Responsive UI** — Dark-themed, mobile-friendly interface
- **Centralized Error Handling** — Consistent error responses across all endpoints
- **Swagger API Docs** — Interactive API documentation at `/api-docs`

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs

### Database
- MongoDB Atlas
- Mongoose ODM

### Tools
- Postman
- Git & GitHub
- VS Code
- Swagger (swagger-jsdoc + swagger-ui-express)

---

## 📂 Project Structure

```
CargoIQ/
│
├── frontend/
│   ├── index.html            # Main application UI
│   ├── login.html            # Login page
│   ├── css/
│   │   ├── style.css         # App styles (dark theme)
│   │   └── login.css         # Login page styles
│   └── js/
│       ├── script.js         # App logic (CRUD, optimization, charts)
│       └── login.js          # Login/register logic
│
└── cargoiq-backend/
    ├── config/
    │   ├── db.js             # MongoDB connection
    │   └── swagger.js        # Swagger/OpenAPI configuration
    ├── controllers/
    │   ├── cargoController.js # Cargo CRUD + optimization handlers
    │   └── authController.js  # Register & login handlers
    ├── middleware/
    │   ├── authMiddleware.js  # JWT verification guard
    │   ├── validateCargo.js   # Request body validation
    │   └── errorHandler.js    # Centralized error handling
    ├── models/
    │   ├── CargoItem.js       # Cargo schema (name, weight, profit, volume, destination, etc.)
    │   └── User.js            # User schema (name, email, password, role)
    ├── routes/
    │   ├── cargoRoutes.js     # Cargo API routes (protected)
    │   └── authRoutes.js      # Auth API routes (public)
    ├── services/
    │   ├── knapsackService.js # 0/1 Knapsack DP (weight + volume)
    │   └── cargoService.js    # Data access layer for CargoItem
    ├── server.js              # Express app entry point
    ├── package.json
    └── .env.example
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

### Clone the repository

```bash
git clone https://github.com/yourusername/CargoIQ.git
cd CargoIQ
```

### Backend setup

```bash
cd cargoiq-backend
npm install
```

### Configure environment variables

Create a `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
```

### Start the server

```bash
npm start
```

Server runs at:

```
http://localhost:5000
```

### Open the frontend

Simply open `frontend/index.html` in your browser (or serve via any static server).

---

## 📡 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and receive JWT token | ❌ |

### Cargo Items (Protected — JWT Required)

| Method | Endpoint | Description | 
|--------|----------|-------------|
| GET | `/api/cargo` | Get all cargo items |
| GET | `/api/cargo/:id` | Get a single cargo item by ID |
| POST | `/api/cargo` | Add a new cargo item |
| PUT | `/api/cargo/:id` | Update an existing cargo item |
| DELETE | `/api/cargo/:id` | Delete a cargo item |
| POST | `/api/cargo/optimize` | Run knapsack optimization |
| GET | `/api/cargo/test` | Health check for cargo routes |

### API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api-docs` | Swagger UI interactive documentation |

---

### Authentication Details

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "Employee" // Optional: "Admin" or "Employee" (default: "Employee")
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
// Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Employee"
  }
}
```

### Cargo Item Schema

| Field | Type | Required | Default | Description |
|-------|------|:--------:|---------|-------------|
| `itemName` | String | ✅ | — | Name of the cargo item |
| `weight` | Number | ✅ | — | Weight in kg (min: 1) |
| `profit` | Number | ✅ | — | Value/priority score (min: 0) |
| `volume` | Number | ❌ | `1` | Volume in m³ (min: 0.1) |
| `destination` | String | ✅ | — | Destination city |
| `category` | String | ❌ | `"General"` | Item category |
| `status` | String | ❌ | `"Pending"` | Enum: `Pending`, `Loaded`, `Rejected` |

### Optimization Endpoint

```json
POST /api/cargo/optimize
{
  "maxWeight": 500,
  "maxVolume": 15
}
// Response:
{
  "selectedItems": [...],
  "rejectedItems": [...],
  "selectedIds": ["..."],
  "totalWeight": 450,
  "totalVolume": 12.5,
  "totalProfit": 350,
  "efficiency": 83.33,
  "dpOps": 7500
}
```

---

## 🔐 Authentication Flow

1. User registers via `POST /api/auth/register`
2. User logs in via `POST /api/auth/login` → receives JWT token + user object
3. Store token and user in `localStorage`
4. All subsequent API calls include `Authorization: Bearer <token>` header
5. Backend verifies token via `authMiddleware` before processing requests
6. Token expires in 1 day (configurable via JWT secret)

---

## 🧮 Knapsack Algorithm

The optimization supports two modes:

1. **Weight-only** — Classic 0/1 Knapsack using DP (O(n × W) time)
2. **Weight + Volume (3D)** — Extended DP with a volume dimension, scaled by factor 10 for decimal precision

The algorithm:
- Builds a DP table from bottom up
- Returns selected items, rejected items, totals, and efficiency score
- Efficiency is a weighted average of weight usage (50%) and volume usage (50%)

---

## 👨‍💻 Author

**Jones D**

---

> **Note**: The `.env` file contains sensitive credentials and should never be committed to version control. Only `.env.example` with placeholder values is tracked.
