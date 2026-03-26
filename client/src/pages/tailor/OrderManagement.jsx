import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';

const OrderManagement = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10
  });

  // Get status from URL params, default to 'accepted,in_progress'
  const statusFilter = searchParams.get('status') || 'accepted,in_progress';

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get(`/orders?status=${statusFilter}&page=${currentPage}&limit=10`);
      const data = response.data.data;
      
      if (data.docs) {
        setOrders(data.docs);
        setPagination({
          totalDocs: data.totalDocs,
          totalPages: data.totalPages,
          page: data.page,
          limit: data.limit
        });
      } else {
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
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            {statusFilter === 'completed' ? 'Completed Orders' : 'Order Management'}
          </h1>
          <p className="text-gray-600">
            {statusFilter === 'completed' ? 'Review your delivered work' : 'Manage active assigned orders'}
          </p>
        </div>
        <Link 
          to="/tailor/dashboard" 
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {orders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{order.title}</h3>
                    <p className="text-gray-600">Customer: {order.customer?.name}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-medium text-gray-900">
                      {order.finalPrice != null ? `₹${order.finalPrice}` : 'Not final yet'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="font-medium text-gray-900 capitalize">{order.category?.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Delivery By</div>
                    <div className="font-medium text-gray-900">
                      {order.preferredDeliveryDate ? new Date(order.preferredDeliveryDate).toLocaleDateString() : 'Not specified'}
                    </div>
                  </div>
                </div>

                {/* Order Details Link */}
                <div className="mt-6">
                  <Link 
                    to={`/tailor/orders/${order._id}`}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-center block"
                  >
                    View Details →
                  </Link>
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
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === 'completed' ? 'No Completed Orders' : 'No Active Orders'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {statusFilter === 'completed' 
                ? 'Completed orders will appear here to showcase your finished work and craftsmanship.'
                : 'Orders appear here after customers accept your estimate and payment is confirmed.'
              }
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <p>✓ Open each order for full progress and communication tools</p>
              <p>✓ Keep updates centralized in the order details page</p>
              <p>✓ Maintain cleaner workflow for assigned jobs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
