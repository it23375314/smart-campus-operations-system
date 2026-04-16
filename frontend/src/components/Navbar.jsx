import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Layout, PlusCircle, User, Shield, Search, Home, BarChart3, LogOut, UserCircle } from 'lucide-react';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} />, roles: ['USER', 'ADMIN', 'MANAGER'] },
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, roles: ['USER', 'ADMIN', 'MANAGER'] },
    { path: '/bookings', label: 'Book Now', icon: <PlusCircle size={18} />, roles: ['USER', 'ADMIN'] },
    { path: '/my-bookings', label: 'My Bookings', icon: <User size={18} />, roles: ['USER', 'ADMIN', 'MANAGER'] },
    { path: '/availability', label: 'Availability', icon: <Search size={18} />, roles: ['USER', 'ADMIN', 'MANAGER'] },
  ];

  // Admin Dashboard only for ADMIN and MANAGER
  if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <Shield size={18} />, roles: ['ADMIN', 'MANAGER'] });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
            <Layout size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800 hidden sm:inline">SmartCampus</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-2xl border border-slate-100">
              <div className={`p-2 rounded-xl text-white shadow-sm ${
                user.role === 'ADMIN' ? 'bg-rose-500' : user.role === 'MANAGER' ? 'bg-amber-500' : 'bg-indigo-500'
              }`}>
                <UserCircle size={20} />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-black text-slate-900 leading-none">{user.username}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
