import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import type { RootState } from '../redux/store';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center mt-10 mb-20 bg-white rounded-3xl shadow-sm border border-slate-100">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} className="text-slate-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Your cart feels lonely</h2>
        <p className="text-slate-500 mb-10 text-lg">Looks like you haven't made your choice yet.</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          Explore Products <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-10 tracking-tight">
        Shopping Cart <span className="text-slate-400 font-medium text-2xl ml-2">({items.length} items)</span>
      </h1>
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card p-5 flex flex-col sm:flex-row gap-6 items-center sm:items-start group border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/product/${item.product}`} className="flex-shrink-0">
                  <img
                    src={item.image || `https://placehold.co/100x100/6366f1/white?text=${encodeURIComponent(item.name[0])}`}
                    alt={item.name}
                    className="w-32 h-32 sm:w-28 sm:h-28 object-cover rounded-xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="flex-1 w-full flex flex-col">
                  <div className="flex justify-between items-start">
                    <Link to={`/product/${item.product}`} className="font-bold text-lg text-slate-800 hover:text-primary-600 line-clamp-2 pr-4 transition-colors">
                      {item.name}
                    </Link>
                    <button
                      onClick={() => dispatch(removeFromCart(item.product))}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-slate-500 font-medium mt-1">₹{item.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden h-10 shadow-sm">
                      <button
                        onClick={() => item.quantity > 1
                          ? dispatch(updateQuantity({ product: item.product, quantity: item.quantity - 1 }))
                          : dispatch(removeFromCart(item.product))
                        }
                        className="px-3 h-full hover:bg-slate-200 transition-colors text-slate-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ product: item.product, quantity: item.quantity + 1 }))}
                        className="px-3 h-full hover:bg-slate-200 transition-colors text-slate-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-extrabold text-lg text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 md:p-8 border-slate-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            <div className="space-y-4 text-slate-600 mb-8">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span>Subtotal <span className="text-slate-400">({items.reduce((s, i) => s + i.quantity, 0)} items)</span></span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base">
                <span>Tax (18%)</span>
                <span className="font-semibold text-slate-900">₹{tax.toLocaleString()}</span>
              </div>
            </div>
            
            {shipping === 0 && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2 border border-emerald-100">
                <span>🎉</span> You're eligible for free shipping!
              </div>
            )}

            <div className="border-t border-slate-100 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-extrabold text-3xl text-slate-900">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all"
            >
              Secure Checkout <ArrowRight size={20} />
            </Link>
            
            <p className="text-center mt-6">
              <Link to="/shop" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors underline underline-offset-4">
                Or continue shopping
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
