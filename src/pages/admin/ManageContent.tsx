import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { Pencil, Save } from 'lucide-react';

export default function ManageContent() {
  const [blocks, setBlocks]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/content');
      setBlocks(res.data || []);
    } catch { setBlocks([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (b: any) => {
    setEditing(b.key);
    setFormData({ title: b.title || '', subtitle: b.subtitle || '', body: b.body || '', cta: b.cta || '', image: b.image || '' });
  };

  const handleSave = async (key: string) => {
    await api.put(`/content/${key}`, formData);
    setEditing(null);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Page Content</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 4}).map((_,i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-32 mb-2"/>
              <div className="h-4 bg-gray-100 rounded w-2/3"/>
            </div>
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <p>No content blocks found. Seed some content via API first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map(b => (
            <div key={b.key} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full mb-1">{b.page}</span>
                  <h3 className="font-semibold text-gray-900 text-sm capitalize">{b.key.replace(/_/g, ' ')}</h3>
                </div>
                {editing !== b.key && (
                  <button onClick={() => handleEdit(b)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                )}
              </div>

              {editing === b.key ? (
                <div className="space-y-3">
                  {['title','subtitle','body','cta','image'].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-400 mb-1 capitalize">{field}</label>
                      {field === 'body' ? (
                        <textarea rows={3} value={formData[field]} onChange={e => setFormData((f: any) => ({...f, [field]: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none" />
                      ) : (
                        <input value={formData[field]} onChange={e => setFormData((f: any) => ({...f, [field]: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400" />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <button onClick={() => handleSave(b.key)} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-medium">
                      <Save size={12} /> Save
                    </button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 space-y-1">
                  {b.title    && <p><span className="text-gray-400 text-xs">Title:</span> {b.title}</p>}
                  {b.subtitle && <p><span className="text-gray-400 text-xs">Subtitle:</span> {b.subtitle}</p>}
                  {b.body     && <p className="line-clamp-2"><span className="text-gray-400 text-xs">Body:</span> {b.body}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
