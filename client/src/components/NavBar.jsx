import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import api from '../api/axios';
import logoSvg from '../assets/logo.svg';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = localStorage.getItem('accessToken');
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchUnreadCount();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      const socket = getSocket();
      socket.on('chat:notify', fetchUnreadCount);
      socket.on('chat:messagesRead', fetchUnreadCount);
      return () => {
        socket.off('chat:notify', fetchUnreadCount);
        socket.off('chat:messagesRead', fetchUnreadCount);
      };
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/chat/unread-count');
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = user
    ? [
        { to: '/explore', label: 'Explore' },
        {
          to: user.role === 'customer' ? '/customer/dashboard' : '/tailor/dashboard',
          label: 'Dashboard',
        },
        ...(user.role === 'tailor' ? [{ to: '/tailor/profile', label: 'Profile' }] : []),
        { to: '/messages', label: 'Messages', badge: unreadCount },
      ]
    : [{ to: '/explore', label: 'Explore' }];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#faf8f4]/90 backdrop-blur border-b border-[#e8e0d4]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logoSvg} alt="WearMade" className="h-10 w-10" />
            <span className="text-lg font-semibold tracking-tight text-gray-950">WearMade</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label, badge }) => (
              <Link
                key={to}
                to={to}
                className={`relative text-sm font-medium transition-colors ${
                  isActive(to) ? 'text-[#1a1814]' : 'text-[#7a7570] hover:text-[#1a1814]'
                }`}
              >
                {label}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-[#7a7570]">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium bg-[#f5f1eb] text-[#5d5145] px-4 py-2 rounded-lg hover:bg-[#ede4d7] transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[#7a7570] hover:text-[#1a1814] transition-colors font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-[#1a1814] text-white px-4 py-2 rounded-lg hover:bg-[#2a2722] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 rounded-md hover:bg-[#f0e9de] transition-colors"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-px w-5 bg-gray-700 transition-transform duration-200 ${
                mobileOpen ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-5 bg-gray-700 transition-opacity duration-200 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-px w-5 bg-gray-700 transition-transform duration-200 ${
                mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1">
            {navLinks.map(({ to, label, badge }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center justify-between px-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-gray-100 text-gray-950'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {label}
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-4.5 flex items-center justify-center px-1.5 leading-none">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
              {user ? (
                <>
                  <p className="px-2 text-xs text-gray-400">{user.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-2 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block px-2 py-2.5 rounded-lg text-sm font-semibold bg-gray-950 text-white text-center hover:bg-gray-800 transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;