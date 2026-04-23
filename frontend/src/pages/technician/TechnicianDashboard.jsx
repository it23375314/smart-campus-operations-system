import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench, ClipboardList, CheckCircle, Clock, AlertCircle,
  ArrowRight, Zap, TrendingUp, Activity, ListChecks,
  CircleDot, Loader2, Tag, MapPin, ChevronRight, Search, Filter
} from 'lucide-react';

/* ─── Status config ────────────────────────────────────────── */
const STATUS_CONFIG = {
  OPEN: { label: 'Open', pill: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'from-amber-400 to-orange-400', dot: 'bg-amber-400' },
  Pending: { label: 'Open', pill: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'from-amber-400 to-orange-400', dot: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', pill: 'bg-blue-100 text-blue-700 border-blue-200', bar: 'from-blue-500 to-indigo-500', dot: 'bg-blue-500' },
  'In Progress': { label: 'In Progress', pill: 'bg-blue-100 text-blue-700 border-blue-200', bar: 'from-blue-500 to-indigo-500', dot: 'bg-blue-500' },
  RESOLVED: { label: 'Resolved', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'from-emerald-400 to-teal-400', dot: 'bg-emerald-500' },
  Resolved: { label: 'Resolved', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'from-emerald-400 to-teal-400', dot: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', pill: 'bg-slate-100 text-slate-500 border-slate-200', bar: 'from-slate-300 to-slate-400', dot: 'bg-slate-400' },
  REJECTED: { label: 'Rejected', pill: 'bg-rose-100 text-rose-700 border-rose-200', bar: 'from-rose-500 to-pink-600', dot: 'bg-rose-500' },
};

const PRIORITY_CONFIG = {
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  High: 'bg-amber-100 text-amber-700 border-amber-200',
  Medium: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Low: 'bg-slate-100 text-slate-500 border-slate-200',
};

/* ─── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, gradient, delay, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card bg-white border border-slate-100 overflow-hidden"
  >
    <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
    <div className="p-6 flex items-start justify-between">
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-4xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 font-medium mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </motion.div>
);

/* ─── Ticket Row ─────────────────────────────────────────────── */
const TicketRow = ({ incident, index }) => {
  const cfg = STATUS_CONFIG[incident.status] || STATUS_CONFIG.OPEN;
  const priCfg = PRIORITY_CONFIG[incident.priority] || PRIORITY_CONFIG.Medium;
  const ref = incident?.referenceId || incident?.id || '—';
  const raw = incident?.createdAt || incident?.dateReported;
  const dateStr = raw ? new Date(raw).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) : '—';

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {ref}
        </span>
      </td>
      <td className="px-6 py-4 max-w-[280px]">
        <p className="text-sm font-black text-slate-900 truncate">{incident.title}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
          <MapPin size={10} /> {incident.resource || incident.campus || '—'}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${priCfg}`}>
          <Zap size={9} fill="currentColor" /> {incident.priority || 'Medium'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Clock size={11} /> {dateStr}
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
};

/* ─── Main Component ─────────────────────────────────────────── */
const TechnicianDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const techName = user?.username || 'Technician';

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/api/incidents')
      .then(r => r.json())
      .then(data => {
        // In a real app, filter by assignedTechnicianId === user.id
        // For demo: show all or filter by name match
        const myTickets = data.filter(i =>
          i.assignedTechnicianName?.toLowerCase() === techName.toLowerCase() ||
          i.assignedTechnicianId === user.id
        );
        // fallback: show all if none assigned
        let finalTickets = myTickets.length > 0 ? myTickets : data;
        finalTickets.sort((a, b) => new Date(b.createdAt || b.dateReported) - new Date(a.createdAt || a.dateReported));
        setIncidents(finalTickets);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openCount = incidents.filter(i => i.status === 'OPEN' || i.status === 'Pending').length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'In Progress').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'Resolved').length;
  const urgentCount = incidents.filter(i => i.priority === 'Urgent' && (i.status === 'OPEN' || i.status === 'Pending' || i.status === 'IN_PROGRESS' || i.status === 'In Progress')).length;

  const filteredActive = incidents
    .filter(i => i.status === 'OPEN' || i.status === 'Pending' || i.status === 'IN_PROGRESS' || i.status === 'In Progress')
    .filter(i => {
      const matchesSearch = i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.referenceId || i.id)?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

  const recentOpen = filteredActive.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto pt-40 pb-16 px-4 space-y-10">

      {/* ── Welcome Hero ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 md:p-12 text-white shadow-2xl shadow-indigo-200"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                <Wrench size={22} />
              </div>
              <span className="text-white/70 text-xs font-black uppercase tracking-widest">Technician Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-none mb-2">
              Welcome back,<br />
              <span className="text-yellow-300">{techName}</span>
            </h1>
            <p className="text-white/70 font-medium mt-2">
              {incidents.length} ticket{incidents.length !== 1 ? 's' : ''} in your queue &bull; {urgentCount > 0 ? `${urgentCount} urgent` : 'No urgent items'}
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <Link
              to="/technician/tickets"
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-50 shadow-xl active:scale-95"
            >
              <ListChecks size={15} /> My Tickets <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Total" value={incidents.length} icon={ClipboardList} gradient="from-indigo-500 to-purple-500" delay={0.05} sub="All tickets" />
        <StatCard label="Open / Pending" value={openCount} icon={CircleDot} gradient="from-amber-400 to-orange-400" delay={0.10} sub="Needs action" />
        <StatCard label="In Progress" value={inProgressCount} icon={Activity} gradient="from-blue-500 to-indigo-500" delay={0.15} sub="Active work" />
        <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle} gradient="from-emerald-400 to-teal-400" delay={0.20} sub="Completed" />
      </div>

      {/* ── Active Tickets Table ───────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="glass-card bg-white border border-slate-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={16} className="text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Active Tickets
              <span className="ml-2 text-indigo-600">{filteredActive.length}</span>
            </span>
          </div>
          <Link
            to="/technician/tickets"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition"
          >
            View All <ChevronRight size={13} />
          </Link>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search active tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Tickets…</p>
          </div>
        ) : (incidents.filter(i => i.status === 'OPEN' || i.status === 'Pending' || i.status === 'IN_PROGRESS' || i.status === 'In Progress').length === 0) ? (
          <div className="text-center py-16">
            <CheckCircle className="mx-auto text-emerald-200 mb-4" size={48} />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">All clear!</h3>
            <p className="text-slate-400 font-medium mt-1 text-sm">No open tickets at the moment.</p>
          </div>
        ) : recentOpen.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No matches</h3>
            <p className="text-slate-400 font-medium mt-1 text-sm">Try adjusting your search term.</p>
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
                {recentOpen.map((incident, index) => (
                  <TicketRow key={incident.id} incident={incident} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Quick Menu ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            to: '/technician/tickets',
            icon: ListChecks,
            label: 'All My Tickets',
            sub: 'View full ticket queue',
            gradient: 'from-indigo-500 to-purple-600',
          },
          {
            to: '/technician/tickets?filter=IN_PROGRESS',
            icon: Activity,
            label: 'In Progress',
            sub: 'Tickets you are working on',
            gradient: 'from-blue-500 to-indigo-600',
          },
          {
            to: '/technician/tickets?filter=RESOLVED',
            icon: CheckCircle,
            label: 'Resolved',
            sub: 'Recently resolved tickets',
            gradient: 'from-emerald-500 to-teal-600',
          },
        ].map((card, i) => (
          <motion.div
            key={card.to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <Link
              to={card.to}
              className={`flex items-center gap-4 p-6 rounded-3xl bg-gradient-to-br ${card.gradient} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group`}
            >
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform shrink-0">
                <card.icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="font-black text-base leading-snug">{card.label}</p>
                <p className="text-white/70 text-xs font-medium mt-0.5">{card.sub}</p>
              </div>
              <ArrowRight size={16} className="ml-auto shrink-0 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
