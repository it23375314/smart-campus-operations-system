import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Loader2, Image as ImageIcon, X } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const TYPES = ['room', 'lab', 'equipment'];
const CATEGORIES = ['Auditorium', 'Laboratory', 'Equipment', 'Classroom', 'Sports', 'Other'];
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
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/admin/resources')}
        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 hover:text-indigo-600 transition-all group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Asset Matrix
      </button>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden glass-heavy">
        <div className="p-10 border-b border-slate-50">
          <h3 className="text-3xl font-prestige text-slate-900">
            {isEdit ? 'Update Asset.' : 'Register Asset.'}
          </h3>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
            Institutional Infrastructure Registry
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               {error}
            </div>
          )}

          {/* Visualization synchronization */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon size={12} /> Asset Visualization
             </label>
             
             <div className="relative group">
               {previewUrl ? (
                 <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 h-64 bg-slate-50">
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button 
                        type="button"
                        onClick={handleRemovePreview}
                        className="p-3 bg-white rounded-full text-rose-500 shadow-xl hover:scale-110 transition-transform"
                     >
                        <X size={20} />
                     </button>
                   </div>
                 </div>
               ) : (
                 <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group">
                    <Upload size={32} className="text-slate-300 group-hover:text-indigo-400 mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">Sync Graphical Reference</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                 </label>
               )}
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Resource Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:border-indigo-400 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option value="">Select type</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category *</label>
               <select name="category" value={form.category} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                 <option value="">Select category</option>
                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location *</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:border-indigo-400 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:border-indigo-400 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custodian</label>
              <select name="managerId" value={form.managerId || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option value="">No manager assigned</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.username || m.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:border-indigo-400 outline-none transition-all resize-none shadow-inner" />
          </div>

          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-50">
            <button type="button" onClick={() => navigate('/admin/resources')} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 active:scale-95 group">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Processing...' : isEdit ? 'Update Registry' : 'Commit to Registry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;
