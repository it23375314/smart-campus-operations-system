import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, User as UserIcon, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('USER');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login by saving user data to localStorage
    const mockUser = {
      id: role === 'ADMIN' ? 99 : role === 'MANAGER' ? 50 : 1,
      username: username || 'Demo User',
      role: role
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Redirect based on role
    if (role === 'ADMIN' || role === 'MANAGER') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
    // Refresh to update Navbar/Context
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card bg-white p-10 shadow-2xl rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl">
              SC
            </div>
            <h1 className="text-3xl font-black text-slate-900">Role-Based Login</h1>
            <p className="text-slate-500 mt-2 font-medium">Select your role to explore the system.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Assign Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'USER', label: 'User', icon: <UserIcon size={14} /> },
                  { id: 'ADMIN', label: 'Admin', icon: <ShieldCheck size={14} /> },
                  { id: 'MANAGER', label: 'Manager', icon: <Briefcase size={14} /> }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      role === r.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {r.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              Start Simulation
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
