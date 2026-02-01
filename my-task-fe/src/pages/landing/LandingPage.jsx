import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      id: 'dashboard',
      title: 'Dashboard Thông Minh',
      desc: 'Tổng quan ngày mới với các chỉ số quan trọng, nhắc nhở thông minh và trích dẫn truyền cảm hứng.',
      icon: 'dashboard',
      color: 'from-violet-500 to-purple-600',
      demo: (
        <div className="w-full h-full p-4 flex flex-col gap-3">
           <div className="flex justify-between items-center">
              <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse"></div>
              <div className="h-8 w-8 bg-white/10 rounded-full"></div>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="h-24 rounded-2xl bg-white/5 border border-white/10 p-3">
                 <div className="h-8 w-8 rounded-lg bg-blue-500/20 mb-2"></div>
                 <div className="h-6 w-12 bg-white/10 rounded"></div>
              </div>
              <div className="h-24 rounded-2xl bg-white/5 border border-white/10 p-3">
                 <div className="h-8 w-8 rounded-lg bg-emerald-500/20 mb-2"></div>
                 <div className="h-6 w-12 bg-white/10 rounded"></div>
              </div>
           </div>
           <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col gap-2">
              <div className="h-4 w-24 bg-white/10 rounded"></div>
              <div className="flex-1 bg-gradient-to-br from-violet-500/20 to-transparent rounded-xl border border-violet-500/20 relative overflow-hidden group">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin"></div>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'tasks',
      title: 'Quản Lý Dự Án & Công Việc',
      desc: 'Hệ thống Kanban trực quan, kéo thả mượt mà. Phân loại theo độ ưu tiên và dự án.',
      icon: 'kanban',
      color: 'from-blue-500 to-cyan-500',
      demo: (
        <div className="w-full h-full p-4 flex gap-3 overflow-hidden">
           <div className="w-1/2 flex flex-col gap-2">
              <div className="h-6 w-20 bg-blue-500/20 rounded text-[10px] text-blue-400 font-bold flex items-center justify-center">TODO</div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                 <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
                 <div className="flex justify-between">
                    <div className="h-2 w-8 bg-white/5 rounded"></div>
                    <div className="h-4 w-4 rounded-full bg-white/10"></div>
                 </div>
              </motion.div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-50">
                 <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
              </div>
           </div>
           <div className="w-1/2 flex flex-col gap-2 pt-8">
               <div className="h-6 w-20 bg-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold flex items-center justify-center">DONE</div>
               <motion.div 
                 initial={{ x: -50, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ repeat: Infinity, duration: 2, delay: 1, repeatDelay: 1 }}
                 className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
               >
                 <div className="h-3 w-full bg-emerald-500/20 rounded mb-2"></div>
                 <div className="h-2 w-12 bg-emerald-500/10 rounded"></div>
              </motion.div>
           </div>
        </div>
      )
    },
    {
      id: 'finance',
      title: 'Quản Lý Tài Chính',
      desc: 'Theo dõi thu chi, ngân sách và báo cáo tài chính chi tiết với biểu đồ trực quan.',
      icon: 'account_balance_wallet',
      color: 'from-amber-500 to-orange-600',
      demo: (
        <div className="w-full h-full p-4 flex flex-col justify-center items-center">
            <div className="relative w-32 h-32">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                  <motion.path 
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: "75, 100" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="text-amber-500" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" stroke="currentColor" strokeWidth="4"
                  ></motion.path>
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400">Số dư</span>
                  <span className="text-sm font-bold text-white">20.5M</span>
               </div>
            </div>
            <div className="w-full mt-4 space-y-2">
               <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Thu nhập</span>
                  <span className="text-emerald-400">+35.2M</span>
               </div>
               <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full bg-emerald-500"></motion.div>
               </div>
            </div>
        </div>
      )
    },
    {
      id: 'assistant',
      title: 'Trợ Lý AI Cá Nhân',
      desc: 'Phân tích dữ liệu, gợi ý mục tiêu và trò chuyện như một người bạn đồng hành.',
      icon: 'auto_awesome',
      color: 'from-pink-500 to-rose-500',
      demo: (
        <div className="w-full h-full p-4 flex flex-col justify-end gap-3">
           <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shrink-0"></div>
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-2 text-[10px] text-slate-200">
                 Chào bạn! Hôm nay năng suất của bạn rất tốt (92/100).
              </div>
           </div>
           <div className="flex items-start gap-2 flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-slate-700 shrink-0"></div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-primary/20 border border-primary/20 rounded-2xl rounded-tr-none p-2 text-[10px] text-white"
              >
                 Cảm ơn! Gợi ý cho tôi việc cần làm tiếp theo?
              </motion.div>
           </div>
           <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shrink-0 flex items-center justify-center">
                 <span className="material-icons-round text-[10px] text-white animate-pulse">auto_awesome</span>
              </div>
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1.5 }}
                 className="bg-white/10 rounded-2xl rounded-tl-none p-2 text-[10px] text-slate-200"
              >
                 <div className="flex gap-1 mb-1">
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                 </div>
              </motion.div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-display overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20">
               <span className="material-icons-round text-2xl text-white">dashboard</span>
            </div>
            <span className="text-xl font-bold tracking-tight">LifeDash</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Đăng nhập</Link>
            <Link to="/register" className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors">Đăng ký ngay</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
         {/* Background Elements */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8"
            >
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
               </span>
               Phiên bản 2.0 đã ra mắt với Trợ lý AI
            </motion.div>
            
            <motion.h1 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent"
            >
               Quản lý cuộc sống <br/>
               <span className="text-primary relative">
                  thông minh hơn
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                     <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
               </span>
            </motion.h1>
            
            <motion.p 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
               Hợp nhất công việc, thói quen, tài chính và mục tiêu vào một nền tảng duy nhất. Được hỗ trợ bởi AI để tối đa hóa năng suất của bạn.
            </motion.p>
            
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.6 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
               <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-violet-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all transform hover:-translate-y-1">
                  Bắt đầu miễn phí
               </Link>
               <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-all backdrop-blur-md">
                  Đăng nhập
               </Link>
            </motion.div>
         </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0B0E14] to-slate-900/50">
         <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
               {/* Left Menu - Feature Selection */}
               <div className="md:col-span-4 flex flex-col gap-4">
                  {features.map((feature, idx) => (
                     <div 
                        key={feature.id}
                        onClick={() => setActiveFeature(idx)}
                        className={`p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
                           activeFeature === idx 
                           ? 'bg-white/5 border-primary/50 shadow-lg' 
                           : 'bg-transparent border-transparent hover:bg-white/5'
                        }`}
                     >
                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg`}>
                              <span className="material-icons-round text-white">{feature.icon}</span>
                           </div>
                           <div className="flex-1">
                              <h3 className={`font-bold text-lg ${activeFeature === idx ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{feature.title}</h3>
                              {activeFeature === idx && (
                                 <motion.p 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-sm text-slate-400 mt-2 leading-relaxed"
                                 >
                                    {feature.desc}
                                 </motion.p>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Right Preview - Interactive Demo */}
               <div className="md:col-span-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-500/10 rounded-[32px] blur-xl"></div>
                  <div className="relative h-full bg-[#151A23] border border-white/10 rounded-[32px] p-2 overflow-hidden shadow-2xl">
                     <div className="absolute top-0 left-0 w-full h-8 bg-[#151A23] border-b border-white/5 flex items-center px-4 gap-2 z-10">
                        <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                     </div>
                     <div className="w-full h-full pt-8 bg-[#0B0E14]/50 rounded-[28px] overflow-hidden">
                        <AnimatePresence mode="wait">
                           <motion.div 
                              key={activeFeature}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.05 }}
                              transition={{ duration: 0.4 }}
                              className="w-full h-full"
                           >
                              {features[activeFeature].demo}
                           </motion.div>
                        </AnimatePresence>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <div className="text-4xl font-bold text-white mb-2">10k+</div>
               <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Người dùng</div>
            </div>
            <div>
               <div className="text-4xl font-bold text-white mb-2">50k+</div>
               <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Công việc</div>
            </div>
            <div>
               <div className="text-4xl font-bold text-white mb-2">99%</div>
               <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Hài lòng</div>
            </div>
            <div>
               <div className="text-4xl font-bold text-white mb-2">24/7</div>
               <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Hỗ trợ AI</div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
         <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Sẵn sàng thay đổi cuộc sống của bạn?</h2>
            <p className="text-xl text-slate-400 mb-10">Tham gia cùng hàng ngàn người đang sử dụng LifeDash để đạt được mục tiêu nhanh hơn.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 rounded-3xl bg-white text-slate-900 font-bold text-xl hover:scale-105 transition-transform">
               <span>Tạo tài khoản miễn phí</span>
               <span className="material-icons-round">arrow_forward</span>
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
         <p>&copy; 2024 LifeDash. Xây dựng bởi đội ngũ đam mê.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
