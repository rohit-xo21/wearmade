import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

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

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="message error">Order not found</div>;

  return (
    <div className="container">
      <h1>Order Request Details</h1>
      
      <div className="card">
        <h2>{order.title}</h2>
        <p><strong>Category:</strong> {order.category}</p>
        <p><strong>Customer:</strong> {order.customer?.name}</p>
        <p><strong>Description:</strong> {order.description}</p>
        <p><strong>Budget:</strong> {order.budget ? `$${order.budget.min} - $${order.budget.max}` : 'Not specified'}</p>
        <p><strong>Deadline:</strong> {order.preferredDeliveryDate ? new Date(order.preferredDeliveryDate).toLocaleDateString() : 'Not specified'}</p>
      </div>

      {order.measurements && (
        <div className="card">
          <h3>Measurements</h3>
          <p>Chest: {order.measurements.chest}"</p>
          <p>Waist: {order.measurements.waist}"</p>
          <p>Shoulders: {order.measurements.shoulders}"</p>
          <p>Arm Length: {order.measurements.armLength}"</p>
        </div>
      )}

      {order.requirements && (
        <div className="card">
          <h3>Requirements</h3>
          <p>Fabric: {order.requirements.fabric}</p>
          <p>Color: {order.requirements.color}</p>
          <p>Style: {order.requirements.style}</p>
          <p>Special Instructions: {order.requirements.specialInstructions}</p>
        </div>
      )}

      <div className="form-container">
        <h3>Submit Your Estimate</h3>
        
        {error && <div className="message error">{error}</div>}

        <form onSubmit={submitEstimate}>
          <div className="form-group">
            <label>Price ($):</label>
            <input
              type="number"
              name="price"
              value={estimate.price}
              onChange={handleEstimateChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Time (days):</label>
            <input
              type="number"
              name="deliveryTime"
              value={estimate.deliveryTime}
              onChange={handleEstimateChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Message to Customer:</label>
            <textarea
              name="message"
              value={estimate.message}
              onChange={handleEstimateChange}
              placeholder="Describe your approach, materials, etc."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Estimate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestDetails;
