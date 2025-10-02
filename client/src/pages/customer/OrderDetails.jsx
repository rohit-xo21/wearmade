import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

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

  const acceptEstimate = async (tailorId) => {
    try {
      await api.post(`/orders/${id}/accept-estimate`, { tailorId });
      fetchOrderData(); // Refresh order data
    } catch (error) {
      console.error('Failed to accept estimate:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="message error">Order not found</div>;

  return (
    <div className="container">
      <h1>Order Details</h1>
      
      <div className="card">
        <h2>{order.title}</h2>
        <p><strong>Category:</strong> {order.category}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Description:</strong> {order.description}</p>
        <p><strong>Budget:</strong> ${order.budget?.min} - ${order.budget?.max}</p>
        <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
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

      {order.estimates && order.estimates.length > 0 && (
        <div className="card">
          <h3>Estimates</h3>
          {order.estimates.map(estimate => (
            <div key={estimate._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <p><strong>Tailor:</strong> {estimate.tailor?.name}</p>
              <p><strong>Price:</strong> ${estimate.price}</p>
              <p><strong>Delivery Time:</strong> {estimate.deliveryTime} days</p>
              <p><strong>Message:</strong> {estimate.message}</p>
              <p><strong>Status:</strong> {estimate.status}</p>
              
              {estimate.status === 'pending' && (
                <button 
                  className="btn btn-success"
                  onClick={() => acceptEstimate(estimate.tailor._id)}
                >
                  Accept Estimate
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to="/customer/orders" className="btn">
          Back to Orders
        </Link>
        {order.status === 'accepted' && (
          <Link to={`/customer/orders/${id}/payment`} className="btn btn-primary">
            Make Payment
          </Link>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
