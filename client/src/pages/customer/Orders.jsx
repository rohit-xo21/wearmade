import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      let url = '/orders';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const response = await api.get(url);
      setOrders(response.data.data.docs || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [filter, fetchOrders]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      quoted: '#3498db', 
      accepted: '#2ecc71',
      in_progress: '#9b59b6',
      ready: '#e67e22',
      completed: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#666';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading your orders...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Orders</h1>
        <Link to="/customer/new-order" className="btn btn-primary">
          Create New Order
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: '20px' }}>
        {['all', 'pending', 'quoted', 'accepted', 'in_progress', 'completed'].map(status => (
          <button
            key={status}
            className={`tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              margin: '0 5px',
              border: '1px solid #ddd',
              background: filter === status ? '#007bff' : 'white',
              color: filter === status ? 'white' : '#333',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="message info">
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/customer/new-order" className="btn btn-primary">
            Create Your First Order
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3>
                    <Link 
                      to={`/customer/orders/${order._id}`}
                      style={{ textDecoration: 'none', color: '#333' }}
                    >
                      {order.title}
                    </Link>
                  </h3>
                  
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Category:</strong> {order.category} | 
                    <strong> Created:</strong> {formatDate(order.createdAt)}
                  </p>
                  
                  <p style={{ margin: '10px 0' }}>
                    {order.description && order.description.length > 100 
                      ? `${order.description.substring(0, 100)}...` 
                      : order.description
                    }
                  </p>
                  
                  {order.budget && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Budget:</strong> ${order.budget.min} - ${order.budget.max}
                    </p>
                  )}

                  {order.estimates && order.estimates.length > 0 && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Estimates:</strong> {order.estimates.length} received
                    </p>
                  )}

                  {order.tailor && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Assigned Tailor:</strong> {order.tailor.name} 
                      {order.tailor.shopName && ` (${order.tailor.shopName})`}
                    </p>
                  )}
                </div>
                
                <div style={{ textAlign: 'right', marginLeft: '20px' }}>
                  <span 
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: getStatusColor(order.status),
                      color: 'white',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      display: 'inline-block',
                      marginBottom: '10px'
                    }}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                  
                  <div>
                    <Link 
                      to={`/customer/orders/${order._id}`}
                      className="btn btn-sm"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;