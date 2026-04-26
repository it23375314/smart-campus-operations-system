import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Loader2, Image as ImageIcon, X } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const TYPES = ['ROOM', 'HALL', 'PROJECTOR', 'CAMERA', 'INDOOR', 'OUTDOOR'];
const CATEGORIES = ['Auditorium', 'Laboratory', 'Classroom', 'Sports', 'Equipment'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const STATUS_OPTIONS = ['ACTIVE', 'OUT_OF_SERVICE'];

const initialForm = {
  name: '',
  type: '',
  category: '',
  location: '',
  description: '',
  capacity: 1,
  imageUrl: '',
  availableDays: [],
  availableTimes: { start: '08:00', end: '18:00' },
  status: 'ACTIVE',
};

const ResourceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Image Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await API.get('/users/managers');
        setManagers(res.data);
      } catch (err) {
        console.error('Failed to fetch managers:', err);
      }
    };
    fetchManagers();

    if (!isEdit) return;
    const fetchResource = async () => {
      try {
        const res = await API.get(`/resources/${id}`);
        setForm({
          ...initialForm,
          ...res.data,
          availableDays: res.data.availableDays || [],
          availableTimes: res.data.availableTimes || { start: '08:00', end: '18:00' },
        });
        if (res.data.imageUrl) setPreviewUrl(res.data.imageUrl);
      } catch {
        setError('Failed to load resource. It may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'managerId') {
      const selectedManager = managers.find(m => m.id === value);
      setForm(prev => ({ 
        ...prev, 
        managerId: value, 
        managerName: selectedManager ? (selectedManager.name || selectedManager.username) : '' 
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(form.imageUrl || '');
  };

  const uploadImage = async () => {
    if (!selectedFile) return form.imageUrl;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const res = await API.post('/resources/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.imageUrl;
    } catch (err) {
      console.error("Image upload protocol failure:", err);
      throw new Error("Failed to synchronize asset imagery with the local registry.");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      // 1. Interrogate and Synchronize Visualization
      let synchronizedImageUrl = form.imageUrl;
      if (selectedFile) {
        synchronizedImageUrl = await uploadImage();
      }

      // 2. Commit Resource Data
      const payload = { 
        ...form, 
        capacity: Number(form.capacity),
        imageUrl: synchronizedImageUrl
      };

      if (isEdit) {
        await API.put(`/resources/${id}`, payload);
        toast.success("Asset registry updated successfully.");
      } else {
        await API.post('/resources', payload);
        toast.success("New asset registered successfully.");
      }
      navigate('/admin/resources');
    } catch (err) {
      setError(err.message || 'An error occurred. Please check the form and try again.');
      toast.error(err.message || "Registry submission failure.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Loading Asset Data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Sticky Action Header */}
      <div className="sticky top-24 z-[30] bg-slate-50/80 backdrop-blur-md py-6 mb-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <button
            onClick={() => navigate('/admin/resources')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 hover:text-indigo-600 transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Asset Matrix
          </button>
          <h2 className="text-4xl font-prestige text-slate-900">
            {isEdit ? 'Asset Synchronization.' : 'New Resource Protocol.'}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/resources')} 
            className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            Discard
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving} 
            className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-900/10 disabled:opacity-50 active:scale-95 group"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Processing...' : isEdit ? 'Update Registry' : 'Commit to Registry'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Form Body */}
        <div className="lg:col-span-2 space-y-8">
          {error && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-sm font-bold text-rose-600 flex items-start gap-4 shadow-sm animate-shake">
               <AlertCircle size={20} className="flex-shrink-0" />
               <div>
                 <p className="font-black uppercase tracking-widest text-[10px] mb-1">Registry Exception Detected</p>
                 {error}
               </div>
            </div>
          )}

          {/* Section: Core Identity */}
          <section className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-10 space-y-8">
            <div className="border-b border-slate-50 pb-6 mb-6">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Save size={16} />
                </div>
                Core Identity
              </h4>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Nomenclature *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Grand Auditorium A1"
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-400 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  rows={5} 
                  placeholder="Provide a formal description of the facility's purpose and capabilities..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-400 outline-none transition-all resize-none shadow-inner" 
                />
              </div>
            </div>
          </section>

          {/* Section: Categorization & Location */}
          <section className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-10 space-y-8">
            <div className="border-b border-slate-50 pb-6 mb-6">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                Classification & Spatial
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white outline-none appearance-none cursor-pointer shadow-inner">
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spatial Identity (Location) *</label>
                <input 
                  type="text" 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange} 
                  placeholder="e.g. North Campus, Bldg 4"
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-400 outline-none transition-all shadow-inner" 
                />
              </div>
            </div>
          </section>

          {/* Section: Operational Capacity */}
          <section className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-10 space-y-8">
            <div className="border-b border-slate-50 pb-6 mb-6">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Save size={16} />
                </div>
                Operational Thresholds
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Type *</label>
                <select name="type" value={form.type} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white outline-none appearance-none cursor-pointer shadow-inner">
                  <option value="">Select Type</option>
                  {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maximum Capacity (Persons)</label>
                <input 
                  type="number" 
                  name="capacity" 
                  value={form.capacity} 
                  onChange={handleChange} 
                  min="1" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-400 outline-none transition-all shadow-inner" 
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          {/* Status & Custodian Card */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-white/10 pb-4">Lifecycle Control</h4>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Resource Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, status: s }))}
                      className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between ${
                        form.status === s 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {s.replace('_', ' ')}
                      {form.status === s && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Asset Custodian (Steward)</label>
                <select 
                  name="managerId" 
                  value={form.managerId || ''} 
                  onChange={handleChange} 
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all shadow-inner"
                >
                  <option value="" className="text-slate-900">Unassigned</option>
                  {managers.map(m => <option key={m.id} value={m.id} className="text-slate-900">{m.username || m.name}</option>)}
                </select>
                <p className="text-[9px] text-slate-500 italic mt-2 px-1">Assigns final authority for booking approvals.</p>
              </div>
            </div>
          </div>

          {/* Visualization synchronization */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-8 space-y-6">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Graphical Reference</h4>
             
             <div className="relative group">
               {previewUrl ? (
                 <div className="relative rounded-3xl overflow-hidden border border-slate-100 aspect-square bg-slate-50">
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button 
                        type="button"
                        onClick={handleRemovePreview}
                        className="p-4 bg-white rounded-full text-rose-500 shadow-2xl hover:scale-110 transition-transform active:scale-95"
                     >
                        <X size={20} />
                     </button>
                   </div>
                 </div>
               ) : (
                 <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer group shadow-inner">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-400 mb-4 transition-colors">
                      <Upload size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Sync Reference</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                 </label>
               )}
             </div>
             <p className="text-[9px] text-slate-400 text-center leading-relaxed">
               Imagery should reflect institutional standards and clearly identify spatial boundaries.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceForm;
