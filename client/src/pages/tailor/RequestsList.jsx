import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';
import Pagination from '../../components/Pagination';

const RequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10
  });

  const fetchRequests = useCallback(async () => {
    try {
      const response = await api.get(`/orders?status=pending&page=${currentPage}&limit=10`);
      const data = response.data.data;
      
      if (data.docs) {
        setRequests(data.docs);
        setPagination({
          totalDocs: data.totalDocs,
          totalPages: data.totalPages,
          page: data.page,
          limit: data.limit
        });
      } else {
        setRequests(data || []);
        setPagination({
          totalDocs: data?.length || 0,
          totalPages: 1,
          page: 1,
          limit: 10
        });
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Order Requests</h1>
        <p className="text-gray-600">Review and respond to customer orders</p>
      </div>
      
      {requests.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map(request => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{request.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{request.customer?.name}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{request.category}</td>
                    <td className="px-6 py-4 text-gray-600">
                      ${request.budget?.min} - ${request.budget?.max}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/tailor/requests/${request._id}`}
                        className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalDocs}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Order Requests Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              When customers create new orders, they will appear here for you to review and submit estimates.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <p>✓ Review order details and requirements</p>
              <p>✓ Submit competitive estimates</p>
              <p>✓ Get notified when customers accept your estimates</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsList;
