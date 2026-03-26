import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Github, Scissors } from 'lucide-react';
import logoSvg from '../assets/logo.svg';

const Footer = () => {
  return (
    <footer className="bg-[#1a1814] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-[#d8c4a5]">
              <Scissors size={16} />
              Bespoke Tailoring Platform
            </div>
            <Link to="/" className="flex items-center gap-3">
              <img src={logoSvg} alt="WearMade" className="h-11 w-11 brightness-0 invert" />
              <span className="text-2xl font-semibold tracking-tight">WearMade</span>
            </Link>
            <p className="text-gray-400 max-w-xl">
              Custom clothing, trusted tailors, and transparent workflow from first measurement to final delivery.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a href="https://github.com/rohit-xo21/wearmade" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#d8c4a5] mb-4 uppercase tracking-wide">For Clients</h4>
            <div className="space-y-3 text-sm">
              <Link to="/explore" className="block text-gray-400 hover:text-white transition-colors">Explore Tailors</Link>
              <Link to="/register" className="block text-gray-400 hover:text-white transition-colors">Create Account</Link>
              <Link to="/customer/orders/new" className="block text-gray-400 hover:text-white transition-colors">Place Order</Link>
              <Link to="/customer/orders" className="block text-gray-400 hover:text-white transition-colors">Track Orders</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#d8c4a5] mb-4 uppercase tracking-wide">For Tailors</h4>
            <div className="space-y-3 text-sm">
              <Link to="/register" className="block text-gray-400 hover:text-white transition-colors">Join Network</Link>
              <Link to="/tailor/dashboard" className="block text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/tailor/portfolio" className="block text-gray-400 hover:text-white transition-colors">Portfolio</Link>
              <Link to="/tailor/profile" className="block text-gray-400 hover:text-white transition-colors">Profile</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 WearMade. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;