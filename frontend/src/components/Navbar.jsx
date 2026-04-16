// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Logo / System Name */}
            <span className="font-bold text-xl tracking-wider">
              Smart Campus
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-150"
            >
              My Incidents
            </Link>
            <Link
              to="/create"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-150"
            >
              Report Issue
            </Link>
            <Link
              to="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-150"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>            
    </nav>
  );
}
