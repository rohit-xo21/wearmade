import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ChatButton from '../../components/chat/ChatButton';
import { getFilledMeasurements, getMeasurementLabel } from '../../utils/measurements';

const TailorOrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState({
    stage: '',
    status: 'in_progress',
    notes: ''
  });
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchOrder = useCallback(async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateProgress = async (e) => {
    e.preventDefault();
    if (!progress.stage) {
      alert('Please select a stage');
      return;
    }

    setUpdating(true);
    try {
      await api.post(`/orders/${id}/progress`, progress);
      fetchOrder();
      setProgress({ stage: '', status: 'in_progress', notes: '' });
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const completeOrder = async () => {
    if (window.confirm('Mark this order as completed? This cannot be undone.')) {
      setUpdating(true);
      try {
        await api.post(`/orders/${id}/complete`);
        await fetchOrder();
        alert('Order completed!');
        setTimeout(() => navigate('/tailor/dashboard'), 1000);
      } catch (error) {
        console.error('Failed to complete order:', error);
        alert('Failed to complete order. Please try again.');
      } finally {
        setUpdating(false);
      }
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

  const isAssigned = order.tailor && (order.status === 'accepted' || order.status === 'in_progress' || order.status === 'ready');

  const filledMeasurements = getFilledMeasurements(order.measurements);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Order Details</h1>
          <p className="text-gray-600">Manage and track order progress</p>
        </div>
        <Link 
          to="/tailor/orders" 
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Main Order Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-1">{order.title}</h2>
            <p className="text-gray-500">Customer: {order.customer?.name}</p>
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
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status?.replace('_', ' ')}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {order.finalPrice != null && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Price</div>
              <div className="text-xl font-medium text-gray-900">₹{order.finalPrice}</div>
            </div>
          )}
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
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-600">{order.description}</p>
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

      {/* Communication — only for assigned orders */}
      {isAssigned && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Communication</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Chat with the customer</p>
              <p className="font-medium text-gray-900">{order.customer?.name}</p>
            </div>
            <ChatButton orderId={order._id} orderTitle={order.title} />
          </div>
        </div>
      )}

      {/* Progress Tracking — only for assigned, non-completed orders */}
      {isAssigned && order.status !== 'completed' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Progress Tracking</h3>
          
          {order.progress && order.progress.length > 0 && (
            <div className="mb-8">
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

          <div className="border-t border-gray-100 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Update Progress</h4>
            <form onSubmit={updateProgress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                  <select
                    value={progress.stage}
                    onChange={(e) => setProgress({...progress, stage: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Stage</option>
                    <option value="cutting">Cutting</option>
                    <option value="stitching">Stitching</option>
                    <option value="fitting">Fitting</option>
                    <option value="finishing">Finishing</option>
                    <option value="quality_check">Quality Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={progress.status}
                    onChange={(e) => setProgress({...progress, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={progress.notes}
                  onChange={(e) => setProgress({...progress, notes: e.target.value})}
                  placeholder="Add progress notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Progress'}
                </button>

                {order.status === 'in_progress' && (
                  <button 
                    type="button"
                    disabled={updating}
                    className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    onClick={completeOrder}
                  >
                    {updating ? 'Completing...' : 'Mark as Completed'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completed Banner */}
      {order.status === 'completed' && (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-green-900">Order Completed</h3>
              <p className="text-green-700">This order has been delivered.</p>
            </div>
          </div>
          
          {order.progress && order.progress.length > 0 && (
            <div className="mt-6 space-y-2">
              {order.progress.map((prog, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-green-200">
                  <span className="font-medium text-gray-900 capitalize">{prog.stage?.replace('_', ' ')}</span>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {prog.status?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
};

export default TailorOrderDetails;
