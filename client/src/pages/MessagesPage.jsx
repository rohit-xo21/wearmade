import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageCircle, Send, Users } from 'lucide-react';
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

  const fetchChats = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/chat');
      console.log('Fetched chats:', res.data);
      const chatData = res.data.data.docs || res.data.data || [];
      console.log('Chat data:', chatData);
      setChats(chatData);
      
      // Update active chat if it exists in the new data
      setActiveChat(prevActiveChat => {
        if (prevActiveChat) {
          const updatedActiveChat = chatData.find(chat => chat._id === prevActiveChat._id);
          return updatedActiveChat || prevActiveChat;
        }
        return prevActiveChat;
      });
    } catch (e) {
      console.error('Failed to load chats', e);
      // Don't clear chats on error, keep existing data
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []); // Remove activeChat dependency

  useEffect(() => {
    fetchChats();
    
    // Emit event to update navbar badge when visiting messages page
    const socket = getSocket();
    if (user?.id) {
      socket.emit('chat:messagesPageVisited', { userId: user.id });
    }
  }, [user?.id, fetchChats]);

  useEffect(() => {
    const socket = getSocket();
    
    const handleNewMessage = (data) => {
      console.log('Received new message:', data);
      fetchChats(false);
      
      // Update active chat if it's the same chat
      setActiveChat(prevActiveChat => {
        if (prevActiveChat && data.chatId === prevActiveChat._id) {
          // Only add message to UI if it's from someone else (avoid duplicating our own messages)
          if (data.senderId !== user.id) {
            setTimeout(scrollToBottom, 100);
            return {
              ...prevActiveChat,
              messages: [...(prevActiveChat.messages || []), data.message]
            };
          }
        }
        return prevActiveChat;
      });
    };
    
    const handleChatNotify = () => {
      fetchChats(false);
    };
    
    // Listen for new messages
    socket.on('chat:message', handleNewMessage);
    
    // Listen for general chat notifications
    socket.on('chat:notify', handleChatNotify);
    
    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:notify', handleChatNotify);
    };
  }, [user.id, fetchChats]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (activeChat?.messages?.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [activeChat?.messages?.length]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Stay connected with your tailors and clients</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
                <button
                  onClick={() => fetchChats(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh conversations"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto h-full">
                {chats.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  chats.map(chat => (
                    <div 
                      key={chat._id} 
                      onClick={() => openChat(chat)}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                        hasUnreadMessages(chat) ? 'bg-blue-50/50' : ''
                      } ${activeChat?._id === chat._id ? 'bg-gray-100' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {chat.order?.title || 'Order'}
                        </h3>
                        {hasUnreadMessages(chat) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {chat.customer?.name} ↔ {chat.tailor?.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              {!activeChat ? (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      {activeChat.order?.title || 'Order Chat'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {activeChat.customer?.name} ↔ {activeChat.tailor?.name}
                    </p>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {(activeChat.messages || []).length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      (activeChat.messages || []).map((m, i) => {
                        const isCurrentUser = m.sender._id === user?._id || m.sender._id === user?.id;
                        return (
                          <div key={m._id || i} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <span className={`text-xs font-medium ${
                                  isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {m.sender?.name || 'Unknown'}
                                </span>
                                <span className={`text-xs ${
                                  isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm">{m.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex gap-3">
                      <input 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Type your message..." 
                        className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        disabled={!activeChat?.isActive}
                      />
                      <button 
                        onClick={sendMessage}
                        disabled={!message.trim() || !activeChat?.isActive}
                        className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={18} />
                        Send
                      </button>
                    </div>
                    
                    {activeChat && !activeChat.isActive && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">This chat is no longer active.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
