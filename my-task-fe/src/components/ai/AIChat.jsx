import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import aiService from '../../services/aiService';

function AIChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const resp = await aiService.getHistory();
      setMessages(resp.data ? resp.data.reverse() : []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (text = inputText) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const resp = await aiService.chat(text);
      const aiMsg = { role: 'assistant', content: resp.data.reply, id: Date.now() + 1 };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = { role: 'assistant', content: 'Lỗi kết nối AI assistant. Vui lòng thử lại sau.', id: Date.now() + 1 };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Tóm tắt công việc', icon: 'summarize', color: 'text-primary' },
    { label: 'Gợi ý mục tiêu', icon: 'lightbulb', color: 'text-emerald-500' },
    { label: 'Phân tích tài chính', icon: 'analytics', color: 'text-blue-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:max-w-[420px] h-full md:h-[700px] max-h-screen md:max-h-[85vh] z-50 flex flex-col overflow-hidden glass-panel md:rounded-3xl border-t md:border border-primary/40 shadow-[0_0_60px_rgba(139,92,246,0.25)] ring-1 ring-white/10 bg-[#0f172a]/80 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-primary/20">
                  <span className="material-icons-round text-white text-lg">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">Trợ lý AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Sẵn sàng hỗ trợ</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={fetchHistory}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                  <span className="material-icons-round text-xl">refresh</span>
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                  <span className="material-icons-round text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
              <div className="flex justify-center my-2">
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full border border-white/5 shadow-sm">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                </span>
              </div>

              {messages.length === 0 && !loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                    <span className="material-icons-round text-white text-xs">auto_awesome</span>
                  </div>
                  <div className="bg-[#1e293b]/90 border border-white/5 text-slate-200 p-4 rounded-2xl rounded-tl-none text-[13.5px] leading-relaxed shadow-sm">
                    Xin chào! Tôi là trợ lý ảo cá nhân của bạn. Tôi có thể giúp bạn phân tích dữ liệu, tóm tắt tiến độ hoặc gợi ý các chiến lược đạt mục tiêu nhanh hơn.
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                      <span className="material-icons-round text-white text-xs">auto_awesome</span>
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-primary to-violet-600 text-white rounded-tr-none shadow-lg shadow-primary/10' 
                        : 'bg-[#1e293b]/90 border border-white/5 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.createdAt && (
                      <span className="text-[10px] text-slate-500 mt-1 mr-1 font-medium">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 p-[1px] shrink-0 mt-1 shadow-md">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center text-[10px] font-bold text-white">
                        ME
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                    <span className="material-icons-round text-white text-xs">auto_awesome</span>
                  </div>
                  <div className="bg-[#1e293b]/90 border border-white/5 text-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/60 backdrop-blur-xl border-t border-white/5">
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-1">
                {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(action.label)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800/80 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-700/80 transition-all flex items-center gap-1.5 group shadow-sm"
                  >
                    <span className={`material-icons-round text-sm ${action.color} group-hover:opacity-80`}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="relative flex items-end gap-2 bg-slate-800/50 border border-white/10 p-1.5 rounded-2xl focus-within:border-primary/50 focus-within:bg-slate-800/80 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
                <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-xl hover:bg-white/5 shrink-0 mb-0.5">
                  <span className="material-icons-round">add_circle_outline</span>
                </button>
                <textarea 
                  className="w-full bg-transparent border-0 text-white placeholder-slate-500 text-sm focus:ring-0 resize-none py-2.5 max-h-24 leading-relaxed" 
                  placeholder="Nhập tin nhắn..." 
                  rows="1"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                ></textarea>
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || loading}
                  className="p-2.5 bg-primary hover:bg-violet-600 text-white transition-all rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-icons-round text-lg leading-none">send</span>
                </button>
              </div>
              <div className="flex justify-center mt-3 gap-1">
                <span className="text-[10px] text-slate-500">Được hỗ trợ bởi LifeDash AI</span>
                <span className="material-icons-round text-[10px] text-primary">bolt</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AIChat;
