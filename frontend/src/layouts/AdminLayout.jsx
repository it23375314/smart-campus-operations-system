import React from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  Package,
  Settings,
  PlusCircle,
  LogOut,
  LayoutDashboard,
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-24 max-w-7xl mx-auto w-full">


        {/* Page content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, disabled = false, exact = false }) => {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 text-slate-300 rounded-xl cursor-default">
        {icon}
        <span className="font-medium text-sm">{label}</span>
        <span className="ml-auto text-[9px] border border-slate-200 text-slate-300 px-1.5 py-0.5 rounded uppercase tracking-tight">
          Soon
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
        ${isActive
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
          <span>{label}</span>
          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
        </>
      )}
    </NavLink>
  );
};

export default AdminLayout;
