import React, { useState, useEffect } from 'react';
import { Search, CalendarDays, Clock, MapPin } from 'lucide-react';
import bookingService from '../services/bookingService';

const AvailabilityView = () => {
  const [resourceId, setResourceId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailability = async () => {
    if (!resourceId) return;
    setLoading(true);
    try {
      const data = await bookingService.getAllBookings(null, resourceId);
      // Filter for only APPROVED ones to show actual occupancy
      setBookings(data.filter(b => b.status === 'APPROVED'));
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Resource Availability</h1>
        <p className="text-slate-500 mt-2">Check when resources are occupied before making a booking.</p>
      </div>

      <div className="glass-card bg-white p-6 mb-8 flex flex-col md:flex-row gap-4 items-end shadow-lg">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Enter Resource ID</label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="number"
              placeholder="e.g. 101"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={fetchAvailability}
          disabled={loading || !resourceId}
          className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          Check Availability
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Checking schedule...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm">
                <CalendarDays size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-indigo-900">Occupied</div>
                <div className="text-xs text-indigo-600 flex items-center gap-1 mt-1 font-medium">
                  <Clock size={12} />
                  {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : resourceId && !loading ? (
        <div className="py-20 text-center bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-3xl">
          <Check className="mx-auto text-emerald-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-emerald-800">Available</h3>
          <p className="text-emerald-600">No approved bookings found for this resource. It's free to book!</p>
        </div>
      ) : null}
    </div>
  );
};

export default AvailabilityView;
