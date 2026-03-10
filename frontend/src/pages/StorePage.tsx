import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Store, Calendar, Star, Package, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const StorePage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch Store Details
  const { data: storeData, isLoading: isStoreLoading } = useQuery({
    queryKey: ['storeDetails', id],
    queryFn: async () => {
      const { data } = await api.get(`/users/store/${id}`);
      return data.store;
    },
    enabled: !!id,
  });

  // Fetch Products by this Seller
  const { data: storeProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['storeProducts', id],
    queryFn: async () => {
      const { data } = await api.get(`/products?seller=${id}`);
      return data.products;
    },
    enabled: !!id,
  });

  if (isStoreLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store size={40} className="text-slate-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Store Not Found</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">The storefront you are looking for does not exist or has been removed from our platform.</p>
        <Link to="/" className="btn btn-primary px-8">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Store Header / Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 relative overflow-hidden">
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          {storeData.store?.banner && (
            <img src={storeData.store.banner} alt="Store Banner" className="w-full h-full object-cover opacity-60" />
          )}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 -mt-16 md:-mt-20 pb-8 relative z-10">
            {/* Store Logo Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl p-2 shadow-xl shrink-0 flex items-center justify-center border border-slate-100">
              {storeData.store?.logo ? (
                <img src={storeData.store.logo} alt={storeData.store.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <span className="text-indigo-600 text-5xl font-black">{storeData.store?.name?.charAt(0) || storeData.name?.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1 pt-2 md:pt-24">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    {storeData.store?.name || `${storeData.name}'s Store`}
                    <ShieldCheck size={24} className="text-emerald-500" />
                  </h1>
                  <p className="text-slate-500 mt-2 max-w-2xl text-lg leading-relaxed">{storeData.store?.description || 'Welcome to my official storefront!'}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                      4.8 (120+ Reviews)
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Calendar size={16} className="text-indigo-500" />
                      Joined {new Date(storeData.createdAt).getFullYear()}
                    </div>
                  </div>
                </div>
                
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 whitespace-nowrap self-start">
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 mt-1">Explore all items from this seller.</p>
          </div>
          <div className="text-sm font-bold bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-100">
            <Package size={18} /> {storeProducts.length} Items
          </div>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100 shadow-sm"></div>
            ))}
          </div>
        ) : storeProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">This seller hasn't published any items to their storefront. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {storeProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
