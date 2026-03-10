import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, ShoppingCart, Trash2 } from 'lucide-react';
import { removeFromCompare, clearCompare } from '../../redux/slices/compareSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import type { RootState } from '../../redux/store';
import { toast } from 'react-toastify';

const COMPARE_FIELDS = [
  { label: 'Price', key: 'price', format: (v: any, p: any) => `₹${(p.discountPrice ?? v).toLocaleString()}` },
  { label: 'Rating', key: 'ratings', format: (v: any) => `⭐ ${Number(v).toFixed(1)}` },
  { label: 'Stock', key: 'stock', format: (v: any) => v > 0 ? `✓ ${v} in stock` : '✗ Out of stock' },
  { label: 'Brand', key: 'brand', format: (v: any) => v || '—' },
  { label: 'Fabric', key: 'fabric', format: (v: any) => v || '—' },
  { label: 'Fit', key: 'fit', format: (v: any) => v || '—' },
  { label: 'Gender', key: 'gender', format: (v: any) => v || '—' },
  { label: 'Occasion', key: 'occasion', format: (v: any) => v || '—' },
  { label: 'Warranty', key: 'warranty', format: (v: any) => v || '—' },
];

const CompareDrawer = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.compare);

  if (items.length === 0) return null;

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      product: product._id, name: product.name,
      image: product.images?.[0] || '', price: product.discountPrice ?? product.price, quantity: 1,
    }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed bottom-0 left-0 right-0 z-[90] bg-white dark:bg-zinc-900 shadow-2xl border-t border-slate-200 dark:border-zinc-700"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <BarChart2 size={18} className="text-primary-500" />
            Compare Products ({items.length}/4)
          </div>
          <button onClick={() => dispatch(clearCompare())}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors">
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 bg-slate-50 dark:bg-zinc-800">Feature</th>
                {items.map((product) => (
                  <th key={product._id} className="px-4 py-2 min-w-[180px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-left">
                        <img src={product.images?.[0]} alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" />
                        <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug">{product.name}</p>
                      </div>
                      <button onClick={() => dispatch(removeFromCompare(product._id))}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
              {COMPARE_FIELDS.map(({ label, key, format }) => {
                const values = items.map((p) => format(p[key], p));
                const allSame = values.every((v) => v === values[0]);
                return (
                  <tr key={label}>
                    <td className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-zinc-800 dark:text-slate-400">{label}</td>
                    {items.map((product) => (
                      <td key={product._id} className={`px-4 py-2 text-xs font-semibold text-center ${
                        !allSame ? 'text-primary-600' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {format(product[key], product)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {/* Rating stars */}
              <tr>
                <td className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-zinc-800 dark:text-slate-400">Reviews</td>
                {items.map((p) => (
                  <td key={p._id} className="px-4 py-2 text-xs text-center text-slate-500 dark:text-slate-400">{p.numOfReviews} reviews</td>
                ))}
              </tr>
              {/* Actions */}
              <tr>
                <td className="px-4 py-2 bg-slate-50 dark:bg-zinc-800" />
                {items.map((product) => (
                  <td key={product._id} className="px-4 py-2 text-center">
                    <button onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                      <ShoppingCart size={13} /> Add to Cart
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareDrawer;
