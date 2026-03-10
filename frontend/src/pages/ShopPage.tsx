import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const sortOptions = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratings' },
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    gender: '',
    size: '',
    brand: '',
    sort: '-createdAt',
    minPrice: '',
    maxPrice: '',
    rating: '',
  });

  useEffect(() => {
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');
    setFilters((f) => ({ 
      ...f, 
      keyword: keyword || '',
      category: category || ''
    }));
  }, [searchParams]);

  const queryParams = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '')
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: queryParams });
      return data;
    },
  });

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.categories || [];
    },
  });

  const updateFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', category: '', gender: '', size: '', brand: '', sort: '-createdAt', minPrice: '', maxPrice: '', rating: '' });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {filters.keyword ? `Search: "${filters.keyword}"` : 'Discover Products'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{data?.count || 0} premium items found</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="input-field w-auto text-sm font-medium shadow-sm"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              showFilters ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Refine Search</h3>
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Clear</button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Search</label>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => updateFilter('keyword', e.target.value)}
                    placeholder="Keywords..."
                    className="input-field text-sm bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="input-field text-sm bg-slate-50 font-medium text-slate-700"
                  >
                    <option value="">All Categories</option>
                    {categoriesData.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Price Range (₹)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      placeholder="Min"
                      className="input-field text-sm bg-slate-50 px-2"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="input-field text-sm bg-slate-50 px-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Minimum Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => updateFilter('rating', e.target.value)}
                    className="input-field text-sm bg-slate-50 font-medium text-slate-700"
                  >
                    <option value="">Any Rating</option>
                    {[4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r}+ Stars</option>
                    ))}
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Gender</label>
                  <div className="flex flex-wrap gap-2">
                    {['Men', 'Women', 'Unisex', 'Boys', 'Girls'].map((g) => (
                      <button
                        key={g}
                        onClick={() => updateFilter('gender', filters.gender === g ? '' : g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          filters.gender === g
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'border-slate-200 text-slate-600 hover:border-primary-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {['XS','S','M','L','XL','XXL'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateFilter('size', filters.size === s ? '' : s)}
                        className={`min-w-[40px] px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                          filters.size === s
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'border-slate-200 text-slate-600 hover:border-primary-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Brand</label>
                  <input
                    type="text"
                    value={filters.brand}
                    onChange={(e) => updateFilter('brand', e.target.value)}
                    placeholder="e.g. Nike, DenimCo..."
                    className="input-field text-sm bg-slate-50"
                  />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading || isFetching ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse border-none shadow-sm">
                  <div className="bg-slate-200 h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded-full w-3/4" />
                    <div className="h-4 bg-slate-200 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg mb-4">No premium products match your criteria.</p>
              <button onClick={clearFilters} className="btn-primary rounded-xl px-6 py-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Reset Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
              {data?.products?.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
