import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'

// Layout Components
import Layout from './components/layout/Layout.jsx'

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard.jsx'
import NewOrderPage from './pages/customer/NewOrder.jsx'
import OrdersPage from './pages/customer/Orders.jsx'
import OrderDetailsPage from './pages/customer/OrderDetails.jsx'

// Tailor Pages
import TailorDashboard from './pages/tailor/Dashboard.jsx'
import TailorProfile from './pages/tailor/Profile.jsx'
import RequestsPage from './pages/tailor/Requests.jsx'
import EstimatePage from './pages/tailor/Estimate.jsx'

// Public Pages
import LandingPage from './pages/LandingPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<Layout />}>
        {/* Customer Routes */}
        {user?.role === 'customer' && (
          <>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/order/new" element={<NewOrderPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
          </>
        )}

        {/* Tailor Routes */}
        {user?.role === 'tailor' && (
          <>
            <Route path="/dashboard" element={<TailorDashboard />} />
            <Route path="/profile" element={<TailorProfile />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/estimate/:orderId" element={<EstimatePage />} />
          </>
        )}

        {/* Fallback */}
        <Route path="/dashboard" element={
          user ? (
            user.role === 'customer' ? <CustomerDashboard /> : <TailorDashboard />
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App