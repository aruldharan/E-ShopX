import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../services/api';

const OrderStepper = ({ status }: { status: string }) => {
  if (status === 'Cancelled') {
    return (
      <div className="bg-red-50 rounded-2xl p-6 mb-8 border border-red-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
          <XCircle className="text-red-500" size={24} />
        </div>
        <div>
          <h3 className="text-red-800 font-bold text-lg">Order Cancelled</h3>
          <p className="text-red-600 text-sm">This order has been cancelled and will not be fulfilled.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { title: 'Pending', icon: Clock },
    { title: 'Processing', icon: Package },
    { title: 'Shipped', icon: Truck },
    { title: 'Delivered', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.title === status);
  const progressWidth = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl p-6 sm:px-10 mb-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="relative flex justify-between z-10 w-full max-w-2xl mx-auto">
        {/* Progress Line */}
        <div className="absolute top-5 sm:top-6 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.title} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-sm
                ${isActive ? 'bg-primary-500 text-white scale-110' : 'bg-gray-100 text-gray-400'}
                ${isCurrent ? 'ring-4 ring-primary-100' : ''}
              `}>
                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-50'} />
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.order;
    },
  });

  if (isLoading) return <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} className="mr-1" /> Back to Orders
      </Link>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Order <span className="font-mono">#{id?.slice(-8).toUpperCase()}</span>
        </h1>
        <span className={`badge text-sm px-3 py-1.5 ${
          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>{order.status}</span>
      </div>

      <OrderStepper status={order.status} />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item: any) => (
                <div key={item.product} className="flex items-center gap-4">
                  <img src={item.image || `https://placehold.co/80x80/f97316/white?text=${item.name[0]}`}
                    alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <Link to={`/product/${item.product}`} className="font-medium text-gray-800 hover:text-primary-500 line-clamp-1">{item.name}</Link>
                    <p className="text-sm text-gray-500">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <span className="font-semibold">₹{(item.qty * item.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Shipping Address</h2>
            <p className="text-gray-600">{order.shippingAddress.address}</p>
            <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p className="text-gray-600">{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Payment Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span>{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={order.isPaid ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              <hr className="border-gray-100 my-2" />
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.itemsPrice.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>₹{order.shippingPrice.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>₹{order.taxPrice.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-lg">₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
