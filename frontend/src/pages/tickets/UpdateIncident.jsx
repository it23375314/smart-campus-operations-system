import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Loader2, X, AlertCircle, CheckCircle,
  XCircle, User, Phone, Mail, Hash, GraduationCap,
  Building2, MapPin, Tag, Clock, MessageSquare, Paperclip,
  Shield, Zap, Pencil, Trash2, ChevronRight, CircleDot,
  Calendar, FileText, MoreHorizontal, Search
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   Helpers & Config
───────────────────────────────────────────────────────────────── */

const stripHtmlToText = (v) => {
  if (!v) return '';
  let str = String(v);
  str = str.replace(/<br\s*[\/]?>/gi, '\n');
  str = str.replace(/<\/p>/gi, '\n\n');
  str = str.replace(/<[^>]*>/g, '');
  str = str.replace(/[ \t]+/g, ' ');
  str = str.replace(/\n\s*\n\s*\n/g, '\n\n');
  return str.trim();
};

const getInit = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const fmtDate = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return '—';
  const hasTime = Boolean(incident?.createdAt);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return hasTime
    ? d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const STATUS = {
  OPEN: { label: 'Open', icon: CircleDot, pill: 'bg-amber-100 text-amber-700 border-amber-200', gradient: 'from-amber-500 to-orange-500', ring: 'ring-amber-200' },
  IN_PROGRESS: { label: 'In Progress', icon: Loader2, pill: 'bg-blue-100 text-blue-700 border-blue-200', gradient: 'from-blue-500 to-indigo-600', ring: 'ring-blue-200' },
  RESOLVED: { label: 'Resolved', icon: CheckCircle, pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', gradient: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-200' },
  CLOSED: { label: 'Closed', icon: XCircle, pill: 'bg-slate-100 text-slate-500 border-slate-200', gradient: 'from-slate-400 to-slate-500', ring: 'ring-slate-200' },
  REJECTED: { label: 'Rejected', icon: XCircle, pill: 'bg-rose-100 text-rose-700 border-rose-200', gradient: 'from-rose-500 to-pink-600', ring: 'ring-rose-200' },
};

const PRIORITY = {
  Urgent: { pill: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  High: { pill: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  Medium: { pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  Low: { pill: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-300' },
};

const MetaItem = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 mt-0.5">
      <Icon size={12} className="text-slate-500" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      {children || <p className="text-sm font-medium text-slate-800 break-words leading-snug">{value || '—'}</p>}
    </div>
  </div>
);

const parseCommentDateTime = (remark) => {
  if (!remark) return { dateStr: '—', timeStr: '', fullStr: '—' };

  let timestamp = null;
  const match = remark.match(/^\[(.*?)\]\s*/);
  if (match) {
    timestamp = match[1];
  } else {
    const dashMatch = remark.match(/^(.+?)\s+-\s+/);
    if (dashMatch) timestamp = dashMatch[1];
  }

  if (!timestamp) return { dateStr: '—', timeStr: '', fullStr: remark.split(': ')[0] };

  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return { dateStr: timestamp, timeStr: '', fullStr: timestamp };
    const dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    const hasTime = timestamp.includes('T') || timestamp.includes(':') || /am|pm/i.test(timestamp);
    const timeStr = hasTime ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
    return { dateStr, timeStr, fullStr: timeStr ? `${dateStr} ${timeStr}` : dateStr };
  } catch {
    return { dateStr: timestamp, timeStr: '', fullStr: timestamp };
  }
};

/* ─── Main Component ────────────────────────────────────── */

const UpdateIncident = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [status, setStatus] = useState('OPEN');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [resource, setResource] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const proofUrls = Array.isArray(incident?.proofUrls) && incident.proofUrls.length > 0
    ? incident.proofUrls
    : incident?.proofImageUrl ? [incident.proofImageUrl] : [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true); setLoadError('');
        const incidentRes = await fetch(`http://localhost:8080/api/incidents/${id}`);
        if (!incidentRes.ok) throw new Error('Failed to load ticket details');
        const incidentData = await incidentRes.json();
        if (!incidentData) throw new Error('Ticket not found');
        setIncident(incidentData);
        setStatus(incidentData.status || 'OPEN');
        setRejectionReason(incidentData.rejectionReason || '');
        setUrgent(incidentData.urgent || false);
        setPriority(incidentData.priority || 'Medium');
        setResource(incidentData.resource || '');
        if (incidentData.assignedTechnicianId) setSelectedTechId(incidentData.assignedTechnicianId);

        const techRes = await fetch('http://localhost:8080/api/technicians');
        if (techRes.ok) setTechnicians(await techRes.json());
      } catch (error) {
        setLoadError(error.message || 'Failed to load ticket details');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason before rejecting the ticket.');
      return;
    }
    const assignedTech = technicians.find(t => t.id === selectedTechId);
    const existingRemarks = incident.remarksHistory || [];
    const updatedRemarks = newRemark
      ? [...existingRemarks, `[${new Date().toISOString()}] - Admin (${user.username || 'Admin'}): ${newRemark}`]
      : existingRemarks;

    const payload = {
      status, urgent,
      priority, resource,
      assignedTechnicianId: assignedTech?.id || null,
      assignedTechnicianName: assignedTech?.name || null,
      assignedTechnicianCategory: assignedTech?.category || null,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      remarksHistory: updatedRemarks,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        navigate('/ticket-list');
      } else {
        alert(`Error: ${res.status} - ${res.statusText}`);
      }
    } catch (error) {
      console.error('Update failed', error);
      alert(`Error updating ticket: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (idx) => {
    if (!editingText.trim()) return;
    const updatedRemarks = [...incident.remarksHistory];
    const originalRemark = updatedRemarks[idx];

    // Strict ownership check for editing
    const isOwn = originalRemark.includes(`Admin (${user.username})`);
    if (!isOwn) {
      alert("Permission denied: You can only edit your own comments.");
      setEditingIndex(null);
      return;
    }

    const prefix = originalRemark.split(': ')[0];
    updatedRemarks[idx] = `${prefix}: ${editingText}`;

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incident, remarksHistory: updatedRemarks }),
      });
      if (res.ok) {
        setIncident({ ...incident, remarksHistory: updatedRemarks });
        setEditingIndex(null);
      }
    } catch (error) {
      alert('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (idx) => {
    if (!window.confirm('Delete this comment?')) return;
    const updatedRemarks = incident.remarksHistory.filter((_, i) => i !== idx);

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incident, remarksHistory: updatedRemarks }),
      });
      if (res.ok) {
        setIncident({ ...incident, remarksHistory: updatedRemarks });
      }
    } catch (error) {
      alert('Failed to delete comment');
    } finally {
      setSubmitting(false);
    }
  };


  /* ── Loading / Error states ──────────────────────────── */

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
        <p className="text-sm font-black uppercase tracking-widest">Loading Ticket…</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={40} className="mx-auto text-rose-400 mb-3" />
        <p className="text-rose-600 font-black">{loadError}</p>
        <Link to="/ticket-list" className="mt-4 inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm">
          <ArrowLeft size={14} /> Back to Tickets
        </Link>
      </div>
    </div>
  );

  if (!incident) return null;

  /* ── Render ──────────────────────────────────────────── */

  /* ── Status config for UI ──────────────────────────────────── */
  const statusCfg = STATUS[incident.status] || STATUS.OPEN;
  const priCfg = PRIORITY[incident.priority] || PRIORITY.Medium;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${statusCfg.gradient} pt-48 pb-20 px-4`}>
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-white/70 text-xs font-black uppercase tracking-widest mb-6"
          >
            <Link to="/ticket-list" className="hover:text-white transition flex items-center gap-1.5">
              <ArrowLeft size={13} /> Back to Tickets
            </Link>
            <ChevronRight size={12} />
            <span className="text-white">Manage Ticket</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/25">
                  <Clock size={11} /> Ref: {incident.referenceId || incident.id}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/25">
                  <Tag size={10} /> {incident.category || 'General'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-sm">
                {incident.title}
              </h1>
              <p className="text-white/70 text-sm font-medium mt-2 flex items-center gap-2">
                <Calendar size={13} />
                Reported {fmtDate(incident)} by <span className="text-white font-black">{incident.reportedBy}</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-16">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT: Info + History (7 cols) ────────────────────── */}
          <div className="lg:col-span-7 w-full space-y-6">

            {/* Original Report Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-lg"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200">
                    {getInit(incident.reportedBy)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{incident.reportedBy || 'Reporter'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Report</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 space-y-6">
                <div className="text-slate-700 text-sm leading-relaxed">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {stripHtmlToText(incident.description)}
                  </div>
                </div>

                {/* Attachments */}
                {proofUrls.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Paperclip size={10} /> {proofUrls.length} Attachment{proofUrls.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {proofUrls.map((url, i) => (
                        <div key={i}>
                          {url.startsWith('data:image') ? (
                            <button
                              onClick={() => setSelectedImage(url)}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              <FileText size={12} /> Image {i + 1}
                            </button>
                          ) : (
                            <a href={url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              <FileText size={12} /> Doc {i + 1}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Conversation History Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-lg"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-indigo-500" />
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Conversation History</h2>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {incident.remarksHistory?.length || 0} Entries
                  </span>
                </div>

                {/* History Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'ADMIN', label: 'Admin' },
                      { id: 'TECH', label: 'Tech' },
                      { id: 'USER', label: 'User' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setHistoryFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                          historyFilter === f.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {(!incident.remarksHistory || incident.remarksHistory.length === 0) ? (
                  <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                    <p className="text-slate-400 text-xs font-medium italic">No remarks recorded yet.</p>
                  </div>
                ) : (
                  <div className="relative pl-4 sm:pl-8 space-y-4">
                    <div className="absolute left-0 sm:left-4 top-0 bottom-0 w-px bg-slate-200" />
                    <AnimatePresence mode="popLayout">
                      {(incident.remarksHistory || [])
                        .filter(remark => {
                          const isTech  = remark.includes('Technician');
                          const isAdmin = remark.includes('Admin');
                          const isUser  = remark.includes('User') || remark.includes('Student');
                          const roleMatch = historyFilter === 'ALL' || 
                            (historyFilter === 'ADMIN' && isAdmin) || 
                            (historyFilter === 'TECH' && isTech) || 
                            (historyFilter === 'USER' && isUser);
                          const searchMatch = !historySearch || remark.toLowerCase().includes(historySearch.toLowerCase());
                          return roleMatch && searchMatch;
                        })
                        .map((remark, idx) => {
                      const isAdmin = remark.includes('Admin');
                      const isTech  = remark.includes('Technician');
                      const isUser  = remark.includes('User') || remark.includes('Student');
                      const isOwn   = isAdmin && user.username && remark.includes(`Admin (${user.username})`);

                      const parts = remark.split(': ');
                      const message = parts.slice(1).join(': ');
                      const { dateStr, timeStr } = parseCommentDateTime(remark);
                      const author = isAdmin ? 'Admin' : (isTech ? 'Technician' : (isUser ? 'User' : 'System'));

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative"
                        >
                          <div className={`absolute -left-5 sm:-left-5 top-4 w-2 h-2 rounded-full border-2 border-white ${isAdmin ? 'bg-indigo-500' : 'bg-slate-400'} ring-4 ring-slate-50`} />

                          <div className={`glass-card bg-white border overflow-hidden shadow-sm ${isAdmin ? 'border-indigo-100' : 'border-slate-100'}`}>
                            <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] ${isAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                  {getInit(author)}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900">{author}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400/70 uppercase tracking-widest">
                                    <span>{dateStr}</span>
                                    {timeStr && <span>•</span>}
                                    <span>{timeStr}</span>
                                  </div>
                                </div>
                              </div>

                              {editingIndex !== idx && (
                                <div className="flex items-center gap-1">
                                  {isOwn && (
                                    <button
                                      onClick={() => { setEditingIndex(idx); setEditingText(message); }}
                                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteComment(idx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-all"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="px-5 py-4">
                              {editingIndex === idx ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-indigo-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    rows="2"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingIndex(null)} className="px-3 py-1 text-[10px] font-black uppercase text-slate-500">Cancel</button>
                                    <button onClick={() => handleSaveEdit(idx)} className="px-3 py-1 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-lg">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Management & Actions (5 cols) ────────────── */}
          <div className="lg:col-span-5 w-full space-y-6">

            {/* Assignment & Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/30 flex items-center gap-3">
                <Shield size={16} className="text-indigo-600" />
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Management Actions</h2>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {/* Status Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS).map(([key, cfg]) => (
                      <button
                        key={key} type="button"
                        onClick={() => { setStatus(key); if (key !== 'REJECTED') setRejectionReason(''); }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all ${status === key ? `${cfg.pill} ${cfg.ring} scale-[1.02] shadow-md` : 'border-slate-100 bg-slate-50 text-slate-400 grayscale'
                          }`}
                      >
                        <cfg.icon size={14} className={key === 'IN_PROGRESS' && status === key ? 'animate-spin' : ''} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{cfg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technician Assignment */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Technician</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <select
                      value={selectedTechId}
                      onChange={(e) => setSelectedTechId(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none"
                    >
                      <option value="">— Select Technician —</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resource / Location */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Resource / Location
                  </label>
                  <input
                    type="text"
                    value={resource}
                    onChange={(e) => setResource(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
                    placeholder="Enter location or resource..."
                  />
                </div>

                {/* Priority Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} /> Ticket Priority
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(PRIORITY).map((p) => (
                      <button
                        key={p} type="button"
                        onClick={() => {
                          setPriority(p);
                          setUrgent(p === 'Urgent');
                        }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all ${
                          priority === p ? `${PRIORITY[p].pill} ring-2 ring-opacity-50 ${priority === 'Urgent' ? 'ring-rose-200' : priority === 'High' ? 'ring-amber-200' : priority === 'Medium' ? 'ring-indigo-200' : 'ring-slate-200'} scale-[1.02] shadow-md` : 'border-slate-100 bg-slate-50 text-slate-400 grayscale'
                        }`}
                      >
                        <Zap size={14} fill={priority === p ? 'currentColor' : 'none'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rejection Note */}
                <AnimatePresence>
                  {status === 'REJECTED' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Rejection Reason *</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-900 outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-rose-300"
                        placeholder="Explain why this ticket is being rejected..."
                        rows="3"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* New Remark */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={12} /> Add Administrative Note
                  </label>
                  <textarea
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
                    placeholder="Add notes about assignments, missing parts, or internal updates..."
                    rows="4"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {submitting ? 'Saving Updates...' : 'Save & Update Ticket'}
                </button>
              </form>
            </motion.div>

            {/* Reporter Meta Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-md"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center gap-3">
                <User size={16} className="text-slate-400" />
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Reporter Contact Details</h2>
              </div>
              <div className="p-5 space-y-0 divide-y divide-slate-50">
                <MetaItem icon={User} label="Full Name" value={incident.reportedBy} />
                <MetaItem icon={Mail} label="Email Address" value={incident.email} />
                <MetaItem icon={Phone} label="Contact Number" value={incident.contactNumber} />
                <MetaItem icon={GraduationCap} label="Faculty" value={incident.faculty} />
                <MetaItem icon={Building2} label="Campus / Site" value={incident.campus} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                onClick={() => setSelectedImage(null)}
              >
                <X size={14} /> Close Preview
              </button>
              <img src={selectedImage} alt="Enlarged Proof" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateIncident;