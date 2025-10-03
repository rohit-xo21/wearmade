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
            await api.post('/payments/verify', {
              paymentId: paymentData.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            alert('Payment successful!');
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

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="message error">Order not found</div>;

  // Check if order can be paid
  if (order.status !== 'accepted') {
    return (
      <div className="container">
        <div className="message error">
          <h2>Payment Not Available</h2>
          <p>Payment can only be made after the order has been accepted by a tailor.</p>
          <p>Current order status: <strong>{order.status}</strong></p>
        </div>
      </div>
    );
  }

  const paymentAmount = order.finalPrice;

  return (
    <div className="container">
      <h1>Payment</h1>
      
      <div className="card">
        <h2>Order Summary</h2>
        <p><strong>Order:</strong> {order.title}</p>
        <p><strong>Tailor:</strong> {order.tailor?.name}</p>
        <p><strong>Amount:</strong> ₹{paymentAmount}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Tailor:</strong> {order.tailor?.name || 'Not assigned'}</p>
      </div>

      <div className="card">
        <h3>Payment Details</h3>
        <p>Amount to pay: <strong>₹{paymentAmount}</strong></p>
        
        <button 
          onClick={handlePayment}
          className="btn btn-primary"
          disabled={processing || !paymentAmount}
        >
          {processing ? 'Processing...' : `Pay ₹${paymentAmount}`}
        </button>

        {!paymentAmount && (
          <div className="message error">
            <p>No payment amount found. Please ensure the order has been accepted with a final price.</p>
          </div>
        )}
      </div>

      <div className="message info">
        <p>Payment is processed securely through Razorpay.</p>
        <p>You will receive a confirmation email after successful payment.</p>
      </div>
    </div>
  );
};

export default PaymentPage;
