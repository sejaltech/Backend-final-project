import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import RideSearch from './pages/RideSearch';
import PostRide from './pages/PostRide';
import MyRides from './pages/MyRides';
import EditRide from './pages/EditRide';
import RideDetails from './pages/RideDetails';
import RideRequests from './pages/RideRequests';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-container">
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/rides" replace />} />

              {/* Public Authentication Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public Ride Browsing Pages */}
              <Route path="/rides" element={<RideSearch />} />
              <Route path="/rides/:id" element={<RideDetails />} />

              {/* Protected Routes (Authentication Required) */}
              <Route
                path="/rides/create"
                element={
                  <ProtectedRoute>
                    <PostRide />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rides"
                element={
                  <ProtectedRoute>
                    <MyRides />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rides/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditRide />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rides/:id/requests"
                element={
                  <ProtectedRoute>
                    <RideRequests />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 */}
              <Route
                path="*"
                element={
                  <div className="card" style={{ textAlign: 'center', padding: '4.5rem 2rem', maxWidth: '500px', margin: '2rem auto' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>404 - Page Not Found</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>The requested page or route could not be found.</p>
                    <Link to="/rides" className="btn btn-primary btn-lg">Return to Rides</Link>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
