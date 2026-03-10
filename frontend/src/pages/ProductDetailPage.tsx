import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Heart, Minus, Plus, ArrowLeft, Truck, Shield, RefreshCw, BarChart2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { addToCompare, removeFromCompare } from '../redux/slices/compareSlice';
import type { RootState } from '../redux/store';
import ProductCard from '../components/ui/ProductCard';
import SizeChartModal from '../components/ui/SizeChartModal';
import PincodeChecker from '../components/ui/PincodeChecker';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlistItems.includes(id || '');
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Track as recently viewed
  useRecentlyViewed(id);

  const compareItems = useSelector((state: RootState) => state.compare.items);
  const isInCompare = compareItems.some((p: any) => p._id === id);
  const handleToggleCompare = () => {
    if (!product) return;
    if (isInCompare) {
      dispatch(removeFromCompare(product._id));
      toast.info('Removed from compare');
    } else if (compareItems.length >= 4) {
      toast.warning('Max 4 products in compare');
    } else {
      dispatch(addToCompare(product));
      toast.success('Added to compare!');
    }
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.product;
    },
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${id}`);
      return data.reviews;
    },
  });

  const { data: related } = useQuery({
    queryKey: ['related', product?.category?._id],
    queryFn: async () => {
      const { data } = await api.get(`/products?category=${product?.category?._id}`);
      return data.products.filter((p: any) => p._id !== id).slice(0, 8);
    },
    enabled: !!product?.category?._id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-12">
          <div className="bg-gray-200 h-96 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.discountPrice ?? product.price,
      quantity: qty,
    }));
    toast.success(`Added ${qty} item(s) to cart!`);
  };

  const handleSubmitReview = async () => {
    if (!user) { toast.error('Please login to leave a review'); return; }
    try {
      await api.post('/reviews', { rating: review.rating, comment: review.comment, productId: id });
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
      refetchReviews();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit review');
    }
  };

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/shop" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-8 font-medium transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
        {/* Images */}
        <div className="space-y-6">
          <motion.div layoutId={`product-image-${id}`} className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm relative aspect-[4/3] sm:aspect-square flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage] || `https://placehold.co/600x600/6366f1/white?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </AnimatePresence>
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === i ? 'border-primary-500 shadow-md scale-105' : 'border-transparent bg-slate-50 opacity-70 hover:opacity-100 hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain bg-white p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="inline-flex items-center px-3 py-1 rounded-full badge bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4 w-max font-semibold tracking-wide text-xs">
            {product.category?.name}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className={i < Math.floor(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-500">{product.ratings.toFixed(1)} <span className="mx-1">•</span> {product.numOfReviews} reviews</span>
          </div>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
              ₹{(product.discountPrice ?? product.price).toLocaleString()}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-2xl font-medium text-slate-400 line-through decoration-slate-300">₹{product.price.toLocaleString()}</span>
                <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm font-bold px-3 py-1 rounded-full">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed text-lg">{product.description}</p>

          {/* Stock */}
          <div className="mb-8">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center badge bg-rose-50 text-rose-700 border border-rose-200">Out of Stock</span>
            )}
          </div>

          {/* Clothing Variant Selectors */}
          {product.productType === 'clothing' && (
            <div className="space-y-5 mb-8">

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-800">Color:</span>
                    {selectedColor && <span className="text-sm text-slate-500">{selectedColor}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                          selectedColor === c
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold'
                            : 'border-slate-200 text-slate-600 hover:border-primary-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">Size:</span>
                      {selectedSize && <span className="text-sm text-slate-500">{selectedSize}</span>}
                    </div>
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-xs text-primary-600 font-semibold hover:underline"
                    >
                      Size Guide →
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[48px] px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          selectedSize === s
                            ? 'border-primary-500 bg-primary-500 text-white shadow-sm shadow-primary-200'
                            : 'border-slate-200 text-slate-700 hover:border-primary-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clothing Attributes */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {product.fabric && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fabric</p>
                    <p className="text-sm font-semibold text-slate-700">{product.fabric}</p>
                  </div>
                )}
                {product.fit && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fit</p>
                    <p className="text-sm font-semibold text-slate-700">{product.fit}</p>
                  </div>
                )}
                {product.gender && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</p>
                    <p className="text-sm font-semibold text-slate-700">{product.gender}</p>
                  </div>
                )}
                {product.pattern && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pattern</p>
                    <p className="text-sm font-semibold text-slate-700">{product.pattern}</p>
                  </div>
                )}
                {product.sleeve && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sleeve</p>
                    <p className="text-sm font-semibold text-slate-700">{product.sleeve}</p>
                  </div>
                )}
                {product.occasion && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occasion</p>
                    <p className="text-sm font-semibold text-slate-700">{product.occasion}</p>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand</p>
                    <p className="text-sm font-semibold text-slate-700">{product.brand}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Highlights (like Amazon) */}
          {product.highlights?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Highlights</h3>
              <ul className="space-y-1.5">
                {product.highlights.map((h: string) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-primary-500 mt-0.5">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 mb-10">
            {product.stock > 0 && (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden h-14 w-max shadow-sm">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-5 h-full hover:bg-slate-200 transition-colors text-slate-600"
                >
                  <Minus size={18} />
                </button>
                <span className="px-4 font-bold text-slate-900 text-lg w-12 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-5 h-full hover:bg-slate-200 transition-colors text-slate-600"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
            
            <div className="flex flex-1 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary text-lg flex items-center justify-center gap-3 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all h-14"
              >
                <ShoppingCart size={22} /> Add to Cart
              </button>
              <button
                onClick={() => { dispatch(toggleWishlist(product._id)); toast.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all ${
                  isWishlisted ? 'border-rose-500 bg-rose-50 text-rose-500 shadow-sm' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-rose-500 hover:shadow-sm'
                }`}
              >
                <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? "animate-bounce" : ""} />
              </button>
              <button
                onClick={handleToggleCompare}
                title="Compare"
                className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all ${
                  isInCompare ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-200 bg-white text-slate-400 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <BarChart2 size={22} />
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            {[
              { icon: Truck, text: 'Free Delivery' },
              { icon: Shield, text: 'Secure Payment' },
              { icon: RefreshCw, text: 'Easy Returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center text-center">
                <Icon size={20} className="text-primary-500 mb-1" />
                <span className="text-xs text-gray-600">{text}</span>
              </div>
            ))}
          </div>

          {/* Pincode Delivery Checker (Flipkart-style) */}
          <PincodeChecker />
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map((r: any) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {r.name[0]}
                  </div>
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <div className="flex ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write Review */}
        {user && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map((r) => (
                <button key={r} onClick={() => setReview((rev) => ({ ...rev, rating: r }))}>
                  <Star size={24} className={r <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea
              value={review.comment}
              onChange={(e) => setReview((rev) => ({ ...rev, comment: e.target.value }))}
              placeholder="Share your experience..."
              rows={3}
              className="input-field mb-4"
            />
            <button onClick={handleSubmitReview} className="btn-primary">Submit Review</button>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related && related.length > 0 && (
        <div className="mb-2 w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="related-products-swiper pb-12"
          >
            {related.map((p: any) => (
              <SwiperSlide key={p._id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
      {showSizeChart && <SizeChartModal onClose={() => setShowSizeChart(false)} />}
    </div>
  );
};

export default ProductDetailPage;
