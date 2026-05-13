import { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import api from '../../utils/axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const empty = () => ({ name: '' });

export default function ManageCategories() {
  const [items,      setItems]     = useState<any[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [showForm,   setShowForm]  = useState(false);
  const [editTarget, setEditTarget]= useState<any>(null);
  const [form,       setForm]      = useState(empty());
  const [saving,     setSaving]    = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r: any = await api.get('/categories'); setItems(r.data?.data ?? r.data ?? []); }
    catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty()); setEditTarget(null); setShowForm(true); };
  const openEdit   = (c: any) => { setForm({ name: c.name ?? '' }); setEditTarget(c); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) await api.put(`/categories/${editTarget._id}`, form);
      else            await api.post('/categories', form);
      setShowForm(false); load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`); load();
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Categories</h1>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 sm:gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15}/>
            <span className="hidden xs:inline">Add Category</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

        {/* Modal — sheet on mobile, centered dialog on sm+ */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 sm:p-6 shadow-xl">
              {/* Drag handle on mobile */}
              <div className="flex justify-center mb-4 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{editTarget ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16}/></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Category Name</label>
                  <input required value={form.name} onChange={e => setForm({ name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400"
                    placeholder="e.g. Apartment, Villa, Plot" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABLE — hidden on mobile */}
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Slug</th>
                <th className="px-5 py-3.5 font-medium">Created</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({length: 4}).map((_,i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({length: 4}).map((_,j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full"/></td>
                      ))}
                    </tr>
                  ))
                : items.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800">{c.name}</td>
                      <td className="px-5 py-4 text-gray-400 font-mono text-xs">{c.slug}</td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(c._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
              {!loading && items.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CARD LIST — shown on mobile */}
        <div className="sm:hidden space-y-3">
          {loading
            ? Array.from({length: 3}).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/2"/>
                  <div className="h-3 bg-gray-100 rounded w-1/3"/>
                  <div className="flex justify-between items-center pt-1">
                    <div className="h-3 bg-gray-100 rounded w-1/4"/>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-gray-100 rounded-lg"/>
                      <div className="h-8 w-16 bg-gray-100 rounded-lg"/>
                    </div>
                  </div>
                </div>
              ))
            : items.length === 0
              ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
                  No categories yet.
                </div>
              )
              : items.map(c => (
                  <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                    </div>
                    {c.slug && (
                      <p className="text-xs font-mono text-gray-400 mb-1">{c.slug}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                      <button onClick={() => openEdit(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 text-xs font-medium transition-colors">
                        <Pencil size={12}/> Edit
                      </button>
                      <button onClick={() => handleDelete(c._id)}
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