import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import api from '../services/api';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  Pending:   { icon: Clock,        color: 'text-yellow-500 bg-yellow-50', label: 'Pending' },
  Processing:{ icon: Package,      color: 'text-blue-500 bg-blue-50',     label: 'Processing' },
  Shipped:   { icon: Truck,        color: 'text-purple-500 bg-purple-50', label: 'Shipped' },
  Delivered: { icon: CheckCircle,  color: 'text-green-500 bg-green-50',   label: 'Delivered' },
  Cancelled: { icon: XCircle,      color: 'text-red-500 bg-red-50',       label: 'Cancelled' },
};

const OrderHistoryPage = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/myorders');
      return data.orders;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Start shopping and your orders will appear here.</p>
          <Link to="/shop" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const cfg = statusConfig[order.status] || statusConfig['Pending'];
            const Icon = cfg.icon;
            return (
              <Link key={order._id} to={`/orders/${order._id}`} className="card p-6 block hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono font-semibold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="font-medium">{order.orderItems.length} item(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.color}`}>
                    <Icon size={14} />
                    {cfg.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
