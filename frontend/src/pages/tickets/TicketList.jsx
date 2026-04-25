import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, AlertCircle, Clock, CheckCircle, Loader2,
  ChevronRight, Zap, Tag, Users, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';

/* ─── Helpers ─────────────────────────────────────────────── */

const getIncidentCreatedAtMillis = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return 0;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const formatIncidentCreatedAt = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return '—';
  const hasTime = Boolean(incident?.createdAt);
  if (!hasTime && typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  return hasTime
    ? date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const getIncidentReference = (incident) => incident?.referenceId || incident?.id || '—';

/* ─── Status Config ─────────────────────────────────────── */

const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        badge: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400'  },
  Pending:     { label: 'Pending',     badge: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400'  },
  IN_PROGRESS: { label: 'In Progress', badge: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500'   },
  'In Progress': { label: 'In Progress', badge: 'bg-blue-100 text-blue-700 border-blue-200',        bar: 'bg-blue-500'   },
  RESOLVED:    { label: 'Resolved',    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  Resolved:    { label: 'Resolved',    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  CLOSED:      { label: 'Closed',      badge: 'bg-slate-100 text-slate-500 border-slate-200',       bar: 'bg-slate-300'  },
  REJECTED:    { label: 'Rejected',    badge: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500'   },
};

const PRIORITY_CONFIG = {
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  High:   'bg-amber-100 text-amber-700 border-amber-200',
  Medium: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Low:    'bg-slate-100 text-slate-500 border-slate-200',
};

/* ─── Stat Card ─────────────────────────────────────────── */

const StatCard = ({ label, count, colorClass, barClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="glass-card bg-white border border-slate-100 overflow-hidden"
  >
    <div className={`h-1 w-full ${barClass}`} />
    <div className="px-6 py-5 text-center">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-4xl font-black ${colorClass}`}>{count}</p>
    </div>
  </motion.div>
);

/* ─── Main Component ────────────────────────────────────── */

const TicketList = () => {
  const [allIncidents, setAllIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    API.get('/incidents')
      .then((response) => {
        const data = Array.isArray(response?.data) ? response.data : [];
        const sorted = [...data].sort((a, b) => getIncidentCreatedAtMillis(b) - getIncidentCreatedAtMillis(a));
        setAllIncidents(sorted);
      })
      .catch(error => console.error('Error fetching incidents:', error))
      .finally(() => setLoading(false));
  }, []);

  const openCount       = allIncidents.filter(i => i.status === 'Pending' || i.status === 'OPEN').length;
  const inProgressCount = allIncidents.filter(i => i.status === 'In Progress' || i.status === 'IN_PROGRESS').length;
  const resolvedCount   = allIncidents.filter(i => i.status === 'Resolved' || i.status === 'RESOLVED').length;
  const closedCount     = allIncidents.filter(i => i.status === 'Closed' || i.status === 'CLOSED').length;
  const rejectedCount   = allIncidents.filter(i => i.status === 'Rejected' || i.status === 'REJECTED').length;

  const filteredIncidents = allIncidents.filter(incident => {
    const q = search.toLowerCase();
    const matchesSearch = !q || 
      incident.title?.toLowerCase().includes(q) || 
      String(incident.referenceId || incident.id)?.toLowerCase().includes(q) ||
      incident.reportedBy?.toLowerCase().includes(q);
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'OPEN' && (incident.status === 'OPEN' || incident.status === 'Pending')) ||
      (statusFilter === 'IN_PROGRESS' && (incident.status === 'IN_PROGRESS' || incident.status === 'In Progress')) ||
      (statusFilter === 'RESOLVED' && (incident.status === 'RESOLVED' || incident.status === 'Resolved')) ||
      (statusFilter === 'CLOSED' && incident.status === 'CLOSED') ||
      (statusFilter === 'REJECTED' && incident.status === 'REJECTED');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto pt-40 pb-12 px-4 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">Issue Management</h1>
          <p className="text-slate-500 font-medium">Overview of all reported campus resource incidents.</p>
        </div>
        <Link
          to="/technician-management"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Users size={15} />
          Manage Technicians
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Open Issues"  count={openCount}       colorClass="text-amber-600"   barClass="bg-amber-400"   delay={0.05} />
        <StatCard label="In Progress"  count={inProgressCount} colorClass="text-blue-600"    barClass="bg-blue-500"    delay={0.10} />
        <StatCard label="Resolved"     count={resolvedCount}   colorClass="text-emerald-600" barClass="bg-emerald-500" delay={0.15} />
        <StatCard label="Closed"       count={closedCount}     colorClass="text-slate-600"   barClass="bg-slate-400"   delay={0.20} />
        <StatCard label="Rejected"     count={rejectedCount}   colorClass="text-rose-600"    barClass="bg-rose-500"    delay={0.25} />
      </div>

      {/* Filters & Search UI */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
          {[
            { id: 'ALL',         label: 'All',         icon: BarChart3 },
            { id: 'OPEN',        label: 'Open',        icon: Clock },
            { id: 'IN_PROGRESS', label: 'In Progress', icon: Loader2 },
            { id: 'RESOLVED',    label: 'Resolved',    icon: CheckCircle },
            { id: 'CLOSED',      label: 'Closed',      icon: AlertCircle },
            { id: 'REJECTED',    label: 'Rejected',    icon: AlertCircle },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all whitespace-nowrap ${
                statusFilter === f.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
              }`}
            >
              <f.icon size={12} className={f.id === 'IN_PROGRESS' && statusFilter === f.id ? 'animate-spin' : ''} />
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <BarChart3 size={15} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card bg-white border border-slate-100 overflow-hidden"
      >
        {/* Table header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={16} className="text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Filtered Results
              <span className="ml-2 text-indigo-600">{filteredIncidents.length}</span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Tickets…</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No incidents match your search</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Ticket ID', 'Issue', 'Priority', 'Date', 'Status', ''].map((h, i) => (
                    <th key={i} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 ${i === 5 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredIncidents.map((incident, index) => {
                    const cfg = STATUS_CONFIG[incident.status] || STATUS_CONFIG.OPEN;
                    return (
                      <motion.tr
                        key={incident.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {getIncidentReference(incident)}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-[320px]">
                          <p className="text-sm font-black text-slate-900 truncate">{incident.title}</p>
                          {incident.reportedBy && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{incident.reportedBy}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${PRIORITY_CONFIG[incident.priority] || PRIORITY_CONFIG.Medium}`}>
                            <Zap size={9} fill="currentColor" />
                            {incident.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                            <Clock size={12} className="text-slate-300" />
                            {formatIncidentCreatedAt(incident)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            to={`/update/${incident.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                          >
                            <Settings size={13} />
                            Manage
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TicketList;