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

  // ── Get the rendered image rect RELATIVE to the container ──
  // The img tag is w-full but maxHeight may make it shorter than container.
  // We must clamp only to the actual pixel area the image occupies.
  const getImgBounds = useCallback(() => {
    const img = imgRef.current;
    const con = containerRef.current;
    if (!img || !con) return null;
    const imgRect = img.getBoundingClientRect();
    const conRect = con.getBoundingClientRect();
    return {
      x: imgRect.left - conRect.left,   // offset of image inside container
      y: imgRect.top  - conRect.top,
      w: imgRect.width,
      h: imgRect.height,
    };
  }, []);

  const clampCrop = useCallback((box: CropBox): CropBox => {
    const bounds = getImgBounds();
    if (!bounds) return box;
    let { x, y, w, h } = box;

    // Clamp size to image bounds
    w = Math.max(60, Math.min(w, bounds.w));
    h = w / CROP_RATIO;
    if (h > bounds.h) { h = bounds.h; w = h * CROP_RATIO; }

    // Clamp position so box never leaves the image
    x = Math.max(bounds.x, Math.min(x, bounds.x + bounds.w - w));
    y = Math.max(bounds.y, Math.min(y, bounds.y + bounds.h - h));

    return { x, y, w, h };
  }, [getImgBounds]);

  const initCrop = useCallback(() => {
    const bounds = getImgBounds();
    if (!bounds) return;
    let w = bounds.w * 0.9;
    let h = w / CROP_RATIO;
    if (h > bounds.h) { h = bounds.h * 0.9; w = h * CROP_RATIO; }
    setCrop({
      x: bounds.x + (bounds.w - w) / 2,
      y: bounds.y + (bounds.h - h) / 2,
      w, h,
    });
  }, [getImgBounds]);

  // ── Drag to move ──
  const onMouseDown = (e: React.MouseEvent) => {
    if (!crop) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !dragStart.current || !crop) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setCrop(prev => prev ? clampCrop({ ...prev, x: dragStart.current!.cx + dx, y: dragStart.current!.cy + dy }) : prev);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, crop, clampCrop]);

  // ── Resize handle ──
  const onResizeDown = (e: React.MouseEvent) => {
    if (!crop) return;
    e.stopPropagation(); e.preventDefault();
    setResizing(true);
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
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [resizing, crop, clampCrop]);

  // ── Confirm: export exactly what's selected ──
  const handleConfirm = () => {
    if (!crop || !imgRef.current) return;
    const img    = imgRef.current;
    const bounds = getImgBounds();
    if (!bounds) return;

    // Convert display-pixel crop (relative to container) → natural image pixels
    const scaleX = img.naturalWidth  / bounds.w;
    const scaleY = img.naturalHeight / bounds.h;

    // Crop position relative to the image itself (subtract image offset inside container)
    const srcX = (crop.x - bounds.x) * scaleX;
    const srcY = (crop.y - bounds.y) * scaleY;
    const srcW = crop.w * scaleX;
    const srcH = crop.h * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(srcW);
    canvas.height = Math.round(srcH);
    canvas.getContext('2d')!.drawImage(img, Math.round(srcX), Math.round(srcY), Math.round(srcW), Math.round(srcH), 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => { if (blob) onDone(blob); }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-semibold text-gray-900 text-sm">Crop Image</span>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">16 : 9</span>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100"><X size={15} /></button>
        </div>

        {/* Container - position:relative so getBoundingClientRect offsets are correct */}
        <div ref={containerRef} className="relative select-none rounded-xl bg-gray-900 overflow-hidden">
          <img
            ref={imgRef}
            src={src}
            onLoad={initCrop}
            draggable={false}
            className="block mx-auto"
            style={{ maxHeight: '55vh', maxWidth: '100%' }}
          />

          {crop && (
            <>
              {/* ── 4-piece dark mask - positioned relative to container ── */}
              {/* Top */}
              <div className="absolute pointer-events-none bg-black/55"
                style={{ top: 0, left: 0, right: 0, height: crop.y }} />
              {/* Bottom */}
              <div className="absolute pointer-events-none bg-black/55"
                style={{ top: crop.y + crop.h, left: 0, right: 0, bottom: 0 }} />
              {/* Left */}
              <div className="absolute pointer-events-none bg-black/55"
                style={{ top: crop.y, left: 0, width: crop.x, height: crop.h }} />
              {/* Right */}
              <div className="absolute pointer-events-none bg-black/55"
                style={{ top: crop.y, left: crop.x + crop.w, right: 0, height: crop.h }} />

              {/* ── Crop box ── */}
              <div
                onMouseDown={onMouseDown}
                className="absolute border-2 border-white"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h, cursor: 'move' }}
              >
                {/* Rule-of-thirds */}
                {[1/3, 2/3].map(f => (
                  <div key={f} className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: `${f*100}%` }} />
                    <div className="absolute left-0 right-0 border-t border-white/30" style={{ top: `${f*100}%` }} />
                  </div>
                ))}
                {/* Corner handles */}
                {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
                  <div key={i} className={`absolute w-4 h-4 border-amber-400 ${cls} -m-0.5`} />
                ))}
                {/* Resize grip */}
                <div
                  onMouseDown={onResizeDown}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-amber-400 rounded-tl-md cursor-se-resize flex items-center justify-center"
                  style={{ marginBottom: -2, marginRight: -2 }}
                >
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
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Blogs</h1>
          <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> New Blog
          </button>
        </div>

        {cropSrc && <CropModal src={cropSrc} onDone={handleCropDone} onCancel={() => setCropSrc(null)} />}

        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{editTarget ? 'Edit Blog' : 'New Blog'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
              </div>
              <form onSubmit={handleSave}>
                <label htmlFor="title" className='text-sm text-gray-600 mb-2 font-medium ml-1'>Blog Title</label>
                <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 mb-5" placeholder="Enter Blog Title..." />
                <label htmlFor="excerpt" className='text-sm text-gray-600 mb-2 font-medium ml-1'>Short Excerpt</label>
                <input value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 mb-5" placeholder="Enter short excerpt..." />
                <label htmlFor="content" className='text-sm text-gray-600 mb-2 font-medium ml-1'>Full Blog Content</label>
                <textarea required rows={5} value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 resize-none mb-5" placeholder="Enter full blog content..." />

                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Cover Image <span className="text-gray-400 font-normal">(16:9)</span></p>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={imagePreview} alt="Preview" className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button type="button" onClick={() => setCropSrc(imagePreview)}
                          className="bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors flex items-center gap-1 text-xs text-gray-700 font-medium px-2">
                          <CropIcon size={12}/> Re-crop
                        </button>
                        <button type="button" onClick={resetImage} className="bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors">
                          <X size={13} className="text-gray-700" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                      style={{ aspectRatio: '16/9' }}>
                      <ImagePlus size={22} />
                      <span className="text-xs">Click to upload - will be cropped to 16:9</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({...f, published: e.target.checked}))} className="rounded" />
                  Publish
                </label>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                ? Array.from({length: 4}).map((_,i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({length:4}).map((_,j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full"/></td>)}
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
                      <td className="px-5 py-4 flex justify-end gap-2">
                        <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Pencil size={14}/></button>
                        <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14}/></button>
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
      </div>
    </AdminLayout>
  );
}