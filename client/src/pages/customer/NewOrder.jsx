import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const NewOrder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'shirt',
    measurements: {
      chest: '',
      waist: '',
      shoulders: '',
      armLength: ''
    },
    requirements: {
      fabric: '',
      color: '',
      style: '',
      specialInstructions: ''
    },
    budget: {
      min: '',
      max: ''
    },
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate budget range
    const minBudget = parseFloat(formData.budget.min);
    const maxBudget = parseFloat(formData.budget.max);
    
    if (isNaN(minBudget) || isNaN(maxBudget)) {
      setError('Please enter valid budget range values');
      setLoading(false);
      return;
    }
    
    if (maxBudget <= minBudget) {
      setError('Maximum budget must be greater than minimum budget');
      setLoading(false);
      return;
    }

    try {
      // Transform the data to match backend expectations
      const orderData = {
        ...formData,
        preferredDeliveryDate: formData.deadline
      };
      delete orderData.deadline; // Remove the old field name

      const response = await api.post('/orders', orderData);
      if (response.data.success) {
        navigate('/customer/orders');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.category && formData.description;
      case 2:
        return formData.measurements.chest && formData.measurements.waist;
      case 3:
        return true; // Optional fields
      case 4: {
        const minBudget = parseFloat(formData.budget.min);
        const maxBudget = parseFloat(formData.budget.max);
        return formData.budget.min && formData.budget.max && formData.deadline &&
               !isNaN(minBudget) && !isNaN(maxBudget) && maxBudget > minBudget;
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
      setError('Please fill in all required fields before proceeding');
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Create New Order</h1>
        <p className="text-gray-600">Tell us about your custom tailoring needs</p>
      </div>
      
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, title: 'Basic Info' },
          { num: 2, title: 'Measurements' },
          { num: 3, title: 'Requirements' },
          { num: 4, title: 'Budget & Timeline' }
        ].map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
              step.num === currentStep 
                ? 'bg-gray-900 text-white' 
                : step.num < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {step.num < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : step.num}
            </div>
            <div className="ml-3 text-sm">
              <div className={`font-medium ${step.num <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.title}
              </div>
            </div>
            {index < 3 && (
              <div className={`mx-6 h-0.5 w-16 ${step.num < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Basic Information</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  placeholder="e.g., Custom Wedding Suit"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  required
                >
                  <option value="shirt">Shirt</option>
                  <option value="pants">Pants</option>
                  <option value="dress">Dress</option>
                  <option value="suit">Suit</option>
                  <option value="jacket">Jacket</option>
                  <option value="skirt">Skirt</option>
                  <option value="blouse">Blouse</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  placeholder="Describe your requirements in detail..."
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Measurements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Measurements</h2>
                <p className="text-gray-600 mb-6">Please provide your accurate measurements in inches</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chest (inches)</label>
                  <input
                    type="number"
                    name="chest"
                    value={formData.measurements.chest}
                    onChange={(e) => handleChange(e, 'measurements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g., 40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waist (inches)</label>
                  <input
                    type="number"
                    name="waist"
                    value={formData.measurements.waist}
                    onChange={(e) => handleChange(e, 'measurements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g., 32"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shoulders (inches)</label>
                  <input
                    type="number"
                    name="shoulders"
                    value={formData.measurements.shoulders}
                    onChange={(e) => handleChange(e, 'measurements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g., 18"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arm Length (inches)</label>
                  <input
                    type="number"
                    name="armLength"
                    value={formData.measurements.armLength}
                    onChange={(e) => handleChange(e, 'measurements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g., 24"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Requirements</h2>
                <p className="text-gray-600 mb-6">Tell us about your preferences and style requirements</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Fabric</label>
                  <input
                    type="text"
                    name="fabric"
                    value={formData.requirements.fabric}
                    onChange={(e) => handleChange(e, 'requirements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g., Cotton, Silk, Linen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.requirements.color}
                    onChange={(e) => handleChange(e, 'requirements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g., Navy Blue, Charcoal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                  <input
                    type="text"
                    name="style"
                    value={formData.requirements.style}
                    onChange={(e) => handleChange(e, 'requirements')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="e.g., Slim fit, Regular fit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={formData.requirements.specialInstructions}
                  onChange={(e) => handleChange(e, 'requirements')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  placeholder="Any specific requirements or modifications..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Budget & Timeline */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Budget & Timeline</h2>
                <p className="text-gray-600 mb-6">Set your budget range and preferred deadline</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range ($)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="min"
                      placeholder="Minimum"
                      value={formData.budget.min}
                      onChange={(e) => handleChange(e, 'budget')}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="max"
                      placeholder="Maximum"
                      value={formData.budget.max}
                      onChange={(e) => handleChange(e, 'budget')}
                      min={formData.budget.min || "0"}
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                {formData.budget.min && formData.budget.max && 
                 parseFloat(formData.budget.max) <= parseFloat(formData.budget.min) && (
                  <p className="mt-2 text-sm text-red-600">
                    Maximum budget must be greater than minimum budget
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-100">
            <div>
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </button>
              )}
            </div>
            
            <div>
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </div>
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
