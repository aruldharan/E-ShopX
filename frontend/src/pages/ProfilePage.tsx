import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Package, Store, X } from 'lucide-react';
import { toast } from 'react-toastify';
import type { RootState } from '../redux/store';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [storeForm, setStoreForm] = useState({ storeName: '', storeDescription: '' });

  const { data: orders = [] } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/myorders');
      return data.orders;
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (payload: { storeName: string, storeDescription: string }) => {
      const { data } = await api.put('/users/become-seller', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Welcome to the Seller Dashboard!");
      setTimeout(() => window.location.reload(), 1500); // Reload to fetch fresh auth state
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upgrade account");
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>
      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-6 text-center mb-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-bold text-primary-600">{user?.name[0].toUpperCase()}</span>
            </div>
            <h2 className="font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge bg-primary-100 text-primary-700 mt-2 capitalize">{user?.role}</span>
          </div>
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' ? (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Personal Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: user?.name },
                  { label: 'Email', value: user?.email },
                  { label: 'Account Role', value: user?.role },
                  { label: 'Loyalty Points', value: `${user?.loyaltyPoints || 0} ⭐` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-medium text-gray-800 capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {(user?.role === 'user' || user?.role === 'buyer') && (
                <div className="mt-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Store size={22} /> Become a Seller</h3>
                    <p className="text-indigo-100 text-sm">Start selling your own products and reach thousands of customers instantly.</p>
                  </div>
                  <button 
                    onClick={() => setShowSellerModal(true)}
                    className="bg-white text-indigo-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-colors whitespace-nowrap"
                  >
                    Open Storefront
                  </button>
                </div>
              )}
              {user?.role === 'seller' && (
                <div className="mt-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Store size={22} /> Seller Dashboard</h3>
                    <p className="text-emerald-50 text-sm">Manage your inventory, process orders, and track your revenue.</p>
                  </div>
                  <Link to="/admin" className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-emerald-50 transition-colors whitespace-nowrap">
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="card p-8 text-center text-gray-500">
                  No orders yet. <Link to="/shop" className="text-primary-500 hover:underline">Start shopping</Link>
                </div>
              ) : (
                orders.slice(0, 5).map((order: any) => (
                  <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-mono text-sm font-bold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                      <span className={`badge text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                    </div>
                  </Link>
                ))
              )}
              <Link to="/orders" className="block text-center text-sm text-primary-500 hover:underline">View all orders →</Link>
            </div>
          )}
        </div>
      </div>

      {showSellerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-indigo-600 text-white">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Store size={20} /> Register Your Store</h3>
                <p className="text-indigo-100 text-sm mt-1">Start selling your products directly to customers.</p>
              </div>
              <button onClick={() => setShowSellerModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={e => { e.preventDefault(); upgradeMutation.mutate(storeForm); }} className="p-8 space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Store Name</label>
                <input type="text" placeholder="E.g., Tech Haven" value={storeForm.storeName}
                  onChange={e => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium" required />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Store Description</label>
                <textarea rows={4} placeholder="Tell customers what you sell..." value={storeForm.storeDescription}
                  onChange={e => setStoreForm({ ...storeForm, storeDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium resize-none" required />
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowSellerModal(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={upgradeMutation.isPending} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30">
                  {upgradeMutation.isPending ? 'Verifying...' : 'Launch Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
