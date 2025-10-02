import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import AuthSuccess from './pages/auth/AuthSuccess';
import AuthError from './pages/auth/AuthError';
import CustomerDashboard from './pages/customer/Dashboard';
import NewOrder from './pages/customer/NewOrder';
import Orders from './pages/customer/Orders';
import OrderDetails from './pages/customer/OrderDetails';
import TailorsList from './pages/customer/TailorsList';
import TailorDashboard from './pages/tailor/Dashboard';
import RequestsList from './pages/tailor/RequestsList';
import RequestDetails from './pages/tailor/RequestDetails';
import Portfolio from './pages/tailor/Portfolio';
import PaymentPage from './pages/PaymentPage';
import MessagesPage from './pages/MessagesPage';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/error" element={<AuthError />} />

        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders/new" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <NewOrder />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders/:id" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OrderDetails />
          </ProtectedRoute>
        } />
        <Route path="/customer/tailors" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <TailorsList />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders/:id/payment" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <PaymentPage />
          </ProtectedRoute>
        } />

        {/* Tailor Routes */}
        <Route path="/tailor/dashboard" element={
          <ProtectedRoute allowedRoles={['tailor']}>
            <TailorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/tailor/requests" element={
          <ProtectedRoute allowedRoles={['tailor']}>
            <RequestsList />
          </ProtectedRoute>
        } />
        <Route path="/tailor/requests/:id" element={
          <ProtectedRoute allowedRoles={['tailor']}>
            <RequestDetails />
          </ProtectedRoute>
        } />
        <Route path="/tailor/portfolio" element={
          <ProtectedRoute allowedRoles={['tailor']}>
            <Portfolio />
          </ProtectedRoute>
        } />

        {/* Shared Routes */}
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App