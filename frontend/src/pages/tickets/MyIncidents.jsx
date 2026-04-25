import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Search, Filter, FileText, Plus, Clock,
  X, Loader2, CheckCircle, XCircle, CircleDot, Zap,
  Tag, RefreshCw, ChevronRight, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';

/* ─── Helpers ─────────────────────────────────────────────── */

const stripHtmlToText = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const safeLower = (value) => String(value ?? '').toLowerCase();

const normalizeStatus = (status) => {
  const value = safeLower(status).replace(/[^a-z]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  if (value === 'pending') return 'OPEN';
  if (value === 'in_progress' || value === 'inprogress') return 'IN_PROGRESS';
  if (value === 'open') return 'OPEN';
  if (value === 'resolved') return 'RESOLVED';
  if (value === 'closed') return 'CLOSED';
  if (value === 'rejected') return 'REJECTED';
  return String(status ?? '').toUpperCase();
};

const getCurrentUserStorageKey = () => {
  try {
    const explicit = String(localStorage.getItem('scos.currentUserKey') || '').trim();
    if (explicit) return explicit;

    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const keySource = String(user?.id || user?.email || user?.name || '').trim().toLowerCase();
    return keySource ? `u:${keySource}` : '';
  } catch {
    return '';
  }
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
  OPEN:        { label: 'Open',        icon: CircleDot,   badge: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', icon: Loader2,     badge: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500'  },
  RESOLVED:    { label: 'Resolved',    icon: CheckCircle, badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  CLOSED:      { label: 'Closed',      icon: XCircle,     badge: 'bg-slate-100 text-slate-500 border-slate-200',       bar: 'bg-slate-300' },
  REJECTED:    { label: 'Rejected',    icon: XCircle,     badge: 'bg-rose-100 text-rose-700 border-rose-200',          bar: 'bg-rose-500'  },
};

const PRIORITY_CONFIG = {
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  High:   'bg-amber-100 text-amber-700 border-amber-200',
  Medium: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Low:    'bg-slate-100 text-slate-500 border-slate-200',
};

/* ─── Status Badge ───────────────────────────────────────── */

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[normalizeStatus(status)] || STATUS_CONFIG.OPEN;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${cfg.badge}`}>
      <Icon size={12} className={normalizeStatus(status) === 'IN_PROGRESS' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
};

/* ─── Main Component ────────────────────────────────────── */

const MyIncidents = () => {
  const [incidents, setIncidents]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchIncidents = () => {
    setLoading(true);
    API.get('/incidents')
      .then((res) => {
        const data = res?.data;
        const all = Array.isArray(data) ? data : [];
        let myIncidentIds = [];
        let email = '';
        let reportedBy = '';

        try {
          const userKey = getCurrentUserStorageKey();
          const scopedIdsKey = userKey ? `scos.myIncidentIds.${userKey}` : '';

          const rawIds = scopedIdsKey
            ? localStorage.getItem(scopedIdsKey)
            : localStorage.getItem('scos.myIncidentIds');
          const parsedIds = rawIds ? JSON.parse(rawIds) : [];
          myIncidentIds      = Array.isArray(parsedIds) ? parsedIds : [];

          const rawUser = localStorage.getItem('user');
          const user = rawUser ? JSON.parse(rawUser) : null;

          email = user?.email || localStorage.getItem('scos.email') || '';
          reportedBy = user?.name || localStorage.getItem('scos.reportedBy') || '';
        } catch { /* ignore */ }

        let myTickets = all;
        if (myIncidentIds.length > 0) {
          const idSet = new Set(myIncidentIds);
          myTickets = all.filter(t => idSet.has(t?.id));
        } else if (email) {
          const wanted = safeLower(email);
          myTickets = all.filter(t => safeLower(t?.email) === wanted);
        } else if (reportedBy) {
          myTickets = all.filter(t => String(t?.reportedBy ?? '') === reportedBy);
        }

        setIncidents(myTickets.slice().reverse());
      })
      .catch((err) => {
        console.error('Error loading incidents:', err);
        setIncidents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIncidents(); }, []);

  /* ── Derived ─────────────────────────────────────────── */

  const filtered = incidents.filter(incident => {
    const s = safeLower(searchTerm);
    const matchSearch =
      safeLower(incident?.title).includes(s) ||
      safeLower(incident?.id).includes(s) ||
      safeLower(incident?.referenceId).includes(s);
    const matchStatus = filterStatus === 'All' || normalizeStatus(incident.status) === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ──────────────────────────────────────────────────── */

  return (
    <div className="max-w-5xl mx-auto pt-40 pb-12 px-4 space-y-8">

      {/* ── Page Header ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">My Incidents</h1>
          <p className="text-slate-500 font-medium">Track and manage all your reported issues.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/create"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus size={16} />
            Report Issue
          </Link>
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search by title or reference…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 shadow-sm"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition rounded-full hover:bg-slate-100"
              >
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Tickets…</p>
        </div>

      /* ── Empty State ─────────────────────────────── */
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 glass-card bg-white border-dashed border-2 border-slate-100 rounded-[3rem]">
          <FileText className="mx-auto text-slate-200 mb-6" size={64} />
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
            {searchTerm || filterStatus !== 'All' ? 'No matching tickets' : 'No incidents yet'}
          </h3>
          <p className="text-slate-400 font-medium mb-8 max-w-xs mx-auto">
            {searchTerm || filterStatus !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : "You haven't reported any issues yet."}
          </p>
          {(searchTerm || filterStatus !== 'All') ? (
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('All'); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              <X size={14} /> Clear Filters
            </button>
          ) : (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200"
            >
              <Plus size={14} /> Report an Issue
            </Link>
          )}
        </div>

      /* ── Cards List ──────────────────────────────── */
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence>
            {filtered.map((incident, index) => {
              const cfg = STATUS_CONFIG[normalizeStatus(incident.status)] || STATUS_CONFIG.OPEN;

              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card bg-white p-7 hover:shadow-2xl transition-all border border-slate-100 relative overflow-hidden group"
                >
                  {/* Status accent bar */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${cfg.bar}`} />

                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pl-2">

                    {/* Left: content */}
                    <div className="flex-1 space-y-4 min-w-0">

                      {/* Title + badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900">{incident.title}</h3>
                        <StatusBadge status={incident.status} />
                        {incident.priority && (
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${PRIORITY_CONFIG[incident.priority] || PRIORITY_CONFIG.Medium}`}>
                            <Zap size={10} fill="currentColor" />
                            {incident.priority}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 font-medium leading-relaxed text-sm line-clamp-2">
                        {stripHtmlToText(incident.description) || 'No description provided.'}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-slate-300" />
                          <span className="font-mono">{getIncidentReference(incident)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-300" />
                          <span>{formatIncidentCreatedAt(incident)}</span>
                        </div>
                        {incident.category && (
                          <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-slate-300" />
                            <span>{incident.category}</span>
                          </div>
                        )}
                        {incident.resource && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-300" />
                            <span>{incident.resource}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: action */}
                    <div className="flex items-center gap-3 self-end lg:self-start shrink-0">
                      <Link
                        to={`/incident/${incident.id}`}
                        className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                      >
                        View Details
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyIncidents;