import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Ticket, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const AdminCoupons = () => {
  const { user: currentUser } = useSelector((state: any) => state.auth);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [form, setForm] = useState({ code: '', discount: '', expiryDate: '', minOrderValue: '', isActive: true });
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const { data } = await api.get('/coupons');
      return data.coupons;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/coupons', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Coupon created!');
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create coupon'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => api.put(`/coupons/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Coupon updated!');
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Coupon deleted!');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete coupon'),
  });

  const openCreate = () => { setEditCoupon(null); setForm({ code: '', discount: '', expiryDate: '', minOrderValue: '', isActive: true }); setShowModal(true); };
  
  const openEdit = (coupon: any) => { 
    setEditCoupon(coupon); 
    const expiry = coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '';
    setForm({ 
      code: coupon.code, 
      discount: coupon.discount.toString(), 
      expiryDate: expiry, 
      minOrderValue: coupon.minOrderValue.toString(), 
      isActive: coupon.isActive 
    }); 
    setShowModal(true); 
  };
  
  const closeModal = () => { setShowModal(false); setEditCoupon(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...form, 
      discount: Number(form.discount), 
      minOrderValue: Number(form.minOrderValue) 
    };
    if (editCoupon) updateMutation.mutate({ id: editCoupon._id, payload });
    else createMutation.mutate(payload);
  };

  const filteredCoupons = coupons.filter((c: any) => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Coupons & Promotions</h2>
          <p className="text-slate-500 mt-1">Manage discount codes and promotional campaigns.</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95">
            <Plus size={20} /> Create Coupon
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-slate-400 font-medium">Loading coupons...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by coupon code..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['Code', 'Discount', 'Min Order', 'Expires', 'Status', canEdit ? 'Actions' : ''].filter(Boolean).map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCoupons.map((coupon: any) => (
                  <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                          <Ticket size={16} />
                        </div>
                        <span className="font-mono font-bold text-slate-900 tracking-tight text-base">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-rose-600 text-lg">{coupon.discount}% <span className="text-xs text-slate-400 font-medium">OFF</span></td>
                    <td className="px-6 py-4 font-bold text-slate-700">₹{coupon.minOrderValue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {new Date(coupon.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        coupon.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(coupon)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => { if(window.confirm('Delete coupon?')) deleteMutation.mutate(coupon._id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCoupons.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket size={24} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching coupons</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-primary-600 text-white">
              <div>
                <h3 className="text-2xl font-bold">{editCoupon ? 'Edit Coupon' : 'New Coupon'}</h3>
                <p className="text-primary-100 text-sm mt-1">{editCoupon ? 'Modify promotional rules.' : 'Create a new discount code.'}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Coupon Code</label>
                  <input type="text" placeholder="e.g. SUMMER25" value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all font-mono font-bold text-slate-700 tracking-wider" required />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Discount (%)</label>
                  <input type="number" placeholder="20" min="1" max="100" value={form.discount}
                    onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700" required />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Min. Order (₹)</label>
                  <input type="number" placeholder="500" min="0" value={form.minOrderValue}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700" required />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Expiry Date</label>
                  <input type="date" value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700" required />
                </div>

                <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl mt-2">
                  <div>
                    <h4 className="font-bold text-slate-800">Coupon Status</h4>
                    <p className="text-sm text-slate-500">Enable or disable this code.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-500/25 active:scale-95">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
