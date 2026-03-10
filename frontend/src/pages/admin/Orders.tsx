import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Search, Trash2, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const AdminOrders = () => {
  const { user: currentUser } = useSelector((state: any) => state.auth);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminOrders', currentUser?.role],
    queryFn: async () => {
      const endpoint = currentUser?.role === 'seller' ? '/orders/seller' : '/orders';
      const { data } = await api.get(endpoint);
      return data.orders;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this order?')) {
      deleteOrderMutation.mutate(id);
    }
  };

  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
            h1 { margin: 0; color: #4f46e5; }
            table { w-full; border-collapse: collapse; margin-top: 30px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
            th { text-transform: uppercase; font-size: 12px; color: #666; }
            .total-row { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header flex-between">
            <div>
              <h1>ShopX Invoice</h1>
              <p>Order ID: ${order._id}</p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <strong>Billed To:</strong><br/>
              ${order.user?.name || 'Guest User'}<br/>
              ${order.user?.email || 'N/A'}<br/>
              ${order.shippingAddress?.address || ''}<br/>
              ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}
            </div>
          </div>
          
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.orderItems || []).map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>Rs. ${item.price.toLocaleString()}</td>
                  <td>Rs. ${(item.price * item.qty).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding-top: 30px;">Grand Total:</td>
                <td style="padding-top: 30px; color: #4f46e5;">Rs. ${order.totalPrice.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 50px; font-size: 12px; color: #888; text-align: center;">
            <p>Thank you for shopping with ShopX.</p>
            <p>Payment Status: <strong>${order.isPaid ? 'PAID' : 'PENDING'}</strong></p>
          </div>
          
          <script>
            window.onload = () => { window.print(); window.onafterprint = () => window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter((order: any) => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canDelete = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orders Center</h2>
          <p className="text-slate-500 mt-1">Process shipments and track customer orders.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-slate-400 font-medium">Loading orders...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Order ID or Customer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package size={14} className="text-slate-500" />
                        </div>
                        <span className="font-mono font-bold text-slate-800 tracking-tight">#{order._id.slice(-8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{order.user?.name || 'Guest User'}</div>
                      <div className="text-xs text-slate-400">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-black text-slate-900">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        order.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-bold border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors cursor-pointer ${statusColors[order.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handlePrintInvoice(order)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Print Invoice"
                        >
                          <Printer size={16} />
                        </button>
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(order._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={24} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching orders</h3>
                <p className="text-slate-500 mt-1 text-sm">Try adjusting your search query.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
