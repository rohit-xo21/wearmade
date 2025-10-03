import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
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
import OrderManagement from './pages/tailor/OrderManagement';
import TailorOrderDetails from './pages/tailor/OrderDetails';
import Portfolio from './pages/tailor/Portfolio';
import TailorPortfolio from './pages/TailorPortfolio';
import ExplorePage from './pages/ExplorePage';
import PaymentPage from './pages/PaymentPage';
import MessagesPage from './pages/MessagesPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  const location = useLocation();
  const hideFooterRoutes = [
    '/messages',
    '/login',
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth/success',
    '/auth/error'
  ];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
          <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
          <Route path="/reset-password/:token" element={<AuthRedirect><ResetPasswordPage /></AuthRedirect>} />
          <Route path="/verify-email/:token" element={<AuthRedirect><VerifyEmailPage /></AuthRedirect>} />
          <Route path="/auth/success" element={<AuthRedirect><AuthSuccess /></AuthRedirect>} />
          <Route path="/auth/error" element={<AuthRedirect><AuthError /></AuthRedirect>} />

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

          {/* Public Routes */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/tailor/:id/portfolio" element={<TailorPortfolio />} />

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
          <Route path="/tailor/orders" element={
            <ProtectedRoute allowedRoles={['tailor']}>
              <OrderManagement />
            </ProtectedRoute>
          } />
          <Route path="/tailor/orders/:id" element={
            <ProtectedRoute allowedRoles={['tailor']}>
              <TailorOrderDetails />
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default App