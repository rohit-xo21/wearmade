import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SimpleTable from '../../components/SimpleTable';
import Pagination from '../../components/Pagination';

const CustomerDashboard = () => {
  const [, setUser] = useState(null);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Manage your orders and connect with talented tailors</p>
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
                <div className="text-3xl font-light text-gray-900 mb-2">{orders.length}</div>
                <div className="text-gray-600 font-medium">Total Orders</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-3xl font-light text-orange-600 mb-2">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-gray-600 font-medium">Pending Orders</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-3xl font-light text-green-600 mb-2">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
                <div className="text-gray-600 font-medium">Completed Orders</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                to="/customer/orders/new" 
                className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors text-center"
              >
                Create New Order
              </Link>
              <Link 
                to="/customer/tailors" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:border-gray-900 hover:text-gray-900 transition-colors text-center"
              >
                Browse Tailors
              </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light text-gray-900">Recent Orders</h2>
                  <Link 
                    to="/customer/orders" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">Create your first custom order to get started</p>
                  <Link 
                    to="/customer/orders/new" 
                    className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Create Order
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4 text-sm font-medium text-gray-900">{order.title}</td>
                          <td className="px-8 py-4 text-sm text-gray-600 capitalize">{order.category}</td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4">
                            <Link 
                              to={`/customer/orders/${order._id}`}
                              className="text-gray-900 hover:text-gray-700 font-medium transition-colors"
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

export default CustomerDashboard;
