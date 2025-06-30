import React, { useState, useRef, useEffect } from 'react';
import { chatWithGPT, getFallbackResponse, saveChatHistory, loadChatHistory, clearChatHistory } from '../services/chatbotService';

const ChatBot = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [useRealAPI, setUseRealAPI] = useState(false); // Start with demo mode for testing
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    console.log('ChatBot mounted with user:', user);
    try {
      const savedMessages = loadChatHistory(user?.id);
      if (savedMessages && savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        // Initialize with welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Hi ${user?.name || 'there'}! 👋 I'm your AI fitness assistant. I can help you with workout plans, nutrition advice, motivation, and answer any fitness-related questions. What would you like to know today?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Initialize with welcome message if loading fails
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hi ${user?.name || 'there'}! 👋 I'm your AI fitness assistant. I can help you with workout plans, nutrition advice, motivation, and answer any fitness-related questions. What would you like to know today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user?.id, user?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    console.log('Sending message:', inputMessage);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let botResponse;
      
      if (useRealAPI) {
        // Use real ChatGPT API
        try {
          botResponse = await chatWithGPT(inputMessage, user, messages);
        } catch (apiError) {
          console.warn('API call failed, using fallback:', apiError);
          setError('ChatGPT is temporarily unavailable. Using demo mode.');
          botResponse = getFallbackResponse(inputMessage, user);
        }
      } else {
        // Use fallback responses (simulated)
        botResponse = getFallbackResponse(inputMessage, user);
      }
      
      console.log('Bot response:', botResponse);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      // Use functional state update to avoid stale closure
      setMessages(prev => {
        const updatedMessages = [...prev, botMessage];
        try {
          saveChatHistory(user?.id, updatedMessages);
        } catch (saveError) {
          console.error('Error saving chat history:', saveError);
        }
        return updatedMessages;
      });
      
      setIsLoading(false);

    } catch (error) {
      console.error('Error getting response:', error);
      setError('Sorry, I encountered an error. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later!",
        timestamp: new Date()
      };
      
      setMessages(prev => {
        const updatedMessages = [...prev, errorMessage];
        try {
          saveChatHistory(user?.id, updatedMessages);
        } catch (saveError) {
          console.error('Error saving chat history:', saveError);
        }
        return updatedMessages;
      });
      
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    console.log('Closing chatbot');
    setIsOpen(false);
    setTimeout(() => onClose(), 300);
  };

  const handleClearHistory = () => {
    try {
      if (window.confirm('Are you sure you want to clear the chat history?')) {
        clearChatHistory(user?.id);
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Hi ${user?.name || 'there'}! 👋 I'm your AI fitness assistant. I can help you with workout plans, nutrition advice, motivation, and answer any fitness-related questions. What would you like to know today?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        setError(null);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      setError('Failed to clear chat history. Please try again.');
    }
  };

  const toggleAPI = () => {
    setUseRealAPI(!useRealAPI);
    console.log('Toggled API mode:', !useRealAPI);
  };

  // Validate props after all hooks
  if (!onClose || typeof onClose !== 'function') {
    console.error('ChatBot: onClose prop is required and must be a function');
    return null;
  }

  if (!isOpen) {
    return null;
  }

  console.log('Rendering ChatBot with messages:', messages.length);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h3 className="font-bold">AI Fitness Assistant</h3>
              <p className="text-sm opacity-90">
                {useRealAPI ? 'Powered by ChatGPT' : 'Demo Mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAPI}
              className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
              title={useRealAPI ? 'Switch to Demo Mode' : 'Enable Real ChatGPT'}
            >
              {useRealAPI ? 'Demo' : 'GPT'}
            </button>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-2xl max-w-[80%]">
                <p className="text-sm">⚠️ {error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fitness..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <button
              onClick={handleClearHistory}
              className="hover:text-red-500 transition-colors"
            >
              Clear History
            </button>
            <span>
              {useRealAPI ? 'Real ChatGPT' : 'Demo Mode'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 