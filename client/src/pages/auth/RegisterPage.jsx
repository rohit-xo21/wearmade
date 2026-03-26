import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import logoSvg from '../../assets/logo.svg';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        setSuccess('Registration successful! Please check your email for verification.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent transition';

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <Link to="/" className="relative z-10">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="WearMade" className="h-9 w-9 brightness-0 invert" />
            <span className="text-white text-2xl font-semibold tracking-tight">WearMade</span>
          </div>
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="w-10 h-px bg-white opacity-40" />
          <blockquote className="text-white text-3xl font-light leading-snug tracking-tight">
            "Every stitch <br />
            tells the story <br />
            of your style."
          </blockquote>
          <p className="text-gray-400 text-sm">Join 1,200+ clients and 300+ master tailors</p>
        </div>

        <div className="relative z-10 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i === 0 ? '#fff' : 'rgba(255,255,255,0.25)' }}
            />
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <Link to="/" className="lg:hidden block mb-10">
            <div className="flex items-center gap-2.5">
              <img src={logoSvg} alt="WearMade" className="h-9 w-9" />
              <span className="text-gray-950 text-2xl font-semibold tracking-tight">WearMade</span>
            </div>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-950 tracking-tight">Create account</h1>
            <p className="mt-2 text-gray-500 text-sm">Join WearMade and find your perfect fit</p>
          </div>

          {/* Role Toggle */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">I am a</p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              {['customer', 'tailor'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`py-2 text-sm font-medium rounded-md capitalize transition-all ${
                    formData.role === r
                      ? 'bg-white text-gray-950 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Must contain uppercase, lowercase, and a number</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-950 text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 active:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-900 hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;