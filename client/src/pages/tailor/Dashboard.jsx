import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';

const TailorDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, ordersRes, requestsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/orders'),
        api.get('/orders?status=pending')
      ]);
      
      setUser(userRes.data.data);
      setOrders(ordersRes.data.data.docs || []);
      setRequests(requestsRes.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Tailor Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{requests.length}</div>
          <div className="stat-label">New Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{orders.filter(o => o.status === 'active').length}</div>
          <div className="stat-label">Active Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{orders.filter(o => o.status === 'completed').length}</div>
          <div className="stat-label">Completed Orders</div>
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <Link to="/tailor/requests" className="btn btn-primary">
          View Requests
        </Link>
        <Link to="/tailor/portfolio" className="btn">
          Manage Portfolio
        </Link>
      </div>

      <h2>Recent Requests</h2>
      <SimpleTable
        headers={['Title', 'Category', 'Budget', 'Deadline']}
        data={requests.slice(0, 5).map(request => ({
          title: request.title,
          category: request.category,
          budget: `$${request.budget?.min}-${request.budget?.max}`,
          deadline: new Date(request.deadline).toLocaleDateString()
        }))}
      />

      <div style={{ marginTop: '20px' }}>
        <Link to="/tailor/requests">View All Requests</Link>
      </div>
    </div>
  );
};

export default TailorDashboard;
