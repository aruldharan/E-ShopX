import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CreditCard, Smartphone, Banknote, Tag, ArrowRight, Gift } from 'lucide-react';
import type { RootState } from '../redux/store';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../services/api';
import RazorpayButton from '../components/ui/RazorpayButton';

const paymentMethods = [
  { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
  { id: 'UPI', label: 'UPI Payment', icon: Smartphone },
  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name: '', street: '', city: '', state: '', postalCode: '', country: 'India', phone: ''
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const discountAmount = Math.round((subtotal * couponDiscount) / 100);
  const pointsDiscountAmount = usePoints ? Math.min(user?.loyaltyPoints || 0, subtotal - discountAmount) : 0;
  const total = subtotal + shipping + tax - discountAmount - pointsDiscountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post('/coupons/verify', { code: couponCode, orderValue: subtotal });
      setCouponDiscount(data.discount);
      toast.success(`Coupon applied! ${data.discount}% off`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async () => {
    const requiredFields = ['name', 'street', 'city', 'state', 'postalCode', 'phone'];
    if (requiredFields.some((k) => !address[k as keyof typeof address])) {
      toast.error('Please fill all address fields');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image,
        price: item.price,
        product: item.product,
      }));

      const { data } = await api.post('/orders', {
        orderItems,
        shippingAddress: { address: `${address.name}, ${address.street}`, city: address.city, postalCode: address.postalCode, country: address.country },
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
        pointsUsed: pointsDiscountAmount,
      });

      dispatch(clearCart());
      navigate(`/order-success/${data.order._id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpaySuccess = async (razorpayPaymentId: string) => {
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        name: item.name, qty: item.quantity, image: item.image, price: item.price, product: item.product,
      }));
      const { data } = await api.post('/orders', {
        orderItems,
        shippingAddress: { address: `${address.name}, ${address.street}`, city: address.city, postalCode: address.postalCode, country: address.country },
        paymentMethod: 'Razorpay',
        paymentResult: { id: razorpayPaymentId, status: 'COMPLETED', update_time: new Date().toISOString() },
        itemsPrice: subtotal, taxPrice: tax, shippingPrice: shipping, totalPrice: total, pointsUsed: pointsDiscountAmount,
      });
      dispatch(clearCart());
      navigate(`/order-success/${data.order._id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-10 tracking-tight text-center">Secure Checkout</h1>

      {/* Steps */}
      <div className="flex items-center justify-center mb-12 w-full max-w-lg mx-auto">
        {['address', 'payment'].map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
              step === s ? 'bg-primary-500 text-white ring-4 ring-indigo-50 scale-110' : 'bg-slate-100 text-slate-400'
            }`}>
              {i + 1}
            </div>
            <span className={`ml-3 text-sm font-bold uppercase tracking-wider transition-colors ${step === s ? 'text-primary-600' : 'text-slate-400'}`}>{s}</span>
            {i === 0 && <div className="mx-4 h-[2px] flex-1 bg-slate-200 rounded-full" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          {step === 'address' ? (
            <div className="card p-8 lg:p-10 border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe', col: 2 },
                  { label: 'Street Address', key: 'street', type: 'text', placeholder: '123 Main St', col: 2 },
                  { label: 'City', key: 'city', type: 'text', placeholder: 'Mumbai', col: 1 },
                  { label: 'State', key: 'state', type: 'text', placeholder: 'Maharashtra', col: 1 },
                  { label: 'Postal Code', key: 'postalCode', type: 'text', placeholder: '400001', col: 1 },
                  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 9999999999', col: 1 },
                ].map(({ label, key, type, placeholder, col }) => (
                  <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={address[key as keyof typeof address]}
                      onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                      className="input-field bg-slate-50/50"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setStep('payment')} className="btn-primary px-8 py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-base">
                  Continue to Payment <ArrowRight size={18} className="ml-2 inline" />
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-8 lg:p-10 border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Payment Details</h2>
              <div className="space-y-4 mb-8">
                {paymentMethods.map(({ id, label, icon: Icon }) => (
                  <label
                    key={id}
                    className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === id ? 'border-primary-500 bg-indigo-50/30 shadow-sm transform scale-[1.01]' : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={paymentMethod === id}
                      onChange={() => setPaymentMethod(id)}
                      className="accent-primary-500 w-5 h-5"
                    />
                    <div className={`p-2 rounded-full ${paymentMethod === id ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`font-semibold ${paymentMethod === id ? 'text-primary-700' : 'text-slate-700'}`}>{label}</span>
                    {id === 'COD' && <span className="ml-auto text-xs font-bold badge bg-emerald-100 text-emerald-700 px-3 py-1">No Extra Fee</span>}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="input-field bg-white border-slate-200 shadow-sm"
                />
                <button onClick={applyCoupon} className="btn-outline border-slate-300 text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap px-6 rounded-xl font-bold">
                  <Tag size={16} /> Apply
                </button>
              </div>

              {(user?.loyaltyPoints || 0) > 0 && (
                <div className="flex items-center justify-between mb-10 p-4 border border-amber-200 bg-amber-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full text-amber-500"><Gift size={20} /></div>
                    <div>
                      <p className="font-bold text-amber-800">Use Loyalty Points</p>
                      <p className="text-sm text-amber-600">You have {user?.loyaltyPoints || 0} points available. 1 Point = ₹1</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={() => setUsePoints(!usePoints)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button onClick={() => setStep('address')} className="btn-outline px-8 py-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors">Back</button>
                {(paymentMethod === 'Card' || paymentMethod === 'UPI') ? (
                  <RazorpayButton
                    amount={total}
                    onSuccess={handleRazorpaySuccess}
                    disabled={loading}
                  />
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary flex-1 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : `Confirm COD Order — ₹${total.toLocaleString()}`}
                    {!loading && <ArrowRight size={20} />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="card p-6 md:p-8 h-fit sticky top-24 border-slate-100 shadow-sm bg-slate-50/30">
            <h2 className="font-bold text-lg text-slate-900 mb-6">Order Summary</h2>
            <div className="space-y-4 text-sm mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {items.map((item) => (
                <div key={item.product} className="flex justify-between gap-3 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded bg-white border border-slate-200 object-cover" />
                    <span className="text-slate-600 line-clamp-2 leading-snug">{item.name} <span className="font-semibold text-slate-400">×{item.quantity}</span></span>
                  </div>
                  <span className="font-bold text-slate-800 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-5 space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Shipping</span><span className="font-semibold text-emerald-600">{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Tax</span><span className="font-semibold text-slate-900">₹{tax.toLocaleString()}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between items-center"><span className="text-slate-500">Coupon Discount</span><span className="font-bold text-emerald-600">-₹{discountAmount.toLocaleString()}</span></div>}
              {pointsDiscountAmount > 0 && <div className="flex justify-between items-center"><span className="text-slate-500">Points Discount</span><span className="font-bold text-emerald-600">-₹{pointsDiscountAmount.toLocaleString()}</span></div>}
            </div>
            <div className="border-t border-slate-200 mt-5 pt-5 flex justify-between items-center font-bold">
              <span className="text-slate-900">Total</span><span className="text-2xl text-slate-900 tracking-tight">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
