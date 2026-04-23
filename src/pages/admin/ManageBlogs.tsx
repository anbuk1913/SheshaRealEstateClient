import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

export default function ManageBlogs() {
  const [blogs, setBlogs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', published: false });

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/blogs/admin/all');
      setBlogs(res.data || []);
    } catch { setBlogs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ title: '', excerpt: '', content: '', published: false }); setEditTarget(null); setShowForm(true); };
  const openEdit   = (b: any) => { setForm({ title: b.title, excerpt: b.excerpt || '', content: b.content || '', published: b.published }); setEditTarget(b); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) await api.put(`/blogs/${editTarget._id}`, form);
    else            await api.post('/blogs', form);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog?')) return;
    await api.delete(`/blogs/${id}`);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Blogs</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus size={15} /> New Blog
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{editTarget ? 'Edit Blog' : 'New Blog'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="Blog Title" />
              <input value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="Short excerpt" />
              <textarea required rows={5} value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 resize-none" placeholder="Full blog content..." />
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({...f, published: e.target.checked}))} className="rounded" />
                Publish immediately
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
                    {Array.from({length:4}).map((_,j) => (
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
  );
}
