import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Wrench, Save, Loader2, CheckCircle,
  XCircle, Clock, Tag, User, MapPin, Phone, GraduationCap,
  Building2, Hash, Zap, Calendar, MessageSquare, Send,
  Shield, AlertCircle, FileText, Paperclip, X, CircleDot,
  CheckSquare, Pencil, Trash2
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────── */
const stripHtml = (v) => v ? String(v).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
const getRef    = (i) => i?.referenceId || i?.id || '—';
const getInit   = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
const fmtDate   = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d)) return String(raw);
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};
const parseCommentDateTime = (remark) => {
  if (!remark) return { dateStr: '—', timeStr: '' };
  let timestamp = null;
  const match = remark.match(/^\[(.*?)\]\s*/);
  if (match) {
    timestamp = match[1];
  } else {
    const dashMatch = remark.match(/^(.+?)\s+-\s+/);
    if (dashMatch) timestamp = dashMatch[1];
  }
  if (!timestamp) return { dateStr: '—', timeStr: '' };
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return { dateStr: timestamp, timeStr: '' };
    const dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    const hasTime = timestamp.includes('T') || timestamp.includes(':') || /am|pm/i.test(timestamp);
    const timeStr = hasTime ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
    return { dateStr, timeStr };
  } catch {
    return { dateStr: timestamp, timeStr: '' };
  }
};

/* ─── Status config ─────────────────────────────────────────── */
const STATUS = {
  OPEN:          { label: 'Open',        icon: CircleDot,    pill: 'bg-amber-100 text-amber-700 border-amber-200',       gradient: 'from-amber-500 to-orange-500'   },
  IN_PROGRESS:   { label: 'In Progress', icon: Loader2,      pill: 'bg-blue-100 text-blue-700 border-blue-200',          gradient: 'from-blue-500 to-indigo-600'    },
  RESOLVED:      { label: 'Resolved',    icon: CheckCircle,  pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', gradient: 'from-emerald-500 to-teal-500'   },
  CLOSED:        { label: 'Closed',      icon: XCircle,      pill: 'bg-slate-100 text-slate-500 border-slate-200',       gradient: 'from-slate-400 to-slate-500'    },
  REJECTED:      { label: 'Rejected',    icon: XCircle,      pill: 'bg-rose-100 text-rose-700 border-rose-200',          gradient: 'from-rose-500 to-pink-600'      },
};

const PRIORITY = {
  Urgent: { pill: 'bg-rose-100 text-rose-700 border-rose-200',     dot: 'bg-rose-500'    },
  High:   { pill: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400'   },
  Medium: { pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  Low:    { pill: 'bg-slate-100 text-slate-500 border-slate-200',   dot: 'bg-slate-300'   },
};

/* ─── Reusable pieces ───────────────────────────────────────── */
const MetaRow = ({ icon: Icon, label, value, children }) => (
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

const StatusPill = ({ status }) => {
  const cfg = STATUS[status] || STATUS.OPEN;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.pill}`}>
      <Icon size={11} className={status === 'IN_PROGRESS' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const TechnicianTicketDetail = () => {
  const { id } = useParams();

  const [incident, setIncident]       = useState(null);
  const [status, setStatus]           = useState('');
  const [resolutionNote, setNote]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [replyFocused, setReplyFocused]   = useState(false);
  const [editingIndex, setEditingIndex]   = useState(null);
  const [editingText, setEditingText]     = useState('');

  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const techName = user?.username || 'Technician';

  /* Fetch incident */
  const fetchIncident = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        setStatus(data.status || 'OPEN');
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchIncident(); }, [id]);

  const proofUrls = Array.isArray(incident?.proofUrls) && incident.proofUrls.length > 0
    ? incident.proofUrls
    : incident?.proofImageUrl ? [incident.proofImageUrl] : [];

  /* Save status + resolution note */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!resolutionNote.trim() && status === incident.status) {
      alert('Please update the status or add a resolution note before saving.');
      return;
    }
    setSubmitting(true);
    setSaveSuccess(false);

    const existingRemarks = incident.remarksHistory || [];
    const updatedRemarks  = resolutionNote.trim()
      ? [...existingRemarks, `[${new Date().toISOString()}] - Technician (${user.username || 'Tech'}): ${resolutionNote.trim()}`]
      : existingRemarks;

    const payload = {
      status,
      remarksHistory: updatedRemarks,
      ...(status === 'RESOLVED' ? { resolvedAt: new Date().toISOString() } : {}),
    };

    try {
      const res = await fetch(`http://localhost:8080/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNote('');
        setSaveSuccess(true);
        await fetchIncident();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(`Error: ${res.statusText}`);
      }
    } catch (err) {
      alert('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (idx) => {
    if (!editingText.trim()) return;
    const updatedRemarks = [...incident.remarksHistory];
    const originalRemark = updatedRemarks[idx];
    
    // Strict ownership check
    const isOwn = originalRemark.includes(`Technician (${user.username})`);
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
        setEditingText('');
      }
    } catch (err) {
      alert('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (idx) => {
    const originalRemark = incident.remarksHistory[idx];
    
    // Strict ownership check
    const isOwn = originalRemark.includes(`Technician (${user.username})`);
    if (!isOwn) {
      alert("Permission denied: You can only delete your own comments.");
      return;
    }

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
    } catch (err) {
      alert('Failed to delete comment');
    } finally {
      setSubmitting(false);
    }
  };


  /* ── Loading ──────────────────────────────────────────── */
  if (!incident) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest">Loading Ticket…</p>
      </div>
    </div>
  );

  const statusCfg = STATUS[incident.status] || STATUS.OPEN;
  const priCfg    = PRIORITY[incident.priority] || PRIORITY.Medium;

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero Banner ──────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${statusCfg.gradient} pt-48 pb-20 px-4`}>
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-white/70 text-xs font-black uppercase tracking-widest mb-6"
          >
            <Link to="/technician" className="hover:text-white transition flex items-center gap-1.5">
              <ArrowLeft size={13} /> Dashboard
            </Link>
            <ChevronRight size={12} />
            <Link to="/technician/tickets" className="hover:text-white transition">My Tickets</Link>
            <ChevronRight size={12} />
            <span className="text-white">#{getRef(incident)}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/25">
                  <statusCfg.icon size={11} className={incident.status === 'IN_PROGRESS' ? 'animate-spin' : ''} />
                  {statusCfg.label}
                </span>
                {incident.priority && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/25">
                    <Zap size={10} fill="currentColor" /> {incident.priority}
                  </span>
                )}
                {incident.category && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/25">
                    <Tag size={10} /> {incident.category}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-sm">
                {incident.title}
              </h1>
              <p className="text-white/70 text-sm font-medium mt-2 flex items-center gap-2">
                <Calendar size={13} />
                Reported {fmtDate(incident)} by <span className="text-white font-black">{incident.reportedBy}</span>
              </p>
            </div>

            {/* Assigned to badge */}
            <div className="shrink-0">
              <div className="flex items-center gap-3 px-5 py-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white font-black text-sm flex items-center justify-center">
                  {getInit(techName)}
                </div>
                <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Assigned To</p>
                  <p className="text-white font-black text-sm">{techName}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: Description + Remarks + Reply ─────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Urgent Notification */}
            {incident.urgent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 rounded-3xl flex items-center gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-700 uppercase tracking-widest">Priority Attention Required</p>
                  <p className="text-sm font-bold text-rose-600 leading-tight">Admin has marked this ticket as high-priority/urgent.</p>
                </div>
              </motion.div>
            )}

            {/* Rejection Notification */}
            {incident.status === 'REJECTED' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 rounded-3xl flex items-center gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                  <XCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-700 uppercase tracking-widest">Ticket Rejected</p>
                  <p className="text-sm font-bold text-rose-600 leading-tight">Reason: {incident.rejectionReason || 'No reason provided.'}</p>
                </div>
              </motion.div>
            )}

            {/* Original report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
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
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> {fmtDate(incident)}
                </span>
              </div>

              <div className="px-6 py-6 text-slate-700 text-sm leading-relaxed">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: incident.description }} />
              </div>

              {/* Attachments */}
              {proofUrls.length > 0 && (
                <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Paperclip size={10} /> {proofUrls.length} Attachment{proofUrls.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proofUrls.map((url, i) => (
                      <div key={i}>
                        {url.startsWith('data:image') ? (
                          <button
                            onClick={() => setSelectedImage(url)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                          >
                            <FileText size={12} /> Image {i + 1}
                          </button>
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                          >
                            <FileText size={12} /> Doc {i + 1}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── Remarks history ─────────────────────────── */}
            {incident.remarksHistory?.length > 0 && (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 hidden sm:block" />
                <div className="space-y-3">
                  <AnimatePresence>
                    {incident.remarksHistory.map((remark, idx) => {
                      const isTech    = remark.includes('Technician');
                      const isAdmin   = remark.includes('Admin');
                      const isUser    = remark.includes('User') || remark.includes('Student');
                      const isOwn     = isTech && user.username && remark.includes(`Technician (${user.username})`);
                      
                      const parts     = remark.split(': ');
                      const message   = parts.slice(1).join(': ');
                      const author    = isAdmin ? 'Admin' : (isTech ? 'Technician' : (isUser ? 'User' : 'System'));
                      const { dateStr, timeStr } = parseCommentDateTime(remark);
                      const role      = isAdmin ? 'Admin' : (isTech ? 'Technician' : 'Reporter');

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: isTech ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: idx * 0.04 }}
                          className="relative sm:pl-12"
                        >
                          <div className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm hidden sm:block ${isUser ? 'bg-blue-400' : isAdmin ? 'bg-amber-500' : 'bg-indigo-500'}`} />

                          <div className={`glass-card bg-white border overflow-hidden ${isUser ? 'border-slate-100' : isAdmin ? 'border-amber-100' : 'border-indigo-100'} shadow-sm`}>
                            {isTech && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600" />}
                            {isAdmin && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-600" />}

                            <div className={`flex items-center justify-between px-5 py-3 border-b border-slate-50 ${isUser ? 'bg-slate-50/50' : isAdmin ? 'bg-amber-50/30 pl-6' : 'pl-6 bg-indigo-50/30'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${isUser ? 'bg-blue-100 text-blue-600' : isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {isUser ? getInit(author) : <Shield size={13} />}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{author}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <Clock size={9} />
                                    <span>{dateStr}</span>
                                    {timeStr && <span>•</span>}
                                    {timeStr && <span>{timeStr}</span>}
                                  </div>
                                </div>
                              </div>
                              {isOwn && editingIndex !== idx && (
                                <div className="flex items-center gap-1 ml-4">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingIndex(idx); setEditingText(message); }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className={`px-5 py-4 text-sm text-slate-700 leading-relaxed ${(isTech || isAdmin) ? 'pl-6' : ''}`}>
                              {editingIndex === idx ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editingText}
                                    onChange={e => setEditingText(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingIndex(null)}
                                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-lg"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(idx)}
                                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-lg"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                message
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── Resolution / Update Form ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`glass-card bg-white border overflow-hidden shadow-sm transition-all duration-300 ${replyFocused ? 'border-indigo-300 shadow-indigo-100 shadow-md' : 'border-slate-100'}`}
            >
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3 bg-indigo-50/40">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Wrench size={15} />
                </div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Update Ticket Status &amp; Add Resolution Note
                </p>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">

                {/* Status selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Update Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: 'OPEN',        label: 'Open',        icon: CircleDot,   color: 'border-amber-200 bg-amber-50 text-amber-700'   },
                      { val: 'IN_PROGRESS', label: 'In Progress', icon: Loader2,     color: 'border-blue-200 bg-blue-50 text-blue-700'     },
                      { val: 'RESOLVED',    label: 'Resolved',    icon: CheckCircle, color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                      { val: 'CLOSED',      label: 'Closed',      icon: XCircle,     color: 'border-slate-200 bg-slate-50 text-slate-500'   },
                    ].map(s => (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => setStatus(s.val)}
                        disabled={incident.status === 'REJECTED'}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                          status === s.val
                            ? `${s.color} shadow-sm scale-[1.02]`
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 disabled:opacity-50'
                        }`}
                      >
                        <s.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution note */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare size={11} /> Resolution / Work Note
                  </label>
                    <textarea
                      value={resolutionNote}
                      onChange={e => setNote(e.target.value)}
                      onFocus={() => setReplyFocused(true)}
                      onBlur={() => !resolutionNote && setReplyFocused(false)}
                      disabled={incident.status === 'REJECTED'}
                      rows={replyFocused ? 6 : 4}
                      placeholder={incident.status === 'REJECTED' ? "This ticket has been rejected and cannot be updated." : "Describe what you did to resolve this issue, any parts replaced, steps taken, or further action required…"}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none text-sm text-slate-700 resize-none transition-all placeholder:text-slate-400 disabled:opacity-50"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {resolutionNote.length > 0 && `${resolutionNote.length} chars`}
                  </div>
                  <div className="flex items-center gap-3">
                    {saveSuccess && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-widest"
                      >
                        <CheckSquare size={14} /> Saved!
                      </motion.span>
                    )}
                    <button
                      type="submit"
                      disabled={submitting || incident.status === 'REJECTED'}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {submitting
                        ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                        : incident.status === 'REJECTED' 
                          ? <><XCircle size={13} /> Ticket Rejected</>
                          : <><Save size={13} /> Save Update</>
                      }
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* ── RIGHT: Sidebar ───────────────────────────── */}
          <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">

            {/* Status card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-md"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${statusCfg.gradient}`} />
              <div className="p-5 border-b border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag size={10} /> Ticket Status
                </p>
                <StatusPill status={incident.status} />
              </div>
              <div className="p-5 divide-y divide-slate-50">
                <MetaRow icon={Hash}     label="Reference"    value={getRef(incident)} />
                <MetaRow icon={Calendar} label="Reported On"  value={fmtDate(incident)} />
                <MetaRow icon={User}     label="Reported By"  value={incident.reportedBy} />
              </div>
            </motion.div>

            {/* Properties card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-md"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle size={10} /> Properties
                </p>
              </div>
              <div className="p-5 divide-y divide-slate-50">
                <MetaRow icon={Zap} label="Priority">
                  <span className={`mt-1 flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${priCfg.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priCfg.dot}`} />
                    {incident.priority || 'Medium'}
                  </span>
                </MetaRow>
                <MetaRow icon={Tag}          label="Category"    value={incident.category} />
                <MetaRow icon={MapPin}       label="Resource"    value={incident.resource} />
                <MetaRow icon={GraduationCap} label="Faculty"   value={incident.faculty} />
                <MetaRow icon={Phone}        label="Contact"     value={incident.contactNumber} />
                <MetaRow icon={Building2}    label="Campus"      value={incident.campus} />
              </div>
            </motion.div>

            {/* Resolution checklist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-md"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-indigo-50/60">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle size={10} /> Technician Checklist
                </p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  'Diagnose the root cause',
                  'Gather required parts / tools',
                  'Apply fix / resolve issue',
                  'Test the solution',
                  'Add resolution note',
                  'Mark ticket as Resolved',
                ].map((step, i) => {
                  const done =
                    (i <= 3 && (incident.status === 'RESOLVED' || incident.status === 'CLOSED')) ||
                    (i === 4 && incident.remarksHistory?.some(r => r.includes('Technician'))) ||
                    (i === 5 && (incident.status === 'RESOLVED' || incident.status === 'CLOSED'));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                        {done && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <p className={`text-xs font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{step}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Image Lightbox ───────────────────────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="relative max-w-4xl w-full flex flex-col justify-center pt-10"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-0 right-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                <X size={13} /> Close
              </button>
              <img
                src={selectedImage} alt="Proof"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicianTicketDetail;
