import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResourceList from './pages/admin/ResourceList';
import ResourceForm from './pages/admin/ResourceForm';
import ResourceDetails from './pages/admin/ResourceDetails';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/resources" replace />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="resources" element={<ResourceList />} />
          <Route path="resources/add" element={<ResourceForm />} />
          <Route path="resources/edit/:id" element={<ResourceForm />} />
          <Route path="resources/view/:id" element={<ResourceDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
