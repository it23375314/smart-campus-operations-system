import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AboutPage from './pages/AboutPage';
import ResourcesPage from './pages/ResourcesPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import ResourceList from './pages/admin/ResourceList';
import ResourceForm from './pages/admin/ResourceForm';
import ResourceDetails from './pages/admin/ResourceDetails';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminBookingPage from './pages/admin/AdminBookingPage';
import { useAuth } from "./context/AuthContext";
import AvailabilityView from "./pages/AvailabilityView";
// Dhanushka's pages (Auth + Notifications)
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Notifications from "./pages/Notifications";
import OAuthSuccess from "./pages/OAuthSuccess";


function App() {

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/availability" element={<AvailabilityView />} />

          {/* Auth routes */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
          />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Booking routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="resources" replace />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="bookings" element={<AdminBookingPage />} />
            <Route path="resources" element={<ResourceList />} />
            <Route path="resources/add" element={<ResourceForm />} />
            <Route path="resources/edit/:id" element={<ResourceForm />} />
            <Route path="resources/view/:id" element={<ResourceDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
