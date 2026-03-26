import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import RatingForm from '../../components/RatingForm';
import { getFilledMeasurements, getMeasurementLabel } from '../../utils/measurements';

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
    fetchOrderData();
  };

  const acceptEstimate = async (tailorId) => {
    try {
      await api.post(`/orders/${id}/accept-estimate`, { tailorId });
      
      try {
        await api.post('/chat/create', { orderId: id });
      } catch (chatError) {
        console.error('Failed to create conversation:', chatError);
      }
      
      fetchOrderData();
      alert('Estimate accepted! You can now chat with your tailor from the Messages section.');
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

  // Get only the filled measurement values
  const filledMeasurements = getFilledMeasurements(order.measurements);

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
            <h2 className="text-2xl font-medium text-gray-900 mb-1">{order.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
              <span className="capitalize">{order.category?.replace('_', ' ')}</span>
              {order.gender && (
                <>
                  <span>•</span>
                  <span className="capitalize">{order.gender}</span>
                </>
              )}
              {order.garmentType && (
                <>
                  <span>•</span>
                  <span className="capitalize">{order.garmentType}</span>
                </>
              )}
              {order.size && order.size !== 'custom' && (
                <>
                  <span>•</span>
                  <span>Size {order.size}</span>
                </>
              )}
            </div>
          </div>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium capitalize ${
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            order.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
            order.status === 'quoted' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status?.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{order.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="text-sm text-gray-500 mb-1">Budget</div>
              <div className="font-medium text-gray-900">
                {order.budget?.min != null ? `₹${order.budget.min} – ₹${order.budget.max}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Delivery By</div>
              <div className="font-medium text-gray-900">
                {order.preferredDeliveryDate ? new Date(order.preferredDeliveryDate).toLocaleDateString() : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Created</div>
              <div className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            {order.finalPrice != null && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Final Price</div>
                <div className="font-medium text-green-700 text-lg">₹{order.finalPrice}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Measurements */}
      {filledMeasurements.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Measurements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filledMeasurements.map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-light text-gray-900">{value}"</div>
                <div className="text-sm text-gray-500 mt-1">{getMeasurementLabel(key)}</div>
              </div>
            ))}
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
                <h4 className="font-medium text-gray-900 mb-1">Style / Fit</h4>
                <p className="text-gray-600">{order.requirements.style}</p>
              </div>
            )}
            {order.requirements.occasion && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Occasion</h4>
                <p className="text-gray-600">{order.requirements.occasion}</p>
              </div>
            )}
            {order.requirements.urgency && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Urgency</h4>
                <p className="text-gray-600 capitalize">{order.requirements.urgency}</p>
              </div>
            )}
          </div>
          {order.requirements.specialInstructions && (
            <div className="mt-6 pt-4 border-t border-gray-100">
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
                    <div className="text-lg font-medium text-gray-900">₹{estimate.price}</div>
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
                
                {estimate.status === 'pending' && order.status !== 'accepted' && (
                  <button 
                    className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
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
        <div className="bg-green-50 rounded-2xl border border-green-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Ready for Payment</h3>
              <p className="text-gray-600 mb-3">Your order has been accepted. Complete the payment to start work.</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span><span className="font-medium">Tailor:</span> {order.tailor?.name}{order.tailor?.shopName && ` (${order.tailor.shopName})`}</span>
                <span className="text-2xl font-bold text-green-700">₹{order.finalPrice}</span>
              </div>
            </div>
            <Link 
              to={`/customer/orders/${id}/payment`}
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Pay Now →
            </Link>
          </div>
        </div>
      )}

      {/* Communication */}
      {order.status === 'accepted' && order.tailor && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Communication</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Chat with your assigned tailor</p>
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

      {/* Progress */}
      {order.progress && order.progress.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Progress</h3>
          <div className="space-y-3">
            {order.progress.map((prog, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 capitalize">{prog.stage?.replace('_', ' ')}</span>
                  {prog.notes && <p className="text-sm text-gray-500 mt-1">{prog.notes}</p>}
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  prog.status === 'completed' ? 'bg-green-100 text-green-800' :
                  prog.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {prog.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
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
                <span key={star} className={`text-xl ${star <= order.review.customer.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <span className="text-gray-600">{order.review.customer.rating}/5</span>
          </div>
          {order.review.customer.comment && (
            <p className="text-gray-600 italic">"{order.review.customer.comment}"</p>
          )}
          <p className="text-sm text-gray-500 mt-4">
            Reviewed on {new Date(order.review.customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Images */}
      {(order.designImages?.length > 0 || order.referenceImages?.length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Reference Images</h3>
          {order.designImages?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Design Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {order.designImages.map((image, index) => (
                  <img key={index} src={image.url} alt={`Design ${index + 1}`} className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                ))}
              </div>
            </div>
          )}
          {order.referenceImages?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Reference Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {order.referenceImages.map((image, index) => (
                  <img key={index} src={image.url} alt={`Reference ${index + 1}`} className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                ))}
              </div>
            </div>
          )}
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
