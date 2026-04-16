import React, { useState, useEffect } from 'react';
import { LayoutGrid, Trash2, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import bookingService from '../services/bookingService';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingService.cancelBooking(id);
        fetchBookings();
      } catch (error) {
        alert("Failed to cancel booking: " + error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-100 text-amber-700 border-amber-200",
      APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
      REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
      CANCELLED: "bg-slate-100 text-slate-500 border-slate-200"
    };
    const icons = {
      PENDING: <Clock size={14} />,
      APPROVED: <CheckCircle size={14} />,
      REJECTED: <XCircle size={14} />,
      CANCELLED: <AlertCircle size={14} />
    };

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">My Requests</h1>
          <p className="text-slate-500 font-medium">Tracking and managing your resource reservations.</p>
        </div>
        <button 
          onClick={fetchBookings}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold shadow-sm"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh Feed
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Data...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 glass-card bg-white border-dashed border-2 border-slate-100 rounded-[3rem]">
          <LayoutGrid className="mx-auto text-slate-200 mb-6" size={64} />
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No activity recorded</h3>
          <p className="text-slate-400 font-medium mt-2">You haven't submitted any resource requests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card bg-white p-8 hover:shadow-2xl transition-all border border-slate-100 relative overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  booking.status === 'APPROVED' ? 'bg-emerald-500' :
                  booking.status === 'REJECTED' ? 'bg-rose-500' :
                  booking.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
                
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-black text-slate-900">RES-{booking.resourceId}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <p className="text-slate-600 font-medium leading-relaxed">{booking.purpose}</p>
                    
                    <div className="flex flex-wrap gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-300" />
                        <span>{new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-300" />
                        <span>{booking.attendees} Attendees</span>
                      </div>
                    </div>

                    {booking.status === 'REJECTED' && booking.rejectionReason && (
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
                        <MessageSquare size={18} className="text-rose-500 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-black text-rose-700 uppercase tracking-widest leading-none mb-1">Reason for Rejection</div>
                          <p className="text-sm text-rose-600 font-medium">{booking.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 self-end lg:self-start">
                    {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-rose-600 border border-slate-100 hover:border-rose-100 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                      >
                        <Trash2 size={16} />
                        Withdraw Request
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
  );
};

export default MyBookingsPage;
