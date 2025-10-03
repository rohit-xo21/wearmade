import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../../lib/socket';
import api from '../../api/axios';

const ChatWindow = ({ orderId, onClose }) => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, [orderId]);

  useEffect(() => {
    if (!chat?._id) return;
    const socket = getSocket();

    socket.emit('chat:join', { chatId: chat._id });

    socket.on('chat:message', ({ chatId, message }) => {
      if (chatId !== chat._id) return;
      setChat(prev => ({ ...prev, messages: [...prev.messages, message] }));
    });

    return () => {};
  }, [chat?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    try {
      const response = await api.get(`/chat/order/${orderId}`);
      setChat(response.data.data);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const socket = getSocket();
      socket.emit('chat:message', { chatId: chat._id, message: message.trim() });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h3>Loading chat...</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h3>Chat not found</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
      </div>
    );
  }

  const chatDisabled = chat && (chat.isActive === false);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <h3>Chat for Order</h3>
          <p>Customer: {chat.customer.name} | Tailor: {chat.tailor.name}</p>
          {chatDisabled && (
            <p style={{ color: '#b00', fontSize: '12px' }}>
              Chat is closed for this order.
            </p>
          )}
        </div>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      
      <div className="chat-messages">
        {chat.messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.sender._id === chat.customer._id ? 'customer' : 'tailor'}`}
          >
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">{msg.sender.name}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-text">{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending || chatDisabled}
        />
        <button type="submit" disabled={sending || !message.trim() || chatDisabled}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
