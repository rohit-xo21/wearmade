import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      isValid: minLength && hasUpper && hasLower && hasNumber
    };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 6 characters long and contain uppercase, lowercase, and number');
      setLoading(false);
      return;
    }

    try {
      const response = await api.put(`/auth/reset-password/${token}`, { 
        password: formData.password 
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setError('Reset link has expired or is invalid. Please request a new one.');
        setTokenValid(false);
      } else {
        setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  if (!tokenValid) {
    return (
      <div className="container">
        <div className="form-container">
          <h2>Reset Password</h2>
          <div className="message error">{error}</div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/forgot-password" className="btn btn-primary">
              Request New Reset Link
            </Link>
            <Link to="/login" style={{ marginLeft: '10px' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container">
        <div className="form-container">
          <h2>Password Reset Successful!</h2>
          <div className="message success">
            Your password has been successfully reset. You will be redirected to login in a few seconds.
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2>Reset Password</h2>
        
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Enter your new password below. Make sure it meets all the requirements.
        </p>
        
        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
            
            {/* Password strength indicator */}
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              <div style={{ color: passwordValidation.minLength ? 'green' : 'red' }}>
                ✓ At least 6 characters
              </div>
              <div style={{ color: passwordValidation.hasUpper ? 'green' : 'red' }}>
                ✓ One uppercase letter
              </div>
              <div style={{ color: passwordValidation.hasLower ? 'green' : 'red' }}>
                ✓ One lowercase letter
              </div>
              <div style={{ color: passwordValidation.hasNumber ? 'green' : 'red' }}>
                ✓ One number
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <small style={{ color: 'red', fontSize: '12px' }}>
                Passwords do not match
              </small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
