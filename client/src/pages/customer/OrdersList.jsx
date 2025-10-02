import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>My Orders</h1>
      
      <div style={{ margin: '20px 0' }}>
        <Link to="/customer/orders/new" className="btn btn-primary">
          Create New Order
        </Link>
      </div>

      <SimpleTable
        headers={['Title', 'Category', 'Status', 'Budget', 'Created', 'Actions']}
        data={orders.map(order => ({
          title: order.title,
          category: order.category,
          status: order.status,
          budget: `$${order.budget?.min}-${order.budget?.max}`,
          created: new Date(order.createdAt).toLocaleDateString(),
          actions: order._id
        }))}
        onRowClick={(row) => window.location.href = `/customer/orders/${row.actions}`}
      />
    </div>
  );
};

export default OrdersList;
