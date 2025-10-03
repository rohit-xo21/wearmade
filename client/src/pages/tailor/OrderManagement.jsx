import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders?status=accepted,in_progress');
      setOrders(response.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderProgress = async (orderId, stage, status, notes = '') => {
    try {
      await api.post(`/orders/${orderId}/progress`, {
        stage,
        status,
        notes
      });
      
      // Refresh orders
      fetchOrders();
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const completeOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to mark this order as completed?')) {
      try {
        await api.post(`/orders/${orderId}/complete`);
        fetchOrders();
        alert('Order marked as completed!');
      } catch (error) {
        console.error('Failed to complete order:', error);
        alert('Failed to complete order. Please try again.');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Order Management</h1>
      <p>Manage your active orders and track progress</p>
      
      <div style={{ margin: '20px 0' }}>
        <Link to="/tailor/dashboard" className="btn">
          Back to Dashboard
        </Link>
      </div>

      {orders.length > 0 ? (
        <div className="card-grid">
          {orders.map(order => (
            <div key={order._id} className="card">
              <h3>{order.title}</h3>
              <p><strong>Customer:</strong> {order.customer?.name}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Price:</strong> ${order.finalPrice}</p>
              <p><strong>Category:</strong> {order.category}</p>
              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              
              {/* Progress Tracking */}
              <div style={{ margin: '15px 0' }}>
                <h4>Progress Tracking</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <button 
                    className="btn btn-sm"
                    onClick={() => updateOrderProgress(order._id, 'cutting', 'in_progress', 'Started cutting fabric')}
                  >
                    Start Cutting
                  </button>
                  <button 
                    className="btn btn-sm"
                    onClick={() => updateOrderProgress(order._id, 'stitching', 'in_progress', 'Started stitching')}
                  >
                    Start Stitching
                  </button>
                  <button 
                    className="btn btn-sm"
                    onClick={() => updateOrderProgress(order._id, 'fitting', 'in_progress', 'Ready for fitting')}
                  >
                    Ready for Fitting
                  </button>
                  <button 
                    className="btn btn-sm"
                    onClick={() => updateOrderProgress(order._id, 'finishing', 'in_progress', 'Final finishing touches')}
                  >
                    Finishing
                  </button>
                </div>
                
                <button 
                  className="btn btn-success"
                  onClick={() => completeOrder(order._id)}
                  style={{ marginTop: '10px' }}
                >
                  Mark as Completed
                </button>
              </div>

              {/* Order Details Link */}
              <div style={{ marginTop: '15px' }}>
                <Link 
                  to={`/tailor/orders/${order._id}`} 
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="message info">
          No active orders found. Orders will appear here after customers make payment.
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
