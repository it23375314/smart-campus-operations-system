import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Package,
  Briefcase
} from 'lucide-react';
import API from '../../services/api';

const StatusIcon = ({ status }) => {
  const config = {
    AVAILABLE: { icon: <CheckCircle2 size={16} />, label: 'Available', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    UNAVAILABLE: { icon: <XCircle size={16} />, label: 'Unavailable', cls: 'text-rose-500 bg-rose-50 border-rose-200' },
    MAINTENANCE: { icon: <AlertCircle size={16} />, label: 'Under Maintenance', cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  };
  const c = config[status] || config.UNAVAILABLE;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await API.get(`/resources/${id}`);
        setResource(res.data);
      } catch {
        setError('Resource not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return;
    try {
      await API.delete(`/resources/${id}`);
      navigate('/admin/resources');
    } catch {
      alert('Failed to delete resource.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 size={24} className="animate-spin mr-3" />
        <span className="text-lg font-medium">Loading resource...</span>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-lg mx-auto text-center py-32">
        <Package size={40} className="text-slate-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-slate-600 mb-2">Resource Not Found</p>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/admin/resources')}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6d28d9)' }}
        >
          Back to Resources
        </button>
      </div>
    );
  }

  const availableDaysLabel = resource.availableDays?.length
    ? resource.availableDays.map(d => d.slice(0, 3)).join(', ')
    : 'Not specified';

  const availableTimesLabel = resource.availableTimes
    ? `${resource.availableTimes.start ?? ''} – ${resource.availableTimes.end ?? ''}`
    : 'Not specified';

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/admin/resources')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={16} />
        Back to Resources
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Hero image */}
        <div className="relative h-52 bg-slate-100">
          {resource.imageUrl ? (
            <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package size={48} />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">{resource.category}</p>
            <h2 className="text-2xl font-bold text-white">{resource.name}</h2>
          </div>
          <div className="absolute top-4 right-4">
            <StatusIcon status={resource.status} />
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          {resource.description && (
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{resource.description}</p>
          )}

          <div className="mb-6">
            <InfoRow icon={<Tag size={15} />} label="Category" value={resource.category} />
            <InfoRow icon={<Users size={15} />} label="Capacity" value={`${resource.capacity} people`} />
            <InfoRow icon={<Briefcase size={15} />} label="Assigned Manager" value={resource.managerName || 'No manager assigned'} />
            <InfoRow icon={<Calendar size={15} />} label="Available Days" value={availableDaysLabel} />
            <InfoRow icon={<Clock size={15} />} label="Available Hours" value={availableTimesLabel} />
          </div>

          {/* Available days chips */}
          {resource.availableDays?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Days</p>
              <div className="flex flex-wrap gap-2">
                {resource.availableDays.map(day => (
                  <span
                    key={day}
                    className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <Link
              to={`/admin/resources/edit/${resource.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #6d28d9)' }}
            >
              <Edit2 size={15} />
              Edit Resource
            </Link>
            <button
              onClick={handleDelete}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
