import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboard from './pages/AdminDashboard';
import AvailabilityView from './pages/AvailabilityView';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Standard User Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            {/* Booking flow for Users and Admins */}
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <BookingFormPage />
              </ProtectedRoute>
            } />
            
            {/* View own or all bookings */}
            <Route path="/my-bookings" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER']}>
                <MyBookingsPage />
              </ProtectedRoute>
            } />
            
            {/* Resource visibility */}
            <Route path="/availability" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER']}>
                <AvailabilityView />
              </ProtectedRoute>
            } />
            
            {/* Admin only dashboard */}
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
