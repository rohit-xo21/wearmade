import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';

const RequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/orders?status=pending');
      setRequests(response.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Order Requests</h1>
      
      <SimpleTable
        headers={['Title', 'Category', 'Customer', 'Budget', 'Deadline', 'Actions']}
        data={requests.map(request => ({
          title: request.title,
          category: request.category,
          customer: request.customer?.name,
          budget: request.budget ? `$${request.budget.min}-${request.budget.max}` : 'Not specified',
          deadline: request.preferredDeliveryDate ? new Date(request.preferredDeliveryDate).toLocaleDateString() : 'Not specified',
          actions: request._id
        }))}
        onRowClick={(row) => window.location.href = `/tailor/requests/${row.actions}`}
      />

      {requests.length === 0 && (
        <div className="message info">No new requests available</div>
      )}
    </div>
  );
};

export default RequestsList;
