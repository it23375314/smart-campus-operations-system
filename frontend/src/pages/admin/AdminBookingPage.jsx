import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw, 
  User, 
  Building2, 
  Calendar,
  ChevronDown,
  Inbox,
  X,
  Package,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import bookingService from '../../services/bookingService';
import resourceService from '../../services/resourceService';
import RejectionModal from '../../components/RejectionModal';
import BookingDetailsModal from '../../components/BookingDetailsModal';
import { Eye } from 'lucide-react';

const AdminBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Filters State
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    resourceId: '',
    search: ''
  });

  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resource inventory:", error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Pass clean filters to the service
      const activeFilters = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.date) activeFilters.date = filters.date;
      if (filters.resourceId) activeFilters.resourceId = filters.resourceId;
      if (filters.search) activeFilters.search = filters.search;

      const data = await bookingService.getAllBookings(activeFilters);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching filtered bookings:", error);
      toast.error("Distribution Registry Synchronization Failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchBookings();
  }, []);

  // Trigger fetch on filter change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings();
    }, 400); // 400ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleApprove = async (id) => {
    const loadingToast = toast.loading("Processing Approval Logic...");
    try {
      await bookingService.approveBooking(id);
      toast.success("Authorization Granted. Resource Synchronized.", { id: loadingToast });
      fetchBookings();
    } catch (error) {
      const msg = error.response?.data || error.message;
      toast.error("Approval Override Denied: " + (typeof msg === 'string' ? msg : "Conflict Detected"), { id: loadingToast });
    }
  };

  const handleRejectConfirm = async (id, reason) => {
    const loadingToast = toast.loading("Executing Rejection Sequence...");
    try {
      await bookingService.rejectBooking(id, reason);
      toast.success("Request Dissolved. Identity Records Updated.", { id: loadingToast });
      setRejectionModal({ isOpen: false, bookingId: null });
      fetchBookings();
    } catch (error) {
      toast.error("Decline Sequence Failure: " + (error.response?.data || error.message), { id: loadingToast });
    }
  };

  const handleAdminCancel = async (id) => {
    const loadingToast = toast.loading("Initiating Forced Override...");
    try {
        await bookingService.adminCancelBooking(id);
        toast.success("Operation Terminated. Registry Purged.", { id: loadingToast });
        fetchBookings();
    } catch (error) {
        toast.error("Override Failure: " + (error.response?.data || error.message), { id: loadingToast });
    }
  };

  const handleExportReport = async () => {
    const loadingToast = toast.loading("Synthesizing Institutional Report...");
    try {
        const activeFilters = {};
        if (filters.status) activeFilters.status = filters.status;
        if (filters.date) activeFilters.date = filters.date;
        if (filters.resourceId) activeFilters.resourceId = filters.resourceId;
        if (filters.search) activeFilters.search = filters.search;

        await bookingService.downloadReportPdf(activeFilters);
        toast.success("Intelligence Stream Finalized.", { id: loadingToast });
    } catch (error) {
        console.error("Export Protocol Failure:", error);
        toast.error("Export Protocol Failure.");
    } finally {
        toast.dismiss(loadingToast);
    }
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      date: '',
      resourceId: '',
      search: ''
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-600 border-amber-100",
      APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
      REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
      CANCELLED: "bg-slate-50 text-slate-400 border-slate-100"
    };
    return styles[status] || "bg-slate-50 text-slate-400 border-slate-100";
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px] pointer-events-none" />
      <div className="grain-overlay" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600">
              <Inbox size={16} />
            </div>
            <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Management Dashboard</span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-prestige text-slate-900 leading-tight"
            >
               Order Central.
            </motion.h1>

            <div className="flex items-center gap-4">
               <button 
                  onClick={fetchBookings}
                  className="p-5 bg-white border border-slate-200 rounded-3xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-xl group"
               >
                  <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
               </button>
               {Object.values(filters).some(v => v !== '') && (
                 <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-6 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all shadow-xl shadow-rose-500/5"
                 >
                    <X size={14} /> Clear Selection
                 </button>
               )}
               <button 
                  onClick={handleExportReport}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95"
               >
                  <Download size={14} /> Export Report
               </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-heavy bg-white/70 p-8 mb-12 rounded-[3.5rem] border border-white shadow-2xl flex flex-wrap gap-6 items-end"
        >
          {/* Search */}
          <div className="flex-1 min-w-[280px] space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Search size={12} /> Global Search
             </label>
             <div className="relative">
                <input 
                  type="text"
                  placeholder="ID, Purpose, or User Identity..."
                  className="w-full px-6 py-4 bg-white/50 border border-white rounded-[2rem] text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
             </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-56 space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Filter size={12} /> Operational Status
             </label>
             <select
               className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
               value={filters.status}
               onChange={(e) => setFilters({...filters, status: e.target.value})}
             >
               <option value="">ALL SEGMENTS</option>
               <option value="PENDING">PENDING</option>
               <option value="APPROVED">APPROVED</option>
               <option value="REJECTED">REJECTED</option>
               <option value="CANCELLED">CANCELLED</option>
             </select>
          </div>

          {/* Resource Dropdown */}
          <div className="w-64 space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Package size={12} /> Asset Target
             </label>
             <select
               className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
               value={filters.resourceId}
               onChange={(e) => setFilters({...filters, resourceId: e.target.value})}
             >
               <option value="">ALL RESOURCES</option>
               {resources.map(res => (
                 <option key={res.id} value={res.id}>{res.name}</option>
               ))}
             </select>
          </div>

          {/* Date Picker */}
          <div className="w-48 space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Calendar size={12} /> Registry Date
             </label>
             <input 
               type="date"
               className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-[11px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
               value={filters.date}
               onChange={(e) => setFilters({...filters, date: e.target.value})}
             />
          </div>
        </motion.div>

        {/* Content */}
        {loading && bookings.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Distribution Matrix...</p>
          </div>
        ) : bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 flex flex-col items-center justify-center text-center opacity-30"
          >
            <Inbox size={64} className="text-slate-300 mb-8" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">No synchronization requests found in this cross-section</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8 relative">
            {loading && (
               <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-[3rem]">
                  <RefreshCw size={24} className="text-indigo-600 animate-spin" />
               </div>
            )}
            <AnimatePresence>
              {bookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-heavy bg-white/70 p-10 rounded-[3.5rem] border border-white shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-12 hover:border-indigo-100 transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-center gap-12 flex-1 w-full">
                    {/* Status Circle */}
                    <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-inner transition-colors flex-shrink-0
                      ${booking.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-500 shadow-emerald-500/5' : 
                        booking.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-rose-500/5' :
                        booking.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-500 shadow-amber-500/5' :
                        'bg-slate-50 border-slate-100 text-slate-300 shadow-slate-500/5'}
                    `}>
                      {booking.status === 'APPROVED' ? <CheckCircle2 size={40} /> : 
                       booking.status === 'REJECTED' ? <XCircle size={40} /> :
                       <Clock size={40} />}
                    </div>

                    <div className="space-y-5 text-center md:text-left flex-1">
                      <div className="flex items-center flex-wrap gap-4 justify-center md:justify-start">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100 shadow-sm">
                          REGISTRY ID: {booking.id.slice(-8)}
                        </span>
                        <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>
                      
                      <h3 className="text-4xl font-prestige text-slate-900 leading-tight">
                        {booking.purpose}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                               <User size={16} />
                            </div>
                            {booking.userId}
                         </div>
                         <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                               <Building2 size={16} />
                            </div>
                            Asset #{booking.resourceId}
                         </div>
                         <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                               <Calendar size={16} />
                            </div>
                            {new Date(booking.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                         </div>
                         <button 
                            onClick={() => openDetails(booking)}
                            className="flex items-center gap-4 text-indigo-600 hover:text-slate-900 font-black text-xs uppercase tracking-[0.2em] transition-all"
                         >
                            <Eye size={18} /> Interrogate Record
                         </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full xl:w-auto xl:justify-end">
                    {booking.status === 'PENDING' && (
                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                          onClick={() => setRejectionModal({ isOpen: true, bookingId: booking.id })}
                          className="flex-1 px-8 py-5 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-[2.5rem] transition-all font-black text-[11px] uppercase tracking-[0.2em] bg-white hover:shadow-xl shadow-slate-200/40 active:scale-[0.98]"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="flex-1 px-10 py-5 bg-slate-900 text-white rounded-[2.5rem] transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:shadow-emerald-200 active:scale-[0.98]"
                        >
                          Approve Provision
                        </button>
                      </div>
                    )}
                    {booking.status === 'REJECTED' && (
                      <div className="p-8 bg-rose-50/50 rounded-[2.5rem] border border-rose-100 w-full xl:max-w-xs text-left shadow-inner">
                        <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest mb-3 flex items-center gap-2">
                           Rejection Rationale
                        </p>
                        <p className="text-xs text-rose-800 font-bold italic line-clamp-3 leading-relaxed">
                          "{booking.rejectionReason}"
                        </p>
                      </div>
                    )}
                    {booking.status === 'APPROVED' && (
                      <div className="flex flex-col gap-4 w-full">
                          <div className="p-6 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 shadow-inner flex items-center justify-center gap-4">
                             <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Active Reservation</span>
                          </div>
                          <button
                            onClick={() => handleAdminCancel(booking.id)}
                            className="w-full px-8 py-4 bg-white text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-[2.5rem] transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-md hover:shadow-xl active:scale-[0.98]"
                          >
                            Forced Override
                          </button>
                      </div>
                    )}
                    {booking.status === 'CANCELLED' && (
                        <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner flex items-center justify-center gap-4 opacity-50 grayscale w-full">
                          <XCircle size={24} className="text-slate-400" />
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Operation Terminated</span>
                        </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <RejectionModal 
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, bookingId: null })}
        onConfirm={handleRejectConfirm}
        bookingId={rejectionModal.bookingId}
      />

      <BookingDetailsModal 
        booking={selectedBooking}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default AdminBookingPage;
