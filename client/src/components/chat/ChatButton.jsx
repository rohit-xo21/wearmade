import { useState } from 'react';
import api from '../../api/axios';
import ChatWindow from './ChatWindow';

const ChatButton = ({ orderId, orderTitle }) => {
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChatClick = async () => {
    setLoading(true);
    try {
      // Create or get chat for this order
      await api.post('/chat', { orderId });
      setShowChat(true);
    } catch (error) {
      console.error('Failed to create/get chat:', error);
      alert('Failed to open chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleChatClick}
        disabled={loading}
        className="btn btn-primary"
        style={{ marginTop: '10px' }}
      >
        {loading ? 'Opening Chat...' : '💬 Chat with ' + (orderTitle || 'Partner')}
      </button>
      
      {showChat && (
        <div className="chat-overlay">
          <ChatWindow 
            orderId={orderId} 
            onClose={() => setShowChat(false)} 
          />
        </div>
      )}
    </>
  );
};

export default ChatButton;
