import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ChatButton from '../../components/chat/ChatButton';
import { getFilledMeasurements, getMeasurementLabel } from '../../utils/measurements';

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
  const filledMeasurements = getFilledMeasurements(order?.measurements);
  const hasSubmittedEstimate = !!order?.estimates?.some(est => est.tailor?._id);
  const canSubmitEstimate = order?.status === 'pending' && !hasSubmittedEstimate;

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <span className="block text-sm text-gray-500 mb-1">Category</span>
            <p className="text-gray-900 capitalize">{order.category?.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Customer</span>
            <p className="text-gray-900">{order.customer?.name}</p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Gender</span>
            <p className="text-gray-900 capitalize">{order.gender || 'Not specified'}</p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Garment Type</span>
            <p className="text-gray-900 capitalize">{order.garmentType || 'new'}</p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Size</span>
            <p className="text-gray-900">{order.size || 'custom'}</p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Budget</span>
            <p className="text-gray-900">
              {order.budget?.min != null ? `₹${order.budget.min} - ₹${order.budget.max}` : 'Not specified'}
            </p>
          </div>
          <div>
            <span className="block text-sm text-gray-500 mb-1">Preferred Delivery Date</span>
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
      {filledMeasurements.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filledMeasurements.map(([key, value]) => (
              <div key={key} className="text-center">
                <span className="block text-2xl font-light text-gray-900">{value}"</span>
                <span className="text-sm text-gray-500">{getMeasurementLabel(key)}</span>
              </div>
            ))}
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
              <span className="block text-sm text-gray-500 mb-1">Occasion</span>
              <p className="text-gray-900">{order.requirements.occasion || 'Not specified'}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-500 mb-1">Urgency</span>
              <p className="text-gray-900 capitalize">{order.requirements.urgency || 'medium'}</p>
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

        {!canSubmitEstimate && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              {hasSubmittedEstimate
                ? 'You have already submitted an estimate for this order.'
                : 'This order is no longer accepting new estimates.'}
            </p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={submitEstimate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (INR)
              </label>
              <input
                type="number"
                name="price"
                value={estimate.price}
                onChange={handleEstimateChange}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                placeholder="Enter your price"
                disabled={!canSubmitEstimate}
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
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                placeholder="Enter delivery time"
                disabled={!canSubmitEstimate}
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
              disabled={!canSubmitEstimate}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting || !canSubmitEstimate}
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
