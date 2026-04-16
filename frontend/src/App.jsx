import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboard from './pages/AdminDashboard';
import AvailabilityView from './pages/AvailabilityView';
import AboutPage from './pages/AboutPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

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
            <Route path="/availability" element={<AvailabilityView />} />

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
            
            {/* Admin & Intelligence Centers: Strict Access */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
