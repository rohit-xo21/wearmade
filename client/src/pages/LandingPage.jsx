import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Users, Zap, Shield } from 'lucide-react';
import api from '../api/axios';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-6 tracking-tight">
              Crafted for <span className="font-medium">You</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Where master tailors meet discerning clients. Experience bespoke tailoring 
              that transforms fabric into art, tailored to your exact specifications.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                to="/explore" 
                className="group bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                Explore Tailors
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {user ? (
                <Link 
                  to={user.role === 'customer' ? '/customer/dashboard' : '/tailor/dashboard'}
                  className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Start Your Journey
                </Link>
              )}
            </div>

            {/* Auth Options - Only show when not logged in */}
            {!loading && !user && (
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Already have an account? Sign in
                </Link>
                <button 
                  onClick={handleGoogleAuth} 
                  className="text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Continue with Google
                </button>
              </div>
            )}

            {/* Welcome message for logged in users */}
            {user && (
              <div className="mb-12">
                <p className="text-lg text-gray-600">
                  Welcome back, <span className="font-medium text-gray-900">{user.name}</span>!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Why Choose WearMade
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Experience the perfect blend of traditional craftsmanship and modern convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* For Customers */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-black rounded-full p-3 flex-shrink-0">
                  <Star size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-3">For Discerning Clients</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Bespoke clothing designed to your exact measurements</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Curated network of master tailors</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Real-time order tracking with transparency</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Secure payments with complete protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* For Tailors */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 rounded-full p-3 flex-shrink-0">
                  <Users size={24} className="text-gray-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-3">For Master Tailors</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Connect with clients who value craftsmanship</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Showcase your portfolio and expertise</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Streamlined business management tools</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Fair pricing and prompt payments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Zap size={32} className="text-gray-900" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Fast Turnaround</h3>
              <p className="text-gray-600">Quality craftsmanship delivered on time, every time</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Shield size={32} className="text-gray-900" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">Your payments and personal data are always protected</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Star size={32} className="text-gray-900" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">Only verified master tailors join our exclusive network</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            {user ? 'Continue Your Journey' : 'Ready to Experience Excellence?'}
          </h2>
          <p className="text-xl text-gray-300 mb-8 font-light">
            {user 
              ? 'Discover new tailors and create your perfect wardrobe'
              : 'Join thousands who have discovered the perfect fit'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link 
                  to={user.role === 'customer' ? '/customer/new-order' : '/tailor/requests'}
                  className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                >
                  {user.role === 'customer' ? 'Create New Order' : 'View Requests'}
                </Link>
                
                <Link 
                  to="/explore" 
                  className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                >
                  Explore Portfolios
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                >
                  Get Started Today
                </Link>
                
                <Link 
                  to="/explore" 
                  className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                >
                  Explore Portfolios
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage