import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import type { RootState } from '../../redux/store';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  ratings: number;
  numOfReviews: number;
  stock: number;
  seller?: string;
  description?: string;
}

interface QuickViewProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlistItems.includes(product._id);
  const [qty, setQty] = useState(1);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.discountPrice ?? product.price,
      quantity: qty,
    }));
    toast.success('Added to cart!');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-1/2 relative bg-slate-50 dark:bg-slate-900">
              <img
                src={product.images[0] || `https://placehold.co/400x400/6366f1/white?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="w-full h-64 sm:h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 bg-white/90 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <X size={16} className="text-slate-700 dark:text-slate-200" />
              </button>
            </div>

            {/* Details */}
            <div className="sm:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                  {product.name}
                </h2>

                {/* Stars */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < Math.floor(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">({product.numOfReviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{(product.discountPrice ?? product.price).toLocaleString()}
                  </span>
                  {product.discountPrice && (
                    <span className="text-base text-slate-400 line-through">₹{product.price.toLocaleString()}</span>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                    {product.description}
                  </p>
                )}

                {/* Stock */}
                <div className={`text-xs font-bold mb-4 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
                </div>

                {/* Qty */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Qty:</span>
                    <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold"
                      >−</button>
                      <span className="w-10 text-center font-bold text-slate-800 dark:text-white text-sm">{qty}</span>
                      <button
                        onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold"
                      >+</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button
                    onClick={() => { dispatch(toggleWishlist(product._id)); toast.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                    className={`w-12 flex items-center justify-center rounded-2xl border-2 transition-all ${isWishlisted ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <button
                  onClick={() => { onClose(); navigate(`/product/${product._id}`); }}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 font-semibold py-2.5 rounded-2xl transition-all text-sm"
                >
                  <Eye size={16} /> View Full Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
