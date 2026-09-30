# 🚗 Campus Carpooling Platform - React Frontend

The official React + Vite SPA frontend for the Campus Carpooling Platform (Case Study 155), connected to the Express & MongoDB REST API.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 6
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios (with centralized JWT interceptor)
- **Icons**: Lucide React
- **Styling**: Modern Vanilla CSS Design System (`index.css`)

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Navigation bar with responsive mobile menu
│   │   ├── ProtectedRoute.jsx       # Route guard for authenticated paths
│   │   ├── RideCard.jsx             # Ride card with live seat count & actions
│   │   ├── Loading.jsx              # Loading spinner component
│   │   └── ErrorMessage.jsx         # Error alert message component
│   ├── pages/
│   │   ├── Login.jsx                # Student login page
│   │   ├── Register.jsx             # Student registration page
│   │   ├── RideSearch.jsx           # Main ride dashboard & search
│   │   ├── PostRide.jsx             # Ride publication form
│   │   ├── MyRides.jsx              # Driver's ride dashboard
│   │   ├── EditRide.jsx             # Ride update form
│   │   ├── RideDetails.jsx          # Public ride details & join action
│   │   └── RideRequests.jsx         # Driver join request moderation
│   ├── services/
│   │   ├── api.js                   # Central Axios client with interceptors
│   │   ├── authService.js           # Auth REST endpoints
│   │   └── rideService.js           # Ride & Request REST endpoints
│   ├── context/
│   │   └── AuthContext.jsx          # React Context for authentication state
│   ├── App.jsx                      # Route definitions
│   ├── main.jsx                     # Vite React DOM root
│   └── index.css                    # CSS Design System
├── .env                             # Frontend environment variables
├── .env.example                     # Environment template
├── index.html                       # HTML5 entry
├── package.json                     # Frontend dependencies
└── vite.config.js                   # Vite configuration
```

---

## ⚙️ Environment Variables

Create `.env` in the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Running the Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The React frontend will be available at: `http://localhost:5173`

### 3. Production Build
```bash
npm run build
```
