import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { AdminLayout } from './Dashboard';
import api from '../../utils/axios';
import { Pencil, Trash2, Plus, X, ImagePlus, Check, CropIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CropBox { x: number; y: number; w: number; h: number }

interface ImageEntry {
  id:        string;          // local unique id
  preview:   string;          // object URL or existing server URL
  file:      File | null;     // null = existing server image
  existing:  boolean;         // true = already on server
  serverUrl: string | null;   // original server path if existing
}

interface SelectOption { _id: string; name?: string; city?: string; area?: string; }

const CROP_RATIO = 16 / 9;

// ─── CropModal ────────────────────────────────────────────────────────────────
function CropModal({ src, onDone, onCancel }: {
  src: string; onDone: (blob: Blob) => void; onCancel: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const [crop, setCrop]         = useState<CropBox | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart       = useRef<{ mx: number; my: number; cx: number; cy: number } | null>(null);
  const resizeDragStart = useRef<{ mx: number; my: number; cw: number } | null>(null);

  const getImgBounds = useCallback(() => {
    const img = imgRef.current, con = containerRef.current;
    if (!img || !con) return null;
    const i = img.getBoundingClientRect(), c = con.getBoundingClientRect();
    return { x: i.left - c.left, y: i.top - c.top, w: i.width, h: i.height };
  }, []);

  const clampCrop = useCallback((box: CropBox): CropBox => {
    const b = getImgBounds(); if (!b) return box;
    let { x, y, w, h } = box;
    w = Math.max(60, Math.min(w, b.w)); h = w / CROP_RATIO;
    if (h > b.h) { h = b.h; w = h * CROP_RATIO; }
    x = Math.max(b.x, Math.min(x, b.x + b.w - w));
    y = Math.max(b.y, Math.min(y, b.y + b.h - h));
    return { x, y, w, h };
  }, [getImgBounds]);

  const initCrop = useCallback(() => {
    const b = getImgBounds(); if (!b) return;
    let w = b.w * 0.9, h = w / CROP_RATIO;
    if (h > b.h) { h = b.h * 0.9; w = h * CROP_RATIO; }
    setCrop({ x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h });
  }, [getImgBounds]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!crop) return; e.preventDefault(); setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !dragStart.current || !crop) return;
      const dx = e.clientX - dragStart.current.mx, dy = e.clientY - dragStart.current.my;
      setCrop(prev => prev ? clampCrop({ ...prev, x: dragStart.current!.cx + dx, y: dragStart.current!.cy + dy }) : prev);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, crop, clampCrop]);

  const onResizeDown = (e: React.MouseEvent) => {
    if (!crop) return; e.stopPropagation(); e.preventDefault(); setResizing(true);
    resizeDragStart.current = { mx: e.clientX, my: e.clientY, cw: crop.w };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing || !resizeDragStart.current || !crop) return;
      const dx = e.clientX - resizeDragStart.current.mx;
      const newW = resizeDragStart.current.cw + dx;
      setCrop(prev => prev ? clampCrop({ ...prev, w: newW, h: newW / CROP_RATIO }) : prev);
    };
    const onUp = () => setResizing(false);
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [resizing, crop, clampCrop]);

  const handleConfirm = () => {
    if (!crop || !imgRef.current) return;
    const img = imgRef.current, b = getImgBounds(); if (!b) return;
    const scaleX = img.naturalWidth / b.w, scaleY = img.naturalHeight / b.h;
    const srcX = (crop.x - b.x) * scaleX, srcY = (crop.y - b.y) * scaleY;
    const srcW = crop.w * scaleX,          srcH = crop.h * scaleY;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(srcW); canvas.height = Math.round(srcH);
    canvas.getContext('2d')!.drawImage(img, Math.round(srcX), Math.round(srcY), Math.round(srcW), Math.round(srcH), 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => { if (blob) onDone(blob); }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-semibold text-gray-900 text-sm">Crop Image</span>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">16 : 9</span>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100"><X size={15}/></button>
        </div>
        <div ref={containerRef} className="relative select-none rounded-xl bg-gray-900 overflow-hidden">
          <img ref={imgRef} src={src} onLoad={initCrop} draggable={false}
            className="block mx-auto" style={{ maxHeight: '55vh', maxWidth: '100%' }} />
          {crop && (
            <>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: 0, left: 0, right: 0, height: crop.y }}/>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y + crop.h, left: 0, right: 0, bottom: 0 }}/>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y, left: 0, width: crop.x, height: crop.h }}/>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y, left: crop.x + crop.w, right: 0, height: crop.h }}/>
              <div onMouseDown={onMouseDown} className="absolute border-2 border-white"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h, cursor: 'move' }}>
                {[1/3, 2/3].map(f => (
                  <div key={f} className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: `${f*100}%` }}/>
                    <div className="absolute left-0 right-0 border-t border-white/30" style={{ top: `${f*100}%` }}/>
                  </div>
                ))}
                {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls,i) => (
                  <div key={i} className={`absolute w-4 h-4 border-amber-400 ${cls} -m-0.5`}/>
                ))}
                <div onMouseDown={onResizeDown}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-amber-400 rounded-tl-md cursor-se-resize flex items-center justify-center"
                  style={{ marginBottom: -2, marginRight: -2 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 7L7 1M4 7L7 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center gap-1.5">
            <Check size={14}/> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = () => ({
  title: '', description: '', price: '', location: '', category: '',
  status: 'available', bedrooms: '', bathrooms: '', area: '',
  featured: false, isNewProject: false, amenities: '',
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageProperties() {
  const { token } = useSelector((s: RootState) => s.auth);
  const navigate  = useNavigate();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving]         = useState(false);

  const [form, setForm]   = useState(emptyForm());
  const [images, setImages] = useState<ImageEntry[]>([]);   // all images (existing + new)
  const [cropSrc, setCropSrc]   = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null); // which slot is being cropped
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locations,   setLocations]   = useState<SelectOption[]>([]);
  const [categories,  setCategories]  = useState<SelectOption[]>([]);

  useEffect(() => { if (!token) navigate('/admin'); }, [token, navigate]);

  // Load dropdown options
  useEffect(() => {
    api.get('/locations').then((r: any)   => setLocations(r.data?.data  ?? r.data ?? [])).catch(() => {});
    api.get('/categories').then((r: any)  => setCategories(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try { const r: any = await api.get('/properties'); setProperties(r.data?.data ?? r.data ?? []); }
    catch { setProperties([]); }
    setLoading(false);
  };

  useEffect(() => { if (token) load(); }, [token]);

  // ── Open create ──
  const openCreate = () => {
    setForm(emptyForm()); setImages([]); setEditTarget(null); setShowForm(true);
  };

  // ── Open edit ──
  const openEdit = (p: any) => {
    setForm({
      title: p.title ?? '', description: p.description ?? '',
      price: p.price ?? '', location: p.location?._id ?? p.location ?? '',
      category: p.category?._id ?? p.category ?? '',
      status: p.status ?? 'available',
      bedrooms: p.bedrooms ?? '', bathrooms: p.bathrooms ?? '', area: p.area ?? '',
      featured: p.featured ?? false, isNewProject: p.isNewProject ?? false,
      amenities: (p.amenities ?? []).join(', '),
    });
    // Map existing server images into ImageEntry list
    const existing: ImageEntry[] = (p.images ?? []).map((url: string) => ({
      id: url, preview: url.startsWith('http') ? url : `${import.meta.env.VITE_BASE_URL}${url}`,
      file: null, existing: true, serverUrl: url,
    }));
    setImages(existing);
    setEditTarget(p);
    setShowForm(true);
  };

  // ── File picked → open crop ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    // Add a placeholder slot, remember its index
    const newEntry: ImageEntry = {
      id: `pending-${Date.now()}`, preview: URL.createObjectURL(file),
      file, existing: false, serverUrl: null,
    };
    setImages(prev => {
      const next = [...prev, newEntry];
      setCropIndex(next.length - 1);
      setCropSrc(URL.createObjectURL(file));
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Crop done → replace slot with cropped file ──
  const handleCropDone = (blob: Blob) => {
    if (cropIndex === null) return;
    const croppedFile = new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const preview = URL.createObjectURL(blob);
    setImages(prev => prev.map((img, i) =>
      i === cropIndex ? { ...img, file: croppedFile, preview, existing: false } : img
    ));
    setCropSrc(null); setCropIndex(null);
  };

  // ── Re-crop existing slot ──
  const handleRecrop = (index: number) => {
    setCropIndex(index);
    setCropSrc(images[index].preview);
  };

  // ── Remove image slot ──
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append('amenities', JSON.stringify(
        form.amenities.split(',').map(s => s.trim()).filter(Boolean)
      ));

      // New files
      images.filter(img => !img.existing && img.file).forEach(img => fd.append('images', img.file!));

      // Existing server URLs to keep
      const kept = images.filter(img => img.existing).map(img => img.serverUrl!);
      fd.append('existingImages', JSON.stringify(kept));

      if (editTarget) await api.put(`/properties/${editTarget._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else            await api.post('/properties', fd,               { headers: { 'Content-Type': 'multipart/form-data' } });

      setShowForm(false); load();
    } catch { /* toast here if you have one */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    await api.delete(`/properties/${id}`); load();
  };

  if (!token) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15}/> Add Property
          </button>
        </div>

        {/* Crop Modal */}
        {cropSrc && (
          <CropModal src={cropSrc} onDone={handleCropDone} onCancel={() => { setCropSrc(null); setCropIndex(null); setImages(prev => prev.filter((_, i) => i !== cropIndex)); }}/>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[92vh]">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <h2 className="font-semibold text-gray-900">{editTarget ? 'Edit Property' : 'New Property'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
              </div>

              {/* Scrollable body */}
              <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
                  <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="Property title"/>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                  <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 resize-none" placeholder="Description"/>
                </div>

                {/* Price + Area */}
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Price (₹)</label>
                    <input required type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="0"/>
                  </div> */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Area (sq ft)</label>
                    <input type="number" value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="0"/>
                  </div>
                </div>

                {/* Bedrooms + Bathrooms */}
                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Bedrooms</label>
                    <input type="number" value={form.bedrooms} onChange={e => setForm(f => ({...f, bedrooms: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="0"/>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Bathrooms</label>
                    <input type="number" value={form.bathrooms} onChange={e => setForm(f => ({...f, bathrooms: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="0"/>
                  </div>
                </div> */}

                {/* Location + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                    <select value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 bg-white">
                      <option value="">Select location</option>
                      {locations.map(l => <option key={l._id} value={l._id}>{l.city} {l.area ? `- ${l.area}` : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 bg-white">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 bg-white">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} className="rounded"/>
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.isNewProject} onChange={e => setForm(f => ({...f, isNewProject: e.target.checked}))} className="rounded"/>
                    New Project
                  </label>
                </div>

                {/* Images */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">
                    Images <span className="font-normal text-gray-400">(16:9 - up to 10)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div key={img.id} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ aspectRatio: '16/9' }}>
                        <img src={`${img.preview}`} alt="" className="w-full h-full object-cover"/>
                        <div className="absolute top-1.5 right-1.5 flex gap-1">
                          <button type="button" onClick={() => handleRecrop(i)}
                            className="bg-white/90 hover:bg-white rounded-lg p-1 shadow-sm">
                            <CropIcon size={11} className="text-gray-700"/>
                          </button>
                          <button type="button" onClick={() => removeImage(i)}
                            className="bg-white/90 hover:bg-white rounded-lg p-1 shadow-sm">
                            <X size={11} className="text-gray-700"/>
                          </button>
                        </div>
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">Cover</span>
                        )}
                      </div>
                    ))}

                    {/* Add button */}
                    {images.length < 10 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                        style={{ aspectRatio: '16/9' }}>
                        <ImagePlus size={18}/>
                        <span className="text-xs">Add image</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl">
                    {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                <th className="px-5 py-3.5 font-medium">Title</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Featured</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({length:5}).map((_,i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({length:5}).map((_,j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full"/></td>)}
                    </tr>
                  ))
                : properties.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800 max-w-xs truncate">{p.title}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${p.status === 'available' ? 'bg-green-100 text-green-700' : p.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{p.featured ? '✓' : 'X'}</td>
                      <td className="px-5 py-4 flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))
              }
              {!loading && properties.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">No properties yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}