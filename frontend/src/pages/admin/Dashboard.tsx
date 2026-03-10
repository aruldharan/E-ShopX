import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Users, Package, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import api from '../../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: analytics, isLoading } = useQuery({ 
    queryKey: ['adminAnalytics', user?.role], 
    queryFn: async () => { 
      const endpoint = user?.role === 'seller' ? '/analytics/seller' : '/analytics/dashboard';
      const { data } = await api.get(endpoint); 
      return data.stats; 
    } 
  });

  const { data: orders = [] } = useQuery({ 
    queryKey: ['adminOrders'], 
    queryFn: async () => { 
      const { data } = await api.get('/orders'); 
      return data.orders; 
    } 
  });

  const stats = [
    { label: 'Total Revenue', value: `₹${(analytics?.overall?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', show: true },
    { label: 'Total Orders', value: analytics?.overall?.totalOrders || 0, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', show: true },
    { label: 'Total Products', value: analytics?.overall?.totalProducts || 0, icon: Package, color: 'bg-purple-50 text-purple-600 border-purple-100', show: true },
    { label: 'Total Users', value: analytics?.overall?.totalUsers || 0, icon: Users, color: 'bg-rose-50 text-rose-600 border-rose-100', show: user?.role === 'admin' },
  ].filter(s => s.show);

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-slate-500 mt-2 text-lg">Here's what's happening in your store today.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-start hover:-translate-y-1 transition-transform">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${color} mb-5 shadow-sm`}>
              <Icon size={26} />
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-wider uppercase">{label}</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Revenue Trend (Last 7 Days)
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenue7Days}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  formatter={(val) => [`₹${val}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <PieIcon size={20} className="text-indigo-500" />
            Category Distribution
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categories}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                  stroke="none"
                  animationDuration={1500}
                >
                  {analytics?.categories?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: '500' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <Package size={20} className="text-amber-500" />
            Order Status
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.orderStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} animationDuration={1500} barSize={40}>
                  {analytics?.orderStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry._id === 'Delivered' ? '#10b981' : entry._id === 'Cancelled' ? '#ef4444' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Order ID</th>
              <th className="text-left py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Date</th>
              <th className="text-left py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Amount</th>
              <th className="text-left py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Status</th>
            </tr></thead>
            <tbody>
              {orders.slice(0, 8).map((order: any) => (
                <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 font-mono font-bold text-indigo-600">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="py-4 text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 font-extrabold text-slate-800">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`badge text-xs font-bold px-3 py-1 scale-90 origin-left ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center text-slate-500 font-medium py-10">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
