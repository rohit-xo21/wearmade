import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import ChatButton from '../../components/chat/ChatButton';
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

      {/* Show chat button if order has been accepted and has a tailor */}
      {order.status === 'accepted' && order.tailor && (
        <div className="card">
          <h3>Communication</h3>
          <ChatButton 
            orderId={order._id} 
            orderTitle={order.title}
          />
        </div>
      )}

      {/* Show rating form for completed orders */}
      {order.status === 'completed' && !order.review?.customer && (
        <RatingForm 
          orderId={order._id} 
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {/* Show existing review */}
      {order.review?.customer && (
        <div className="card">
          <h3>Your Review</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  style={{ 
                    color: star <= order.review.customer.rating ? '#ffc107' : '#ddd',
                    fontSize: '20px'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <span>{order.review.customer.rating}/5</span>
          </div>
          {order.review.customer.comment && (
            <p style={{ marginTop: '10px' }}>"{order.review.customer.comment}"</p>
          )}
          <p style={{ fontSize: '12px', color: '#666' }}>
            Reviewed on {new Date(order.review.customer.createdAt).toLocaleDateString()}
          </p>
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
