// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MyIncidents from './pages/tickets/MyIncidents';
import CreateIncident from './pages/tickets/CreateIncident'; // Adjust path if needed
import AdminDashboard from './pages/tickets/AdminDashboard';
import UpdateIncident from './pages/tickets/UpdateIncident'
function App() {
  return (
    <Router>
      {/* The Navbar stays at the top of every page */}
      <Navbar />
      
      {/* The Routes decide which page to show based on the URL */}
      <Routes>
        <Route path="/" element={<MyIncidents />} />
        <Route path="/create" element={<CreateIncident />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/update/:id" element={<UpdateIncident />} />
      </Routes>
    </Router>
  );
}

export default App;