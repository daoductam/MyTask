import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background-dark font-display text-slate-200 relative selection:bg-primary selection:text-white overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col lg:flex-row w-full min-h-full">
        {/* Left Side - Hero/Illustration */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-[#0B0E14]">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-40"></div>
          
          <div className="relative w-[500px] h-[600px] z-10 perspective-1000 transform scale-90">
            {/* Decorative background layers */}
            <div className="absolute top-0 right-[-40px] w-full h-full bg-slate-800/40 rounded-3xl border border-white/5 backdrop-blur-sm transform rotate-6 scale-95"></div>
            
            {/* Main glass card content */}
            <div className="absolute inset-0 glass-card rounded-3xl p-8 flex flex-col shadow-2xl shadow-black/50 overflow-hidden floating-element">
              <div className="flex justify-between items-center mb-8">
                <div className="w-32 h-8 bg-white/10 rounded-lg"></div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10"></div>
                  <div className="w-8 h-8 rounded-full bg-white/10"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 mb-3"></div>
                  <div className="w-16 h-4 bg-white/10 rounded mb-2"></div>
                  <div className="w-24 h-8 bg-white/20 rounded"></div>
                </div>
                <div className="h-32 rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 mb-3"></div>
                  <div className="w-16 h-4 bg-white/10 rounded mb-2"></div>
                  <div className="w-12 h-8 bg-white/20 rounded"></div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="w-24 h-5 bg-white/10 rounded mb-4"></div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-4 h-4 rounded-full border border-primary"></div>
                  <div className="w-48 h-3 bg-white/10 rounded"></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-4 h-4 rounded-full border border-slate-500"></div>
                  <div className="w-32 h-3 bg-white/10 rounded"></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-4 h-4 rounded-full border border-slate-500"></div>
                  <div className="w-40 h-3 bg-white/10 rounded"></div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
          
          <div className="absolute bottom-16 left-0 w-full text-center z-20 px-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Quản lý cuộc sống thông minh</h2>
            <p className="text-slate-400">Tối ưu hóa năng suất và đạt được mục tiêu của bạn.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto min-h-screen">
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]"></div>
          </div>

          <div className="w-full max-w-md space-y-8 z-10 transition-all duration-500">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6 lg:mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <span className="material-icons-round text-xl">dashboard</span>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">LifeDash</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Tạo tài khoản mới</h1>
              <p className="text-slate-400">Bắt đầu hành trình năng suất của bạn ngay hôm nay.</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                <span className="material-icons-round text-lg">error_outline</span>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                <span className="material-icons-round text-lg">check_circle_outline</span>
                Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="fullName">Họ và tên</label>
                <div className="relative">
                  <input 
                    id="fullName" 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full glass-input text-white rounded-2xl px-4 py-3.5 pl-11 placeholder-slate-500 focus:outline-none focus:ring-0" 
                    placeholder="Nguyễn Văn A" 
                  />
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">person_outline</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">Email</label>
                <div className="relative">
                  <input 
                    id="email" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full glass-input text-white rounded-2xl px-4 py-3.5 pl-11 placeholder-slate-500 focus:outline-none focus:ring-0" 
                    placeholder="name@example.com" 
                  />
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">mail_outline</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="password">Mật khẩu</label>
                <div className="relative">
                  <input 
                    id="password" 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full glass-input text-white rounded-2xl px-4 py-3.5 pl-11 placeholder-slate-500 focus:outline-none focus:ring-0" 
                    placeholder="••••••••" 
                  />
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock_outline</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input 
                    id="confirmPassword" 
                    type="password" 
                    required 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full glass-input text-white rounded-2xl px-4 py-3.5 pl-11 placeholder-slate-500 focus:outline-none focus:ring-0" 
                    placeholder="••••••••" 
                  />
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock_reset</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-1">
                <input id="terms" type="checkbox" required className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary focus:ring-offset-slate-900 focus:ring-primary" />
                <label htmlFor="terms" className="text-sm text-slate-400">
                  Tôi đồng ý với <a href="#" className="text-primary hover:text-violet-400 underline">Điều khoản sử dụng</a>
                </label>
              </div>

              <button 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all transform active:scale-[0.98] mt-2 disabled:opacity-70"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
              </button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background-dark text-slate-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-700 rounded-xl hover:bg-slate-800/50 hover:border-slate-600 transition-colors group">
                <svg className="w-5 h-5 text-slate-200 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                </svg>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-700 rounded-xl hover:bg-slate-800/50 hover:border-slate-600 transition-colors group">
                <svg className="w-5 h-5 text-slate-200 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.1 1.88-2.5 5.75.1 6.74-.24.77-.58 1.55-.98 2.27-.51.92-1.07 1.8-2.17 2.2zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path>
                </svg>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">Apple</span>
              </button>
            </div>

            <p className="text-center text-slate-400 text-sm">
              Đã có tài khoản? 
              <Link to="/login" className="text-primary hover:text-violet-400 font-bold transition-colors ml-1">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .glass-input {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          background: rgba(30, 41, 59, 0.6);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
        }
        .glass-card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

export default RegisterPage;
