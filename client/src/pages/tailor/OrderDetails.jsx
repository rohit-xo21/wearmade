import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    if (window.confirm('Are you sure you want to mark this order as completed?')) {
      try {
        await api.post(`/orders/${id}/complete`);
        fetchOrder();
        alert('Order marked as completed!');
      } catch (error) {
        console.error('Failed to complete order:', error);
        alert('Failed to complete order. Please try again.');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="message error">Order not found</div>;

  return (
    <div className="container">
      <h1>Order Details</h1>
      
      <div style={{ margin: '20px 0' }}>
        <Link to="/tailor/orders" className="btn">
          Back to Orders
        </Link>
      </div>

      <div className="card">
        <h2>{order.title}</h2>
        <p><strong>Customer:</strong> {order.customer?.name}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Price:</strong> ${order.finalPrice}</p>
        <p><strong>Category:</strong> {order.category}</p>
        <p><strong>Description:</strong> {order.description}</p>
        <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Chat Section */}
      {order.status === 'accepted' && order.tailor && (
        <div className="card">
          <h3>Communication</h3>
          <ChatButton 
            orderId={order._id} 
            orderTitle={order.title}
          />
        </div>
      )}

      {/* Progress Tracking */}
      <div className="card">
        <h3>Progress Tracking</h3>
        
        {/* Current Progress */}
        {order.progress && order.progress.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4>Current Progress</h4>
            {order.progress.map((prog, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                margin: '5px 0',
                borderRadius: '5px'
              }}>
                <p><strong>Stage:</strong> {prog.stage}</p>
                <p><strong>Status:</strong> {prog.status}</p>
                {prog.notes && <p><strong>Notes:</strong> {prog.notes}</p>}
                {prog.completedAt && (
                  <p><strong>Completed:</strong> {new Date(prog.completedAt).toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Update Progress Form */}
        <form onSubmit={updateProgress}>
          <div className="form-group">
            <label>Stage:</label>
            <select
              value={progress.stage}
              onChange={(e) => setProgress({...progress, stage: e.target.value})}
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

          <div className="form-group">
            <label>Status:</label>
            <select
              value={progress.status}
              onChange={(e) => setProgress({...progress, status: e.target.value})}
            >
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={progress.notes}
              onChange={(e) => setProgress({...progress, notes: e.target.value})}
              placeholder="Add progress notes..."
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Progress'}
          </button>
        </form>

        {/* Complete Order Button */}
        {order.status === 'in_progress' && (
          <div style={{ marginTop: '20px' }}>
            <button 
              className="btn btn-success"
              onClick={completeOrder}
            >
              Mark Order as Completed
            </button>
          </div>
        )}
      </div>

      {/* Order Requirements */}
      {order.requirements && (
        <div className="card">
          <h3>Requirements</h3>
          <p><strong>Fabric:</strong> {order.requirements.fabric}</p>
          <p><strong>Color:</strong> {order.requirements.color}</p>
          <p><strong>Style:</strong> {order.requirements.style}</p>
          <p><strong>Special Instructions:</strong> {order.requirements.specialInstructions}</p>
        </div>
      )}

      {/* Measurements */}
      {order.measurements && (
        <div className="card">
          <h3>Measurements</h3>
          <p><strong>Chest:</strong> {order.measurements.chest}"</p>
          <p><strong>Waist:</strong> {order.measurements.waist}"</p>
          <p><strong>Shoulder:</strong> {order.measurements.shoulder}"</p>
          <p><strong>Sleeve:</strong> {order.measurements.sleeve}"</p>
          <p><strong>Neck:</strong> {order.measurements.neck}"</p>
          <p><strong>Inseam:</strong> {order.measurements.inseam}"</p>
          <p><strong>Length:</strong> {order.measurements.length}"</p>
        </div>
      )}

      {/* Images */}
      {(order.designImages?.length > 0 || order.referenceImages?.length > 0) && (
        <div className="card">
          <h3>Reference Images</h3>
          
          {order.designImages?.length > 0 && (
            <div>
              <h4>Design Images</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {order.designImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image.url} 
                    alt={`Design ${index + 1}`}
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover',
                      border: '1px solid #ccc'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {order.referenceImages?.length > 0 && (
            <div>
              <h4>Reference Images</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {order.referenceImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image.url} 
                    alt={`Reference ${index + 1}`}
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover',
                      border: '1px solid #ccc'
                    }}
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
