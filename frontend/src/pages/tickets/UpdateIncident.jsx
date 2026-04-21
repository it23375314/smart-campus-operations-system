import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, X, AlertCircle, CheckCircle,
  XCircle, User, Phone, Mail, Hash, GraduationCap,
  Building2, MapPin, Tag, Clock, MessageSquare, Paperclip,
  Shield, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Helpers ─────────────────────────────────────────────── */

const stripHtmlToText = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const getIncidentReference = (incident) => incident?.referenceId || incident?.id || '—';

const PRIORITY_CONFIG = {
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  High:   'bg-amber-100 text-amber-700 border-amber-200',
  Medium: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Low:    'bg-slate-100 text-slate-500 border-slate-200',
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg shrink-0">
      <Icon size={13} className="text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5 break-words">{value || '—'}</p>
    </div>
  </div>
);

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
      ? [...existingRemarks, `${new Date().toLocaleDateString()} - Admin: ${newRemark}`]
      : existingRemarks;

    const payload = {
      status, urgent,
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

  return (
    <div className="max-w-6xl mx-auto pt-40 pb-12 px-4 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Ref: <span className="text-indigo-600 font-mono">{getIncidentReference(incident)}</span>
          </p>
          <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">Manage Ticket</h1>
          <p className="text-slate-500 font-medium truncate max-w-lg">{incident.title}</p>
        </div>
        <Link
          to="/ticket-list"
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm shrink-0"
        >
          <ArrowLeft size={16} /> Back to Tickets
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Original Report ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card bg-white border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
            <AlertCircle size={16} className="text-indigo-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Original Report</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Title</p>
              <p className="text-base font-black text-slate-900">{incident.title}</p>
            </div>

            {/* Ticket details */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ticket Details</p>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <InfoRow icon={MapPin} label="Resource / Location" value={incident.resource} />
                <InfoRow icon={Tag}    label="Category"            value={incident.category} />
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg shrink-0"><Zap size={13} className="text-slate-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                    <span className={`mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${PRIORITY_CONFIG[incident.priority] || PRIORITY_CONFIG.Medium}`}>
                      <Zap size={9} fill="currentColor" /> {incident.priority || 'Medium'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reporter details */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reporter Details</p>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <InfoRow icon={User}         label="Name"       value={incident.reportedBy} />
                <InfoRow icon={Mail}         label="Email"      value={incident.email} />
                <InfoRow icon={Phone}        label="Phone"      value={incident.contactNumber} />
                <InfoRow icon={Hash}         label="Reg No."    value={incident.registrationNumber} />
                <InfoRow icon={GraduationCap} label="Faculty"  value={incident.faculty} />
                <InfoRow icon={Building2}    label="Campus"     value={incident.campus} />
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Description</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-2xl p-4 leading-relaxed">
                {stripHtmlToText(incident.description)}
              </p>
            </div>

            {/* Proof images */}
            {proofUrls.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Paperclip size={11} /> Attached Proof
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {proofUrls.map((url, idx) => (
                    <div key={idx} className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                      {url.startsWith('data:image') ? (
                        <img
                          src={url} alt={`Proof ${idx + 1}`}
                          onClick={() => setSelectedImage(url)}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          title="Click to enlarge"
                        />
                      ) : (
                        <a href={url} target="_blank" rel="noreferrer"
                          className="flex items-center justify-center w-full h-full text-xs font-black text-indigo-600 hover:bg-indigo-50 uppercase tracking-widest">
                          PDF
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remarks History */}
            {incident.remarksHistory?.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MessageSquare size={11} /> Remarks History
                </p>
                <ul className="space-y-2">
                  {incident.remarksHistory.map((remark, idx) => (
                    <li key={idx} className="text-sm text-slate-700 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                      {remark}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Right: Actions Form ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card bg-white border border-slate-100 overflow-hidden h-fit"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
            <Shield size={16} className="text-indigo-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Technician Actions & Assignment</h2>
          </div>

          <form onSubmit={handleUpdate} className="p-6 space-y-5">

            {/* Status + Technician */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); if (e.target.value !== 'REJECTED') setRejectionReason(''); }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Assign Technician</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="">— Unassigned —</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name} ({tech.category})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rejection Reason */}
            <AnimatePresence>
              {status === 'REJECTED' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                    <XCircle size={12} /> Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    placeholder="Explain why this ticket is being rejected…"
                    className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Urgent toggle */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${urgent ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'} transition-all`}>
              <input
                type="checkbox" id="adminUrgent"
                checked={urgent} onChange={(e) => setUrgent(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="adminUrgent" className={`text-sm font-black cursor-pointer flex items-center gap-2 ${urgent ? 'text-rose-600' : 'text-slate-600'}`}>
                <Zap size={14} fill={urgent ? 'currentColor' : 'none'} />
                Mark as Urgent Priority
              </label>
            </div>

            {/* New Remark */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={11} /> Add New Remark
              </label>
              <textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                rows="3"
                placeholder="Add notes about assignments, missing parts, etc…"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit" disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Updates</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative max-w-4xl w-full flex justify-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition"
                onClick={() => setSelectedImage(null)}
              >
                <X size={22} />
              </button>
              <img src={selectedImage} alt="Enlarged Proof"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateIncident;