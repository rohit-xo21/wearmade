import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Github } from 'lucide-react';
import logoSvg from '../assets/logo.svg';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={logoSvg} 
                alt="WearMade" 
                className="h-16 w-16 filter brightness-0 invert" 
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <h3 className="text-2xl font-light">WearMade</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Where master tailors meet discerning clients. Experience bespoke tailoring 
              that transforms fabric into art.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/rohit-xo21/wearmade" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">For Customers</h4>
            <div className="space-y-3">
              <Link to="/explore" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Explore Tailors
              </Link>
              <Link to="/register" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Create Account
              </Link>
              <Link to="/customer/orders/new" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Place Order
              </Link>
              <Link to="/customer/dashboard" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Track Orders
              </Link>
            </div>
          </div>

          {/* For Tailors */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">For Tailors</h4>
            <div className="space-y-3">
              <Link to="/register" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Join Network
              </Link>
              <Link to="/tailor/dashboard" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Tailor Dashboard
              </Link>
              <Link to="/tailor/portfolio" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Manage Portfolio
              </Link>
              <Link to="/tailor/requests" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                View Requests
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Support</h4>
            <div className="space-y-3">
              <Link to="/help" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Help Center
              </Link>
              <Link to="/faq" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                FAQ
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors cursor-pointer">
                Contact Us
              </Link>
              <a 
                href="https://github.com/rohit-xo21" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 WearMade. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                Terms of Service
              </Link>
              <Link to="/support" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;