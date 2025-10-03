import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';

const CustomerDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, ordersRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/orders')
      ]);
      
      setUser(userRes.data.data);
      setOrders(ordersRes.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Customer Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{orders.filter(o => o.status === 'pending').length}</div>
          <div className="stat-label">Pending Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{orders.filter(o => o.status === 'completed').length}</div>
          <div className="stat-label">Completed Orders</div>
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <Link to="/customer/orders/new" className="btn btn-primary">
          Create New Order
        </Link>
        <Link to="/customer/tailors" className="btn">
          Browse Tailors
        </Link>
      </div>

      <h2>Recent Orders</h2>
      <SimpleTable
        headers={['Title', 'Category', 'Status', 'Created']}
        data={orders.slice(0, 5).map(order => ({
          title: order.title,
          category: order.category,
          status: order.status,
          created: new Date(order.createdAt).toLocaleDateString()
        }))}
      />

      <div style={{ marginTop: '20px' }}>
        <Link to="/customer/orders">View All Orders</Link>
      </div>
    </div>
  );
};

export default CustomerDashboard;
