import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Settings, 
  PlusCircle, 
  LogOut, 
  LayoutDashboard,
  Calendar,
  Building2
} from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">Smart Campus</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Panel</p>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-1.5">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" disabled />
          <NavItem to="/admin/resources" icon={<Package size={20} />} label="Resources" />
          <NavItem to="/admin/calendar" icon={<Calendar size={20} />} label="Schedule" disabled />
          <NavItem to="/admin/settings" icon={<Settings size={20} />} label="Settings" disabled />
        </nav>

        <div className="absolute bottom-6 w-full px-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">Campus Admin</p>
                <p className="text-xs text-slate-500 truncate">admin@smartcampus.edu</p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 w-full rounded-xl transition-all duration-200">
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <nav className="flex items-center text-xs font-medium text-slate-400 gap-2 mb-2">
              <Link to="/admin" className="hover:text-slate-600 transition-colors">Admin</Link>
              <span>/</span>
              <span className="text-slate-900">Resource Management</span>
            </nav>
            <h2 className="admin-header">Resources</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/resources/add" className="btn-primary">
              <PlusCircle size={20} />
              Add New Resource
            </Link>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, disabled = false }) => {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3.5 text-slate-400 rounded-xl cursor-default grayscale">
        {icon}
        <span className="font-medium text-sm">{label}</span>
        <span className="ml-auto text-[8px] border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-tighter">Soon</span>
      </div>
    );
  }

  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300
        ${isActive 
          ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className={`${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            {icon}
          </div>
          <span className="font-medium text-sm">{label}</span>
          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
        </>
      )}
    </NavLink>
  );
};

export default AdminLayout;
