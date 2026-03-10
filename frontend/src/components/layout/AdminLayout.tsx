import { Link, Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Tags, Ticket, AlertTriangle, ShieldAlert, MessageSquare } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory Alerts', icon: AlertTriangle },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/logs', label: 'Audit Logs', icon: ShieldAlert },
];

const AdminLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white font-extrabold text-lg">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ShopX Staff</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.filter(item => {
            if (user?.role === 'seller') {
              return ['/admin', '/admin/orders', '/admin/products'].includes(item.to);
            }
            if ((item.to === '/admin/users' || item.to === '/admin/logs') && user?.role !== 'admin') return false;
            return true;
          }).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-base">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all w-full text-base font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-100 px-8 py-5 flex items-center justify-between z-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Portal Console</h1>
            <span className="px-3 py-1 rounded-full badge bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase text-xs tracking-wider font-bold">
              {user?.role}
            </span>
          </div>
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">← Back to Store</Link>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
