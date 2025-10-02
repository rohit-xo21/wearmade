import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token in localStorage (using same key as AuthContext)
      localStorage.setItem('accessToken', token);

      // Decode the token to get user info (simple decode, not verification)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          avatar: payload.avatar
        };

        // Update auth context
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });

        // Show success message
        toast.success(`Welcome back, ${user.name}!`);

        // Redirect based on user role
        const redirectPath = user.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard';
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 2000);

      } catch (error) {
        console.error('Error processing auth token:', error);
        navigate('/login', { replace: true });
      }
    } else {
      // No token found, redirect to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="container">
      <div className="auth-container">
        <div className="card">
          <h2>Authentication Successful!</h2>
          <div className="message success">
            <p>You have been successfully authenticated with Google.</p>
            <p>Redirecting to your dashboard...</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;