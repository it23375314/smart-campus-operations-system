import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Send, CheckCircle, ArrowLeft, Loader2, X, Paperclip, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';

// Import Medium Editor and its default themes
import MediumEditor from 'medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';

export default function CreateIncident() {
  const navigate = useNavigate();

  const editorElementRef = useRef(null);
  const mediumEditorRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [faculty, setFaculty] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactMethod, setContactMethod] = useState('Phone');
  const [subject, setSubject] = useState('');
  const [campus, setCampus] = useState('Malabe Campus');
  const [resource, setResource] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  
  // File Upload State
  const [proofFiles, setProofFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!editorElementRef.current) return;

    mediumEditorRef.current = new MediumEditor(editorElementRef.current, {
      toolbar: false,
      placeholder: {
        text: 'Describe your issue in detail...',
        hideOnClick: false,
      },
    });

    const handleEditableInput = () => {
      const html = editorElementRef.current?.innerHTML ?? '';
      setMessage(html);
      if (messageError) setMessageError('');
    };

    mediumEditorRef.current.subscribe('editableInput', handleEditableInput);

    // Initialize editor with current state
    editorElementRef.current.innerHTML = message || '';

    return () => {
      try {
        mediumEditorRef.current?.destroy();
      } finally {
        mediumEditorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = editorElementRef.current;
    if (!el) return;
    const desired = message || '';
    if ((el.innerHTML ?? '') !== desired) {
      el.innerHTML = desired;
    }
  }, [message]);

  const stripHtmlToText = (v) => {
    if (!v) return '';
    let str = String(v);
    str = str.replace(/<br\s*[\/]?>/gi, '\n');
    str = str.replace(/<[^>]*>/g, '');
    str = str.replace(/[ \t]+/g, ' ');
    return str.trim();
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    setFileError('');
    const newFiles = Array.from(e.target.files);
    
    // Check if exceeding 3 image limit
    if (proofFiles.length + newFiles.length > 3) {
      setFileError('Maximum 3 image attachments allowed. You have ' + proofFiles.length + ' file(s) already.');
      e.target.value = '';
      return;
    }
    
    // Check file types (images only)
    const invalidFile = newFiles.find(file => !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type));
    if (invalidFile) {
      setFileError(`File "${invalidFile.name}" is not a valid image. Only JPG and PNG are allowed.`);
      e.target.value = '';
      return;
    }
    
    const oversizedFile = newFiles.find(file => file.size > 5242880);
    if (oversizedFile) {
      setFileError(`File "${oversizedFile.name}" is too large. Maximum size is 5MB.`);
      e.target.value = '';
      return;
    }
    setProofFiles(prevFiles => [...prevFiles, ...newFiles]);
    e.target.value = ''; 
  };

  const removeFile = (indexToRemove) => {
    setProofFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleReset = () => {
    setName(''); setEmail(''); setFaculty('');
    setContactNumber(''); setSubject(''); setCampus('Malabe Campus'); setResource('');
    setCategory(''); setPriority('Medium'); setMessage('');
    setProofFiles([]); setFileError(''); setSubmitStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) return;
    
    if (faculty === '' || faculty === 'Select') {
        setSubmitStatus({ type: 'error', message: 'Please select your Faculty.' });
        return;
    }

    // Validate preferred contact method detail
    if (contactMethod === 'Email' && !email) {
      setSubmitStatus({ type: 'error', message: 'Please provide your Email as preferred contact method.' });
      return;
    }
    if ((contactMethod === 'Phone' || contactMethod === 'WhatsApp') && !contactNumber) {
      setSubmitStatus({ type: 'error', message: 'Please provide your Contact Number as preferred contact method.' });
      return;
    }

    // Description validation
    const descText = stripHtmlToText(message);
    if (!descText || descText.length < 20) {
      setMessageError('Please provide a detailed description (at least 20 characters).');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const base64Files = await Promise.all(proofFiles.map(readFileAsDataUrl));

      try {
        if (email) localStorage.setItem('scos.email', email);
        if (name) localStorage.setItem('scos.reportedBy', name);
      } catch {
        // ignore storage failures
      }

      const newIncident = {
        reportedBy: name,
        email: email,
        faculty: faculty,
        contactNumber: contactNumber,
        contactMethod: contactMethod,
        contactDetail: contactMethod === 'Email' ? email : contactNumber,
        title: subject,
        campus: campus,
        resource: resource,
        category: category,
        priority: priority,
        description: message,
        status: 'OPEN',
        proofUrls: base64Files,
      };

      const response = await API.post('/incidents', newIncident);
      const createdIncident = response.data;
      if (createdIncident?.id) {
        try {
          const explicitUserKey = String(localStorage.getItem('scos.currentUserKey') || '').trim();
          let inferredUserKey = '';
          if (!explicitUserKey) {
            const rawUser = localStorage.getItem('user');
            const user = rawUser ? JSON.parse(rawUser) : null;
            const keySource = String(user?.id || user?.email || user?.name || '').trim().toLowerCase();
            inferredUserKey = keySource ? `u:${keySource}` : '';
          }

          const userKey = explicitUserKey || inferredUserKey;
          const idsKey = userKey ? `scos.myIncidentIds.${userKey}` : 'scos.myIncidentIds';

          const raw = localStorage.getItem(idsKey);
          const existing = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(existing) ? existing : [];
          if (!next.includes(createdIncident.id)) next.unshift(createdIncident.id);
          localStorage.setItem(idsKey, JSON.stringify(next.slice(0, 200)));
        } catch {
          // ignore storage failures
        }
      }

      setSubmitStatus({ type: 'success', message: '✅ Incident reported successfully! Redirecting...' });
      setTimeout(() => {
        handleReset();
        navigate('/my-incidents'); 
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus({ type: 'error', message: `❌ Error: ${error.message || 'There was an error submitting the incident. Please try again.'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-40 pb-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card bg-white border border-slate-100 overflow-hidden"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4 px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-none mb-1">Report an Issue</h1>
              <p className="text-slate-500 font-medium">Submit a detailed incident report for review by our team.</p>
            </div>
          </div>
          <Link 
            to="/my-incidents" 
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm whitespace-nowrap"
          >
            <ArrowLeft size={15} />
            My Incidents
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Name *</label>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Faculty / School Row */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Faculty / School *</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                value={faculty} onChange={(e) => setFaculty(e.target.value)} required
              >
                <option value="Select">Select Faculty...</option>
                <option value="Faculty of Computing">Faculty of Computing</option>
                <option value="School of Business">School of Business</option>
                <option value="Faculty of Engineering">Faculty of Engineering</option>
                <option value="Faculty of Humanities & Sciences">Faculty of Humanities & Sciences</option>
                <option value="School of Architecture">School of Architecture</option>
                <option value="Faculty of Graduate Studies & Research">Faculty of Graduate Studies & Research</option>
              </select>
            </div>
          </div>

          {/* Contact Number & Campus Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Preferred Contact Method *</label>
              <div className="flex items-center gap-3">
                <select
                  className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
                <input
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  type={contactMethod === 'Email' ? 'email' : 'tel'}
                  value={contactMethod === 'Email' ? email : contactNumber}
                  onChange={(e) => contactMethod === 'Email' ? setEmail(e.target.value) : setContactNumber(e.target.value)}
                  placeholder={contactMethod === 'Email' ? 'Your email address' : contactMethod === 'WhatsApp' ? 'WhatsApp number (with country code)' : 'Contact number'}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Campus / Center *</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                value={campus} onChange={(e) => setCampus(e.target.value)} required
              >
                <option value="Malabe Campus">Malabe Campus</option>
                <option value="Kandy Uni / Kandy Center">Kandy Uni / Kandy Center</option>
                <option value="Nothern Uni">Nothern Uni</option>
                <option value="Matara Center">Matara Center</option>
                <option value="Kurunegala Center">Kurunegala Center</option>
              </select>
            </div>
          </div>

          {/* Resource & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Resource / Location *</label>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                type="text" value={resource} onChange={(e) => setResource(e.target.value)} required
                placeholder="e.g., Lecture Hall 101, Laboratory 3"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category *</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                value={category} onChange={(e) => setCategory(e.target.value)} required
              >
                <option value="">Select Category...</option>
                <option value="Infrastructure">Infrastructure (Damage/Maintenance)</option>
                <option value="Equipment">Equipment (Broken/Malfunctioning)</option>
                <option value="Facility">Facility Issue</option>
                <option value="Safety">Safety Concern</option>
                <option value="Cleanliness">Cleanliness Issue</option>
                <option value="Accessibility">Accessibility Problem</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Priority Level *</label>
            <div className="flex flex-wrap gap-3">
              {['Low', 'Medium', 'High', 'Urgent'].map((level) => {
                const colors = {
                  Low:    { active: 'bg-slate-800 text-white border-slate-800',    inactive: 'bg-white text-slate-500 border-slate-200 hover:border-slate-400' },
                  Medium: { active: 'bg-indigo-600 text-white border-indigo-600',  inactive: 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400' },
                  High:   { active: 'bg-amber-500 text-white border-amber-500',    inactive: 'bg-white text-amber-600 border-amber-200 hover:border-amber-400' },
                  Urgent: { active: 'bg-rose-600 text-white border-rose-600',      inactive: 'bg-white text-rose-600 border-rose-200 hover:border-rose-400' },
                };
                const isActive = priority === level;
                return (
                  <button
                    key={level} type="button"
                    onClick={() => setPriority(level)}
                    className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${isActive ? colors[level].active : colors[level].inactive}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Issue Subject *</label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
              placeholder="Brief title of your issue"
            />
          </div>

          {/* Message Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Detailed Description *</label>
            <div className="border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-slate-50 overflow-hidden">
              <div
                ref={editorElementRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full p-4 outline-none text-sm text-slate-900 min-h-[200px] cursor-text font-medium"
              />
            </div>
            <AnimatePresence>
              {messageError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-3 p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-sm font-medium"
                >
                  {messageError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add Attachment */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Paperclip size={11} /> Evidence / Attachments (Optional — up to 3 images)
            </label>
            <div className="w-full border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50 flex flex-col items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all">
              <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200">
                <input type="file" multiple accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                <Paperclip size={14} /> Choose Images
              </label>
              <span className="text-slate-400 text-xs font-medium">Max 5 MB per image · 3 images total · JPG & PNG only</span>
            </div>
            
            <AnimatePresence>
              {fileError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-sm font-medium"
                >
                  {fileError}
                </motion.div>
              )}
            </AnimatePresence>
            
            {proofFiles.length > 0 && (
              <div className="space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{proofFiles.length}/3 images selected</p>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {proofFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl text-sm text-slate-700 shadow-sm">
                      <span className="truncate max-w-[80%] font-medium text-slate-800">{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)} className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-black text-xs uppercase tracking-widest px-2 transition">
                        <X size={12} /> Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Status Message */}
          <AnimatePresence>
            {submitStatus.message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-2xl flex items-center gap-3 ${
                  submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}
              >
                <CheckCircle size={18} />
                <p className="text-sm font-bold">{submitStatus.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isSubmitting ? 'Submitting…' : 'Submit Incident Report'}
            </button>
            <button
              type="button" onClick={handleReset} disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm disabled:opacity-50"
            >
              <RotateCcw size={13} /> Reset Form
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
