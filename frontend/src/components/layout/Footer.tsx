import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8">
        <div>
          <h3 className="text-white font-bold mb-4 text-lg">ShopX</h3>
          <p className="text-sm text-slate-400">Your one-stop shop for everything you need, delivered fast.</p>
          <div className="flex space-x-3 mt-4">
            <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors"><Facebook size={18} /></a>
            <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors"><Youtube size={18} /></a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books'].map((cat) => (
              <li key={cat}><Link to={`/shop?category=${cat}`} className="hover:text-primary-400 transition-colors">{cat}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Account</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'My Profile', path: '/profile' },
              { label: 'My Orders', path: '/orders' },
              { label: 'Wishlist', path: '/wishlist' },
              { label: 'Cart', path: '/cart' },
            ].map((item) => (
              <li key={item.label}><Link to={item.path} className="hover:text-primary-400 transition-colors">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Help</h4>
          <ul className="space-y-2 text-sm">
            {['FAQ', 'Shipping Info', 'Returns', 'Contact Us', 'Privacy Policy'].map((item) => (
              <li key={item}><a href="#" className="hover:text-primary-400 transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-slate-500">© 2024 ShopX. All rights reserved.</p>
        <p className="text-sm text-slate-500 mt-2 md:mt-0">Made with ❤️ using MERN Stack</p>
      </div>
    </div>
  </footer>
);

export default Footer;
