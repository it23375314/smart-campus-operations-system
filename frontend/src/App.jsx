import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyIncidents from './pages/tickets/MyIncidents';
import CreateIncident from './pages/tickets/CreateIncident';
import IncidentDetails from './pages/tickets/IncidentDetails';
import UpdateIncident from './pages/tickets/UpdateIncident';
import TicketList from './pages/tickets/TicketList';
import TechnicianManagement from './pages/tickets/TechnicianManagement';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianTickets from './pages/technician/TechnicianTickets';
import TechnicianTicketDetail from './pages/technician/TechnicianTicketDetail';

import AvailabilityView from './pages/AvailabilityView';
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
// import AvailabilityView from "./pages/AvailabilityView"; // Duplicate import removed
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

          {/* My Incidents: Visibility for Users to view their reported incidents */}
          <Route path="/my-incidents" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <MyIncidents />
            </ProtectedRoute>
          } />

          {/* Create Incident: Report a new issue */}
          <Route path="/create" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <CreateIncident />
            </ProtectedRoute>
          } />

          {/* View Incident Details: User views their incident details and comments */}
          <Route path="/incident/:id" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <IncidentDetails />
            </ProtectedRoute>
          } />

          {/* Update/Manage Incident: Admin manages ticket status, assigns technician, adds notes */}
          <Route path="/update/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UpdateIncident />
            </ProtectedRoute>
          } />

          {/* Ticket List: Admin overview of reported incidents */}
          <Route path="/ticket-list" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TicketList />
            </ProtectedRoute>
          } />

          {/* Technician Management: Admin manages technician staff */}
          <Route path="/technician-management" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TechnicianManagement />
            </ProtectedRoute>
          } />

          {/* Technician Dashboard */}
          <Route path="/technician" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />
          <Route path="/technician/tickets" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianTickets />
            </ProtectedRoute>
          } />
          <Route path="/technician/ticket/:id" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianTicketDetail />
            </ProtectedRoute>
          } />

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

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
