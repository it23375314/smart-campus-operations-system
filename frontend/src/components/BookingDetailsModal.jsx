import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Calendar, 
    Clock, 
    Users, 
    Hash, 
    Info, 
    AlertCircle,
    User,
    Box,
    CheckCircle2,
    XCircle,
    Clock3,
    Ban,
    FileDown
} from 'lucide-react';
import bookingService from '../services/bookingService';

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
    if (!booking) return null;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'APPROVED':
                return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <CheckCircle2 size={24} /> };
            case 'REJECTED':
                return { color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', icon: <XCircle size={24} /> };
            case 'CANCELLED':
                return { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: <Ban size={24} /> };
            default:
                return { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Clock3 size={24} /> };
        }
    };

    const statusInfo = getStatusInfo(booking.status);

    const handleDownloadPdf = async () => {
        try {
            await bookingService.downloadBookingPdf(booking.id);
        } catch (error) {
            console.error("Institutional document retrieval failed:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl glass-heavy bg-white/95 rounded-[3rem] shadow-2xl border border-white overflow-hidden"
                    >
                        {/* Header Image/Pattern */}
                        <div className={`h-32 w-full ${statusInfo.bg} relative overflow-hidden`}>
                            <div className="absolute inset-0 opacity-10 bg-blueprint" />
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white transition-colors"
                            >
                                <X size={20} className="text-slate-600" />
                            </button>
                            <div className="absolute -bottom-10 left-12 p-6 glass-heavy bg-white rounded-3xl shadow-xl">
                                {statusInfo.icon}
                            </div>
                        </div>

                        <div className="pt-16 pb-12 px-12 space-y-10">
                            {/* Title & Badge */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-4xl font-prestige text-slate-900 mb-2">{booking.purpose}</h2>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${statusInfo.color.replace('text', 'bg')}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusInfo.color}`}>
                                            {booking.status} REQUEST
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Request ID</p>
                                    <p className="text-lg font-prestige text-indigo-600">#{booking.id?.split('-')[1] || booking.id}</p>
                                </div>
                            </div>

                            {/* Core Details Grid */}
                            <div className="grid grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                            <Box size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resource</p>
                                            <p className="text-sm font-bold text-slate-700">{booking.resourceName || booking.resourceId}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Date</p>
                                            <p className="text-sm font-bold text-slate-700">{new Date(booking.startTime).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Range</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Occupancy</p>
                                            <p className="text-sm font-bold text-slate-700">{booking.attendees} Authorized Individuals</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata & Reason */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitter Identity</p>
                                        <p className="text-sm font-bold text-slate-700">{booking.userName || booking.userId}</p>
                                    </div>
                                </div>

                                {booking.rejectionReason && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] space-y-3"
                                    >
                                        <div className="flex items-center gap-3 text-rose-600">
                                            <AlertCircle size={20} />
                                            <h4 className="font-black text-xs uppercase tracking-widest">Rejection Rationale</h4>
                                        </div>
                                        <p className="text-rose-700/80 font-medium leading-relaxed italic">
                                            "{booking.rejectionReason}"
                                        </p>
                                    </motion.div>
                                )}

                                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                                        <Info size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Timestamp</p>
                                        <p className="text-[11px] font-bold text-slate-500 italic">
                                            Protocol established on {new Date(booking.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex justify-end pt-4 gap-3">
                                {booking.status === 'APPROVED' && (
                                    <button 
                                        onClick={handleDownloadPdf}
                                        className="px-8 py-4 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all outline-none active:scale-95 flex items-center gap-2"
                                    >
                                        <FileDown size={16} />
                                        Download Slip
                                    </button>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all outline-none active:scale-95"
                                >
                                    Dismiss Record
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingDetailsModal;
