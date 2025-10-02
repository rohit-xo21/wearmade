import { Link } from 'react-router-dom';

const AuthError = () => {
  return (
    <div className="container">
      <div className="auth-container">
        <div className="card">
          <h2>Authentication Failed</h2>
          <div className="message error">
            <p>There was an error during the authentication process with Google.</p>
            <p>This could be due to:</p>
            <ul>
              <li>You denied permission to access your Google account</li>
              <li>A temporary server error occurred</li>
              <li>Your Google account is not properly configured</li>
            </ul>
          </div>
          <div className="form-actions">
            <Link to="/login" className="btn btn-primary">
              Try Again
            </Link>
            <Link to="/" className="btn">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError;