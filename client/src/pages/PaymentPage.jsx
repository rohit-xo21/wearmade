import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const PaymentPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    fetchOrder();
    loadRazorpayScript();
  }, [id]);

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
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Create payment order
      const orderResponse = await api.post('/payments/create-order', {
        orderId: id,
        amount: order.finalPrice || order.estimates[0]?.price
      });

      const options = {
        key: 'rzp_test_key', // Replace with your Razorpay key
        amount: orderResponse.data.order.amount,
        currency: 'INR',
        name: 'WearMade',
        description: `Payment for Order: ${order.title}`,
        order_id: orderResponse.data.order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            alert('Payment successful!');
            window.location.href = '/customer/orders';
          } catch (error) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: order.customer?.name,
          email: order.customer?.email,
          contact: order.customer?.phone
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment initiation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="message error">Order not found</div>;

  const paymentAmount = order.finalPrice || order.estimates[0]?.price;

  return (
    <div className="container">
      <h1>Payment</h1>
      
      <div className="card">
        <h2>Order Summary</h2>
        <p><strong>Order:</strong> {order.title}</p>
        <p><strong>Tailor:</strong> {order.tailor?.name}</p>
        <p><strong>Amount:</strong> ${paymentAmount}</p>
        <p><strong>Delivery Time:</strong> {order.estimates[0]?.deliveryTime} days</p>
      </div>

      <div className="card">
        <h3>Payment Details</h3>
        <p>Amount to pay: <strong>${paymentAmount}</strong></p>
        
        <button 
          onClick={handlePayment}
          className="btn btn-primary"
          disabled={processing || !paymentAmount}
        >
          {processing ? 'Processing...' : `Pay $${paymentAmount}`}
        </button>
      </div>

      <div className="message info">
        <p>Payment is processed securely through Razorpay.</p>
        <p>You will receive a confirmation email after successful payment.</p>
      </div>
    </div>
  );
};

export default PaymentPage;
