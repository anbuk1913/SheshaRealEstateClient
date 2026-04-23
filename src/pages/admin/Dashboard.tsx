import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { logout, loginAsync } from '../../features/auth/authSlice';
import { Building2, LayoutDashboard, Newspaper, Settings, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/blogs',      label: 'Blogs',      icon: Newspaper },
  { to: '/admin/content',    label: 'Content',    icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-gray-900 text-white flex flex-col transition-all duration-200 shrink-0`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
          {!collapsed && <span className="font-bold text-sm">Shesha Admin</span>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-amber-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-gray-800">
          <button onClick={() => { dispatch(logout()); navigate('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors">
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setCollapsed(c => !c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-semibold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || 'Admin'}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(loginAsync(creds));
    if (loginAsync.fulfilled.match(res)) navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
            <Building2 size={22} className="text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Admin Login</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Shesha Real Estate Solutions</p>
        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input required type="email" value={creds.email}
              onChange={e => setCreds(c => ({...c, email: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400"
              placeholder="admin@sheshaestates.in" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
            <input required type="password" value={creds.password}
              onChange={e => setCreds(c => ({...c, password: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useSelector((s: RootState) => s.auth);
  if (!token) return <LoginForm />;

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back 👋</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your real estate platform from here.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Properties', to: '/admin/properties', icon: Building2,  color: 'bg-amber-50 text-amber-600' },
            { label: 'Blogs',      to: '/admin/blogs',      icon: Newspaper,  color: 'bg-blue-50 text-blue-600' },
            { label: 'Content',    to: '/admin/content',    icon: Settings,   color: 'bg-emerald-50 text-emerald-600' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link key={to} to={to} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-amber-200 hover:shadow-sm transition-all flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">Manage {label.toLowerCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
