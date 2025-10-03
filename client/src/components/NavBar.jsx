import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import api from '../api/axios';

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
    <div className="header">
      <div className="navbar">
        <h1>
          <Link to="/" style={{ color: '#333', textDecoration: 'none' }}>
            WearMade
          </Link>
        </h1>
        
        <div className="nav-links">
          <Link to="/explore">Explore</Link>
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <Link to={user.role === 'customer' ? '/customer/dashboard' : '/tailor/dashboard'}>
                Dashboard
              </Link>
              <Link to="/messages" style={{ position: 'relative' }}>
                Messages
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;