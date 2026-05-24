import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { toast } from 'react-hot-toast';

const AiChatButton = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am the Savomart Support Assistant. 🤖 I can help you file support tickets or answer questions. What is your full name?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketLogged, setTicketLogged] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chats
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Attempt to extract issue category from conversation
  const extractCategory = (conversationText) => {
    const text = conversationText.toLowerCase();
    if (text.includes('points') || text.includes('point') || text.includes('loyalty')) return 'points';
    if (text.includes('refund') || text.includes('money') || text.includes('pay')) return 'refund';
    if (text.includes('order') || text.includes('delivery') || text.includes('item')) return 'order';
    if (text.includes('store') || text.includes('branch') || text.includes('operational')) return 'store';
    return 'other';
  };

  // Automated support request logger
  const autoLogSupportRequest = async (chatHistory) => {
    try {
      // Heuristic extraction of name/contact/category/description
      const userMsgs = chatHistory.filter(m => m.role === 'user').map(m => m.content);
      const conversationDump = chatHistory.map(m => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');
      
      const category = extractCategory(conversationDump);
      
      // Fallback pre-fills using user state
      const customerName = user?.name || userMsgs[0] || 'Anonymous Customer';
      const customerContact = user?.mobile_number || userMsgs[1] || 'No Mobile';
      
      const payload = {
        name: customerName,
        contact: customerContact,
        issue_category: category,
        description: `Logged via AI Chat Agent. Full Conversation:\n${conversationDump}`
      };
      
      const response = await client.post('/api/support/request', payload);
      
      // Append green confirmation message bubble
      setMessages(prev => [
        ...prev,
        {
          role: 'system_confirm',
          content: `✅ Ticket Saved Successfully!\nReference: Ticket #${response.data.id}\nStatus: ${response.data.status.toUpperCase()}\nMessage: ${response.data.message}`
        }
      ]);
      setTicketLogged(true);
      toast.success('AI Agent logged a support ticket for you! 🎫');
    } catch (error) {
      console.error('Error auto-logging AI request:', error);
      toast.error('AI was unable to automatically log your support request.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessageText = inputValue.trim();
    setInputValue('');

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: userMessageText }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Call secure backend proxy
      const response = await client.post('/api/ai/chat', {
        messages: updatedMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      });

      const replyText = response.data.reply;
      setIsTyping(false);

      const finalMessages = [...updatedMessages, { role: 'assistant', content: replyText }];
      setMessages(finalMessages);

      // Check if ticket triggers
      const shouldLog = 
        replyText.toLowerCase().includes('request has been logged') || 
        finalMessages.length >= 8;

      if (shouldLog && !ticketLogged) {
        await autoLogSupportRequest(finalMessages);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Oops! I ran into an issue connecting with the mother ship. 🚀 Let me know if I can try again!"
        }
      ]);
      console.error('AI Chat Error:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 md:bottom-6 md:right-6 w-14 h-14 bg-savomart-purple text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-savomart-darkPurple hover:scale-110 active:scale-95 transition-all duration-300 z-50 animate-bounce"
        title="Chat with Savomart Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {/* Unread dot */}
        {!isOpen && !ticketLogged && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-savomart-yellow border-2 border-white rounded-full animate-ping"></span>
        )}
      </button>

      {/* Floating Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col z-50 transition-all duration-300">
          
          {/* Header */}
          <div className="bg-savomart-purple text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Bot size={22} className="text-savomart-yellow" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Savomart Assistant</h3>
                <span className="text-[10px] text-savomart-yellow flex items-center">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full inline-block mr-1 animate-pulse"></span>
                  Active Claude Support
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, index) => {
              if (msg.role === 'system_confirm') {
                return (
                  <div key={index} className="flex justify-center my-3 animate-fade-in">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-3 flex items-start space-x-2 max-w-[90%] shadow-sm">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div className="whitespace-pre-line font-medium leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              }

              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-savomart-purple flex items-center justify-center text-white text-[10px] shrink-0">
                        🤖
                      </div>
                    )}
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      isUser 
                        ? 'bg-savomart-purple text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Dots Indicator */}
            {isTyping && (
              <div className="flex justify-start items-center space-x-2 animate-pulse">
                <div className="w-7 h-7 rounded-full bg-savomart-purple flex items-center justify-center text-white text-[10px]">
                  🤖
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1 shadow-sm">
                  <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping || ticketLogged}
              placeholder={ticketLogged ? "Support request logged!" : "Type a message..."}
              className="flex-1 bg-slate-100 border-none rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-savomart-purple disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping || ticketLogged}
              className="bg-savomart-purple text-white p-2.5 rounded-xl hover:bg-savomart-darkPurple disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
          
        </div>
      )}
    </>
  );
};

export default AiChatButton;
