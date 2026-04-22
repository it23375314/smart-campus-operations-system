import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Clock, CheckCircle, AlertCircle, Activity,
  Zap, MapPin, Search, ChevronRight, CircleDot, Filter,
  ListChecks, ArrowLeft
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────── */
const fmtDate = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d)) return String(raw);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

/* ─── Status / Priority configs ─────────────────────────────── */
const STATUS_CFG = {
  OPEN: { label: 'Open', pill: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  Pending: { label: 'Open', pill: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', pill: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'In Progress': { label: 'In Progress', pill: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  RESOLVED: { label: 'Resolved', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Resolved: { label: 'Resolved', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', pill: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};
const PRI_CFG = {
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  High: 'bg-amber-100 text-amber-700 border-amber-200',
  Medium: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Low: 'bg-slate-100 text-slate-500 border-slate-200',
};

const FILTER_TABS = [
  { key: 'ALL', label: 'All', icon: ListChecks },
  { key: 'OPEN', label: 'Open', icon: CircleDot },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Activity },
  { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle },
  { key: 'CLOSED', label: 'Closed', icon: AlertCircle },
];

/* ─── Main Component ─────────────────────────────────────────── */
const TechnicianTickets = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();

  const initialFilter = searchParams.get('filter') || 'ALL';
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const techName = user?.username || '';

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/api/incidents')
      .then(r => r.json())
      .then(data => {
        const myTickets = data.filter(i =>
          i.assignedTechnicianName?.toLowerCase() === techName.toLowerCase() ||
          i.assignedTechnicianId === user.id
        );
        setIncidents(myTickets.length > 0 ? myTickets : data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* Filter + search */
  const matchesFilter = (i) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'OPEN') return i.status === 'OPEN' || i.status === 'Pending';
    if (activeFilter === 'IN_PROGRESS') return i.status === 'IN_PROGRESS' || i.status === 'In Progress';
    if (activeFilter === 'RESOLVED') return i.status === 'RESOLVED' || i.status === 'Resolved';
    if (activeFilter === 'CLOSED') return i.status === 'CLOSED';
    return true;
  };

  const filtered = incidents.filter(i => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      i.title?.toLowerCase().includes(q) ||
      String(i.referenceId || i.id)?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q);

    return matchesFilter(i) && matchesSearch;
  });

  const countFor = (key) => {
    if (key === 'ALL') return incidents.length;
    if (key === 'OPEN') return incidents.filter(i => i.status === 'OPEN' || i.status === 'Pending').length;
    if (key === 'IN_PROGRESS') return incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'In Progress').length;
    if (key === 'RESOLVED') return incidents.filter(i => i.status === 'RESOLVED' || i.status === 'Resolved').length;
    if (key === 'CLOSED') return incidents.filter(i => i.status === 'CLOSED').length;
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto pt-40 pb-16 px-4 space-y-8">

      {/* ── Header ─────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            <Link to="/technician" className="hover:text-indigo-600 flex items-center gap-1 transition">
              <ArrowLeft size={13} /> Dashboard
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-700">My Tickets</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">My Ticket Queue</h1>
          <p className="text-slate-500 font-medium">All support incidents assigned to you.</p>
        </div>
      </div>

      {/* ── Filter Tabs ────────────────── */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${activeFilter === tab.key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
          >
            <tab.icon size={13} />
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${activeFilter === tab.key ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
              {countFor(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search + Table ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card bg-white border border-slate-100 overflow-hidden"
      >
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <Filter size={13} />
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No tickets found</h3>
            <p className="text-slate-400 font-medium mt-1 text-sm">Try adjusting your filter or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Ref', 'Issue', 'Category', 'Priority', 'Date', 'Status', ''].map((h, i) => (
                    <th key={i} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 ${i === 6 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((incident, idx) => {
                    const cfg = STATUS_CFG[incident.status] || STATUS_CFG.OPEN;
                    const priCfg = PRI_CFG[incident.priority] || PRI_CFG.Medium;
                    const ref = incident?.referenceId || incident?.id || '—';
                    return (
                      <motion.tr
                        key={incident.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{ref}</span>
                        </td>
                        <td className="px-6 py-4 max-w-[240px]">
                          <div className="flex flex-col gap-1.5">
                            <p className="text-sm font-black text-slate-900 truncate">{incident.title}</p>
                            {incident.urgent && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-lg w-fit animate-pulse">
                                <Zap size={10} className="text-rose-600 fill-rose-600" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-rose-600">Admin marked this ticket as urgent</span>
                              </div>
                            )}
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <MapPin size={10} /> {incident.resource || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-slate-500">{incident.category || '—'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${priCfg}`}>
                            <Zap size={9} fill="currentColor" /> {incident.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={11} /> {fmtDate(incident)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            to={`/technician/ticket/${incident.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                          >
                            <Wrench size={12} /> Work
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

export default TechnicianTickets;
