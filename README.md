# 🚚 CargoIQ - Agricultural Cargo Loading Optimization

CargoIQ is a full-stack web application that helps optimize agricultural cargo loading using the **0/1 Knapsack Algorithm**. It assists users in selecting the most profitable combination of cargo items while staying within the truck's weight capacity.

---

## 📌 Features

- Add, edit, and delete cargo items
- Optimize cargo loading using the 0/1 Knapsack Algorithm
- Display selected items and maximum profit
- Responsive and user-friendly interface
- RESTful API built with Express.js
- MongoDB database integration
- Input validation and centralized error handling

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Tools
- Postman
- Git & GitHub
- VS Code
- Swagger API Documentation

---

## 📂 Project Structure

```
CargoIQ/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│
└── cargoiq-backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── server.js
    ├── package.json
    └── .env.example
```

---

## 🚀 Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/CargoIQ.git
```

### Navigate to backend

```bash
cd cargoiq-backend
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file using `.env.example`.

Example:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### Start the server

```bash
npm start
```

Server runs at

```
http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/cargo | Get all cargo items |
| POST | /api/cargo | Add a cargo item |
| PUT | /api/cargo/:id | Update cargo |
| DELETE | /api/cargo/:id | Delete cargo |

---

## 👨‍💻 Author

**Jones D**

# cargo
