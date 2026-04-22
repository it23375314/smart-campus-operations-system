import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AvailabilityPage from './pages/AvailabilityPage';
import AboutPage from './pages/AboutPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import ResourceList from './pages/admin/ResourceList';
import ResourceForm from './pages/admin/ResourceForm';
import ResourceDetails from './pages/admin/ResourceDetails';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminBookingPage from './pages/admin/AdminBookingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="">
          <Routes>
            {/* Public Institutional Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/availability" element={<AvailabilityPage />} />

            {/* Standard User Dashboards */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            {/* Booking Flow: Visible to Student/Staff & Admin */}
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <BookingFormPage />
              </ProtectedRoute>
            } />
            
            {/* Persona Records: Visibility for Users, Admins, and Managers */}
            <Route path="/my-bookings" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER']}>
                <MyBookingsPage />
              </ProtectedRoute>
            } />
            
            {/* Admin panel: sidebar layout wraps all /admin/* routes */}
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
