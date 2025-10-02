import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying');
  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify/${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="container">
      <div className="form-container">
        <h2>Email Verification</h2>
        
        {status === 'verifying' && (
          <div className="message info">Verifying your email...</div>
        )}
        
        {status === 'success' && (
          <div className="message success">
            Email verified successfully! <Link to="/login">Login now</Link>
          </div>
        )}
        
        {status === 'error' && (
          <div className="message error">
            Verification failed. Link may be expired.
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
