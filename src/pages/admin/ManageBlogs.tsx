import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../../utils/axios';
import { AdminLayout } from './Dashboard';
import { Pencil, Trash2, Plus, X, ImagePlus, CropIcon, Check } from 'lucide-react';

interface CropBox { x: number; y: number; w: number; h: number }
const CROP_RATIO = 16 / 9;

// ─── CropModal ────────────────────────────────────────────────────────────────
function CropModal({ src, onDone, onCancel }: { src: string; onDone: (blob: Blob) => void; onCancel: () => void }) {
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
    <div className="fixed inset-0 bg-black/70 z-[60] flex flex-col items-center justify-center p-0 sm:p-4">
      <div className="bg-white sm:rounded-2xl p-4 shadow-2xl w-full sm:max-w-2xl h-full sm:h-auto flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <span className="font-semibold text-gray-900 text-sm">Crop Image</span>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">16 : 9</span>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={15} /></button>
        </div>

        {/* Container wraps tightly around image — no blank space */}
        <div ref={containerRef} className="relative select-none sm:rounded-xl bg-gray-900 overflow-hidden touch-none flex justify-center">
          <img
            ref={imgRef}
            src={src}
            onLoad={initCrop}
            draggable={false}
            className="block max-w-full h-auto"
            style={{ maxHeight: '55vh' }}
          />
          {crop && (
            <>
              <div className="absolute pointer-events-none bg-black/55" style={{ top: 0, left: 0, right: 0, height: crop.y }} />
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y + crop.h, left: 0, right: 0, bottom: 0 }} />
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y, left: 0, width: crop.x, height: crop.h }} />
              <div className="absolute pointer-events-none bg-black/55" style={{ top: crop.y, left: crop.x + crop.w, right: 0, height: crop.h }} />
              <div
                onPointerDown={onDragPointerDown} onPointerMove={onDragPointerMove} onPointerUp={onDragPointerUp}
                className="absolute border-2 border-white touch-none"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h, cursor: dragging ? 'grabbing' : 'grab' }}
              >
                {[1/3, 2/3].map(f => (
                  <div key={f} className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: `${f*100}%` }} />
                    <div className="absolute left-0 right-0 border-t border-white/30" style={{ top: `${f*100}%` }} />
                  </div>
                ))}
                {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
                  <div key={i} className={`absolute w-5 h-5 border-amber-400 ${cls} -m-0.5`} />
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageBlogs() {
  const [blogs, setBlogs]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', published: false });
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc]           = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/blogs/admin/all');
      setBlogs(res.data || []);
    } catch { setBlogs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetImage = () => { setImageFile(null); setImagePreview(null); setCropSrc(null); };

  const openCreate = () => {
    setForm({ title: '', excerpt: '', content: '', published: false });
    setEditTarget(null); resetImage(); setShowForm(true);
  };

  const openEdit = (b: any) => {
    setForm({ title: b.title, excerpt: b.excerpt || '', content: b.content || '', published: b.published });
    setEditTarget(b); resetImage();
    setImagePreview(import.meta.env.VITE_BASE_URL + b.coverImage || null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropDone = (blob: Blob) => {
    setImageFile(new File([blob], 'cover.jpg', { type: 'image/jpeg' }));
    setImagePreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('excerpt', form.excerpt);
    formData.append('content', form.content);
    formData.append('published', String(form.published));
    if (imageFile) formData.append('image', imageFile);

    if (editTarget) await api.put(`/blogs/${editTarget._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    else            await api.post('/blogs', formData,               { headers: { 'Content-Type': 'multipart/form-data' } });

    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog?')) return;
    await api.delete(`/blogs/${id}`);
    load();
  };

  return (
    <AdminLayout>
      {/* ── Responsive page padding ── */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Blogs</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 sm:gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            <span className="hidden xs:inline sm:inline">New Blog</span>
            <span className="xs:hidden sm:hidden">New</span>
          </button>
        </div>

        {cropSrc && <CropModal src={cropSrc} onDone={handleCropDone} onCancel={() => setCropSrc(null)} />}

        {/* ── Form Modal: full-screen on mobile, card on sm+ ── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-5 sm:p-6 shadow-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{editTarget ? 'Edit Blog' : 'New Blog'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
              </div>

              {/* Drag handle hint on mobile */}
              <div className="flex justify-center mb-4 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <form onSubmit={handleSave} className="space-y-1">
                <label className='block text-sm text-gray-600 mb-1.5 font-medium ml-1'>Blog Title</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 mb-4"
                  placeholder="Enter Blog Title..."
                />

                <label className='block text-sm text-gray-600 mb-1.5 font-medium ml-1'>Short Excerpt</label>
                <input
                  value={form.excerpt}
                  onChange={e => setForm(f => ({...f, excerpt: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 mb-4"
                  placeholder="Enter short excerpt..."
                />

                <label className='block text-sm text-gray-600 mb-1.5 font-medium ml-1'>Full Blog Content</label>
                <textarea
                  required
                  rows={5}
                  value={form.content}
                  onChange={e => setForm(f => ({...f, content: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 resize-none mb-4"
                  placeholder="Enter full blog content..."
                />

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    Cover Image <span className="text-gray-400 font-normal">(16:9)</span>
                  </p>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={imagePreview} alt="Preview" className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCropSrc(imagePreview)}
                          className="bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors flex items-center gap-1 text-xs text-gray-700 font-medium px-2"
                        >
                          <CropIcon size={12}/> Re-crop
                        </button>
                        <button
                          type="button"
                          onClick={resetImage}
                          className="bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors"
                        >
                          <X size={13} className="text-gray-700" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <ImagePlus size={22} />
                      <span className="text-xs text-center px-4">Click to upload · cropped to 16:9</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => setForm(f => ({...f, published: e.target.checked}))}
                    className="rounded"
                  />
                  Publish immediately
                </label>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TABLE: hidden on mobile, shown on sm+ ── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                <th className="px-5 py-3.5 font-medium">Title</th>
                <th className="px-5 py-3.5 font-medium">Author</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({length: 4}).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({length: 4}).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full"/></td>
                      ))}
                    </tr>
                  ))
                : blogs.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800 max-w-xs truncate">{b.title}</td>
                      <td className="px-5 py-4 text-gray-500">{b.author}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {b.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
              {!loading && blogs.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">No blogs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── CARD LIST: shown on mobile, hidden on sm+ ── */}
        <div className="sm:hidden space-y-3">
          {loading
            ? Array.from({length: 3}).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"/>
                  <div className="h-3 bg-gray-100 rounded w-1/2"/>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-100 rounded-full w-20"/>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-100 rounded-lg"/>
                      <div className="h-8 w-8 bg-gray-100 rounded-lg"/>
                    </div>
                  </div>
                </div>
              ))
            : blogs.length === 0
              ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
                  No blogs yet.
                </div>
              )
              : blogs.map(b => (
                  <div key={b._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">{b.title}</p>
                        {b.author && (
                          <p className="text-xs text-gray-400 mt-0.5">{b.author}</p>
                        )}
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${b.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {b.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => openEdit(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 text-xs font-medium transition-colors"
                      >
                        <Pencil size={12}/> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs font-medium transition-colors"
                      >
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