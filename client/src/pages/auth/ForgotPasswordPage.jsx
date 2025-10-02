import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage('Password reset link sent to your email. Please check your inbox and spam folder.');
        setEmailSent(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Forgot Password</h2>
        
        {!emailSent ? (
          <>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && <div className="message error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/login">Back to Login</Link> | 
              <Link to="/register" style={{ marginLeft: '5px' }}>Create Account</Link>
            </div>
          </>
        ) : (
          <>
            <div className="message success">{message}</div>
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
              <h4>What's next?</h4>
              <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                <li>Check your email inbox for a password reset link</li>
                <li>The link will expire in 10 minutes for security</li>
                <li>Check your spam folder if you don't see the email</li>
                <li>Click the link to set a new password</li>
              </ul>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="btn"
                onClick={() => {
                  setEmailSent(false);
                  setMessage('');
                  setError('');
                  setEmail('');
                }}
              >
                Try Different Email
              </button>
              <Link to="/login" style={{ marginLeft: '10px' }}>Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
