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

  // Derive breadcrumb label from path
  const getBreadcrumb = () => {
    if (location.pathname.includes('/resources/add')) return 'Add Resource';
    if (location.pathname.includes('/resources/edit')) return 'Edit Resource';
    if (location.pathname.includes('/resources/view')) return 'Resource Details';
    if (location.pathname.includes('/resources')) return 'Resources';
    return 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-32 max-w-7xl mx-auto w-full">

        {/* Top header bar */}
        <header className="sticky top-32 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center rounded-2xl mx-4 mt-4 shadow-sm">
          <div>
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-0.5">
              <Link to="/admin" className="hover:text-slate-600 transition-colors">Admin</Link>
              <ChevronRight size={12} />
              <span className="text-slate-700">{getBreadcrumb()}</span>
            </nav>
            <h2 className="text-xl font-bold text-slate-900">{getBreadcrumb()}</h2>
          </div>
          <Link
            to="/admin/resources/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6d28d9)' }}
          >
            <PlusCircle size={17} />
            Add Resource
          </Link>
        </header>

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
