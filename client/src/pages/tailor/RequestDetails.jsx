import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ChatButton from '../../components/chat/ChatButton';

const RequestDetails = () => {
  const [order, setOrder] = useState(null);
  const [estimate, setEstimate] = useState({
    price: '',
    deliveryTime: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleEstimateChange = (e) => {
    setEstimate({
      ...estimate,
      [e.target.name]: e.target.value
    });
  };

  const submitEstimate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post(`/orders/${id}/estimate`, estimate);
      navigate('/tailor/requests');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit estimate');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-600">The requested order could not be found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Order Request Details</h1>
        <p className="text-gray-600">Review the request and submit your estimate</p>
      </div>
      
      {/* Order Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-6">{order.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <span className="block text-sm text-gray-500 mb-1">Category</span>
            <p className="text-gray-900">{order.category}</p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Customer</span>
            <p className="text-gray-900">{order.customer?.name}</p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Budget</span>
            <p className="text-gray-900">
              {order.budget ? `$${order.budget.min} - $${order.budget.max}` : 'Not specified'}
            </p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Deadline</span>
            <p className="text-gray-900">
              {order.preferredDeliveryDate ? new Date(order.preferredDeliveryDate).toLocaleDateString() : 'Not specified'}
            </p>
          </div>
        </div>
        
        <div>
          <span className="block text-sm text-gray-500 mb-2">Description</span>
          <p className="text-gray-900 leading-relaxed">{order.description}</p>
        </div>
      </div>

      {/* Measurements */}
      {order.measurements && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <span className="block text-2xl font-light text-gray-900">{order.measurements.chest}"</span>
              <span className="text-sm text-gray-500">Chest</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-light text-gray-900">{order.measurements.waist}"</span>
              <span className="text-sm text-gray-500">Waist</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-light text-gray-900">{order.measurements.shoulders}"</span>
              <span className="text-sm text-gray-500">Shoulders</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-light text-gray-900">{order.measurements.armLength}"</span>
              <span className="text-sm text-gray-500">Arm Length</span>
            </div>
          </div>
        </div>
      )}

      {/* Requirements */}
      {order.requirements && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-sm text-gray-500 mb-1">Fabric</span>
              <p className="text-gray-900">{order.requirements.fabric}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-500 mb-1">Color</span>
              <p className="text-gray-900">{order.requirements.color}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-500 mb-1">Style</span>
              <p className="text-gray-900">{order.requirements.style}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-500 mb-1">Special Instructions</span>
              <p className="text-gray-900">{order.requirements.specialInstructions || 'None'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Communication */}
      {order.status === 'accepted' && order.tailor && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Communication</h3>
          <ChatButton 
            orderId={order._id} 
            orderTitle={order.title}
          />
        </div>
      )}

      {/* Estimate Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-medium text-gray-900 mb-6">Submit Your Estimate</h3>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={submitEstimate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={estimate.price}
                onChange={handleEstimateChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                placeholder="Enter your price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time (days)
              </label>
              <input
                type="number"
                name="deliveryTime"
                value={estimate.deliveryTime}
                onChange={handleEstimateChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                placeholder="Enter delivery time"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Customer
            </label>
            <textarea
              name="message"
              value={estimate.message}
              onChange={handleEstimateChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              placeholder="Describe your approach, materials, timeline, etc."
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-gray-900 text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Estimate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestDetails;
