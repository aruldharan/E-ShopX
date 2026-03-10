import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import type { RootState } from '../../redux/store';
import { toast } from 'react-toastify';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    ratings: number;
    numOfReviews: number;
    stock: number;
    seller?: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlistItems.includes(product._id);
  const [showQuickView, setShowQuickView] = useState(false);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.discountPrice ?? product.price,
      quantity: 1,
    }));
    toast.success('Added to cart!');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product._id));
    toast.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <>
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        onClick={() => navigate(`/product/${product._id}`)} 
        className="card block group cursor-pointer"
      >
        <div className="relative overflow-hidden">
          <img
            src={product.images[0] || `https://placehold.co/300x300/f97316/white?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 badge bg-green-500 text-white">{discount}% OFF</span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 badge bg-red-500 text-white">Out of Stock</span>
          )}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          {/* Quick View Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap hover:bg-primary-500 hover:text-white z-10"
          >
            <Eye size={14} /> Quick View
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.numOfReviews})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{(product.discountPrice ?? product.price).toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
          {product.seller && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
              <Link 
                to={`/store/${product.seller}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                Visit Store →
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
    {showQuickView && <QuickViewModal product={product as any} onClose={() => setShowQuickView(false)} />}
  </>
  );
};

export default ProductCard;
