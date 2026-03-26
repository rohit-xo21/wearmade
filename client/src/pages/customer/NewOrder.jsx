import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const CATEGORIES = [
  { value: 'shirt', label: 'Shirt' },
  { value: 'pants', label: 'Pants' },
  { value: 'dress', label: 'Dress' },
  { value: 'suit', label: 'Suit' },
  { value: 'jacket', label: 'Jacket' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'blouse', label: 'Blouse' },
  { value: 'kurta', label: 'Kurta' },
  { value: 'sherwani', label: 'Sherwani' },
  { value: 'lehenga', label: 'Lehenga' },
  { value: 'saree_blouse', label: 'Saree Blouse' },
  { value: 'other', label: 'Other' },
];

const MEASUREMENT_FIELDS_BY_CATEGORY = {
  shirt:        ['chest', 'waist', 'shoulder', 'sleeveLength', 'neck', 'upperBodyLength'],
  blouse:       ['chest', 'waist', 'shoulder', 'sleeveLength', 'neck', 'upperBodyLength'],
  saree_blouse: ['chest', 'waist', 'shoulder', 'sleeveLength', 'neck', 'upperBodyLength'],
  pants:        ['waist', 'hip', 'inseam', 'outseam', 'thigh', 'rise'],
  skirt:        ['waist', 'hip', 'fullLength'],
  dress:        ['chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'fullLength'],
  lehenga:      ['waist', 'hip', 'fullLength'],
  suit:         ['chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'neck', 'upperBodyLength', 'inseam', 'outseam', 'thigh'],
  jacket:       ['chest', 'waist', 'shoulder', 'sleeveLength', 'upperBodyLength'],
  kurta:        ['chest', 'waist', 'shoulder', 'sleeveLength', 'fullLength'],
  sherwani:     ['chest', 'waist', 'shoulder', 'sleeveLength', 'fullLength', 'neck'],
  other:        ['chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'neck', 'fullLength'],
};

const MEASUREMENT_LABELS = {
  chest: 'Chest',
  waist: 'Waist',
  hip: 'Hip',
  shoulder: 'Shoulder Width',
  sleeveLength: 'Sleeve Length',
  neck: 'Neck',
  upperBodyLength: 'Body Length (shoulder to waist)',
  inseam: 'Inseam',
  outseam: 'Outseam',
  thigh: 'Thigh',
  rise: 'Rise',
  fullLength: 'Full Garment Length',
};

const NewOrder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'shirt',
    garmentType: 'new',
    gender: '',
    size: 'custom',
    measurements: {},
    requirements: {
      fabric: '',
      color: '',
      style: '',
      occasion: '',
      specialInstructions: '',
      urgency: 'medium',
    },
    budget: { min: '', max: '' },
    preferredDeliveryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const measurementFields = useMemo(
    () => MEASUREMENT_FIELDS_BY_CATEGORY[formData.category] || MEASUREMENT_FIELDS_BY_CATEGORY.other,
    [formData.category]
  );

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const minBudget = parseFloat(formData.budget.min);
    const maxBudget = parseFloat(formData.budget.max);

    if (isNaN(minBudget) || isNaN(maxBudget)) {
      setError('Please enter valid budget values');
      setLoading(false);
      return;
    }
    if (maxBudget <= minBudget) {
      setError('Maximum budget must be greater than minimum');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/orders', formData);
      if (response.data.success) {
        navigate('/customer/orders');
      }
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to create order';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title.trim().length >= 5 && formData.category && formData.description.trim().length >= 10 && formData.gender && formData.garmentType;
      case 2: {
        const filled = measurementFields.filter(f => formData.measurements[f] && parseFloat(formData.measurements[f]) > 0);
        return filled.length >= 2;
      }
      case 3:
        return true;
      case 4: {
        const min = parseFloat(formData.budget.min);
        const max = parseFloat(formData.budget.max);
        return formData.budget.min && formData.budget.max && formData.preferredDeliveryDate && !isNaN(min) && !isNaN(max) && max > min;
      }
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError('');
    } else {
      const msgs = {
        1: 'Please fill in title (5+ chars), description (10+ chars), category, gender, and garment type',
        2: 'Please provide at least 2 measurements',
        4: 'Please set a valid budget range and delivery date',
      };
      setError(msgs[currentStep] || 'Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const stepTitles = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Measurements' },
    { num: 3, title: 'Requirements' },
    { num: 4, title: 'Budget & Timeline' },
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Create New Order</h1>
        <p className="text-gray-600">Tell us what you need — we'll match you with the right tailor.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {stepTitles.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                step.num === currentStep
                  ? 'bg-gray-900 text-white'
                  : step.num < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.num < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step.num
              )}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${step.num <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {step.title}
            </span>
            {index < 3 && <div className={`mx-4 h-0.5 w-12 ${step.num < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="e.g., Navy Blue Wedding Suit"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Garment Type *</label>
                  <select
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  >
                    <option value="new">New Garment</option>
                    <option value="alteration">Alteration</option>
                    <option value="repair">Repair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Size (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'custom'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, size: s }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        formData.size === s
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {s === 'custom' ? 'Custom Fit' : s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="Describe what you want in detail — design, fit, any references..."
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Measurements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Measurements</h2>
                <p className="text-gray-500 text-sm">
                  Showing measurements relevant to <span className="font-medium capitalize">{formData.category.replace('_', ' ')}</span>. All values in inches. Fill at least 2.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {measurementFields.map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {MEASUREMENT_LABELS[field]}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name={field}
                        value={formData.measurements[field] || ''}
                        onChange={(e) => handleChange(e, 'measurements')}
                        className="w-full px-4 py-3 pr-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        placeholder="0"
                        min="0"
                        step="0.5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">in</span>
                    </div>
                  </div>
                ))}
              </div>

              {formData.size !== 'custom' && (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  You selected size <strong>{formData.size}</strong>. Providing measurements ensures a better fit even with a standard size.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Requirements */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Style & Requirements</h2>
                <p className="text-gray-500 text-sm">All fields here are optional but help tailors give better estimates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Fabric</label>
                  <input
                    type="text"
                    name="fabric"
                    value={formData.requirements.fabric}
                    onChange={(e) => handleChange(e, 'requirements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="e.g., Cotton, Silk, Linen, Wool"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.requirements.color}
                    onChange={(e) => handleChange(e, 'requirements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="e.g., Navy Blue, Charcoal Grey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Style / Fit</label>
                  <input
                    type="text"
                    name="style"
                    value={formData.requirements.style}
                    onChange={(e) => handleChange(e, 'requirements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="e.g., Slim fit, Regular, A-line"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                  <input
                    type="text"
                    name="occasion"
                    value={formData.requirements.occasion}
                    onChange={(e) => handleChange(e, 'requirements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="e.g., Wedding, Office, Casual, Festive"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                <div className="flex gap-3">
                  {[
                    { value: 'low', label: 'No Rush', desc: 'Flexible timeline' },
                    { value: 'medium', label: 'Normal', desc: 'Standard pace' },
                    { value: 'high', label: 'Urgent', desc: 'Need it soon' },
                  ].map(u => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        requirements: { ...prev.requirements, urgency: u.value },
                      }))}
                      className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${
                        formData.requirements.urgency === u.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm">{u.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{u.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={formData.requirements.specialInstructions}
                  onChange={(e) => handleChange(e, 'requirements')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="Anything else the tailor should know — pockets, lining, embroidery, etc."
                />
              </div>
            </div>
          )}

          {/* Step 4: Budget & Timeline */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Budget & Timeline</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (₹)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="min"
                    placeholder="Minimum"
                    value={formData.budget.min}
                    onChange={(e) => handleChange(e, 'budget')}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  />
                  <input
                    type="number"
                    name="max"
                    placeholder="Maximum"
                    value={formData.budget.max}
                    onChange={(e) => handleChange(e, 'budget')}
                    min={formData.budget.min || '0'}
                    step="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  />
                </div>
                {formData.budget.min && formData.budget.max && parseFloat(formData.budget.max) <= parseFloat(formData.budget.min) && (
                  <p className="mt-2 text-sm text-red-600">Maximum must be greater than minimum</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery Date</label>
                <input
                  type="date"
                  name="preferredDeliveryDate"
                  value={formData.preferredDeliveryDate}
                  onChange={handleChange}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">Title</span>
                  <span className="text-gray-900 font-medium">{formData.title || '—'}</span>
                  <span className="text-gray-500">Category</span>
                  <span className="text-gray-900 capitalize">{formData.category.replace('_', ' ')}</span>
                  <span className="text-gray-500">Gender</span>
                  <span className="text-gray-900 capitalize">{formData.gender || '—'}</span>
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-900 capitalize">{formData.garmentType}</span>
                  <span className="text-gray-500">Size</span>
                  <span className="text-gray-900">{formData.size === 'custom' ? 'Custom Fit' : formData.size}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
            <div>
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  ← Previous
                </button>
              )}
            </div>
            <div>
              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating...
                    </span>
                  ) : (
                    'Create Order'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
