import React from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
  Activity,
  Info,
  Hexagon,
  LayoutDashboard,
  Inbox,
  BarChart3,
  ListChecks,
  LineChart,
  ChevronDown,
  ShieldHalf,
  Command,
  Settings2,
  AlertCircle,
  Wrench,
  ClipboardList
} from "lucide-react";
import {
  getUnreadCount
} from "../services/api";

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
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    { path: "/availability", label: "Availability", icon: <Activity size={18} /> },
    { path: "/about", label: "About", icon: <Info size={18} /> },
  ];

  // Role-Specific logic
  const getRoleItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'ADMIN':
        return [
          { path: '/admin', label: 'Admin Panel', icon: <LayoutDashboard size={18} /> },
          { path: '/ticket-list', label: 'Incidents', icon: <AlertCircle size={18} /> },
          { path: '/users', label: 'User Management', icon: <Shield size={18} /> },
          { path: '/admin', label: 'Resource Management', icon: <LayoutDashboard size={18} /> },
          { path: '/ticket-list', label: 'Incident Management', icon: <AlertCircle size={18} /> },
        ];
      case 'MANAGER':
        return [
          { path: '/admin', label: 'Manager Panel', icon: <LayoutDashboard size={18} /> },
          { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
        ];
      case 'TECHNICIAN':
        return [
          { path: '/technician', label: 'Tech Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/technician/tickets', label: 'My Work', icon: <ClipboardList size={18} /> },
        ];
      case 'USER':
        return [
          { path: '/bookings', label: 'Book', icon: <PlusCircle size={18} /> },
          { path: '/my-bookings', label: 'My Bookings', icon: <User size={18} /> },
          { path: '/my-incidents', label: 'My Incidents', icon: <AlertCircle size={18} /> },
        ];
      default:
        return [];
    }
  };

  const getManagementItems = () => {
    if (!user) return [];
    switch (user.role) {
      case "ADMIN":
        return [
          { path: '/admin/analytics', label: 'Strategic Analytics', icon: <BarChart3 size={18} /> },
          { path: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} /> },
          { path: '/my-bookings', label: 'All Bookings', icon: <ListChecks size={18} /> },
          { path: '/ticket-list', label: 'Ticket List', icon: <AlertCircle size={18} /> },
          { path: '/technician-management', label: 'Technician Management', icon: <Wrench size={18} /> },
          {
            path: "/users",label: "User Management",icon: <Shield size={18} />,},
          { path: '/admin/bookings', label: 'All Bookings', icon: <ListChecks size={18} /> },
          { path: '/admin/bookings?status=PENDING', label: 'Manage Requests', icon: <Inbox size={18} /> },
        ];
      case "MANAGER":
        return [
          { path: '/admin/bookings', label: 'Evaluate Requests', icon: <Inbox size={18} /> },
          { path: '/admin/analytics', label: 'Operational Analytics', icon: <BarChart3 size={18} /> },
          { path: '/admin', label: 'Analytics Dashboard', icon: <LineChart size={18} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = [...commonItems, ...getRoleItems()];
  const managementItems = getManagementItems();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 bg-white/90 backdrop-blur-2xl border-b border-white/40 shadow-sm py-2">
      <div className="max-w-[1440px] mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-xl ${user?.role === 'ADMIN' ? 'bg-rose-600' : user?.role === 'MANAGER' ? 'bg-amber-600' : 'bg-indigo-600'}`}
          >
            <ShieldHalf size={22} />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight leading-none text-slate-900 group-hover:text-indigo-600 transition-colors">
              SmartCampus
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Operations Center
            </span>
          </div>
        </Link>

        {/* Main Nav */}
        <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-[1.25rem] bg-slate-100/80 border border-slate-200/40">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => `
                relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all text-[12px] group
                ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm border border-indigo-100/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/40 uppercase tracking-tighter"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`}>
                    {React.cloneElement(item.icon, { size: 16 })}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}

          {managementItems.length > 0 && (
            <div className="h-6 w-px bg-slate-200/60 mx-1.5" />
          )}

          {managementItems.length > 0 && (
             <div className="relative group/mgmt">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[12px] text-slate-500 hover:text-indigo-700 hover:bg-white/40 transition-all uppercase tracking-tighter">
                  <Command size={16} className="text-indigo-500" />
                  Management
                  <ChevronDown size={12} className="group-hover/mgmt:rotate-180 transition-transform ml-1" />
                </button>
                
                 <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl py-3 opacity-0 invisible translate-y-2 group-hover/mgmt:opacity-100 group-hover/mgmt:visible group-hover/mgmt:translate-y-0 transition-all z-[200]">
                   {managementItems.map((item, idx) => {
                     const isActive = location.pathname === item.path.split('?')[0] && 
                                     (item.path.includes('?') 
                                       ? location.search === '?' + item.path.split('?')[1]
                                       : location.search === '');

                     return (
                       <React.Fragment key={item.path}>
                         {/* Add a divider before the critical management tools if it's the second half of the list */}
                         {idx === 3 && <div className="h-px bg-slate-100 my-2 mx-4" />}
                         <Link
                           to={item.path}
                           className={`
                             flex items-center gap-3 px-5 py-3 text-sm font-bold transition-all relative
                             ${isActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}
                           `}
                         >
                           {isActive && <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />}
                           <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                             {React.cloneElement(item.icon, { size: 18 })}
                           </span>
                           {item.label}
                         </Link>
                       </React.Fragment>
                     );
                   })}
                 </div>
             </div>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4 relative">
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
            <div className="relative" ref={dropdownRef}>
               {/* User Info Card / Dropdown Trigger */}
               <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pr-3 rounded-xl border bg-white border-slate-200 hover:border-indigo-300 transition-all focus:outline-none group shadow-sm hover:shadow-md"
               >
                  <div className={`p-2 rounded-lg text-white shadow-sm transition-transform group-hover:scale-105 ${user.role === 'ADMIN' ? 'bg-rose-500' : user.role === 'MANAGER' ? 'bg-amber-500' : user.role === 'TECHNICIAN' ? 'bg-teal-600' : 'bg-indigo-600'}`}>
                    <UserCircle size={18} />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[12px] font-black text-slate-800 leading-none">{user.name || 'User'}</p>
                    <p className="text-[8px] font-black text-slate-400 tracking-wider uppercase mt-0.5">{user.role}</p>
                  </div>
                  <ChevronDown size={12} className={`text-slate-300 ml-0.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
               </button>

               {/* Dropdown Menu */}
               {isDropdownOpen && (
                 <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-[999] overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100/80 mb-1 bg-slate-50/50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email || 'user@campus.edu'}</p>
                    </div>
                    
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
                      <User size={16} />
                      Profile Settings
                    </Link>
                    
                    <div className="h-px bg-slate-100 my-1 mx-4" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                 </div>
               )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* ✅ 2. Guest View: Show Login */}
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
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
