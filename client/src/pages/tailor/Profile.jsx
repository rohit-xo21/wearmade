import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageLoader from '../../components/ui/PageLoader';

const TailorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    shopName: '',
    experience: '',
    specialtiesText: '',
    isAvailable: true,
    shopAddress: {
      city: '',
      state: '',
      country: ''
    },
    priceRange: {
      min: '',
      max: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const user = response.data.data;

      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        shopName: user.shopName || '',
        experience: user.experience ?? '',
        specialtiesText: (user.specialties || []).join(', '),
        isAvailable: user.isAvailable !== false,
        shopAddress: {
          city: user.shopAddress?.city || '',
          state: user.shopAddress?.state || '',
          country: user.shopAddress?.country || ''
        },
        priceRange: {
          min: user.priceRange?.min ?? '',
          max: user.priceRange?.max ?? ''
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: inputValue
        }
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const min = parseFloat(formData.priceRange.min);
    const max = parseFloat(formData.priceRange.max);
    if ((!Number.isNaN(min) || !Number.isNaN(max)) && (Number.isNaN(min) || Number.isNaN(max) || max < min)) {
      setError('Please enter a valid price range');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        shopName: formData.shopName,
        experience: formData.experience ? parseInt(formData.experience, 10) : undefined,
        specialties: formData.specialtiesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isAvailable: formData.isAvailable,
        shopAddress: {
          city: formData.shopAddress.city,
          state: formData.shopAddress.state,
          country: formData.shopAddress.country
        },
        priceRange: {
          min: Number.isNaN(min) ? undefined : min,
          max: Number.isNaN(max) ? undefined : max
        }
      };

      await api.put('/users/profile', payload);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">Tailor Profile</h1>
          <p className="text-gray-600">Update your shop details and preferences</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma separated)</label>
              <input
                type="text"
                name="specialtiesText"
                value={formData.specialtiesText}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                placeholder="e.g. bridal, suits, alterations"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range Min (₹)</label>
                <input
                  type="number"
                  name="min"
                  min="0"
                  value={formData.priceRange.min}
                  onChange={(e) => handleChange(e, 'priceRange')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range Max (₹)</label>
                <input
                  type="number"
                  name="max"
                  min="0"
                  value={formData.priceRange.max}
                  onChange={(e) => handleChange(e, 'priceRange')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.shopAddress.city}
                  onChange={(e) => handleChange(e, 'shopAddress')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.shopAddress.state}
                  onChange={(e) => handleChange(e, 'shopAddress')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.shopAddress.country}
                  onChange={(e) => handleChange(e, 'shopAddress')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Available for new orders</span>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-gray-900 text-white px-7 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TailorProfile;