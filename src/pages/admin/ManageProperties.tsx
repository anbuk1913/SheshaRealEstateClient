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
  id:        string;
  preview:   string;
  file:      File | null;
  existing:  boolean;
  serverUrl: string | null;
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

  const onDragPointerDown = (e: React.PointerEvent) => {
    if (!crop) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y };
  };
  const onDragPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current || !crop) return;
    setCrop(prev => prev ? clampCrop({ ...prev, x: dragStart.current!.cx + (e.clientX - dragStart.current!.mx), y: dragStart.current!.cy + (e.clientY - dragStart.current!.my) }) : prev);
  };
  const onDragPointerUp = () => setDragging(false);

  const onResizePointerDown = (e: React.PointerEvent) => {
    if (!crop) return;
    e.stopPropagation(); e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setResizing(true);
    resizeDragStart.current = { mx: e.clientX, my: e.clientY, cw: crop.w };
  };
  const onResizePointerMove = (e: React.PointerEvent) => {
    if (!resizing || !resizeDragStart.current || !crop) return;
    const newW = resizeDragStart.current.cw + (e.clientX - resizeDragStart.current.mx);
    setCrop(prev => prev ? clampCrop({ ...prev, w: newW, h: newW / CROP_RATIO }) : prev);
  };
  const onResizePointerUp = () => setResizing(false);

  const handleConfirm = () => {
    if (!crop || !imgRef.current) return;
    const img = imgRef.current, b = getImgBounds(); if (!b) return;
    const scaleX = img.naturalWidth / b.w, scaleY = img.naturalHeight / b.h;
    const srcX = (crop.x - b.x) * scaleX, srcY = (crop.y - b.y) * scaleY;
    const srcW = crop.w * scaleX, srcH = crop.h * scaleY;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(srcW); canvas.height = Math.round(srcH);
    canvas.getContext('2d')!.drawImage(img, Math.round(srcX), Math.round(srcY), Math.round(srcW), Math.round(srcH), 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => { if (blob) onDone(blob); }, 'image/jpeg', 0.92);
  };

  return (
    // ── Full-screen on mobile, card on sm+ ──
    <div className="fixed inset-0 bg-black/70 z-[60] flex flex-col items-center justify-center p-0 sm:p-4">
      <div className="bg-white sm:rounded-2xl p-4 shadow-2xl w-full sm:max-w-2xl h-full sm:h-auto flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <span className="font-semibold text-gray-900 text-sm">Crop Image</span>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">16 : 9</span>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={15}/></button>
        </div>
        <div ref={containerRef} className="relative select-none sm:rounded-xl bg-gray-900 overflow-hidden touch-none flex-1 sm:flex-none">
          <img ref={imgRef} src={src} onLoad={initCrop} draggable={false}
            className="block mx-auto max-w-full object-contain" style={{ maxHeight: '55vh' }}/>
          {crop && (
            <>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: 0, left: 0, right: 0, height: crop.y }}/>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y + crop.h, left: 0, right: 0, bottom: 0 }}/>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y, left: 0, width: crop.x, height: crop.h }}/>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y, left: crop.x + crop.w, right: 0, height: crop.h }}/>
              <div
                onPointerDown={onDragPointerDown} onPointerMove={onDragPointerMove} onPointerUp={onDragPointerUp}
                className="absolute border-2 border-white touch-none"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h, cursor: dragging ? 'grabbing' : 'grab' }}
              >
                {[1/3, 2/3].map(f => (
                  <div key={f} className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: `${f*100}%` }}/>
                    <div className="absolute left-0 right-0 border-t border-white/30" style={{ top: `${f*100}%` }}/>
                  </div>
                ))}
                {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
                  <div key={i} className={`absolute w-5 h-5 border-amber-400 ${cls} -m-0.5`}/>
                ))}
                <div
                  onPointerDown={onResizePointerDown} onPointerMove={onResizePointerMove} onPointerUp={onResizePointerUp}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-amber-400 rounded-tl-md cursor-se-resize flex items-center justify-center touch-none"
                  style={{ marginBottom: -2, marginRight: -2 }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 7L7 1M4 7L7 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 mt-4 shrink-0">
          <button onClick={onCancel} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center justify-center gap-1.5">
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

  const [form, setForm]     = useState(emptyForm());
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [cropSrc, setCropSrc]     = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locations,  setLocations]  = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);

  useEffect(() => { if (!token) navigate('/admin'); }, [token, navigate]);

  useEffect(() => {
    api.get('/locations').then((r: any)  => setLocations(r.data?.data  ?? r.data ?? [])).catch(() => {});
    api.get('/categories').then((r: any) => setCategories(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try { const r: any = await api.get('/properties'); setProperties(r.data?.data ?? r.data ?? []); }
    catch { setProperties([]); }
    setLoading(false);
  };

  useEffect(() => { if (token) load(); }, [token]);

  const openCreate = () => { setForm(emptyForm()); setImages([]); setEditTarget(null); setShowForm(true); };

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
    const existing: ImageEntry[] = (p.images ?? []).map((url: string) => ({
      id: url, preview: url.startsWith('http') ? url : `${import.meta.env.VITE_BASE_URL}${url}`,
      file: null, existing: true, serverUrl: url,
    }));
    setImages(existing);
    setEditTarget(p);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
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

  const handleCropDone = (blob: Blob) => {
    if (cropIndex === null) return;
    const croppedFile = new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const preview = URL.createObjectURL(blob);
    setImages(prev => prev.map((img, i) =>
      i === cropIndex ? { ...img, file: croppedFile, preview, existing: false } : img
    ));
    setCropSrc(null); setCropIndex(null);
  };

  const handleRecrop  = (index: number) => { setCropIndex(index); setCropSrc(images[index].preview); };
  const removeImage   = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append('amenities', JSON.stringify(form.amenities.split(',').map(s => s.trim()).filter(Boolean)));
      images.filter(img => !img.existing && img.file).forEach(img => fd.append('images', img.file!));
      fd.append('existingImages', JSON.stringify(images.filter(img => img.existing).map(img => img.serverUrl!)));
      if (editTarget) await api.put(`/properties/${editTarget._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else            await api.post('/properties', fd,               { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false); load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    await api.delete(`/properties/${id}`); load();
  };

  if (!token) return null;

  // Status badge helper
  const statusCls = (s: string) =>
    s === 'available' ? 'bg-green-100 text-green-700' :
    s === 'sold'      ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700';

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Properties</h1>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 sm:gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15}/>
            <span className="hidden xs:inline">Add Property</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

        {/* ── Crop Modal ── */}
        {cropSrc && (
          <CropModal
            src={cropSrc}
            onDone={handleCropDone}
            onCancel={() => { setCropSrc(null); setImages(prev => prev.filter((_, i) => i !== cropIndex)); setCropIndex(null); }}
          />
        )}

        {/* ── Form Modal — bottom sheet on mobile, centered on sm+ ── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-xl flex flex-col max-h-[95vh] sm:max-h-[92vh]">

              {/* Drag handle on mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full"/>
              </div>

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
                <h2 className="font-semibold text-gray-900">{editTarget ? 'Edit Property' : 'New Property'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16}/></button>
              </div>

              {/* Scrollable body */}
              <form onSubmit={handleSave} className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4 sm:space-y-5 flex-1">

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

                {/* Area — single col on mobile, 2-col if more fields are uncommented */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Area (sq ft)</label>
                  <input type="number" value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="0"/>
                </div>

                {/* Location + Category — stack on mobile, side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                    <select value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 bg-white">
                      <option value="">Select location</option>
                      {locations.map(l => <option key={l._id} value={l._id}>{l.city}{l.area ? ` - ${l.area}` : ''}</option>)}
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

                {/* Images — 2 cols on mobile, 3 on sm+ */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">
                    Images <span className="font-normal text-gray-400">(16:9 · up to 10)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {images.map((img, i) => (
                      <div key={img.id} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ aspectRatio: '16/9' }}>
                        <img src={img.preview} alt="" className="w-full h-full object-cover"/>
                        <div className="absolute top-1.5 right-1.5 flex gap-1">
                          <button type="button" onClick={() => handleRecrop(i)}
                            className="bg-white/90 hover:bg-white rounded-lg p-1.5 sm:p-1 shadow-sm">
                            <CropIcon size={11} className="text-gray-700"/>
                          </button>
                          <button type="button" onClick={() => removeImage(i)}
                            className="bg-white/90 hover:bg-white rounded-lg p-1.5 sm:p-1 shadow-sm">
                            <X size={11} className="text-gray-700"/>
                          </button>
                        </div>
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">Cover</span>
                        )}
                      </div>
                    ))}
                    {images.length < 10 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                        style={{ aspectRatio: '16/9' }}>
                        <ImagePlus size={18}/>
                        <span className="text-xs">Add</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                </div>

                {/* Footer buttons — full-width on mobile */}
                <div className="flex gap-2 sm:gap-3 sm:justify-end pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl">
                    {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TABLE: hidden on mobile ── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                      {Array.from({length:4}).map((_,j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full"/></td>)}
                    </tr>
                  ))
                : properties.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800 max-w-xs truncate">{p.title}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusCls(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{p.featured ? '✓' : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
              {!loading && properties.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">No properties yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── CARD LIST: shown on mobile ── */}
        <div className="sm:hidden space-y-3">
          {loading
            ? Array.from({length: 3}).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"/>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-100 rounded-full w-20"/>
                    <div className="h-5 bg-gray-100 rounded-full w-16"/>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <div className="h-7 w-16 bg-gray-100 rounded-lg"/>
                    <div className="h-7 w-16 bg-gray-100 rounded-lg"/>
                  </div>
                </div>
              ))
            : properties.length === 0
              ? <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">No properties yet.</div>
              : properties.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="font-medium text-gray-800 text-sm leading-snug mb-2 line-clamp-2">{p.title}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusCls(p.status)}`}>{p.status}</span>
                      {p.featured && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Featured</span>
                      )}
                      {p.isNewProject && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">New Project</span>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
                      <button onClick={() => openEdit(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 text-xs font-medium transition-colors">
                        <Pencil size={12}/> Edit
                      </button>
                      <button onClick={() => handleDelete(p._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs font-medium transition-colors">
                        <Trash2 size={12}/> Delete
                      </button>
                    </div>
                  </div>
                ))
          }
        </div>

      </div>
    </AdminLayout>
  );
}