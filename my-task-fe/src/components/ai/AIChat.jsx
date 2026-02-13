import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import aiService from '../../services/aiService';
import { formatDateStrict } from '../../utils/dateUtils';


// Helper Component for Rich Content
const MessageContent = ({ content }) => {
  // 1. Transaction Receipt Card
  if (content.includes("Đã thêm giao dịch:")) {
    const amountMatch = content.match(/(\d+) VND/);
    const catMatch = content.match(/vào danh mục \*\*(.*?)\*\*/); // Expecting **Category**
    const typeMatch = content.match(/\((EXPENSE|INCOME)\)/);
    
    if (amountMatch && catMatch) {
        return (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 my-1">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeMatch && typeMatch[1] === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        <span className="material-icons-round text-xl">
                            {typeMatch && typeMatch[1] === 'INCOME' ? 'trending_up' : 'receipt_long'}
                        </span>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">Giao dịch mới</div>
                        <div className="font-bold text-white text-lg">{parseInt(amountMatch[1]).toLocaleString()} đ</div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Danh mục</span>
                    <span className="text-white font-medium bg-white/10 px-2 py-0.5 rounded text-xs">{catMatch[1]}</span>
                </div>
            </div>
        );
    }
  }

  // 2. Project Plan Card
  if (content.includes("Đã lập kế hoạch")) {
      const projectMatch = content.match(/\*\*(.*?)\*\*/);
      const countMatch = content.match(/tạo thành công \*\*(.*?)\*\*/);
      
      return (
          <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30 my-1">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <span className="material-icons-round text-white text-xl">rocket_launch</span>
                  </div>
                  <div>
                      <div className="text-xs text-indigo-300 font-medium">Dự án mới</div>
                      <div className="font-bold text-white">{projectMatch ? projectMatch[1] : 'Kế hoạch'}</div>
                  </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
                      <span>Tasks đã tạo</span>
                      <span className="font-bold">{countMatch ? countMatch[1] : '0/0'}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 w-full animate-pulse"></div>
                  </div>
              </div>
              <div className="mt-3 text-xs text-slate-400 italic text-center">
                  "Hãy vào mục Projects để xem chi tiết nhé!"
              </div>
          </div>
      );
  }

  // Default Markdown Text
  return (
    <ReactMarkdown 
        components={{
            strong: ({node, ...props}) => <span className="font-bold text-indigo-300" {...props} />,
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="marker:text-indigo-400" {...props} />
        }}
    >
        {content}
    </ReactMarkdown>
  );
};

function AIChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

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

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Trình duyệt không hỗ trợ nhận diện giọng nói"); // Simple fallback
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev ? prev + ' ' + transcript : transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
      setIsListening(true);
      recognitionRef.current = recognition;
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text = inputText) => {
    if (!text.trim() && !image) return;
    
    // Optimistic UI for User Msg
    const userMsg = { role: 'user', content: text, id: Date.now() };
    // We don't show image in history immediately in this simple state, 
    // but ideally we should:
    /* if (image) userMsg.image = image; */
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const currentImage = image; // Capture for sending
    setImage(null); // Clear after send
    setLoading(true);

    try {
      const resp = await aiService.chat(text, currentImage);
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
                  {formatDateStrict(new Date().toISOString())}
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
                        : 'bg-[#1e293b]/90 border border-white/5 text-slate-200 rounded-tl-none w-full'
                    }`}>
                      {msg.role === 'user' ? msg.content : <MessageContent content={msg.content} />}
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
              {/* Image Preview */}
              <AnimatePresence>
                  {image && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative w-20 h-20 mb-2 rounded-lg overflow-hidden border border-white/20 group"
                    >
                        <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => setImage(null)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span className="material-icons-round text-sm">close</span>
                        </button>
                    </motion.div>
                  )}
              </AnimatePresence>
            
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
                {/* Image Upload Button */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageSelect} 
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 transition-colors rounded-xl hover:bg-white/5 shrink-0 mb-0.5 ${image ? 'text-emerald-400' : 'text-slate-400 hover:text-primary'}`}
                >
                  <span className="material-icons-round">attach_file</span>
                </button>
                
                {/* Voice Button */}
                <button 
                    onClick={handleVoiceToggle}
                    className={`p-2 transition-all rounded-xl hover:bg-white/5 shrink-0 mb-0.5 ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-slate-400 hover:text-primary'}`}
                >
                  <span className="material-icons-round">{isListening ? 'mic' : 'mic_none'}</span>
                </button>

                <textarea 
                  className="w-full bg-transparent border-0 text-white placeholder-slate-500 text-sm focus:ring-0 resize-none py-2.5 max-h-24 leading-relaxed" 
                  placeholder={isListening ? "Đang lắng nghe..." : "Nhập tin nhắn..."}
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
                  disabled={(!inputText.trim() && !image) || loading}
                  className="p-2.5 bg-primary hover:bg-violet-600 text-white transition-all rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-icons-round text-lg leading-none">send</span>
                </button>
              </div>
              <div className="flex justify-center mt-3 gap-1">
                <span className="text-[10px] text-slate-500">Được hỗ trợ bởi LifeDash AI + Vision + Voice</span>
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
