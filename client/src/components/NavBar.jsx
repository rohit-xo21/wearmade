import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import api from '../api/axios';
import logoSvg from '../assets/logo.svg';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchUnreadCount();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      // Listen for new messages to update badge
      const socket = getSocket();
      socket.on('chat:notify', () => {
        fetchUnreadCount();
      });
      
      // Listen for messages being read to update badge
      socket.on('chat:messagesRead', () => {
        fetchUnreadCount();
      });
      
      return () => {
        socket.off('chat:notify');
        socket.off('chat:messagesRead');
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
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 cursor-pointer">
              <img src={logoSvg} alt="WearMade" className="h-16 w-16" />
              <span className="text-2xl font-light text-gray-900 hover:text-gray-700 transition-colors">
                WearMade
              </span>
            </Link>
          </div>
          
          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/explore" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
            >
              Explore
            </Link>
            {user && (
              <>
                <Link 
                  to={user.role === 'customer' ? '/customer/dashboard' : '/tailor/dashboard'}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/messages" 
                  className="relative text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:block text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden pb-3 border-t border-gray-100 mt-3 pt-3">
            <div className="flex justify-center space-x-6">
              <Link 
                to="/explore" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                Explore
              </Link>
              <Link 
                to={user.role === 'customer' ? '/customer/dashboard' : '/tailor/dashboard'}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                Dashboard
              </Link>
              <Link 
                to="/messages" 
                className="relative text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;