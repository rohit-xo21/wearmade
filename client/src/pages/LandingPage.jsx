import { Link } from 'react-router-dom';

const LandingPage = () => {
  const handleGoogleAuth = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to WearMade</h1>
        <p style={{ margin: '20px 0', fontSize: '18px' }}>
          Custom tailoring platform connecting customers with skilled tailors
        </p>
        
        <div style={{ margin: '40px 0' }}>
          <h2>Get Started</h2>
          <div style={{ margin: '20px 0' }}>
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-success">
              Register
            </Link>
            <button onClick={handleGoogleAuth} className="btn">
              Continue with Google
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'left', maxWidth: '600px', margin: '40px auto' }}>
          <h3>For Customers:</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>Create custom clothing orders</li>
            <li>Browse tailors in your area</li>
            <li>Track order progress</li>
            <li>Secure payment processing</li>
          </ul>

          <h3>For Tailors:</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>Receive order requests</li>
            <li>Submit estimates</li>
            <li>Showcase your portfolio</li>
            <li>Manage your business</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LandingPage