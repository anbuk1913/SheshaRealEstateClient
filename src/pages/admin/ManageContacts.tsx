import { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import api from '../../utils/axios';
import { Trash2, Eye, Search, Mail, User } from 'lucide-react';

export default function ManageContacts() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const limit = 10;

  const load = async () => {
    setLoading(true);
    try {
      const r: any = await api.get('/contacts', { params: { page, limit, search } });
      setItems(r.data?.data ?? []);
      setTotal(r.data?.total ?? 0);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const r: any = await api.get('/contacts/stats');
      setStats(r.data ?? { total: 0, unread: 0 });
    } catch {}
  };

  useEffect(() => {
    load();
    loadStats();
  }, [page, search]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/contacts/${id}/read`);
      load();
      loadStats();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      load();
      loadStats();
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Contact Messages</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
              <span className="text-xs text-gray-600">Total:</span>
              <span className="font-semibold text-blue-600">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg">
              <span className="text-xs text-gray-600">Unread:</span>
              <span className="font-semibold text-amber-600">{stats.unread}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        {/* TABLE — hidden on mobile */}
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Phone</th>
                <th className="px-5 py-3.5 font-medium">Message</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : items.map((item) => (
                    <tr key={item._id} className={`hover:bg-gray-50/50 transition-colors ${!item.isRead ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-5 py-4 font-medium text-gray-800">{item.name}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs break-all">{item.email}</td>
                      <td className="px-5 py-4 text-gray-500">{item.phone || '-'}</td>
                      <td className="px-5 py-4 text-gray-500 line-clamp-2">{item.message}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                            item.isRead
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {!item.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(item._id)}
                              title="Mark as read"
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item._id)}
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No contact messages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CARD LIST — shown on mobile */}
        <div className="sm:hidden space-y-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            : items.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-xl border border-gray-100 p-4 ${
                    !item.isRead ? 'border-amber-200 bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate flex items-center gap-2">
                        <User size={14} className="text-gray-400 flex-shrink-0" />
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 truncate">
                        <Mail size={12} className="flex-shrink-0" />
                        {item.email}
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                        item.isRead
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  {item.phone && (
                    <p className="text-xs text-gray-500 mb-2">Phone: {item.phone}</p>
                  )}
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{item.message}</p>
                  <div className="flex gap-2">
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Eye size={12} /> Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
          {!loading && items.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No contact messages yet.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
