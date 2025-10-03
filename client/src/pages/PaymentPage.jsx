import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const PaymentPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadRazorpayScript = () => {
      // Check if script is already loaded
      if (window.Razorpay) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
      };
      document.body.appendChild(script);
    };

    fetchOrder();
    loadRazorpayScript();
  }, [id]);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      console.log('Initiating payment for order:', id);
      console.log('Order details:', order);
      
      // Create payment order
      const orderResponse = await api.post('/payments/create-order', {
        orderId: id
      });

      console.log('Full payment response:', orderResponse.data);
      const paymentData = orderResponse.data.data;
      console.log('Payment data received:', paymentData);

      const options = {
        key: paymentData.key, // Use key from backend response
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'WearMade',
        description: `Payment for Order: ${order.title}`,
        order_id: paymentData.razorpayOrderId,
        handler: async (response) => {
          try {
            // Verify payment
            await api.post('/payments/verify', {
              paymentId: paymentData.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            // Create chat after successful payment
            try {
              await api.post('/chat/create', {
                orderId: id
              });
            } catch (chatError) {
              console.error('Failed to create chat:', chatError);
              // Don't fail the payment flow if chat creation fails
            }
            
            alert('Payment successful! Work will begin shortly and you can now chat with your tailor.');
            window.location.href = '/customer/orders';
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: order.customer?.name,
          email: order.customer?.email,
          contact: order.customer?.phone
        }
      };

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        alert('Razorpay SDK not loaded. Please refresh the page and try again.');
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment initiation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Check if order can be paid
  if (order.status !== 'accepted') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-red-900 mb-2">Payment Not Available</h2>
          <p className="text-red-700 mb-4">Payment can only be made after the order has been accepted by a tailor.</p>
          <p className="text-red-600">
            Current order status: <span className="font-medium capitalize">{order.status.replace('_', ' ')}</span>
          </p>
        </div>
      </div>
    );
  }

  const paymentAmount = order.finalPrice;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Payment</h1>
        <p className="text-gray-600">Complete your order payment</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Order</span>
            <span className="font-medium">{order.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tailor</span>
            <span className="font-medium">{order.tailor?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Amount</span>
              <span className="text-2xl font-medium text-gray-900">₹{paymentAmount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Details</h3>
        <div className="mb-6">
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-600">Amount to pay:</span>
            <span className="font-medium text-gray-900">₹{paymentAmount}</span>
          </div>
        </div>
        
        <button 
          onClick={handlePayment}
          className="w-full bg-gray-900 text-white py-4 px-6 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={processing || !paymentAmount}
        >
          {processing ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            `Pay ₹${paymentAmount}`
          )}
        </button>

        {!paymentAmount && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">No payment amount found. Please ensure the order has been accepted with a final price.</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-800 font-medium mb-1">Secure Payment</p>
            <p className="text-blue-700 text-sm">Payment is processed securely through Razorpay. You will receive a confirmation email after successful payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
