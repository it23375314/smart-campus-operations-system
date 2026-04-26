import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Users, 
  Eye,
  ArrowLeft,
  Calendar,
  Box,
  Inbox,
  Filter,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';
import BookingDetailsModal from '../components/BookingDetailsModal';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Registry Synchronization Failure.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        const loadingToast = toast.loading("Executing Termination Protocol...");
        try {
            await bookingService.cancelBooking(id);
            toast.success("Allocation Decommissioned Successfully.", { id: loadingToast });
            fetchBookings();
        } catch (error) {
            toast.error("Decommissioning Failure: " + (error.response?.data || error.message), { id: loadingToast });
        }
    };

    const openDetails = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "APPROVED": return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-200/50";
            case "REJECTED": return "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-200/50";
            case "CANCELLED": return "bg-slate-50 text-slate-400 border-slate-100";
            default: return "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-200/50";
        }
    };

    const filteredBookings = bookings.filter(b => 
        b.purpose.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.resourceId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[1px] pointer-events-none" />
            
            {/* Vibrant Interior Background Overlay */}
            <div 
              className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
              style={{ 
                backgroundImage: 'url("/backgrounds/colorful-interior.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }}
            />

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
                            My Registry.
                        </motion.h1>
                        <p className="text-xl text-slate-500 font-medium mt-4">Personal resource allocation cycles and operational status.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/70 backdrop-blur px-6 py-4 rounded-3xl border border-white shadow-xl flex items-center gap-8">
                           <div className="flex flex-col">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Pool</span>
                               <span className="text-2xl font-prestige text-slate-900">{bookings.length} Records</span>
                           </div>
                           <Link to="/bookings" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                               + New Entry
                           </Link>
                        </div>
                        <button 
                            onClick={fetchBookings}
                            className="p-5 bg-white border border-slate-200 rounded-3xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-xl group"
                        >
                            <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Interrogate your localized registry..."
                            className="w-full pl-16 pr-8 py-5 bg-white/50 backdrop-blur rounded-[2rem] border border-white shadow-xl text-lg font-bold text-slate-900 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="p-5 bg-white/50 border border-white rounded-[1.5rem] text-slate-400 hover:text-indigo-600 transition-all shadow-xl backdrop-blur">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
                        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Interrogating Localized Registry...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-40 text-center glass-heavy bg-white/40 rounded-[4rem] border-2 border-dashed border-slate-200"
                    >
                        <Inbox size={80} className="mx-auto text-slate-200 mb-8" />
                        <h3 className="text-3xl font-prestige text-slate-800">Operational Silence</h3>
                        <p className="text-slate-400 font-medium mt-4">Your localized terminal has no recorded resource allocation cycles.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {filteredBookings.map((b, idx) => (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="glass-heavy bg-white/70 rounded-[3rem] border border-white group overflow-hidden shadow-2xl relative"
                                >
                                    {/* Card Decoration */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full blur-2xl opacity-20 ${
                                        b.status === 'APPROVED' ? 'bg-emerald-400' :
                                        b.status === 'REJECTED' ? 'bg-rose-400' : 'bg-amber-400'
                                    }`} />

                                    <div className="p-8 space-y-8 relative z-10 text-left">
                                        <div className="flex justify-between items-start">
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(b.status)}`}>
                                                {b.status}
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">#{b.id.slice(-6)}</span>
                                        </div>

                                        <div className="space-y-2 text-left">
                                            <h3 className="text-2xl font-prestige text-slate-900 group-hover:text-indigo-600 transition-colors mb-4 truncate">{b.purpose}</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                    <Box size={14} className="text-indigo-600" /> {b.resourceId}
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                    <Calendar size={14} className="text-indigo-600" /> {new Date(b.startTime).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                    <Clock size={14} className="text-indigo-600" /> {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        {b.status === "REJECTED" && b.rejectionReason && (
                                            <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3 shadow-inner">
                                                <AlertCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                                                <p className="text-[11px] font-bold text-rose-500 italic line-clamp-2">" {b.rejectionReason} "</p>
                                            </div>
                                        )}

                                        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                                            <button 
                                                onClick={() => openDetails(b)}
                                                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all outline-none"
                                            >
                                                <Eye size={16} /> Interrogate Record
                                            </button>

                                            {(b.status === "PENDING" || b.status === "APPROVED") && (
                                                <button 
                                                    onClick={() => handleCancel(b.id)}
                                                    className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all outline-none"
                                                    title="Decommission Request"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <BookingDetailsModal 
                booking={selectedBooking} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default MyBookingsPage;
