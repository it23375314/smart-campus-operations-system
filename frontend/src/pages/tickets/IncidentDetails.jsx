import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, Clock, Tag, User, Paperclip, AlertCircle,
  ChevronRight, Send, Pencil, Trash2, X, CheckCircle, XCircle,
  Loader2, MessageSquare, Shield, FileText, MapPin, Phone,
  GraduationCap, Hash, Building2, CircleDot, Zap, Calendar,
  MoreHorizontal, ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─────────────────────────────────────────────────────────────────
   Helpers
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
const getRef  = (i) => i?.referenceId || i?.id || '—';
const getInit = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
const fmtDate = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return '—';
  const hasTime = Boolean(incident?.createdAt);
  if (!hasTime && typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return hasTime
    ? d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};
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

/* ─────────────────────────────────────────────────────────────────
   Status / Priority  Config
───────────────────────────────────────────────────────────────── */

const STATUS = {
  OPEN:        { label: 'Open',        icon: CircleDot,   pill: 'bg-amber-100 text-amber-700 border-amber-200',       gradient: 'from-amber-500 to-orange-500',   ring: 'ring-amber-200'   },
  IN_PROGRESS: { label: 'In Progress', icon: Loader2,     pill: 'bg-blue-100 text-blue-700 border-blue-200',          gradient: 'from-blue-500 to-indigo-600',    ring: 'ring-blue-200'    },
  RESOLVED:    { label: 'Resolved',    icon: CheckCircle, pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', gradient: 'from-emerald-500 to-teal-500',   ring: 'ring-emerald-200' },
  CLOSED:      { label: 'Closed',      icon: XCircle,     pill: 'bg-slate-100 text-slate-500 border-slate-200',       gradient: 'from-slate-400 to-slate-500',    ring: 'ring-slate-200'   },
  REJECTED:    { label: 'Rejected',    icon: XCircle,     pill: 'bg-rose-100 text-rose-700 border-rose-200',          gradient: 'from-rose-500 to-pink-600',      ring: 'ring-rose-200'    },
};

const PRIORITY = {
  Urgent: { pill: 'bg-rose-100 text-rose-700 border-rose-200',  dot: 'bg-rose-500'   },
  High:   { pill: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  Medium: { pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  Low:    { pill: 'bg-slate-100 text-slate-500 border-slate-200',  dot: 'bg-slate-300'  },
};

/* ─────────────────────────────────────────────────────────────────
   Small reusable pieces
───────────────────────────────────────────────────────────────── */

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

const PriorityPill = ({ priority }) => {
  const cfg = PRIORITY[priority] || PRIORITY.Medium;
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {priority || 'Medium'}
    </span>
  );
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

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */

const IncidentDetails = () => {
  const { id } = useParams();
  const [incident, setIncident]             = useState(null);
  const [comments, setComments]             = useState([]);
  const [newNote, setNewNote]               = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [selectedImage, setSelectedImage]   = useState(null);
  const [editingCommentId, setEditingCId]   = useState(null);
  const [editingText, setEditingText]       = useState('');
  const [replyFocused, setReplyFocused]     = useState(false);

  const currentUserEmail = localStorage.getItem('scos.email') || localStorage.getItem('scos.reportedBy') || '';
  const currentUserRole = localStorage.getItem('scos.role') || '';
  const isCurrentUserAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'Admin';

  useEffect(() => { fetchIncident(); }, [id]);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        setComments(
          Array.isArray(data.remarksHistory)
            ? data.remarksHistory.map((r, i) => ({ id: `${data.id || id}-${i}-${r}`, text: r }))
            : []
        );
      }
    } catch (err) { console.error(err); }
  };

  const handleEditComment = (cid, remarkText) => {
    const remark  = remarkText ?? comments.find(c => c.id === cid)?.text ?? '';
    const message = remark.split(': ').slice(1).join(': ');
    setEditingCId(cid);
    setEditingText(message);
  };

  const patchRemarks = async (updatedComments) => {
    const updatedRemarks = updatedComments.map(c => c.text);
    const res = await fetch(`http://localhost:8080/api/incidents/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ remarksHistory: updatedRemarks }),
    });
    if (!res.ok) throw new Error(res.statusText);
    return updatedRemarks;
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    const note = `[${new Date().toISOString()}] - Student: ${newNote}`;
    const updated = [...comments, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, text: note }];
    try {
      const remarks = await patchRemarks(updated);
      setNewNote('');
      setComments(updated);
      setIncident(c => c ? { ...c, remarksHistory: remarks } : c);
      setReplyFocused(false);
    } catch { alert('Failed to send reply.'); }
    finally { setIsSubmitting(false); }
  };

  const handleSaveEdit = async (cid) => {
    if (!editingText.trim()) { alert('Comment cannot be empty'); return; }
    const updated = comments.map(c => {
      if (c.id !== cid) return c;
      return { ...c, text: `${c.text.split(': ')[0]}: ${editingText}` };
    });
    setIsSubmitting(true);
    try {
      const remarks = await patchRemarks(updated);
      setEditingCId(null); setEditingText('');
      setComments(updated);
      setIncident(c => c ? { ...c, remarksHistory: remarks } : c);
    } catch { alert('Failed to update comment.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm('Delete this comment?')) return;
    const updated = comments.filter(c => c.id !== cid);
    setIsSubmitting(true);
    try {
      const remarks = await patchRemarks(updated);
      setComments(updated);
      setIncident(c => c ? { ...c, remarksHistory: remarks } : c);
    } catch { alert('Failed to delete comment.'); }
    finally { setIsSubmitting(false); }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Close this ticket? Only an admin can reopen it.')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/incidents/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      if (res.ok) fetchIncident();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDownloadPDF = () => {
    if (!incident) return;
    const doc = new jsPDF();
    const ref = getRef(incident);
    const pdfCreatedAt = new Date();
    const pdfCreatedAtStr = pdfCreatedAt.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const primaryColor = [79, 70, 229]; // Indigo-600
    const textColor = [51, 65, 85]; // Slate-700
    const lightGray = [248, 250, 252]; // Slate-50
    const borderColor = [226, 232, 240]; // Slate-200
    
    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // --- Helper to check page break ---
    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        y = 20;
        addHeader(false);
      }
    };

    // --- Header ---
    const addHeader = (isFirstPage = true) => {
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SmartCampus', margin, 16);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Excellence Portal - Incident Report', margin + 45, 16);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Ticket #${ref}`, pageWidth - margin, 16, { align: 'right' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`PDF Created: ${pdfCreatedAtStr}`, pageWidth - margin, 21, { align: 'right' });
      if (!isFirstPage) y = 35;
    };

    addHeader(true);
    y = 35;

    // --- Ticket Title ---
    doc.setTextColor(...primaryColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(incident.title, pageWidth - 2 * margin);
    doc.text(titleLines, margin, y);
    y += (titleLines.length * 7) + 5;

    // --- Metadata Card (using autoTable) ---
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [['Ticket Information', 'Reporter Details']],
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 11 },
      body: [
        [
          `Status: ${incident.status}\nPriority: ${incident.priority || 'Medium'}\nCategory: ${incident.category || '—'}\nResource / Location: ${incident.resource || '—'}\nTicket Created: ${fmtDate(incident)}\nPDF Created: ${pdfCreatedAtStr}\nAssigned: ${incident.assignedTechnicianName || 'Unassigned'}`,
          `Name: ${incident.reportedBy}\nEmail: ${incident.email || '—'}\nPhone: ${incident.contactNumber || '—'}\nFaculty: ${incident.faculty || '—'}\nCampus: ${incident.campus || '—'}`
        ]
      ],
      styles: { fontSize: 10, cellPadding: 5, textColor: textColor, valign: 'top', lineColor: borderColor, lineWidth: 0.1 },
      columnStyles: { 0: { cellWidth: (pageWidth - 2 * margin) / 2 }, 1: { cellWidth: (pageWidth - 2 * margin) / 2 } },
      didDrawPage: (data) => {
          if(data.pageNumber > 1) { y = data.cursor.y + 10; addHeader(false); }
      },
    });

    if (doc.lastAutoTable) {
        y = doc.lastAutoTable.finalY + 15;
    }

    // --- Description ---
    checkPageBreak(40);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Issue Description', margin, y);
    y += 8;

    const descBoxY = y;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let cleanDesc = stripHtmlToText(incident.description);
    const descLines = doc.splitTextToSize(cleanDesc || 'No description provided.', pageWidth - 2 * margin - 10);
    const descHeight = Math.max((descLines.length * 4.5) + 8, 15); // Minimum height

    doc.setFillColor(...lightGray);
    doc.setDrawColor(...borderColor);
    doc.rect(margin, descBoxY, pageWidth - 2 * margin, descHeight, 'FD');
    doc.text(descLines, margin + 5, descBoxY + 7);
    y = descBoxY + descHeight + 15;

    // --- Remarks / Conversation Thread ---
    checkPageBreak(30);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Conversation History', margin, y);
    y += 10;

    if (!incident.remarksHistory || incident.remarksHistory.length === 0) {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No remarks recorded yet.', margin, y);
      y += 10;
    } else {
      incident.remarksHistory.forEach((remark, i) => {
        const isStud = remark.includes('- Student:') || remark.includes('- User:');
        const isAdmin = remark.includes('Admin');
        const isTech  = !isStud && !isAdmin;
        const parts  = remark.split(': ');
        let msg    = parts.slice(1).join(': ');
        if(!msg && parts.length > 0) msg = remark; // fallback
        
        const author = isAdmin ? 'Admin' : (isTech ? 'Technician' : 'User');
        const { dateStr: parsedDate, timeStr: parsedTime } = parseCommentDateTime(remark);
        const dateStr = parsedTime ? `${parsedDate} • ${parsedTime}` : parsedDate;
        const role = isAdmin ? 'Admin' : (isStud ? 'Reporter' : 'Technician');
        
        const bubbleFill = isAdmin ? [254, 243, 224] : isTech ? [238, 242, 255] : [248, 250, 252]; // Amber-50 vs Indigo-50 vs Slate-50
        const bubbleBorder = isAdmin ? [253, 224, 71] : isTech ? [199, 210, 254] : [226, 232, 240]; // Amber-300 vs Indigo-200 vs Slate-200
        const indentX = (isTech || isAdmin) ? margin + 20 : margin;
        const msgWidth = pageWidth - 2 * margin - 20;

        const msgLines = doc.splitTextToSize(msg.trim(), msgWidth - 10);
        const msgHeight = (msgLines.length * 4.5) + 10;

        checkPageBreak(msgHeight + 15);

        // Header line (Author & Date)
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isAdmin ? 180 : isTech ? 79 : 71, isAdmin ? 120 : isTech ? 70 : 85, isAdmin ? 60 : isTech ? 229 : 105); // Amber, Indigo or slate
        doc.text(`${author} (${role})`, indentX, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(dateStr, indentX + msgWidth, y, { align: 'right' });
        y += 4;

        // Bubble
        doc.setFillColor(...bubbleFill);
        doc.setDrawColor(...bubbleBorder);
        doc.roundedRect(indentX, y, msgWidth, msgHeight, 2, 2, 'FD');
        
        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.text(msgLines, indentX + 5, y + 6);
        
        y += msgHeight + 10;
      });
    }

    // --- Footer with Page Numbers ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 285, pageWidth - margin, 285);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('SmartCampus Operations System', margin, 290);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 290, { align: 'right' });
    }

    doc.save(`Ticket_${ref}.pdf`);
  };

  const proofUrls = Array.isArray(incident?.proofUrls) && incident.proofUrls.length > 0
    ? incident.proofUrls
    : incident?.proofImageUrl ? [incident.proofImageUrl] : [];

  /* ── Loading ─────────────────────────────────────────────────── */

  if (!incident) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 text-slate-400"
      >
        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest">Loading Ticket…</p>
      </motion.div>
    </div>
  );

  const statusCfg = STATUS[incident.status] || STATUS.OPEN;

  /* ── Render ──────────────────────────────────────────────────── */

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
            <Link to="/my-incidents" className="hover:text-white transition flex items-center gap-1.5">
              <ArrowLeft size={13} /> My Tickets
            </Link>
            <ChevronRight size={12} />
            <span className="text-white">#{getRef(incident)}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="flex-1 min-w-0">
              {/* Status + Priority chips */}
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

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/25 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                <Download size={14} /> PDF
              </button>
              {incident.status === 'OPEN' && (
                <button
                  onClick={handleCloseTicket} disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 hover:bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
                >
                  <X size={13} /> {isSubmitting ? 'Closing…' : 'Close Ticket'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: Conversation Thread ────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Original Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-lg"
            >
              {/* Card Top Bar */}
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
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={11} /> {fmtDate(incident)}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-6 text-slate-700 text-sm leading-relaxed">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: incident.description }} />
              </div>

              {/* Attachment strip */}
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
                          <a
                            href={url} target="_blank" rel="noreferrer"
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

            {/* ── Comment Thread ───────────────────────────────────── */}
            {comments.length > 0 && (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 hidden sm:block" />

                <div className="space-y-3">
                  <AnimatePresence>
                    {comments.map((comment, idx) => {
                      const remark    = comment.text;
                      const isStudent = remark.includes('- Student:') || remark.includes('- User:');
                      const isAdmin   = remark.includes('Admin');
                      const isTech    = remark.includes('Technician');
                      const isUser    = remark.includes('User') || remark.includes('Student');
                      
                      const isReporter= isUser && (currentUserEmail === incident?.email || currentUserEmail === incident?.reportedBy);
                      const isTechnicianComment = !isUser && !isAdmin;
                      const isCurrentUserCommentAuthor = (isUser && isReporter) || (isTechnicianComment && isCurrentUserAdmin) || (isAdmin && isCurrentUserAdmin);
                      const canEditComment = isCurrentUserCommentAuthor;
                      const canDeleteComment = (isReporter && isUser) || (isCurrentUserAdmin);
                      const parts     = remark.split(': ');
                      const message   = parts.slice(1).join(': ');
                      const author    = isAdmin ? 'Admin' : (isTech ? 'Technician' : (isUser ? 'User' : 'System'));
                      const { dateStr: fDate, timeStr: fTime } = parseCommentDateTime(remark);
                      const role      = isAdmin ? 'Admin' : (isUser ? 'Reporter' : 'Technician');

                      return (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, x: isStudent ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: idx * 0.04 }}
                          className={`relative sm:pl-12 ${isStudent ? '' : ''}`}
                        >
                          {/* Timeline dot */}
                          <div className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm hidden sm:block ${isStudent ? 'bg-blue-400' : isAdmin ? 'bg-amber-500' : 'bg-indigo-500'}`} />

                          <div className={`glass-card bg-white border overflow-hidden ${isStudent ? 'border-slate-100 ml-0 md:ml-6' : isAdmin ? 'border-amber-100 mr-0 md:mr-6' : 'border-indigo-100 mr-0 md:mr-6'} shadow-sm`}>
                            {/* Left accent */}
                            {!isStudent && !isAdmin && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600" />}
                            {isAdmin && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-600" />}

                            {/* Header */}
                            <div className={`flex items-center justify-between px-5 py-3 border-b border-slate-50 ${isStudent ? 'bg-slate-50/50' : isAdmin ? 'bg-amber-50/30' : 'pl-6 bg-indigo-50/30'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${isStudent ? 'bg-blue-100 text-blue-600' : isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {isStudent ? getInit(incident.reportedBy) : isAdmin ? <Shield size={13} /> : <Shield size={13} />}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{author}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {role}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const { dateStr: fDate, timeStr: fTime } = parseCommentDateTime(remark);
                                  return (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      <Clock size={10} />
                                      <span>{fDate}</span>
                                      {fTime && <span className="text-slate-400/60">•</span>}
                                      {fTime && <span>{fTime}</span>}
                                    </div>
                                  );
                                })()}
                                {(canDeleteComment || canEditComment) && editingCommentId !== comment.id && (
                                  <div className="flex items-center gap-0.5">
                                    {canEditComment && (
                                      <button
                                        type="button"
                                        onClick={() => handleEditComment(comment.id, remark)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                        title="Edit comment"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                    )}
                                    {canDeleteComment && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        disabled={isSubmitting}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-40"
                                        title={isCurrentUserAdmin && !isCurrentUserCommentAuthor ? "Delete (Moderation)" : "Delete"}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Body / Edit */}
                            {editingCommentId === comment.id ? (
                              <div className="p-5 bg-indigo-50/20">
                                <textarea
                                  value={editingText}
                                  onChange={e => setEditingText(e.target.value)}
                                  rows={3}
                                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm text-slate-700 resize-none transition-all mb-3"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingCId(null); setEditingText(''); }}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                  >
                                    <X size={12} /> Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(comment.id)}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
                                  >
                                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                    {isSubmitting ? 'Saving…' : 'Save'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={`px-5 py-4 text-sm text-slate-700 leading-relaxed ${!isStudent && !isAdmin ? 'pl-6' : isAdmin ? 'pl-6' : ''}`}>
                                {message}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── Reply Box ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`glass-card bg-white border overflow-hidden shadow-sm transition-all duration-300 ${replyFocused ? 'border-indigo-300 shadow-indigo-100 shadow-md' : 'border-slate-100'}`}
            >
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs">
                  {getInit(incident.reportedBy)}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare size={11} className={replyFocused ? 'text-indigo-500' : ''} />
                  Add a Reply
                </p>
              </div>

              <form onSubmit={handleAddNote} className="p-5">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onFocus={() => setReplyFocused(true)}
                  onBlur={() => !newNote && setReplyFocused(false)}
                  rows={replyFocused ? 5 : 3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none text-sm text-slate-700 resize-none transition-all placeholder:text-slate-400 mb-4"
                  placeholder="Write your reply here…"
                  style={{ transition: 'height 0.2s ease' }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {newNote.length > 0 && `${newNote.length} chars`}
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newNote.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isSubmitting
                      ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
                      : <><Send size={13} /> Send Reply</>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────── */}
          <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">

            {/* Ticket Meta Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass-card bg-white border border-slate-100 overflow-hidden shadow-md"
            >
              {/* Card header strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${statusCfg.gradient}`} />
              <div className="p-5 border-b border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag size={10} /> Ticket Status
                </p>
                <StatusPill status={incident.status} />
              </div>

              <div className="p-5 space-y-0 divide-y divide-slate-50">
                <MetaItem icon={Hash}  label="Reference" value={getRef(incident)} />
                <MetaItem icon={Calendar} label="Reported On" value={fmtDate(incident)} />
                <MetaItem icon={User} label="Assigned Agent">
                  {incident.assignedTechnicianName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                        {incident.assignedTechnicianName.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-slate-800">{incident.assignedTechnicianName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic font-medium">Unassigned</span>
                  )}
                </MetaItem>
              </div>
            </motion.div>

            {/* Properties Card */}
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
              <div className="p-5 space-y-0 divide-y divide-slate-50">
                <MetaItem icon={Zap} label="Priority">
                  <div className="mt-1"><PriorityPill priority={incident.priority} /></div>
                </MetaItem>
                <MetaItem icon={Tag}          label="Category"          value={incident.category} />
                <MetaItem icon={MapPin}       label="Resource"          value={incident.resource} />
                <MetaItem icon={GraduationCap} label="Faculty"          value={incident.faculty} />
                <MetaItem icon={Phone}        label="Contact"           value={incident.contactNumber} />
                <MetaItem icon={Building2}    label="Campus"            value={incident.campus} />
              </div>
            </motion.div>

            {/* Attachments Card */}
            {proofUrls.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-card bg-white border border-slate-100 overflow-hidden shadow-md"
              >
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Paperclip size={10} /> Attachments
                  </p>
                </div>
                <div className="p-5 space-y-2">
                  {proofUrls.map((url, i) => (
                    <div key={i}>
                      {url.startsWith('data:image') ? (
                        <button
                          onClick={() => setSelectedImage(url)}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-indigo-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-700 group-hover:text-indigo-700 truncate">Screenshot_{i + 1}.png</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image</p>
                          </div>
                        </button>
                      ) : (
                        <a
                          href={url} target="_blank" rel="noreferrer"
                          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-rose-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-700 group-hover:text-indigo-700 truncate">Document_{i + 1}.pdf</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PDF Document</p>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Image Lightbox ────────────────────────────────────────── */}
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
                src={selectedImage} alt="Enlarged Proof"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncidentDetails;