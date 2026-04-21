import React, { useState } from 'react';
import { Calendar, Clock, Users, FileText, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import bookingService from '../services/bookingService';

const BookingFormPage = () => {
  const [formData, setFormData] = useState({
    userId: 1, // Hardcoded for demo, normally from auth
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await bookingService.createBooking({
        ...formData,
        resourceId: parseInt(formData.resourceId),
        attendees: parseInt(formData.attendees),
        startTime: formData.startTime.replace(' ', 'T'),
        endTime: formData.endTime.replace(' ', 'T')
      });
      setStatus({ type: 'success', message: 'Booking created successfully! Pending approval.' });
      setFormData({
        userId: 1,
        resourceId: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1
      });
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      setStatus({ 
        type: 'error', 
        message: typeof errorMsg === 'object' ? Object.values(errorMsg).join(', ') : errorMsg 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-40 pb-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 bg-white shadow-lg rounded-3xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Book a Resource</h1>
            <p className="text-slate-500">Reserve campus rooms, equipment, or facilities.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Resource ID</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="number"
                  placeholder="e.g. 101"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.resourceId}
                  onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Attendees</label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="number"
                  min="1"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.attendees}
                  onChange={(e) => setFormData({...formData, attendees: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="datetime-local"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">End Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="datetime-local"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Purpose of Booking</label>
            <textarea
              rows="3"
              placeholder="Describe your event or meeting..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              required
            ></textarea>
          </div>

          {status.message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl flex items-center gap-3 ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              <CheckCircle size={20} />
              <p className="text-sm font-medium">{status.message}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={20} />
                <span>Submit Booking Request</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingFormPage;
