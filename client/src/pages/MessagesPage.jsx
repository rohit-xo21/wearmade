import { useEffect, useState, useRef } from 'react';
import { getSocket } from '../lib/socket';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const MessagesPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    
    // Emit event to update navbar badge when visiting messages page
    const socket = getSocket();
    socket.emit('chat:messagesPageVisited', { userId: user?.id });
  }, [user?.id]);

  useEffect(() => {
    const socket = getSocket();
    
    // Listen for new messages
    socket.on('chat:message', (data) => {
      console.log('Received new message:', data);
      fetchChats(false);
      
      // Update active chat if it's the same chat
      if (activeChat && data.chatId === activeChat._id) {
        // Only add message to UI if it's from someone else (avoid duplicating our own messages)
        if (data.senderId !== user.id) {
          setActiveChat(prev => ({
            ...prev,
            messages: [...(prev.messages || []), data.message]
          }));
          // Scroll to bottom when receiving new message
          setTimeout(scrollToBottom, 100);
        }
      }
    });
    
    // Listen for general chat notifications
    socket.on('chat:notify', () => {
      fetchChats(false);
    });
    
    return () => {
      socket.off('chat:message');
      socket.off('chat:notify');
    };
  }, [activeChat, user.id]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (activeChat?.messages?.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [activeChat?.messages?.length]);

  const fetchChats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/chat');
      console.log('Fetched chats:', res.data);
      const chatData = res.data.data.docs || res.data.data || [];
      console.log('Chat data:', chatData);
      setChats(chatData);
    } catch (e) {
      console.error('Failed to load chats', e);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (chat) => {
    try {
      // Get the latest chat data with all messages
      const response = await api.get(`/chat/order/${chat.order._id}`);
      const fullChat = response.data.data;
      
      setActiveChat(fullChat);
      
      // Join the socket room for this chat
      const socket = getSocket();
      socket.emit('chat:join', { chatId: chat._id });
      
      // Mark messages as read when opening chat
      try {
        await api.put(`/chat/${chat._id}/read`);
        // Refresh chats to update unread indicators
        fetchChats(false);
        
        // Emit event to update navbar badge
        socket.emit('chat:messagesRead', { userId: user.id });
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
      
    } catch (error) {
      console.error('Failed to open chat:', error);
      setActiveChat(chat); // Fallback to the basic chat data
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasUnreadMessages = (chat) => {
    if (!chat.messages || !user) return false;
    return chat.messages.some(msg => 
      msg.sender._id !== user.id && !msg.isRead
    );
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;
    
    try {
      // Send message via HTTP API instead of socket for reliability
      const response = await api.post(`/chat/${activeChat._id}/message`, {
        message: message.trim()
      });
      
      setMessage('');
      
      // Get the new message from response and update activeChat immediately
      const newMessage = response.data.data;
      setActiveChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      }));
      
      // Scroll to bottom after adding message
      setTimeout(scrollToBottom, 100);
      
      // Also refresh the chat list to show latest activity
      fetchChats(false);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Messages</h1>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
          <div className="card" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <h3>Your conversations</h3>
            {chats.length === 0 && <div className="message info">No conversations yet.</div>}
            {chats.map(chat => (
              <div 
                key={chat._id} 
                onClick={() => openChat(chat)}
                style={{ 
                  borderBottom: '1px solid #eee', 
                  padding: '10px', 
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: hasUnreadMessages(chat) ? '#f8f9ff' : 'transparent'
                }}
              >
                <div style={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {chat.order?.title || 'Order'}
                  {hasUnreadMessages(chat) && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ff4444',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}></span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {chat.customer?.name} ↔ {chat.tailor?.name}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            {!activeChat ? (
              <div className="message info">Select a conversation</div>
            ) : (
              <>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px', flexShrink: 0 }}>
                  <h3>{activeChat.order?.title || 'Order Chat'}</h3>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {activeChat.customer?.name} ↔ {activeChat.tailor?.name}
                  </div>
                </div>
                <div 
                  id="messages-container"
                  style={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    maxHeight: 'calc(70vh - 140px)',
                    minHeight: '300px',
                    paddingRight: '8px'
                  }}
                >
                  {(activeChat.messages || []).length === 0 ? (
                    <div className="message info">No messages yet. Start the conversation!</div>
                  ) : (
                    (activeChat.messages || []).map((m, i) => (
                      <div key={m._id || i} style={{ 
                        margin: '8px 0', 
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                      }}>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{m.sender?.name || 'Unknown'}</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ marginTop: '4px' }}>{m.message}</div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #eee',
                  flexShrink: 0
                }}>
                  <input 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..." 
                    style={{ flex: 1, padding: '8px' }}
                    disabled={!activeChat?.isActive}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={sendMessage}
                    disabled={!message.trim() || !activeChat?.isActive}
                  >
                    Send
                  </button>
                </div>
                {activeChat && !activeChat.isActive && (
                  <div className="message info" style={{ marginTop: '8px' }}>
                    <small>This chat is no longer active.</small>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
