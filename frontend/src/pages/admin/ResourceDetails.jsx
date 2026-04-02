import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ResourceDetails = () => {
  const { id } = useParams();

  // Mock data for display
  const resource = {
    id: id,
    name: 'Main Auditorium',
    category: 'Auditorium',
    capacity: 500,
    description: 'The main university auditorium equipped with state-of-the-art sound system and projector. Suitable for large gatherings, seminars, and cultural events.',
    status: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd20df0f1?w=800&q=80',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableTimes: { start: '08:00', end: '20:00' }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold ring-1 ring-inset ring-emerald-600/10">
            <CheckCircle2 size={16} />
            Available for Booking
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-sm font-bold ring-1 ring-inset ring-rose-600/10">
            <XCircle size={16} />
            Currently Unavailable
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-sm font-bold ring-1 ring-inset ring-amber-600/10">
            <AlertCircle size={16} />
            Under Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/admin/resources" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ArrowLeft size={20} />
          Back to Resources
        </Link>
        <Link to={`/admin/resources/edit/${id}`} className="btn-secondary">
          <Edit2 size={18} />
          Edit Resource
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Status */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white">
            <img 
              src={resource.imageUrl} 
              alt={resource.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8">
               {getStatusBadge(resource.status)}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">{resource.category}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-xs font-bold text-slate-400">ID: {resource.id}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-6">{resource.name}</h1>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg">
                {resource.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 pt-10 border-t border-slate-50">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <Users size={20} className="text-blue-500" />
                  <span className="text-xl font-bold">{resource.capacity} People</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <MapPin size={20} className="text-rose-500" />
                  <span className="text-xl font-bold">Main Block, L2</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resource Type</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <Info size={20} className="text-amber-500" />
                  <span className="text-xl font-bold">Physical Asset</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Metadata */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CalendarIcon size={24} className="text-blue-600" />
              Availability
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Clock size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Operating Hours</p>
                    <p className="font-bold text-slate-900">{resource.availableTimes.start} - {resource.availableTimes.end}</p>
                  </div>
                </div>
              </div>

              <div className="p-1">
                <p className="text-sm font-bold text-slate-700 mb-3">Active Days</p>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const isActive = resource.availableDays.some(d => d.startsWith(day));
                    return (
                      <div 
                        key={day}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'bg-slate-100 text-slate-400'}
                        `}
                      >
                        {day[0]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button className="btn-primary w-full mt-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20">
               Book This Resource
            </button>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
               <Info size={20} className="text-blue-400" />
               Equipment Note
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              This resource requires a specialized technician for operation. Please contact the department head at least 24 hours before use.
            </p>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
               <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                 <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-900"></div>
               </div>
               <span className="text-xs text-slate-500 font-medium">+2 Technicians Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
