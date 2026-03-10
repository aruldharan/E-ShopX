import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Package, Search, Sparkles, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../services/api';

// Category keyword → product type mapping
const detectProductType = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('fashion') || name.includes('clothing') || name.includes('wear') || name.includes('apparel')) return 'clothing';
  if (name.includes('electron') || name.includes('tech') || name.includes('gadget') || name.includes('mobile') || name.includes('computer')) return 'electronics';
  if (name.includes('sport') || name.includes('fitness') || name.includes('gym')) return 'sports';
  if (name.includes('beauty') || name.includes('skin') || name.includes('care') || name.includes('cosmet')) return 'beauty';
  if (name.includes('home') || name.includes('kitchen') || name.includes('furniture') || name.includes('garden')) return 'home';
  if (name.includes('book') || name.includes('stationery') || name.includes('education')) return 'books';
  return 'general';
};

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CLOTHING_FITS = ['Regular Fit', 'Slim Fit', 'Oversized Fit', 'Relaxed Fit', 'Compression Fit', 'A-Line', 'Straight Fit'];
const SLEEVE_TYPES = ['Full Sleeve', 'Half Sleeve', '3/4 Sleeve', 'Sleeveless', 'Cap Sleeve'];
const PATTERNS = ['Solid', 'Striped', 'Checkered', 'Printed', 'Floral', 'Abstract', 'Geometric', 'Camouflage'];
const GENDERS = ['Men', 'Women', 'Unisex', 'Boys', 'Girls'];
const OCCASIONS = ['Casual', 'Formal', 'Office', 'Party', 'Sports', 'Beach', 'Festival', 'Wedding'];

const emptyBase = { name: '', description: '', price: '', discountPrice: '', stock: '', category: '', images: '', brand: '', highlights: '' };
const emptyClothing = { sizes: [] as string[], colors: '', fabric: '', fit: '', gender: '', pattern: '', sleeve: '', occasion: '' };
const emptyElectronics = { warranty: '', modelNumber: '', specifications: [{ key: '', value: '' }] };

const AdminProducts = () => {
  const { user: currentUser } = useSelector((state: any) => state.auth);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({ ...emptyBase });
  const [clothingAttrs, setClothingAttrs] = useState({ ...emptyClothing });
  const [electronicsAttrs, setElectronicsAttrs] = useState({ ...emptyElectronics });

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'seller';

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', currentUser?.role],
    queryFn: async () => {
      const endpoint = currentUser?.role === 'seller' ? '/products/seller' : '/products';
      const { data } = await api.get(endpoint);
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data.categories; },
  });

  // Resolve product type from selected category name
  const selectedCategory = categories.find((c: any) => c._id === form.category);
  const productType = selectedCategory ? detectProductType(selectedCategory.name) : 'general';

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/products', payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminProducts'] }); toast.success('Product created!'); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => api.put(`/products/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminProducts'] }); toast.success('Product updated!'); closeModal(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminProducts'] }); toast.success('Product deleted!'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete product'),
  });

  const resetForms = () => {
    setForm({ ...emptyBase });
    setClothingAttrs({ ...emptyClothing });
    setElectronicsAttrs({ ...emptyElectronics });
  };

  const openCreate = () => { setEditProduct(null); resetForms(); setShowModal(true); };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || '',
      stock: p.stock, category: p.category?._id || '', images: p.images.join(', '), brand: p.brand || '',
      highlights: (p.highlights || []).join('\n'),
    });
    setClothingAttrs({
      sizes: p.sizes || [], colors: (p.colors || []).join(', '), fabric: p.fabric || '',
      fit: p.fit || '', gender: p.gender || '', pattern: p.pattern || '',
      sleeve: p.sleeve || '', occasion: p.occasion || '',
    });
    setElectronicsAttrs({
      warranty: p.warranty || '', modelNumber: p.modelNumber || '',
      specifications: p.specifications?.length ? p.specifications : [{ key: '', value: '' }],
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditProduct(null); resetForms(); };

  const generateAIDescription = () => {
    if (!form.name) return toast.info('Enter a product name first!');
    toast.success('Generating description...');
    setTimeout(() => {
      setForm((f: any) => ({
        ...f,
        description: `Introducing the ${f.name} — engineered for excellence and crafted with precision. This premium product offers unparalleled durability and a sleek, modern aesthetic. Perfect for everyday use, it seamlessly blends advanced functionality with sophisticated design. Elevate your experience with the ultimate choice in quality.`,
      }));
    }, 800);
  };

  const toggleSize = (s: string) => {
    setClothingAttrs((a) => ({
      ...a,
      sizes: a.sizes.includes(s) ? a.sizes.filter((x) => x !== s) : [...a.sizes, s],
    }));
  };

  const addSpec = () => setElectronicsAttrs((a) => ({ ...a, specifications: [...a.specifications, { key: '', value: '' }] }));
  const removeSpec = (i: number) => setElectronicsAttrs((a) => ({ ...a, specifications: a.specifications.filter((_, idx) => idx !== i) }));
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    setElectronicsAttrs((a) => {
      const specs = [...a.specifications];
      specs[i] = { ...specs[i], [field]: val };
      return { ...a, specifications: specs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basePayload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      category: form.category,
      images: form.images.split(',').map((s: string) => s.trim()).filter(Boolean),
      brand: form.brand || undefined,
      highlights: form.highlights.split('\n').map((s: string) => s.trim()).filter(Boolean),
      productType,
    };

    let typePayload = {};
    if (productType === 'clothing') {
      typePayload = {
        sizes: clothingAttrs.sizes,
        colors: clothingAttrs.colors.split(',').map((s) => s.trim()).filter(Boolean),
        fabric: clothingAttrs.fabric || undefined,
        fit: clothingAttrs.fit || undefined,
        gender: clothingAttrs.gender || undefined,
        pattern: clothingAttrs.pattern || undefined,
        sleeve: clothingAttrs.sleeve || undefined,
        occasion: clothingAttrs.occasion || undefined,
      };
    } else if (productType === 'electronics') {
      typePayload = {
        warranty: electronicsAttrs.warranty || undefined,
        modelNumber: electronicsAttrs.modelNumber || undefined,
        specifications: electronicsAttrs.specifications.filter((s) => s.key && s.value),
      };
    }

    const payload = { ...basePayload, ...typePayload };
    if (editProduct) updateMutation.mutate({ id: editProduct._id, payload });
    else createMutation.mutate(payload);
  };

  const filteredProducts = data?.products?.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700 text-sm';
  const labelCls = 'text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block';
  const sectionCls = 'rounded-2xl border border-slate-100 p-5 space-y-4';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h2>
          <p className="text-slate-500 mt-1">Manage your inventory, pricing, and product details.</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95">
            <Plus size={20} /> Add Product
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
          <p className="text-slate-400 font-medium">Loading products...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text" placeholder="Search products..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['Product', 'Category', 'Type', 'Price', 'Stock', 'Rating', canEdit ? 'Actions' : ''].filter(Boolean).map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((product: any) => (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={product.images[0] || `https://placehold.co/40x40/6366f1/white?text=${product.name[0]}`}
                          alt={product.name} className="w-12 h-12 object-cover rounded-xl shadow-sm border border-slate-100" />
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors max-w-[200px] truncate block">{product.name}</span>
                          {product.brand && <span className="text-xs text-slate-400">{product.brand}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 w-40 truncate">{product.category?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        product.productType === 'clothing' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        product.productType === 'electronics' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>{product.productType || 'general'}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 w-32">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 w-24">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        product.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>{product.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-amber-500 font-bold w-24">⭐ {product.ratings?.toFixed(1) || '0.0'}</td>
                    {canEdit && (
                      <td className="px-6 py-4 w-32">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(product)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Pencil size={18} /></button>
                          <button onClick={() => { if (window.confirm('Delete product?')) deleteMutation.mutate(product._id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Package size={24} className="text-slate-300" /></div>
                <h3 className="text-lg font-bold text-slate-900">No matching products</h3>
                <p className="text-slate-500 mt-1 text-sm">Try adjusting your search query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-primary-600 to-violet-600 text-white shrink-0">
              <div>
                <h3 className="text-xl font-extrabold">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <p className="text-primary-100 text-xs mt-0.5">
                  {selectedCategory ? `Category: ${selectedCategory.name}` : 'Select a category to unlock attribute fields'}
                  {productType !== 'general' && ` • ${productType.toUpperCase()} mode`}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={22} /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-6">

              {/* ── SECTION 1: Basic Info ── */}
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center font-black">1</span>
                  Basic Information
                </h4>
                <div className={sectionCls}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelCls}>Product Name *</label>
                      <input className={inputCls} placeholder="e.g. Classic Denim Jacket" value={form.name}
                        onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Price (₹) *</label>
                      <input className={inputCls} type="number" min="0" placeholder="1999" value={form.price}
                        onChange={(e) => setForm((f: any) => ({ ...f, price: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Discount Price (₹)</label>
                      <input className={inputCls} type="number" min="0" placeholder="1499 (optional)" value={form.discountPrice}
                        onChange={(e) => setForm((f: any) => ({ ...f, discountPrice: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Stock Quantity *</label>
                      <input className={inputCls} type="number" min="0" placeholder="50" value={form.stock}
                        onChange={(e) => setForm((f: any) => ({ ...f, stock: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Brand</label>
                      <input className={inputCls} placeholder="e.g. Nike, DenimCo" value={form.brand}
                        onChange={(e) => setForm((f: any) => ({ ...f, brand: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Category *</label>
                      <div className="relative">
                        <select className={inputCls} value={form.category}
                          onChange={(e) => setForm((f: any) => ({ ...f, category: e.target.value }))} required>
                          <option value="">Select a category…</option>
                          {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Image URLs <span className="normal-case font-normal text-slate-400">(comma separated)</span></label>
                      <input className={inputCls} placeholder="https://..., https://..." value={form.images}
                        onChange={(e) => setForm((f: any) => ({ ...f, images: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelCls + ' mb-0'}>Description *</label>
                        <button type="button" onClick={generateAIDescription}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1 px-3 rounded-lg flex items-center gap-1 transition-colors">
                          <Sparkles size={12} /> AI Generate
                        </button>
                      </div>
                      <textarea rows={3} className={inputCls + ' resize-none'} placeholder="Describe the product..."
                        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Highlights <span className="normal-case font-normal text-slate-400">(one per line)</span></label>
                      <textarea rows={3} className={inputCls + ' resize-none'} placeholder={"Machine washable\nStretch fabric\nPremium quality"}
                        value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Clothing Attributes ── */}
              {productType === 'clothing' && (
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center font-black">2</span>
                    👗 Clothing Attributes
                    <span className="text-xs font-normal text-slate-400 ml-1">Auto-detected from category: {selectedCategory?.name}</span>
                  </h4>
                  <div className={sectionCls}>
                    {/* Sizes */}
                    <div>
                      <label className={labelCls}>Available Sizes</label>
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_SIZES.map((s) => (
                          <button key={s} type="button" onClick={() => toggleSize(s)}
                            className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                              clothingAttrs.sizes.includes(s) ? 'bg-primary-500 text-white border-primary-500' : 'border-slate-200 text-slate-600 hover:border-primary-300'
                            }`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors & Fabric */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Colors <span className="normal-case font-normal text-slate-400">(comma separated)</span></label>
                        <input className={inputCls} placeholder="Red, Black, Navy Blue" value={clothingAttrs.colors}
                          onChange={(e) => setClothingAttrs((a) => ({ ...a, colors: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Fabric / Material</label>
                        <input className={inputCls} placeholder="100% Cotton" value={clothingAttrs.fabric}
                          onChange={(e) => setClothingAttrs((a) => ({ ...a, fabric: e.target.value }))} />
                      </div>
                    </div>

                    {/* Fit & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Fit Type</label>
                        <div className="relative">
                          <select className={inputCls} value={clothingAttrs.fit}
                            onChange={(e) => setClothingAttrs((a) => ({ ...a, fit: e.target.value }))}>
                            <option value="">Select Fit</option>
                            {CLOTHING_FITS.map((f) => <option key={f}>{f}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Gender</label>
                        <div className="relative">
                          <select className={inputCls} value={clothingAttrs.gender}
                            onChange={(e) => setClothingAttrs((a) => ({ ...a, gender: e.target.value }))}>
                            <option value="">Select Gender</option>
                            {GENDERS.map((g) => <option key={g}>{g}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Pattern & Sleeve */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Pattern</label>
                        <div className="relative">
                          <select className={inputCls} value={clothingAttrs.pattern}
                            onChange={(e) => setClothingAttrs((a) => ({ ...a, pattern: e.target.value }))}>
                            <option value="">Select Pattern</option>
                            {PATTERNS.map((p) => <option key={p}>{p}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Sleeve Type</label>
                        <div className="relative">
                          <select className={inputCls} value={clothingAttrs.sleeve}
                            onChange={(e) => setClothingAttrs((a) => ({ ...a, sleeve: e.target.value }))}>
                            <option value="">Select Sleeve</option>
                            {SLEEVE_TYPES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Occasion */}
                    <div>
                      <label className={labelCls}>Occasion</label>
                      <div className="flex flex-wrap gap-2">
                        {OCCASIONS.map((o) => {
                          const selected = clothingAttrs.occasion.split(',').map((s) => s.trim()).includes(o);
                          return (
                            <button key={o} type="button"
                              onClick={() => {
                                const current = clothingAttrs.occasion.split(',').map((s) => s.trim()).filter(Boolean);
                                const updated = selected ? current.filter((x) => x !== o) : [...current, o];
                                setClothingAttrs((a) => ({ ...a, occasion: updated.join(', ') }));
                              }}
                              className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
                                selected ? 'bg-rose-500 text-white border-rose-500' : 'border-slate-200 text-slate-600 hover:border-rose-300'
                              }`}>
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECTION 2: Electronics Attributes ── */}
              {productType === 'electronics' && (
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-500 text-white rounded-full text-xs flex items-center justify-center font-black">2</span>
                    📱 Electronics Attributes
                  </h4>
                  <div className={sectionCls}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Warranty</label>
                        <input className={inputCls} placeholder="1 Year Manufacturer Warranty" value={electronicsAttrs.warranty}
                          onChange={(e) => setElectronicsAttrs((a) => ({ ...a, warranty: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Model Number</label>
                        <input className={inputCls} placeholder="SM-A546B" value={electronicsAttrs.modelNumber}
                          onChange={(e) => setElectronicsAttrs((a) => ({ ...a, modelNumber: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelCls + ' mb-0'}>Specifications</label>
                        <button type="button" onClick={addSpec}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1 px-3 rounded-lg flex items-center gap-1 transition-colors">
                          <Plus size={12} /> Add Row
                        </button>
                      </div>
                      <div className="space-y-2">
                        {electronicsAttrs.specifications.map((spec, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input className={inputCls} placeholder="e.g. Battery" value={spec.key}
                              onChange={(e) => updateSpec(i, 'key', e.target.value)} />
                            <input className={inputCls} placeholder="e.g. 5000 mAh" value={spec.value}
                              onChange={(e) => updateSpec(i, 'value', e.target.value)} />
                            <button type="button" onClick={() => removeSpec(i)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECTION 2: Sports / Beauty / General ── */}
              {(productType === 'sports' || productType === 'beauty' || productType === 'home' || productType === 'books') && (
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full text-xs flex items-center justify-center font-black">2</span>
                    {productType === 'sports' ? '⚽ Sports' : productType === 'beauty' ? '💄 Beauty' : productType === 'home' ? '🏠 Home' : '📚 Books'} Attributes
                  </h4>
                  <div className={sectionCls}>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500">
                      Use the <strong>Highlights</strong> field above to list key features (one per line), and the <strong>Brand</strong> field for the manufacturer. The basic fields cover all core details for this product type.
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-2 min-w-[180px] py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-500/25 active:scale-95 flex items-center justify-center gap-2">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
