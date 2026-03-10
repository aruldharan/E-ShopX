import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Zap } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import { getRecentlyViewed } from '../hooks/useRecentlyViewed';

const categories = [
  { name: 'Electronics', emoji: '📱', color: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
  { name: 'Fashion', emoji: '👗', color: 'bg-rose-50 text-rose-700 border border-rose-100' },
  { name: 'Home & Garden', emoji: '🏠', color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  { name: 'Sports', emoji: '⚽', color: 'bg-amber-50 text-amber-700 border border-amber-100' },
  { name: 'Books', emoji: '📚', color: 'bg-purple-50 text-purple-700 border border-purple-100' },
  { name: 'Beauty', emoji: '💄', color: 'bg-pink-50 text-pink-700 border border-pink-100' },
];

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over ₹499' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% safe transactions' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
];

/** Recently Viewed Section (reads from localStorage) */
const RecentlyViewedSection = () => {
  const recentIds = getRecentlyViewed();
  const { data: recentProducts = [] } = useQuery({
    queryKey: ['recentlyViewed', recentIds.join(',')],
    enabled: recentIds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        recentIds.slice(0, 6).map((id) => api.get(`/products/${id}`).then((r) => r.data.product).catch(() => null))
      );
      return results.filter(Boolean);
    },
  });

  if (recentProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🕐 Recently Viewed</h2>
          <p className="text-sm text-slate-500">Pick up where you left off</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('shopx_recently_viewed'); window.location.reload(); }}
          className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {recentProducts.map((product: any) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

const HomePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const { data } = await api.get('/products?sort=-ratings&limit=8');
      return data.products;
    },
  });

  const { data: saleProducts = [] } = useQuery({
    queryKey: ['flashSaleProducts'],
    queryFn: async () => {
      const { data } = await api.get('/products?sort=-discountPrice&limit=4');
      return (data.products || []).filter((p: any) => p.discountPrice);
    },
  });

  // Flash Sale countdown — ends midnight tonight
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-slate-900 group">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          loop={true}
          className="w-full h-full"
        >
          {/* Banner 1: Technology */}
          <SwiperSlide>
            <div className="relative w-full h-full flex items-center">
              <div className="absolute inset-0 bg-slate-900">
                <img 
                  src="/tech_banner.png" 
                  alt="Technology Deals" 
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                  onError={(e) => { 
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550009158-9effb6ce15a6?q=80&w=2000&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                  <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 font-bold tracking-wider text-xs sm:text-sm mb-4 border border-indigo-500/30 backdrop-blur-sm">NEW RELEASES</span>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                    Next-Gen <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Tech is Here.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 max-w-lg mb-8 leading-relaxed">
                    Upgrade your lifestyle with our curated collection of premium electronics, smart gadgets, and high-performance gear.
                  </p>
                  <Link to="/shop?category=Electronics" className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-1 w-full sm:w-auto">
                    Shop Electronics <ArrowRight size={20} className="ml-2" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>

          {/* Banner 2: Fashion */}
          <SwiperSlide>
            <div className="relative w-full h-full flex items-center justify-end">
              <div className="absolute inset-0 bg-slate-900">
                <img 
                  src="/fashion_banner.png" 
                  alt="Summer Fashion" 
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                  onError={(e) => { 
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-slate-900/90 via-slate-900/60 to-transparent" />
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-end text-right">
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-lg">
                  <span className="inline-block py-1 px-3 rounded-full bg-rose-500/20 text-rose-300 font-bold tracking-wider text-xs sm:text-sm mb-4 border border-rose-500/30 backdrop-blur-sm text-right">TRENDING NOW</span>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                    Redefine <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-rose-400 to-orange-400">Your Style.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed ml-auto">
                    Discover exclusive apparel collections that blend modern comfort with cutting-edge streetwear aesthetics.
                  </p>
                  <Link to="/shop?category=Fashion" className="inline-flex items-center justify-center bg-rose-600 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl hover:bg-rose-500 transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:-translate-y-1 w-full sm:w-auto">
                    Explore Fashion <ArrowRight size={20} className="ml-2" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>

          {/* Banner 3: Home & Garden */}
          <SwiperSlide>
            <div className="relative w-full h-full flex items-center justify-center text-center">
              <div className="absolute inset-0 bg-slate-900">
                <img 
                  src="/home_banner.png" 
                  alt="Home & Living" 
                  className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                  onError={(e) => { 
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
              </div>
              <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                  <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 font-bold tracking-wider text-xs sm:text-sm mb-4 border border-emerald-500/30 backdrop-blur-sm text-center">FLASH SALE</span>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 leading-tight drop-shadow-lg">
                    Elevate Your <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-none">Living Space.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    Transform your home with our minimalist furniture and premium decor. Up to 40% off selected items this week only.
                  </p>
                  <Link to="/shop?category=Home" className="inline-flex items-center justify-center bg-emerald-600 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:-translate-y-1 w-full sm:w-auto">
                    Shop Home Deals <ArrowRight size={20} className="ml-2" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚡ Flash Sale Section */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Zap className="text-white" size={20} fill="white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">⚡ Flash Sale</h2>
                <p className="text-sm text-slate-500">Limited time deals — grab them fast!</p>
              </div>
            </div>
            {/* Live Countdown */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Ends in</span>
              {[
                { val: String(timeLeft.h).padStart(2,'0'), label: 'HRS' },
                { val: String(timeLeft.m).padStart(2,'0'), label: 'MIN' },
                { val: String(timeLeft.s).padStart(2,'0'), label: 'SEC' },
              ].map(({ val, label }, i) => (
                <>
                  <div key={label} className="flex flex-col items-center">
                    <div className="bg-slate-900 text-white font-mono font-black text-xl sm:text-2xl w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-xl shadow-lg">
                      {val}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 tracking-widest">{label}</span>
                  </div>
                  {i < 2 && <span className="text-slate-900 font-black text-2xl mb-2">:</span>}
                </>
              ))}
            </div>
          </div>

          {/* Sale Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts.map((product: any) => {
              const disc = Math.round(((product.price - product.discountPrice) / product.price) * 100);
              return (
                <motion.div key={product._id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Link to={`/product/${product._id}`} className="block relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100 bg-white group">
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-sm px-3 py-1 rounded-full shadow-lg">
                      {disc}% OFF
                    </div>
                    <img
                      src={product.images[0] || `https://placehold.co/300x250/f97316/white?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <p className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-slate-900">₹{product.discountPrice.toLocaleString()}</span>
                        <span className="text-sm text-slate-400 line-through">₹{product.price.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full text-center">
                        Save ₹{(product.price - product.discountPrice).toLocaleString()}!
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all">
              <Zap size={18} fill="white" /> View All Flash Deals <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map(({ name, emoji, color }) => (
            <motion.div key={name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={`/shop?category=${encodeURIComponent(name)}`}
                className={`${color} rounded-2xl p-5 flex flex-col items-center text-center space-y-3 hover:shadow-lg transition-shadow`}
              >
                <span className="text-4xl bg-white/50 p-2 rounded-xl">{emoji}</span>
                <span className="font-semibold text-sm">{name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top Rated Products</h2>
          <Link to="/shop" className="text-primary-500 hover:text-primary-600 font-medium flex items-center">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 h-52 w-full" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(data || []).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedSection />
    </div>
  );
};

export default HomePage;
