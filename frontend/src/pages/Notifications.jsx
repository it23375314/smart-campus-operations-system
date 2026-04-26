import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    BellRing, 
    CheckCircle2, 
    Trash2, 
    Calendar, 
    Ticket, 
    Clock, 
    ArrowLeft,
    CheckSquare,
    MessageCircle,
    BellOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (err) {
            toast.error('Signal Feed Synchronization Failure');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            toast.error('Protocol Acknowledgement Failure');
        }
    };

    const handleMarkAllAsRead = async () => {
        const loadingToast = toast.loading("Acknowledging all signals...");
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success('All signals acknowledged.', { id: loadingToast });
        } catch (err) {
            toast.error('Global Acknowledgement Failure', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Signal purged from localized matrix.');
        } catch (err) {
            toast.error('Signal Purge Failure');
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'BOOKING': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'TICKET': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'BOOKING': return <Calendar size={18} />;
            case 'TICKET': return <Ticket size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[1px] pointer-events-none" />
            
            {/* Vibrant Interior Background Overlay */}
            <div 
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{ 
                backgroundImage: 'url("/backgrounds/colorful-interior.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
                }}
            />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
                    <div>
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 font-black tracking-widest uppercase text-[10px] mb-8 hover:gap-3 transition-all">
                            <ArrowLeft size={14} /> Back to Nexus
                        </Link>
                        <motion.h1 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-7xl font-prestige text-slate-900 leading-tight"
                        >
                            Signal Feed.
                        </motion.h1>
                        <p className="text-xl text-slate-500 font-medium mt-4">Real-time institutional alerts and operational updates.</p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-3 px-8 py-4 bg-white border border-white rounded-[2rem] text-slate-900 hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200/50 group"
                        >
                            <CheckSquare size={18} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                            Acknowledge All
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Signal Feed...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/40 backdrop-blur-3xl border-2 border-dashed border-slate-200 rounded-[4rem] py-40 text-center"
                    >
                        <BellOff className="mx-auto text-slate-200 mb-8" size={80} />
                        <h3 className="text-3xl font-prestige text-slate-800">Operational Silence</h3>
                        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto">No institutional alerts have been broadcasted to your node in the current session.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {notifications.map((notification, idx) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`glass-heavy bg-white/70 p-8 rounded-[3rem] border transition-all relative overflow-hidden group
                                        ${!notification.read ? 'border-indigo-100 shadow-2xl' : 'border-white opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    {!notification.read && (
                                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                                    )}
                                    
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                                        <div className="flex flex-1 gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0
                                                ${getTypeStyle(notification.type)}
                                            `}>
                                                {getTypeIcon(notification.type)}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className={`text-xl font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTypeStyle(notification.type)}`}>
                                                        {notification.type}
                                                    </span>
                                                    {!notification.read && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                            <BellRing size={10} /> New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 font-medium leading-relaxed italic">"{notification.message}"</p>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Clock size={12} />
                                                        {new Date(notification.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-start">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="px-6 py-2.5 bg-white border border-slate-100 hover:border-indigo-200 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Acknowledge
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                                title="Purge Signal"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;