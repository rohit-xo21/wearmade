import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import RatingForm from '../../components/RatingForm';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

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

  const fetchOrderData = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  const handleRatingSubmitted = () => {
    fetchOrderData(); // Refresh order data to show the review
  };

  const acceptEstimate = async (tailorId) => {
    try {
      await api.post(`/orders/${id}/accept-estimate`, { tailorId });
      
      // Create conversation after accepting estimate
      try {
        await api.post('/chat/create', {
          orderId: id
        });
      } catch (chatError) {
        console.error('Failed to create conversation:', chatError);
        // Don't fail the estimate acceptance if chat creation fails
      }
      
      fetchOrderData(); // Refresh order data
      alert('Estimate accepted! A conversation has been created with your tailor. You can find it in the Messages section.');
    } catch (error) {
      console.error('Failed to accept estimate:', error);
      alert('Failed to accept estimate. Please try again.');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Order Details</h1>
        <p className="text-gray-600">View your order information and current status</p>
      </div>
      
      {/* Main Order Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">{order.title}</h2>
            <p className="text-gray-600 capitalize">{order.category}</p>
          </div>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            order.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
            order.status === 'quoted' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{order.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Budget Range</h4>
              <p className="text-gray-600">${order.budget?.min} - ${order.budget?.max}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Measurements */}
      {order.measurements && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {order.measurements.chest && (
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900">{order.measurements.chest}"</div>
                <div className="text-sm text-gray-500">Chest</div>
              </div>
            )}
            {order.measurements.waist && (
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900">{order.measurements.waist}"</div>
                <div className="text-sm text-gray-500">Waist</div>
              </div>
            )}
            {order.measurements.shoulders && (
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900">{order.measurements.shoulders}"</div>
                <div className="text-sm text-gray-500">Shoulders</div>
              </div>
            )}
            {order.measurements.armLength && (
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900">{order.measurements.armLength}"</div>
                <div className="text-sm text-gray-500">Arm Length</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requirements */}
      {order.requirements && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {order.requirements.fabric && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Fabric</h4>
                <p className="text-gray-600">{order.requirements.fabric}</p>
              </div>
            )}
            {order.requirements.color && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Color</h4>
                <p className="text-gray-600">{order.requirements.color}</p>
              </div>
            )}
            {order.requirements.style && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Style</h4>
                <p className="text-gray-600">{order.requirements.style}</p>
              </div>
            )}
          </div>
          {order.requirements.specialInstructions && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
              <p className="text-gray-600">{order.requirements.specialInstructions}</p>
            </div>
          )}
        </div>
      )}

      {/* Estimates */}
      {order.estimates && order.estimates.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Estimates ({order.estimates.length})</h3>
          <div className="space-y-4">
            {order.estimates.map(estimate => (
              <div key={estimate._id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{estimate.tailor?.name}</h4>
                    <p className="text-sm text-gray-500">{estimate.tailor?.shopName}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    estimate.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    estimate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {estimate.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="text-lg font-medium text-gray-900">${estimate.price}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Delivery Time</div>
                    <div className="text-lg font-medium text-gray-900">{estimate.deliveryTime} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="text-lg font-medium text-gray-900 capitalize">{estimate.status}</div>
                  </div>
                </div>
                
                {estimate.message && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Message</div>
                    <p className="text-gray-600">{estimate.message}</p>
                  </div>
                )}
                
                {estimate.status === 'pending' && (
                  <button 
                    className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                    onClick={() => acceptEstimate(estimate.tailor._id)}
                  >
                    Accept Estimate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Section */}
      {order.status === 'accepted' && order.finalPrice && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Ready for Payment</h3>
              <p className="text-gray-600 mb-4">Your order has been accepted! Complete the payment to start work.</p>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Tailor:</span> {order.tailor?.name}
                  {order.tailor?.shopName && ` (${order.tailor.shopName})`}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Final Amount:</span> <span className="text-2xl font-bold text-green-600">${order.finalPrice}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Link 
                to={`/customer/orders/${id}/payment`}
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Communication */}
      {order.status === 'accepted' && order.tailor && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Communication</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">You can chat with your assigned tailor</p>
              <p className="font-medium text-gray-900">{order.tailor.name}</p>
            </div>
            <Link 
              to="/messages"
              className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Messages →
            </Link>
          </div>
        </div>
      )}

      {/* Rating Form */}
      {order.status === 'completed' && !order.review?.customer && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <RatingForm 
            orderId={order._id} 
            onRatingSubmitted={handleRatingSubmitted}
          />
        </div>
      )}

      {/* Existing Review */}
      {order.review?.customer && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Your Review</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  className={`text-xl ${star <= order.review.customer.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-gray-600">{order.review.customer.rating}/5</span>
          </div>
          {order.review.customer.comment && (
            <div className="mt-4">
              <p className="text-gray-600 italic">"{order.review.customer.comment}"</p>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-4">
            Reviewed on {new Date(order.review.customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <Link 
          to="/customer/orders" 
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
