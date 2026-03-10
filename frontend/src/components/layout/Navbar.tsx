import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Heart, Menu, Search, X, LogOut, Package, LayoutDashboard, Briefcase, ClipboardList, Moon, Sun, Bell } from 'lucide-react';
import type { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import { toggleDarkMode } from '../../redux/slices/uiSlice';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);

  const cartCount = cartItems.reduce((sum: number, i: any) => sum + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
    setUserOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['search-suggestions', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];
      const { data } = await api.get('/products', { params: { keyword: debouncedSearch, limit: 6 } });
      return data.products || [];
    },
    enabled: debouncedSearch.length >= 2,
  });

  const { data: notifications = [], refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/notifications');
      return data.notifications || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => refetchNotifs(),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.put('/notifications/read-all'),
    onSuccess: () => refetchNotifs(),
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopX</span>
          </Link>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-xl mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="flex w-full">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search products, brands and more..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-400"
                />
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 rounded-r-lg transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {searchFocused && debouncedSearch.length >= 2 && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-700 overflow-hidden z-50"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-3 pb-1">Suggestions</p>
                  {suggestions.map((p: any) => (
                    <button
                      key={p._id}
                      onClick={() => { navigate(`/product/${p._id}`); setSearch(''); setSearchFocused(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <img src={p.images?.[0] || ''} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-zinc-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">₹{(p.discountPrice ?? p.price).toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => { handleSearch({ preventDefault: () => {} } as any); setSearchFocused(false); }}
                    className="w-full text-center text-xs font-bold text-primary-600 py-3 border-t border-slate-100 dark:border-zinc-700 hover:bg-primary-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    See all results for "{debouncedSearch}" →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-gray-600 hover:text-primary-500 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-gray-600 hover:text-primary-500 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</h3>
                      {unreadCount > 0 && <span className="text-[10px] bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No notifications yet.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
                        {notifications.map((n: any) => (
                          <div 
                            key={n._id} 
                            onClick={() => {
                              if (!n.isRead) markReadMutation.mutate(n._id);
                              if (n.link) navigate(n.link);
                              setNotifOpen(false);
                            }}
                            className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${n.isRead ? 'opacity-60 bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100'}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm text-slate-800 dark:text-slate-100 ${n.isRead ? '' : 'font-bold'}`}>{n.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-slate-400 whitespace-nowrap mt-1 font-medium">{dayjs(n.createdAt).fromNow()}</p>
                            </div>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1 shrink-0"></span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 text-center border-t border-slate-100 dark:border-slate-700">
                      {unreadCount > 0 && (
                        <button onClick={() => markAllReadMutation.mutate()} className="w-full text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors">Mark All as Read</button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors">
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center space-x-1 p-2 text-gray-600 hover:text-primary-500 transition-colors"
              >
                <User size={22} />
                {user && <span className="hidden md:block text-sm font-medium">{user.name.split(' ')[0]}</span>}
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    {user ? (
                      <>
                        <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-primary-600 transition-colors">
                          <User size={16} className="mr-2" /> Profile
                        </Link>
                        <Link to="/orders" onClick={() => setUserOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-primary-600 transition-colors">
                          <Package size={16} className="mr-2" /> My Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-primary-600 transition-colors">
                            <LayoutDashboard size={16} className="mr-2" /> Admin Panel
                          </Link>
                        )}
                        {user.role === 'manager' && (
                          <Link to="/manager" onClick={() => setUserOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-primary-600 transition-colors">
                            <Briefcase size={16} className="mr-2" /> Manager Portal
                          </Link>
                        )}
                        {user.role === 'supervisor' && (
                          <Link to="/supervisor" onClick={() => setUserOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-primary-600 transition-colors">
                            <ClipboardList size={16} className="mr-2" /> Supervisor Ops
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={16} className="mr-2" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Login</Link>
                        <Link to="/register" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Register</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pb-4"
            >
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" className="bg-primary-500 text-white px-4 rounded-r-lg">
                  <Search size={18} />
                </button>
              </form>
              <nav className="mt-3 space-y-1">
                {['Home', 'Shop', 'Cart', 'Wishlist'].map((item) => (
                  <Link
                    key={item}
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
