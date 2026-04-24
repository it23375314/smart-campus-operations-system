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
  MapPin,
  ShieldCheck
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const StatusIcon = ({ status }) => {
  const config = {
    ACTIVE: { icon: <CheckCircle2 size={16} />, label: 'Active', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    OUT_OF_SERVICE: { icon: <XCircle size={16} />, label: 'Decommissioned', cls: 'text-rose-500 bg-rose-50 border-rose-200' },
    MAINTENANCE: { icon: <AlertCircle size={16} />, label: 'Under Maintenance', cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    AVAILABLE: { icon: <CheckCircle2 size={16} />, label: 'Available', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  };
  const c = config[status] || { icon: <AlertCircle size={16} />, label: status, cls: 'text-slate-500 bg-slate-50 border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

const InfoCard = ({ icon, label, value, subtext }) => (
  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex items-start gap-4 hover:bg-white hover:border-indigo-100 transition-all group">
    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value || '—'}</p>
      {subtext && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{subtext}</p>}
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
    if (!window.confirm('Institutional Confirmation: Irreversibly decommission this asset?')) return;
    try {
      await API.delete(`/resources/${id}`);
      toast.success("Asset decommissioned.");
      navigate('/admin/resources');
    } catch {
      toast.error('Decommission protocol failure.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Synching Asset Briefing...</span>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-lg mx-auto text-center py-40">
        <Package size={64} className="text-slate-200 mx-auto mb-6" strokeWidth={1} />
        <h3 className="text-2xl font-prestige text-slate-900 mb-2">Detailed Registry Void.</h3>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">{error}</p>
        <button
          onClick={() => navigate('/admin/resources')}
          className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
        >
          Back to Resource Matrix
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button
        onClick={() => navigate('/admin/resources')}
        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 hover:text-indigo-600 transition-all group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Asset Matrix
      </button>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden glass-heavy">
        {/* Banner with Identity */}
        <div className="relative h-80 bg-slate-100">
          {resource.imageUrl ? (
            <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
              <Package size={80} strokeWidth={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-white px-3 py-1 bg-white/20 backdrop-blur-md rounded-md uppercase tracking-[0.2em]">{resource.type}</span>
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">{resource.category}</span>
                </div>
                <h2 className="text-5xl font-prestige text-white leading-tight">{resource.name}.</h2>
              </div>
              <StatusIcon status={resource.status} />
            </div>
          </div>
        </div>

        {/* Intelligence Matrix */}
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <InfoCard icon={<MapPin size={20} />} label="Spatial Identity" value={resource.location} subtext="Campus Geographical Anchor" />
            <InfoCard icon={<Users size={20} />} label="Operational Capacity" value={`${resource.capacity} Standard Units`} subtext="Institutional Safety Threshold" />
            <InfoCard icon={<ShieldCheck size={20} />} label="Asset Custodian" value={resource.managerName} subtext="Assigned Stewardship" />
            <InfoCard icon={<Clock size={20} />} label="Verification Status" value={resource.status === 'ACTIVE' ? 'Operational' : 'Restricted'} subtext="Current Lifecycle Node" />
          </div>

          <div className="space-y-10">
            {/* Description */}
            <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Strategic Asset Briefing</h4>
              <p className="text-base text-slate-600 font-medium leading-relaxed italic">
                {resource.description || 'No formal operational briefing has been declared for this institutional asset.'}
              </p>
            </div>

            {/* Actions Matrix */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-10 border-t border-slate-50">
              <Link
                to={`/admin/resources/edit/${resource.id}`}
                className="flex-1 inline-flex items-center justify-center gap-3 w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
              >
                <Edit2 size={16} /> Update Registry Node
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 inline-flex items-center justify-center gap-3 w-full py-6 bg-rose-50 text-rose-500 border border-rose-100 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
              >
                <Trash2 size={16} /> Terminate Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
