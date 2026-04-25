import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Trash2, 
    UserX, 
    UserCheck, 
    AtSign, 
    Key, 
    ShieldAlert,
    ChevronRight,
    Search,
    Filter,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllUsers, updateUserRole, deleteUser, deactivateUser, createUser } from '../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [addLoading, setAddLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            toast.error('Institutional Archive Access Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        const loadingToast = toast.loading("Updating clearance level...");
        try {
            await updateUserRole(id, newRole);
            toast.success('Clearance synchronized successfully.', { id: loadingToast });
            fetchUsers();
        } catch (err) {
            toast.error('Governance Protocol Violation.', { id: loadingToast });
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Sever user access? Internal state will be preserved.')) return;
        try {
            await deactivateUser(id);
            toast.success('Identity deactivated.');
            fetchUsers();
        } catch (err) {
            toast.error('Deactivation cycle failure.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Irreversibly delete this identity from the registry?')) return;
        try {
            await deleteUser(id);
            toast.success('Identity purged from registry.');
            fetchUsers();
        } catch (err) {
            toast.error('Purge operation failure.');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            await createUser(
                { name: newUser.name, email: newUser.email, password: newUser.password },
                newUser.role
            );
            toast.success('New identity registered successfully.');
            setNewUser({ name: '', email: '', password: '', role: 'USER' });
            setShowAddForm(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registry entry failure.');
        } finally {
            setAddLoading(false);
        }
    };

    const getRoleStyle = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-200/50';
            case 'TECHNICIAN': return 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-200/50';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-200/50';
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative bg-blueprint">
            <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-[2px] pointer-events-none" />
            <div className="grain-overlay" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
                    <div>
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 font-black tracking-widest uppercase text-[10px] mb-8 hover:gap-3 transition-all">
                            <ArrowLeft size={14} /> System Nexus
                        </Link>
                        <motion.h1 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-8xl font-prestige text-slate-900 leading-tight"
                        >
                            Governance.
                        </motion.h1>
                        <p className="text-xl text-slate-500 font-medium mt-4">Manage institutional identities and clearance protocols.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/70 backdrop-blur px-6 py-4 rounded-3xl border border-white shadow-xl flex items-center gap-8">
                           <div className="flex flex-col">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Pool</span>
                               <span className="text-2xl font-prestige text-slate-900">{users.length} Identities</span>
                           </div>
                           <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                                    ${showAddForm ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200 shadow-xl'}
                                `}
                            >
                                {showAddForm ? 'Cancel Entry' : '+ Register Identity'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add Form Matrix */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden mb-12"
                        >
                            <div className="glass-heavy bg-white/70 p-10 rounded-[3rem] border border-white shadow-2xl relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <UserPlus size={20} />
                                    </div>
                                    <h3 className="text-2xl font-prestige text-slate-900">New Identity Protocol</h3>
                                </div>
                                
                                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={newUser.name}
                                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                required
                                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                placeholder="Alpha Identity"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Archive Email</label>
                                        <div className="relative">
                                            <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                required
                                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                placeholder="identity@nexus.edu"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Entry Key</label>
                                        <div className="relative">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                required
                                                minLength={6}
                                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                placeholder="Secure Sequence"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Clearance Tier</label>
                                        <div className="relative">
                                            <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                className="w-full pl-14 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                            >
                                                <option value="USER">USER (Auxiliary)</option>
                                                <option value="ADMIN">ADMIN (High Clearance)</option>
                                                <option value="TECHNICIAN">TECHNICIAN (Operational)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={addLoading}
                                            className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-950 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                        >
                                            {addLoading ? "Processing Registry..." : "Commit Identity Entry"}
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search and Filters */}
                <div className="mb-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Interrogate registry by name or credential..."
                            className="w-full pl-16 pr-8 py-5 bg-white/50 backdrop-blur rounded-[2rem] border border-white shadow-xl text-lg font-bold text-slate-900 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Identity Matrix (Users Table) */}
                <div className="glass-heavy bg-white/40 rounded-[3.5rem] border border-white shadow-2xl overflow-hidden relative min-h-[400px]">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
                            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Interrogating Institutional Archives...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900/5 lg:bg-transparent">
                                    <tr>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Biological Identity</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Credential Node</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Clearance</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Governance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/50">
                                    <AnimatePresence>
                                        {filteredUsers.map((user, idx) => (
                                            <motion.tr 
                                                key={user.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="group hover:bg-white/50 transition-all"
                                            >
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${getRoleStyle(user.role)}`}>
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div className="font-bold text-slate-900 text-lg">{user.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 font-medium text-slate-500">{user.email}</td>
                                                <td className="px-10 py-8">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${getRoleStyle(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                            {user.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative group/select">
                                                            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                                className="pl-9 pr-6 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                                                            >
                                                                <option value="USER">USER</option>
                                                                <option value="ADMIN">ADMIN</option>
                                                                <option value="TECHNICIAN">TECH</option>
                                                            </select>
                                                        </div>
                                                        
                                                        {user.active ? (
                                                            <button
                                                                onClick={() => handleDeactivate(user.id)}
                                                                className="p-3 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all shadow-sm bg-white"
                                                                title="Deactivate Identity"
                                                            >
                                                                <UserX size={18} />
                                                            </button>
                                                        ) : (
                                                            <div className="p-3 text-slate-300">
                                                                <UserCheck size={18} />
                                                            </div>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-3 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-white"
                                                            title="Purge Identity"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && filteredUsers.length === 0 && (
                        <div className="py-40 flex flex-col items-center justify-center text-center opacity-30">
                            <Shield size={80} className="text-slate-300 mb-8" />
                            <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px]">No Matching Identities in Institutional Registry</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;