import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';
import Pagination from '../../components/Pagination';

const TailorDashboard = () => {
  const [, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPagination, setRequestsPagination] = useState({
    totalDocs: 0,
    totalPages: 1
  });

  const fetchData = useCallback(async () => {
    try {
      const [userRes, ordersRes, requestsRes, completedRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/orders?status=accepted,in_progress'),
        api.get(`/orders?status=pending&limit=10&page=${requestsPage}`),
        api.get('/orders?status=completed')
      ]);
      
      setUser(userRes.data.data);
      setOrders(ordersRes.data.data.docs || []);
      
      // Handle paginated requests
      const requestsData = requestsRes.data.data;
      if (requestsData.docs) {
        setRequests(requestsData.docs);
        setRequestsPagination({
          totalDocs: requestsData.totalDocs,
          totalPages: requestsData.totalPages
        });
      } else {
        setRequests(requestsData || []);
      }
      
      setCompletedOrders(completedRes.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [requestsPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestsPageChange = (page) => {
    setRequestsPage(page);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Manage your orders and showcase your craftsmanship</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-3xl font-light text-blue-600 mb-2">{requests.length}</div>
                <div className="text-gray-600 font-medium">New Requests</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-3xl font-light text-orange-600 mb-2">
                  {orders.filter(o => o.status === 'in_progress').length}
                </div>
                <div className="text-gray-600 font-medium">Active Orders</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-3xl font-light text-green-600 mb-2">
                  {completedOrders.length}
                </div>
                <div className="text-gray-600 font-medium">Completed Orders</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                to="/tailor/requests" 
                className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors text-center cursor-pointer"
              >
                View Requests
              </Link>
              <Link 
                to="/tailor/orders" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:border-gray-900 hover:text-gray-900 transition-colors text-center cursor-pointer"
              >
                Manage Orders
              </Link>
              <Link 
                to="/tailor/portfolio" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:border-gray-900 hover:text-gray-900 transition-colors text-center cursor-pointer"
              >
                Manage Portfolio
              </Link>
            </div>

            {/* Active Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light text-gray-900">Active Orders</h2>
                  <Link 
                    to="/tailor/orders" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
                  <p className="text-gray-600">New orders will appear here once accepted</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Price</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4 text-sm font-medium text-gray-900">{order.title}</td>
                          <td className="px-8 py-4 text-sm text-gray-600">{order.customer?.name}</td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-sm text-gray-600">${order.finalPrice || 'TBD'}</td>
                          <td className="px-8 py-4">
                            <Link 
                              to={`/tailor/orders/${order._id}`}
                              className="text-gray-900 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light text-gray-900">Recent Requests</h2>
                  <Link 
                    to="/tailor/requests" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              
              {requests.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600">New requests will appear here for you to review</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Budget</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Deadline</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.slice(0, 5).map((request, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4 text-sm font-medium text-gray-900">{request.title}</td>
                          <td className="px-8 py-4 text-sm text-gray-600 capitalize">{request.category}</td>
                          <td className="px-8 py-4 text-sm text-gray-600">
                            ${request.budget?.min}-${request.budget?.max}
                          </td>
                          <td className="px-8 py-4 text-sm text-gray-600">
                            {new Date(request.deadline).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4">
                            <Link 
                              to={`/tailor/requests/${request._id}`}
                              className="text-gray-900 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination for Requests */}
              {requestsPagination.totalPages > 1 && (
                <Pagination
                  currentPage={requestsPage}
                  totalPages={requestsPagination.totalPages}
                  totalItems={requestsPagination.totalDocs}
                  itemsPerPage={10}
                  onPageChange={handleRequestsPageChange}
                />
              )}
            </div>

            {/* Completed Works */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light text-gray-900">Completed Works</h2>
                  <Link 
                    to="/tailor/orders?status=completed" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              
              {completedOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed works yet</h3>
                  <p className="text-gray-600">Completed orders will appear here to showcase your craftsmanship</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Final Price</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Rating</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {completedOrders.slice(0, 5).map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4 text-sm font-medium text-gray-900">{order.title}</td>
                          <td className="px-8 py-4 text-sm text-gray-600">{order.customer?.name}</td>
                          <td className="px-8 py-4 text-sm text-gray-600 capitalize">{order.category}</td>
                          <td className="px-8 py-4 text-sm text-gray-600">${order.finalPrice || 'N/A'}</td>
                          <td className="px-8 py-4 text-sm text-gray-600">
                            {new Date(order.completedAt || order.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4">
                            {order.review?.rating ? (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm text-gray-600">{order.review.rating}/5</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No rating</span>
                            )}
                          </td>
                          <td className="px-8 py-4">
                            <Link 
                              to={`/tailor/orders/${order._id}`}
                              className="text-gray-900 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TailorDashboard;
