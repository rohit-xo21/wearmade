import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
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
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <Link to={user.role === 'customer' ? '/customer/dashboard' : '/tailor/dashboard'}>
                Dashboard
              </Link>
              <Link to="/messages">Messages</Link>
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