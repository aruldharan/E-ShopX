import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Tags, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const AdminCategories = () => {
  const { user: currentUser } = useSelector((state: any) => state.auth);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.categories;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/categories', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      toast.success('Category created!');
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => api.put(`/categories/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      toast.success('Category updated!');
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      toast.success('Category deleted!');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete category'),
  });

  const openCreate = () => { setEditCategory(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (cat: any) => { setEditCategory(cat); setForm({ name: cat.name, description: cat.description || '' }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditCategory(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCategory) updateMutation.mutate({ id: editCategory._id, payload: form });
    else createMutation.mutate(form);
  };

  const filteredCategories = categories.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Category Center</h2>
          <p className="text-slate-500 mt-1">Organize your store's taxonomy and groupings.</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95">
            <Plus size={20} /> Add Category
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-slate-400 font-medium">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['Name', 'Slug', 'Description', canEdit ? 'Actions' : ''].filter(Boolean).map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCategories.map((cat: any) => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-bold shadow-sm">
                          {cat.name[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">/{cat.slug}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{cat.description || 'No description provided.'}</td>
                    
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(cat)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => { if(window.confirm('Delete category?')) deleteMutation.mutate(cat._id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tags size={24} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching categories</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-primary-600 text-white">
              <div>
                <h3 className="text-2xl font-bold">{editCategory ? 'Edit Category' : 'New Category'}</h3>
                <p className="text-primary-100 text-sm mt-1">{editCategory ? 'Update category details.' : 'Create a new structural group.'}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Category Name</label>
                <input type="text" placeholder="e.g. Smartwatches" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700" required />
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Description</label>
                <textarea placeholder="Category description..." value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700 resize-none" />
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-500/25 active:scale-95">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
