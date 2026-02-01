import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background-dark font-display text-slate-200 relative selection:bg-primary selection:text-white overflow-y-auto overflow-x-hidden">
      {/* Background Blobs & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-grid opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-full">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background-dark/50 to-background-dark z-0"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-2xl">dashboard</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">LifeDash</h2>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center flex-1">
            <div className="relative w-80 h-80 mb-8 floating-shape">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/30 to-blue-500/30 blur-2xl"></div>
              <div className="relative w-full h-full glass-panel rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden transform rotate-6 hover:rotate-0 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                <div className="text-center p-8">
                  <span className="material-symbols-outlined text-8xl text-primary mb-4 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">rocket_launch</span>
                  <h3 className="text-2xl font-bold text-white mb-2">Tăng Tốc Năng Suất</h3>
                  <p className="text-slate-400 text-sm">Quản lý mọi khía cạnh cuộc sống của bạn tại một nơi duy nhất.</p>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-20 h-20 rounded-xl bg-blue-500/20 backdrop-blur-md border border-white/10 animate-bounce" style={{ animationDuration: '3s' }}></div>
              <div className="absolute -bottom-5 -left-10 w-16 h-16 rounded-full bg-purple-500/20 backdrop-blur-md border border-white/10 animate-pulse"></div>
            </div>
            <div className="text-center max-w-md">
              <p className="text-lg text-slate-300 italic">"Cách tốt nhất để dự đoán tương lai là tạo ra nó."</p>
            </div>
          </div>
          <div className="relative z-10 text-sm text-slate-500">
            © 2024 LifeDash Inc. Bảo lưu mọi quyền.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative min-h-screen lg:min-h-full overflow-y-visible">
          <div className="w-full max-w-md space-y-8 glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="text-center">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-3xl">dashboard</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Chào mừng trở lại!</h1>
              <p className="text-slate-400">Hãy đăng nhập để quản lý cuộc sống của bạn</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                  </div>
                  <input 
                    id="email" 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none glow-input transition-all duration-200 sm:text-sm" 
                    placeholder="name@example.com" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">Mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                  </div>
                  <input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none glow-input transition-all duration-200 sm:text-sm" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-slate-700 rounded bg-slate-900/50 cursor-pointer" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer select-none">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <div className="text-sm">
                  <a className="font-medium text-primary hover:text-violet-400 transition-colors" href="#">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>
              <div>
                <button 
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-slate-900 transition-all duration-300 glow-button disabled:opacity-70 disabled:cursor-not-allowed" 
                  type="submit"
                >
                  {loading && (
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <span className="material-symbols-outlined text-violet-300 group-hover:text-violet-100 transition-colors">
                        sync
                      </span>
                    </span>
                  )}
                  {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1b2537] text-slate-500 rounded-lg">Hoặc đăng nhập với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-2.5 border border-slate-700 rounded-xl shadow-sm bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 hover:border-slate-500" type="button">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center px-4 py-2.5 border border-slate-700 rounded-xl shadow-sm bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 hover:border-slate-500" type="button">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.135 6.05675C13.255 7.18675 12.865 8.16675 12.005 8.86675C11.235 9.51675 10.205 9.87675 9.175 9.87675C9.025 9.87675 8.875 9.86675 8.735 9.85675C8.595 8.65675 9.075 7.60675 9.905 6.89675C10.705 6.20675 11.755 5.86675 12.835 5.92675C12.885 5.92675 12.985 5.96675 13.135 6.05675ZM17.155 13.9168C17.115 15.6568 15.675 18.0668 13.925 18.0668C13.115 18.0668 12.865 17.5868 11.595 17.5868C10.365 17.5868 9.965 18.0168 9.295 18.0668C7.625 18.1668 5.755 15.4268 5.755 12.9168C5.755 10.9668 6.955 9.87675 8.445 9.87675C9.645 9.87675 10.325 10.6168 11.695 10.6168C12.965 10.6168 13.435 9.87675 14.885 9.87675C15.445 9.89675 16.515 10.0968 17.155 11.0468C17.075 11.0968 15.625 11.9468 15.655 13.7868C15.665 13.8268 15.665 13.8768 15.665 13.9168H17.155Z"></path>
                </svg>
                Apple
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-violet-400 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
        .glow-input:focus {
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.2);
          border-color: #8B5CF6;
        }
        .glow-button {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }
        .glow-button:hover {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
        }
        .floating-shape {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes sync {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .material-symbols-outlined[textContent="sync"] {
          animation: sync 2s linear infinite;
        }

        /* Autofill override for this page specifically */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #0f172a inset !important;
            -webkit-text-fill-color: white !important;
            caret-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
