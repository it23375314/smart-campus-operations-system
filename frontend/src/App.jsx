import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyIncidents from './pages/tickets/MyIncidents';
import CreateIncident from './pages/tickets/CreateIncident';
import IncidentDetails from './pages/tickets/IncidentDetails';
import UpdateIncident from './pages/tickets/UpdateIncident';
import TicketList from './pages/tickets/TicketList';

import AvailabilityView from './pages/AvailabilityView';
import AboutPage from './pages/AboutPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import ResourceList from './pages/admin/ResourceList';
import ResourceForm from './pages/admin/ResourceForm';
import ResourceDetails from './pages/admin/ResourceDetails';

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
