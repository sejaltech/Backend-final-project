# 🚗 Campus Carpooling Platform (Case Study 155)

Full-stack college carpooling system with a Node.js/Express/MongoDB REST API backend and a modern React (Vite) frontend.

---

## 📂 Project Architecture

```
BACKEND FINAL PROJECT/
│
├── backend/                                   # Express & MongoDB Atlas REST API
│   ├── src/
│   │   ├── config/db.js                       # Mongoose connection
│   │   ├── controllers/                       # Auth, Ride, and RideRequest controllers
│   │   ├── middleware/                        # Auth, Ownership, and Error handling
│   │   ├── models/                            # Student, Ride, and RideRequest schemas
│   │   ├── routes/                            # Express routes
│   │   └── app.js                             # Express application setup
│   ├── server.js                              # Backend server entry point
│   ├── test/api.test.js                       # 22 automated integration tests
│   ├── thunder-collection_campus_carpooling.json # Thunder Client / Postman collection
│   ├── .env                                   # Backend environment variables
│   ├── .env.example                           # Backend environment template
│   ├── .gitignore                             # Git ignore rules
│   ├── package.json                           # Backend dependencies
│   └── README.md                              # Backend API documentation
│
└── frontend/                                  # React 18 + Vite SPA Client
    ├── src/
    │   ├── components/                        # Navbar, ProtectedRoute, RideCard, etc.
    │   ├── pages/                             # Login, Register, RideSearch, PostRide, etc.
    │   ├── services/                          # Central Axios client & API service calls
    │   ├── context/AuthContext.jsx            # Authentication state provider
    │   ├── App.jsx                            # React Router setup
    │   ├── main.jsx                           # React DOM root
    │   └── index.css                          # Modern CSS design system
    ├── index.html                             # Single-page HTML shell
    ├── vite.config.js                         # Vite configuration
    ├── .env                                   # Frontend environment variables
    ├── .env.example                           # Frontend environment template
    ├── package.json                           # Frontend dependencies
    └── README.md                              # Frontend documentation
```

---

## 🚀 How to Run the Full-Stack Application

### 1. Run Backend Server

```bash
cd backend
npm install
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Run Backend Tests**: `npm test`

---

### 2. Run Frontend Client

```bash
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:5173`
