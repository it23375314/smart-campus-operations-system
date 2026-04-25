import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUnreadCount } from '../services/api';
import {
  Layout,
  PlusCircle,
  User,
  Shield,
  Search,
  Home,
  LogOut,
  UserCircle,
  Bell,
  Settings,
  BarChart3,
  Hexagon,
  Info,
  LayoutDashboard,
  ListChecks,
  LineChart,
  Activity,
  Inbox,
  AlertCircle,
  Wrench,
  ClipboardList
} from "lucide-react";


const UnreadBadge = () => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        setCount(res.data.unreadCount);
      } catch (err) {
        // ignore
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  // ✅ 1. Common Navbar (Visible to Everyone: Guest + All roles)
  const commonItems = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    { path: "/resources", label: "Resources", icon: <Hexagon size={18} /> },
    {
      path: "/availability",
      label: "Availability",
      icon: <Activity size={18} />,
    },
    { path: "/about", label: "About", icon: <Info size={18} /> },
  ];

  // Role-Specific logic
  const getRoleItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'TECHNICIAN':
        return [
          { path: '/technician', label: 'My Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/technician/tickets', label: 'My Tickets', icon: <ClipboardList size={18} /> },
        ];
      case 'ADMIN':
        return [
          { path: '/admin/bookings', label: 'Manage Requests', icon: <Inbox size={18} /> },
          { path: '/admin/analytics', label: 'Strategic Analytics', icon: <BarChart3 size={18} /> },
          { path: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/my-bookings', label: 'All Bookings', icon: <ListChecks size={18} /> },
          { path: '/ticket-list', label: 'Ticket List', icon: <AlertCircle size={18} /> },
          { path: '/technician-management', label: 'Technician Management', icon: <Wrench size={18} /> },
        ];
      case 'MANAGER':
        return [
          { path: '/admin/bookings', label: 'Evaluate Requests', icon: <Inbox size={18} /> },
          { path: '/admin/analytics', label: 'Operational Analytics', icon: <BarChart3 size={18} /> },
          { path: '/admin', label: 'Analytics Dashboard', icon: <LineChart size={18} /> },
        ];
      case 'USER':
      default:
        return [
          { path: '/bookings', label: 'Book Resource', icon: <PlusCircle size={18} /> },
          { path: '/my-bookings', label: 'My Bookings', icon: <User size={18} /> },
          { path: '/my-incidents', label: 'My Incidents', icon: <AlertCircle size={18} /> },
        ];
    }
  };

  const roleItems = getRoleItems();
  const commonItemsForRole = user?.role === 'ADMIN'
    ? commonItems.filter((item) => item.path !== '/about' && item.path !== '/')
    : commonItems;

  const navItems = user?.role === 'TECHNICIAN'
    ? roleItems
    : [...commonItemsForRole, ...roleItems];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 bg-white/80 backdrop-blur-2xl border-b border-white/40 shadow-sm py-4">
      <div className="max-w-[1440px] mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-2xl bg-indigo-600 shadow-indigo-200"
          >
            <Layout size={28} />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight leading-none transition-colors text-slate-800">
              SmartCampus
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors text-indigo-500">
              Excellence Portal
            </span>
          </div>
        </Link>

        {/* Main Nav */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl border transition-all bg-slate-900/5 border-slate-900/5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => `
                relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm overflow-hidden group
                ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm active border border-indigo-100/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                }
              `}
            >
              {item.icon}
              {item.label}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all opacity-0 group-[.active]:opacity-100 bg-indigo-600" />
            </NavLink>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <Link
              to="/notifications"
              className="p-3 transition-all rounded-xl border border-transparent text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-slate-100 relative"
            >
              <Bell size={20} />
              {user && <UnreadBadge />}
            </Link>
            <button className="p-3 transition-all rounded-xl border border-transparent text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-slate-100">
              <Settings size={20} />
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl border transition-all bg-white border-slate-100 shadow-sm">
              <motion.div
                whileHover={{ rotate: 5 }}
                className={`p-2.5 rounded-xl text-white shadow-lg ${
                  user.role === 'ADMIN'
                    ? 'bg-rose-500'
                    : user.role === 'MANAGER'
                      ? 'bg-amber-500'
                      : user.role === 'TECHNICIAN'
                        ? 'bg-teal-600'
                        : 'bg-indigo-600'
                }`}
              >
                <UserCircle size={22} />
              </motion.div>
              <div className="hidden sm:block">
                <div className="text-sm font-black leading-none mb-1 transition-colors text-slate-900">
                  {user.name || user.username}
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-rose-500'
                        : user.role === 'MANAGER'
                          ? 'bg-amber-500'
                          : user.role === 'TECHNICIAN'
                            ? 'bg-teal-500'
                            : 'bg-indigo-500'
                    }`}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest transition-colors text-slate-400">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="h-8 w-px mx-2 transition-colors bg-slate-100" />
              <button
                onClick={handleLogout}
                className="p-2 transition-colors text-slate-400 hover:text-rose-600"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* ✅ 2. Guest View: Show Login */}
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
