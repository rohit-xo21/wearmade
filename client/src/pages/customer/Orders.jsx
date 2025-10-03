import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10
  });

  const fetchOrders = useCallback(async () => {
    try {
      let url = `/orders?page=${currentPage}&limit=10`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      const response = await api.get(url);
      const data = response.data.data;
      
      if (data.docs) {
        // Paginated response
        setOrders(data.docs);
        setPagination({
          totalDocs: data.totalDocs,
          totalPages: data.totalPages,
          page: data.page,
          limit: data.limit
        });
      } else {
        // Non-paginated response (fallback)
        setOrders(data || []);
        setPagination({
          totalDocs: data?.length || 0,
          totalPages: 1,
          page: 1,
          limit: 10
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [filter, currentPage, fetchOrders]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };



  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your custom orders</p>
          </div>
          
          <Link 
            to="/customer/new-order"
            className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Create New Order
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'quoted', 'accepted', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  filter === status 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <Link 
              to="/customer/new-order"
              className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Create Your First Order
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 lg:pr-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-medium text-gray-900 mb-2">
                            <Link 
                              to={`/customer/orders/${order._id}`}
                              className="hover:text-gray-700 transition-colors"
                            >
                              {order.title}
                            </Link>
                          </h3>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="capitalize">{order.category}</span>
                            <span>•</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'quoted' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {order.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {order.description.length > 150 
                            ? `${order.description.substring(0, 150)}...` 
                            : order.description
                          }
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        {order.budget && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Budget:</span>
                            <span className="font-medium">${order.budget.min} - ${order.budget.max}</span>
                          </div>
                        )}

                        {order.estimates && order.estimates.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Estimates:</span>
                            <span className="font-medium">{order.estimates.length} received</span>
                          </div>
                        )}

                        {order.tailor && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Tailor:</span>
                            <span className="font-medium">
                              {order.tailor.name}
                              {order.tailor.shopName && ` (${order.tailor.shopName})`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <Link 
                        to={`/customer/orders/${order._id}`}
                        className="block w-full lg:w-auto text-center bg-gray-100 text-gray-700 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalDocs}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;