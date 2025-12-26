'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const { user, logout, hasHydrated, isAuthenticated, refreshUser } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [capabilities, setCapabilities] = useState<any>(null);
  const [examples, setExamples] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingComplaintsCount, setPendingComplaintsCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const quickActions = [
    { icon: '⚡', label: 'Energy Status', query: "Show me current energy consumption and production" },
    { icon: '💡', label: 'Light Control', query: "Control lights in lobby" },
    { icon: '🔧', label: 'Report Issue', query: "I want to report an electrical failure" },
    { icon: '📊', label: 'Analytics', query: "Show energy analytics for today" },
    { icon: '🔋', label: 'Battery', query: "What's the battery status?" },
    { icon: '☀️', label: 'Solar', query: "Show solar production" },
  ];

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    if (!hasHydrated) {
      return;
    }

    if (!user || !isAuthenticated) {
      router.push('/login');
      return;
    }

    console.log('=== CHAT PAGE - USER DATA ===');
    console.log('User object in chat page:', JSON.stringify(user, null, 2));
    console.log('User full_name:', user?.full_name);
    console.log('User role:', user?.role);

    loadCapabilities();
    loadExamples();
    loadComplaintNotifications();

    // Check if saved user ID matches current user
    const savedUserId = localStorage.getItem('chatUserId');
    const currentUserId = user?.uid;

    // Load messages and session from localStorage only if same user
    const savedMessages = localStorage.getItem('chatMessages');
    const savedSessionId = localStorage.getItem('chatSessionId');

    if (savedMessages && savedSessionId && savedUserId === currentUserId) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        setSessionId(savedSessionId);
      } catch (error) {
        console.error('Failed to load saved messages:', error);
        // If parsing fails, show welcome message
        const welcomeMessage: Message = {
          role: 'assistant',
          content: `Welcome back, ${user?.full_name || 'User'}.\n\nI'm your AI-powered energy management assistant. I can help you control lighting systems, monitor energy consumption, manage complaints, and provide detailed analytics.\n\nWhat would you like to know?`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
        localStorage.setItem('chatUserId', currentUserId || '');
      }
    } else {
      // Different user or no saved messages, clear old data and show welcome message
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('chatSessionId');
      localStorage.setItem('chatUserId', currentUserId || '');

      console.log('Chat Page - Creating welcome message for user:', {
        full_name: user?.full_name,
        role: user?.role,
        email: user?.email,
        uid: user?.uid
      });

      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Welcome back, ${user?.full_name || 'User'}.\n\nI'm your AI-powered energy management assistant. I can help you control lighting systems, monitor energy consumption, manage complaints, and provide detailed analytics.\n\nWhat would you like to know?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }

    // Poll for complaint updates every 30 seconds
    const interval = setInterval(loadComplaintNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, router, hasHydrated, isAuthenticated]);

  const loadCapabilities = async () => {
    try {
      const data = await apiClient.getChatCapabilities();
      setCapabilities(data);
    } catch (error) {
      console.error('Failed to load capabilities:', error);
    }
  };

  const loadComplaintNotifications = async () => {
    try {
      if (user && (user.role === 'admin' || user.role === 'electrical_engineer')) {
        const complaints = await apiClient.getComplaints('pending');
        setPendingComplaintsCount(complaints.length);
      }
    } catch (error) {
      console.error('Failed to load complaint notifications:', error);
    }
  };

  const loadExamples = async () => {
    try {
      const data = await apiClient.getChatExamples();
      setExamples(data.examples || []);
    } catch (error) {
      console.error('Failed to load examples:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    // Update messages state with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send full conversation history including the current message for context continuity
      const response = await apiClient.sendChatMessage(textToSend, updatedMessages, sessionId || undefined);

      // Store session ID from response
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
      }

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `System Error: ${error.response?.data?.detail || error.message || 'Unable to process request'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    // Clear chat data from localStorage
    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatMessages');
    await logout();
    router.push('/login');
  };

  const handleNewChat = () => {
    // Clear current session and start fresh
    setSessionId(null);
    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatMessages');
    setMessages([{
      role: 'assistant',
      content: `Welcome back, ${user?.full_name || 'User'}.\n\nI'm your AI-powered energy management assistant. I can help you control lighting systems, monitor energy consumption, manage complaints, and provide detailed analytics.\n\nWhat would you like to know?`,
      timestamp: new Date().toISOString(),
    }]);
  };

  // Show loading while store is hydrating
  if (!hasHydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000000',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #333',
            borderTop: '3px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2>ENERGY.AI</h2>
              <p>v4.0.2035</p>
            </div>
          </div>
          <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sidebar-content">
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <h3>{user?.full_name || 'User'}</h3>
              <p className="user-role">{user?.role?.replace('_', ' ').toUpperCase() || 'USER'}</p>
              <p className="user-email">{user?.email || ''}</p>
            </div>
          </div>

          {/* Refresh Profile Button */}
          <div className="quick-actions-section">
            <button
              onClick={async () => {
                await refreshUser();
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#000000',
                borderRadius: '10px',
                textAlign: 'center',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px',
                border: '1px solid #333',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
            >
              🔄 Refresh Profile
            </button>
          </div>

          {/* New Chat Button */}
          <div className="quick-actions-section">
            <button
              onClick={handleNewChat}
              style={{
                width: '100%',
                padding: '15px',
                background: '#000000',
                borderRadius: '10px',
                textAlign: 'center',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                border: '1px solid #333',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
            >
              ➕ New Chat
            </button>
          </div>

          {/* Admin Dashboard Link */}
          {user?.role === 'admin' && (
            <div className="quick-actions-section">
              <a
                href="/admin"
                style={{
                  display: 'block',
                  padding: '15px',
                  background: '#000000',
                  borderRadius: '10px',
                  textAlign: 'center',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                }}
              >
                👑 Admin Dashboard
              </a>
            </div>
          )}

          {/* Complaints Link */}
          {(user?.role === 'admin' || user?.role === 'electrical_engineer') && (
            <div className="quick-actions-section">
              <a
                href="/complaints"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '15px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                <span>🔧 Complaints</span>
                {pendingComplaintsCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    minWidth: '24px',
                    textAlign: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    {pendingComplaintsCount}
                  </span>
                )}
              </a>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h4>QUICK ACTIONS</h4>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => handleSendMessage(action.query)}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          {capabilities && (
            <div className="capabilities-section">
              <h4>ACCESS LEVEL</h4>
              <div className="capability-badge">
                <span className="badge-level">LEVEL {capabilities.level || 0}</span>
                <span className="badge-role">{capabilities.role?.replace('_', ' ') || 'USER'}</span>
              </div>
              <div className="permissions-count">
                {capabilities.permissions?.length || 0} Active Permissions
              </div>
            </div>
          )}

          {/* Examples */}
          {examples.length > 0 && (
            <div className="examples-section">
              <h4>SUGGESTED COMMANDS</h4>
              {examples.slice(0, 5).map((example, index) => (
                <button
                  key={index}
                  className="example-btn"
                  onClick={() => handleSendMessage(example)}
                >
                  <span className="example-arrow">›</span>
                  <span>{example}</span>
                </button>
              ))}
            </div>
          )}

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="top-bar-title">
            <h1>AI ASSISTANT</h1>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>ONLINE</span>
            </div>
          </div>
          <div className="top-bar-actions">
            <button className="icon-btn" title="Clear Chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button className="icon-btn" title="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="messages-container">
          {messages.length === 1 && (
            <div className="welcome-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="welcome-card"
                  onClick={() => handleSendMessage(action.query)}
                >
                  <div className="welcome-icon">{action.icon}</div>
                  <div className="welcome-label">{action.label}</div>
                  <div className="welcome-arrow">→</div>
                </button>
              ))}
            </div>
          )}

          <div className="messages-list">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="message-avatar assistant-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-meta">
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="message-avatar user-avatar">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message assistant">
                <div className="message-avatar assistant-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <button className="input-action-btn" title="Attach">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          <div className="input-hint">
            Press <kbd>Enter</kbd> to send • <kbd>Shift + Enter</kbd> for new line
          </div>
        </div>
      </main>

      <style jsx>{`
        .chat-container {
          display: flex;
          height: 100vh;
          background: #000000;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
          width: 320px;
          background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%);
          border-right: 1px solid #1a1a1a;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
        }

        .logo-icon svg {
          width: 24px;
          height: 24px;
        }

        .logo-section h2 {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
          margin: 0;
        }

        .logo-section p {
          font-size: 10px;
          color: #666666;
          margin: 0;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .close-sidebar {
          display: none;
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 8px;
        }

        .close-sidebar svg {
          width: 20px;
          height: 20px;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .user-profile {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: #ffffff;
          color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .user-info h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .user-role {
          font-size: 10px;
          color: #ffffff;
          background: #1a1a1a;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          margin: 0 0 8px 0;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .user-email {
          font-size: 11px;
          color: #666666;
          margin: 0;
        }

        .quick-actions-section,
        .capabilities-section,
        .examples-section {
          margin-bottom: 32px;
        }

        .quick-actions-section h4,
        .capabilities-section h4,
        .examples-section h4 {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #666666;
          margin: 0 0 16px 0;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .quick-action-btn {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 16px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .quick-action-btn:hover {
          background: #1a1a1a;
          border-color: #333333;
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 24px;
        }

        .action-label {
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
          text-align: center;
        }

        .capability-badge {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .badge-level {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .badge-role {
          font-size: 10px;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .permissions-count {
          font-size: 11px;
          color: #666666;
        }

        .example-btn {
          width: 100%;
          background: none;
          border: none;
          padding: 12px;
          text-align: left;
          cursor: pointer;
          color: #999999;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 6px;
          margin-bottom: 4px;
          transition: all 0.2s ease;
        }

        .example-btn:hover {
          background: #0a0a0a;
          color: #ffffff;
        }

        .example-arrow {
          font-size: 16px;
          color: #333333;
        }

        .logout-btn {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 14px;
          border-radius: 8px;
          cursor: pointer;
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          margin-top: auto;
          letter-spacing: 1px;
        }

        .logout-btn svg {
          width: 16px;
          height: 16px;
        }

        .logout-btn:hover {
          background: #1a1a1a;
          border-color: #333333;
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #000000;
        }

        .top-bar {
          height: 72px;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          align-items: center;
          padding: 0 32px;
          gap: 24px;
          background: #000000;
          z-index: 50;
        }

        .menu-btn {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .menu-btn span {
          width: 20px;
          height: 2px;
          background: #ffffff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .top-bar-title {
          flex: 1;
        }

        .top-bar-title h1 {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
          margin: 0 0 4px 0;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: #666666;
          letter-spacing: 1px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #00ff00;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .top-bar-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: #1a1a1a;
          border-color: #333333;
        }

        .icon-btn svg {
          width: 18px;
          height: 18px;
        }

        /* ===== MESSAGES ===== */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          background: #000000;
        }

        .welcome-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .welcome-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 32px 24px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
        }

        .welcome-card:hover {
          background: #1a1a1a;
          border-color: #333333;
          transform: translateY(-4px);
        }

        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .welcome-label {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .welcome-arrow {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 20px;
          color: #333333;
          transition: all 0.3s ease;
        }

        .welcome-card:hover .welcome-arrow {
          color: #ffffff;
          transform: translateX(4px);
        }

        .messages-list {
          max-width: 1000px;
          margin: 0 auto;
        }

        .message {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .assistant-avatar {
          background: #ffffff;
          color: #000000;
        }

        .assistant-avatar svg {
          width: 20px;
          height: 20px;
        }

        .user-avatar {
          background: #000000;
          border: 2px solid #ffffff;
          color: #ffffff;
          font-size: 16px;
        }

        .message-content {
          width: fit-content;
          max-width: 70%;
        }

        .message-text {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .message.user .message-text {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
          padding: 0 4px;
        }

        .message-time {
          font-size: 10px;
          color: #666666;
          letter-spacing: 0.5px;
        }

        .typing-indicator {
          display: flex;
          gap: 6px;
          padding: 16px 20px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          animation: typing 1.4s ease-in-out infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-8px);
          }
        }

        /* ===== INPUT ===== */
        .input-container {
          padding: 24px 32px;
          background: #000000;
          border-top: 1px solid #1a1a1a;
        }

        .input-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
          align-items: flex-end;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 12px;
          transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #ffffff;
          box-shadow: 0 0 0 1px #ffffff;
        }

        .input-action-btn {
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          cursor: pointer;
          color: #666666;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .input-action-btn:hover {
          color: #ffffff;
          background: #1a1a1a;
        }

        .input-action-btn svg {
          width: 20px;
          height: 20px;
        }

        .input-wrapper textarea {
          flex: 1;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          resize: none;
          outline: none;
          font-family: inherit;
          line-height: 1.5;
          min-height: 24px;
          max-height: 120px;
          padding: 6px 0;
        }

        .input-wrapper textarea::placeholder {
          color: #666666;
        }

        .send-btn {
          width: 36px;
          height: 36px;
          background: #ffffff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .send-btn svg {
          width: 18px;
          height: 18px;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #333333;
          border-top-color: #000000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .input-hint {
          max-width: 1000px;
          margin: 12px auto 0;
          font-size: 11px;
          color: #666666;
          text-align: center;
        }

        .input-hint kbd {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-family: inherit;
        }

        /* ===== SCROLLBAR ===== */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #000000;
        }

        ::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .close-sidebar {
            display: block;
          }

          .menu-btn {
            display: flex;
          }

          .top-bar {
            padding: 0 16px;
          }

          .messages-container {
            padding: 16px;
          }

          .input-container {
            padding: 16px;
          }

          .message-content {
            max-width: 85%;
          }

          .welcome-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .top-bar-actions {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .sidebar {
            width: 100%;
          }

          .top-bar {
            height: 60px;
          }

          .welcome-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .welcome-card {
            padding: 24px 20px;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .message-content {
            max-width: 90%;
          }

          .input-hint {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
