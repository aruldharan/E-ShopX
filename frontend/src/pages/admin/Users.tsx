import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Mail, Shield, Key, X, Check, Search, Users, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.users;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (newUser: any) => api.post('/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateRoleMutation.mutate({ id: editingUser._id, role: formData.role });
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        return toast.error('Please fill in all fields');
      }
      createUserMutation.mutate(formData);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'user' });
  };

  const handleDelete = (id: string, role: string) => {
    if (role === 'admin') {
      return toast.error('Cannot delete an admin from this interface.');
    }
    if (window.confirm('Are you sure you want to remove this member? This action cannot be undone.')) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff & Users</h2>
          <p className="text-slate-500 mt-1">Manage platform access and member privileges.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
        >
          <UserPlus size={20} />
          Add New Member
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-slate-400 font-medium">Loading user data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['User Member', 'Email Address', 'Security Role', 'Date Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-8 py-5 text-slate-500 font-bold uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-extrabold shadow-sm">
                          {user.name?.[0].toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{user.name}</div>
                          <div className="text-slate-400 text-xs font-medium">ID: {user._id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium">{user.email}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-tighter ${
                        user.role === 'admin' 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' 
                          : user.role === 'manager'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : user.role === 'supervisor'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id, user.role)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No members found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search or add a new member.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-primary-600 text-white">
                <div>
                  <h3 className="text-2xl font-bold">{editingUser ? 'Edit Member Role' : 'New Member'}</h3>
                  <p className="text-primary-100 text-sm mt-1">Assign roles and permissions.</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {!editingUser && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <UserPlus size={16} /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Mail size={16} /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Key size={16} /> Temporary Password
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                      />
                    </div>
                  </>
                )}

                {editingUser && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                       {editingUser.name?.[0].toUpperCase()}
                     </div>
                     <div>
                       <div className="font-bold text-slate-900">{editingUser.name}</div>
                       <div className="text-sm text-slate-500">{editingUser.email}</div>
                     </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Shield size={16} /> Platform Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['user', 'manager', 'supervisor', 'admin'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role as any })}
                        className={`px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm capitalize flex items-center justify-between ${
                          formData.role === role 
                            ? 'border-primary-600 bg-primary-50 text-primary-700' 
                            : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {role}
                        {formData.role === role && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createUserMutation.isPending || updateRoleMutation.isPending}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95 disabled:opacity-50 mt-4 h-14"
                >
                  {createUserMutation.isPending || updateRoleMutation.isPending ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                  ) : (
                    editingUser ? 'Save Role Changes' : 'Add Member to Platform'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
