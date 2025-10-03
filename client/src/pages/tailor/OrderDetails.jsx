import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ChatButton from '../../components/chat/ChatButton';

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

  useEffect(() => {
    fetchOrder();
  }, [id]);

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

  const updateProgress = async (e) => {
    e.preventDefault();
    if (!progress.stage) {
      alert('Please select a stage');
      return;
    }

    setUpdating(true);
    try {
      await api.post(`/orders/${id}/progress`, progress);
      fetchOrder(); // Refresh order data
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
    if (window.confirm('Are you sure you want to mark this order as completed? This action will move the order to your completed works.')) {
      setUpdating(true);
      try {
        await api.post(`/orders/${id}/complete`);
        // Refresh the order data
        await fetchOrder();
        // Show success message and redirect to dashboard
        alert('🎉 Order marked as completed successfully! It will now appear in your completed works.');
        setTimeout(() => {
          navigate('/tailor/dashboard');
        }, 1500);
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
            <h2 className="text-2xl font-medium text-gray-900 mb-2">{order.title}</h2>
            <p className="text-gray-600">Customer: {order.customer?.name}</p>
          </div>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            order.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Price</h4>
            <p className="text-2xl font-light text-gray-900">${order.finalPrice}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Category</h4>
            <p className="text-gray-600 capitalize">{order.category}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Created</h4>
            <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-600">{order.description}</p>
        </div>
      </div>

      {/* Communication */}
      {order.status === 'accepted' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Communication</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Chat with your customer</p>
              <p className="font-medium text-gray-900">{order.customer?.name}</p>
            </div>
            <ChatButton 
              orderId={order._id} 
              orderTitle={order.title}
            />
          </div>
        </div>
      )}

      {/* Progress Tracking - Only show for non-completed orders */}
      {order.status !== 'completed' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Progress Tracking</h3>
          
          {/* Current Progress */}
          {order.progress && order.progress.length > 0 && (
            <div className="mb-8">
              <h4 className="font-medium text-gray-900 mb-4">Current Progress</h4>
              <div className="space-y-4">
                {order.progress.map((prog, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">{prog.stage}</span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        prog.status === 'completed' ? 'bg-green-100 text-green-800' :
                        prog.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prog.status}
                      </span>
                    </div>
                    {prog.notes && <p className="text-gray-600 mb-2">{prog.notes}</p>}
                    {prog.completedAt && (
                      <p className="text-sm text-gray-500">
                        Completed: {new Date(prog.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Progress Form */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Update Progress</h4>
            <form onSubmit={updateProgress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                  <select
                    value={progress.stage}
                    onChange={(e) => setProgress({...progress, stage: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Progress'}
                </button>

                {/* Complete Order Button */}
                {order.status === 'in_progress' && (
                  <button 
                    type="button"
                    disabled={updating}
                    className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={completeOrder}
                  >
                    {updating ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Completing...
                      </span>
                    ) : (
                      'Mark as Completed'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completed Order Summary - Only show for completed orders */}
      {order.status === 'completed' && (
        <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-8 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-green-900 mb-1">Order Completed!</h3>
              <p className="text-green-700">This order has been successfully completed and delivered.</p>
            </div>
          </div>
          
          {order.completedAt && (
            <p className="text-green-700">
              <span className="font-medium">Completed on:</span> {new Date(order.completedAt).toLocaleDateString()}
            </p>
          )}
          
          {/* Show final progress summary if available */}
          {order.progress && order.progress.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-green-900 mb-3">Final Progress Summary</h4>
              <div className="space-y-2">
                {order.progress.map((prog, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-green-200">
                    <span className="font-medium text-gray-900 capitalize">{prog.stage}</span>
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {prog.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Requirements */}
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

      {/* Measurements */}
      {order.measurements && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(order.measurements).map(([key, value]) => (
              value && (
                <div key={key} className="text-center">
                  <div className="text-2xl font-light text-gray-900">{value}"</div>
                  <div className="text-sm text-gray-500 capitalize">{key}</div>
                </div>
              )
            ))}
          </div>
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
                  <img 
                    key={index}
                    src={image.url} 
                    alt={`Design ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {order.referenceImages?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Reference Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {order.referenceImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image.url} 
                    alt={`Reference ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
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
