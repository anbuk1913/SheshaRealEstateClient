import { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import api from '../../utils/axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const empty = () => ({ city: '', area: '', state: '', country: 'India' });

export default function ManageLocations() {
  const [items,     setItems]     = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editTarget,setEditTarget]= useState<any>(null);
  const [form,      setForm]      = useState(empty());
  const [saving,    setSaving]    = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r: any = await api.get('/locations'); setItems(r.data?.data ?? r.data ?? []); }
    catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty()); setEditTarget(null); setShowForm(true); };
  const openEdit   = (l: any) => {
    setForm({ city: l.city ?? '', area: l.area ?? '', state: l.state ?? '', country: l.country ?? 'India' });
    setEditTarget(l); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) await api.put(`/locations/${editTarget._id}`, form);
      else            await api.post('/locations', form);
      setShowForm(false); load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    await api.delete(`/locations/${id}`); load();
  };

  const field = (key: keyof typeof form, label: string, placeholder = '') => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <input value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400"
        placeholder={placeholder} />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15}/> Add Location
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{editTarget ? 'Edit Location' : 'New Location'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                {field('city',    'City *',    'Chennai')}
                {field('area',    'Area',      'Anna Nagar')}
                {field('state',   'State',     'Tamil Nadu')}
                {field('country', 'Country',   'India')}
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl">
                    {saving ? 'Saving…' : 'Save'}
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
                <th className="px-5 py-3.5 font-medium">City</th>
                <th className="px-5 py-3.5 font-medium">Area</th>
                <th className="px-5 py-3.5 font-medium">State</th>
                <th className="px-5 py-3.5 font-medium">Country</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({length: 4}).map((_,i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({length: 5}).map((_,j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full"/></td>
                      ))}
                    </tr>
                  ))
                : items.map(l => (
                    <tr key={l._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800">{l.city}</td>
                      <td className="px-5 py-4 text-gray-500">{l.area || '-'}</td>
                      <td className="px-5 py-4 text-gray-500">{l.state || '-'}</td>
                      <td className="px-5 py-4 text-gray-500">{l.country}</td>
                      <td className="px-5 py-4 flex justify-end gap-2">
                        <button onClick={() => openEdit(l)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Pencil size={14}/></button>
                        <button onClick={() => handleDelete(l._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))
              }
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">No locations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}