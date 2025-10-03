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
    <div className="container">
      <h1>Create New Order</h1>
      
      <div className="step-indicator">
        {[1, 2, 3, 4].map(step => (
          <div 
            key={step} 
            className={`step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
          >
            Step {step}
          </div>
        ))}
      </div>

      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="form-container">
            <h2>Step 1: Basic Information</h2>
            
            <div className="form-group">
              <label>Order Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
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

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Measurements */}
        {currentStep === 2 && (
          <div className="form-container">
            <h2>Step 2: Measurements</h2>
            
            <div className="form-group">
              <label>Chest (inches):</label>
              <input
                type="number"
                name="chest"
                value={formData.measurements.chest}
                onChange={(e) => handleChange(e, 'measurements')}
                required
              />
            </div>

            <div className="form-group">
              <label>Waist (inches):</label>
              <input
                type="number"
                name="waist"
                value={formData.measurements.waist}
                onChange={(e) => handleChange(e, 'measurements')}
                required
              />
            </div>

            <div className="form-group">
              <label>Shoulders (inches):</label>
              <input
                type="number"
                name="shoulders"
                value={formData.measurements.shoulders}
                onChange={(e) => handleChange(e, 'measurements')}
              />
            </div>

            <div className="form-group">
              <label>Arm Length (inches):</label>
              <input
                type="number"
                name="armLength"
                value={formData.measurements.armLength}
                onChange={(e) => handleChange(e, 'measurements')}
              />
            </div>
          </div>
        )}

        {/* Step 3: Requirements */}
        {currentStep === 3 && (
          <div className="form-container">
            <h2>Step 3: Requirements</h2>
            
            <div className="form-group">
              <label>Preferred Fabric:</label>
              <input
                type="text"
                name="fabric"
                value={formData.requirements.fabric}
                onChange={(e) => handleChange(e, 'requirements')}
              />
            </div>

            <div className="form-group">
              <label>Color:</label>
              <input
                type="text"
                name="color"
                value={formData.requirements.color}
                onChange={(e) => handleChange(e, 'requirements')}
              />
            </div>

            <div className="form-group">
              <label>Style:</label>
              <input
                type="text"
                name="style"
                value={formData.requirements.style}
                onChange={(e) => handleChange(e, 'requirements')}
              />
            </div>

            <div className="form-group">
              <label>Special Instructions:</label>
              <textarea
                name="specialInstructions"
                value={formData.requirements.specialInstructions}
                onChange={(e) => handleChange(e, 'requirements')}
              />
            </div>
          </div>
        )}

        {/* Step 4: Budget & Timeline */}
        {currentStep === 4 && (
          <div className="form-container">
            <h2>Step 4: Budget & Timeline</h2>
            
            <div className="form-group">
              <label>Budget Range:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  name="min"
                  placeholder="Min ($)"
                  value={formData.budget.min}
                  onChange={(e) => handleChange(e, 'budget')}
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="number"
                  name="max"
                  placeholder="Max ($)"
                  value={formData.budget.max}
                  onChange={(e) => handleChange(e, 'budget')}
                  min={formData.budget.min || "0"}
                  step="0.01"
                  required
                />
              </div>
              {formData.budget.min && formData.budget.max && 
               parseFloat(formData.budget.max) <= parseFloat(formData.budget.min) && (
                <small style={{ color: 'red', fontSize: '12px' }}>
                  Maximum budget must be greater than minimum budget
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Deadline:</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ margin: '20px 0' }}>
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn">
              Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="btn btn-primary">
              Next
            </button>
          ) : (
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewOrder;
