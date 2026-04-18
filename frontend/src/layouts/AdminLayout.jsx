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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
               style={{ background: 'linear-gradient(135deg, #4f46e5, #6d28d9)' }}>
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">Smart Campus</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-6 px-4 space-y-1 flex-1">
          <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Overview" exact />
          <NavItem to="/admin/resources" icon={<Package size={18} />} label="Resources" />
          <NavItem to="/admin/calendar" icon={<Calendar size={18} />} label="Schedule" disabled />
          <NavItem to="/admin/settings" icon={<Settings size={18} />} label="Settings" disabled />
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">Campus Admin</p>
              <p className="text-xs text-slate-400 truncate">admin@smartcampus.edu</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 w-full rounded-xl transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={17} />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top header bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
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
