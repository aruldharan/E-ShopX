import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const LowStockAlerts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['lowStockAlerts'],
    queryFn: async () => {
      const res = await api.get('/admin/low-stock');
      return res.data.products;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={32} />
            Low Stock Alerts
          </h2>
          <p className="text-slate-500 mt-1">Products that require immediate restocking.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-slate-400 font-medium">Loading inventory data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((product: any) => (
            <div key={product._id} className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:border-rose-300 transition-colors flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-[100px] flex items-start justify-end p-3">
                <TrendingDown className="text-rose-500" size={20} />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={product.images?.[0] || `https://placehold.co/80x80/ffe4e6/be123c?text=${product.name.charAt(0)}`}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-2">{product.name}</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">₹{product.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Stock</span>
                  <span className={`text-2xl font-black ${product.stock === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                    {product.stock}
                  </span>
                </div>
                
                <Link 
                  to="/admin/products"
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-sm transition-colors border border-slate-200"
                >
                  Manage Item
                </Link>
              </div>
            </div>
          ))}

          {data?.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-emerald-50 rounded-3xl border border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Package className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-emerald-900">Inventory Looks Good!</h3>
              <p className="text-emerald-700 mt-2 text-center max-w-md">All your active products have sufficient stock levels. No immediate restocking is required.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
