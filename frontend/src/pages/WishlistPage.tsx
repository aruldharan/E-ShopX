import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import type { RootState } from '../redux/store';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const WishlistPage = () => {
  const wishlistIds = useSelector((state: RootState) => state.wishlist.items);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['wishlistProducts', wishlistIds],
    queryFn: async () => {
      const promises = wishlistIds.map((id) => api.get(`/products/${id}`).then((r) => r.data.product));
      return Promise.all(promises);
    },
    enabled: wishlistIds.length > 0,
  });

  if (wishlistIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={80} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save items you love and shop them later.</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({wishlistIds.length} items)</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.filter(Boolean).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
