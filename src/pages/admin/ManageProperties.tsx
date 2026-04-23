import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { AdminLayout } from './Dashboard';
import api from '../../utils/axios';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function ManageProperties() {
  const { token } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!token) navigate('/admin'); }, [token, navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/properties');
      setProperties(res.data || []);
    } catch { setProperties([]); }
    setLoading(false);
  };

  useEffect(() => { if (token) load(); }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    await api.delete(`/properties/${id}`);
    load();
  };

  if (!token) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> Add Property
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                <th className="px-5 py-3.5 font-medium">Title</th>
                <th className="px-5 py-3.5 font-medium">Price</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Featured</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({length:5}).map((_,i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({length:5}).map((_,j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-full"/></td>
                      ))}
                    </tr>
                  ))
                : properties.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800 max-w-xs truncate">{p.title}</td>
                      <td className="px-5 py-4 text-gray-600">₹{p.price?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{p.featured ? '✓' : '—'}</td>
                      <td className="px-5 py-4 flex justify-end gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"><Pencil size={14}/></button>
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