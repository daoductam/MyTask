import { useState, useEffect } from 'react';
import financeService from '../../services/financeService';
import Header from '../../components/layout/Header';
import { useLayout } from '../../context/LayoutContext';

function FinancePage() {
  const { toggleSidebar } = useLayout();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    balanceChangePercent: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    note: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [currentMonth, currentYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        financeService.getTransactions(currentYear, currentMonth),
        financeService.getMonthlySummary(currentYear, currentMonth)
      ]);
      
      setTransactions(transactionsRes.data.data || []);
      
      const summaryData = summaryRes.data.data;
      setSummary({
        totalBalance: summaryData.balance || 0,
        monthlyIncome: summaryData.income || 0,
        monthlyExpense: summaryData.expense || 0,
        balanceChangePercent: summaryData.growth || 0
      });
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await financeService.getCategories();
      const cats = response.data.data || [];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (categories.length > 0 && !newTransaction.categoryId) {
      const firstValid = categories.find(c => c.type === newTransaction.type);
      if (firstValid) {
        setNewTransaction(prev => ({ ...prev, categoryId: firstValid.id }));
      }
    }
  }, [categories, newTransaction.type]);

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      if (selectedTransaction) {
        await financeService.updateTransaction(selectedTransaction.id, newTransaction);
      } else {
        await financeService.createTransaction(newTransaction);
      }
      setShowModal(false);
      setSelectedTransaction(null);
      setNewTransaction({
        amount: '',
        type: 'EXPENSE',
        categoryId: categories[0]?.id || '',
        note: '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Có lỗi xảy ra khi lưu giao dịch.');
    }
  };

  const openEditModal = (tx) => {
    setSelectedTransaction(tx);
    setNewTransaction({
      amount: tx.amount,
      type: tx.type,
      categoryId: tx.categoryId,
      note: tx.note || '',
      transactionDate: tx.transactionDate ? tx.transactionDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      try {
        await financeService.deleteTransaction(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading && transactions.length === 0) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
  }

  return (
    <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 shrink-0">
        <div className="w-full md:w-auto flex-1 max-w-xl flex items-center gap-3">
           <button 
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors shrink-0"
              >
                <span className="material-icons-round">menu</span>
           </button>
           <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý Tài chính</h1>
              <p className="text-slate-500 dark:text-slate-400">Theo dõi dòng tiền và ngân sách của bạn.</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 shrink-0">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-icons-round text-7xl text-primary">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Số dư hiện tại</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{formatCurrency(summary.totalBalance)}</h3>
            <p className={`text-xs flex items-center gap-1 ${summary.balanceChangePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              <span className="material-icons-round text-sm">
                {summary.balanceChangePercent >= 0 ? 'trending_up' : 'trending_down'}
              </span> 
              {Math.abs(summary.balanceChangePercent).toFixed(1)}% so với tháng trước
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group border-emerald-500/20">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-icons-round text-7xl text-emerald-500">payments</span>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Thu nhập tháng này</p>
            <h3 className="text-3xl font-bold text-emerald-500 mb-2">{formatCurrency(summary.monthlyIncome)}</h3>
            <p className="text-xs text-slate-500">Tháng {currentMonth + 1}/{currentYear}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group border-rose-500/20">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-icons-round text-7xl text-rose-500">shopping_cart</span>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Chi tiêu tháng này</p>
            <h3 className="text-3xl font-bold text-rose-500 mb-2">{formatCurrency(summary.monthlyExpense)}</h3>
            <p className="text-xs text-slate-500">Tháng {currentMonth + 1}/{currentYear}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full"></span>
          Lịch sử giao dịch
        </h2>
        <button 
          onClick={() => {
            fetchCategories(); // Refetch to ensure seeding works
            setShowModal(true);
          }}
          className="group flex items-center gap-2 bg-primary hover:bg-violet-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all font-medium"
        >
          <span className="material-icons-round text-xl group-hover:rotate-90 transition-transform">add</span>
          <span>Thêm giao dịch</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md z-10">
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Loại</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ghi chú / Danh mục</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Số tiền</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      <span className="material-icons-round">{tx.categoryIcon || (tx.type === 'INCOME' ? 'arrow_upward' : 'arrow_downward')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{tx.note || tx.categoryName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tx.categoryName} • {new Date(tx.transactionDate).toLocaleDateString('vi-VN')}</p>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => openEditModal(tx)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        <span className="material-icons-round text-lg">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 dark:text-slate-500 hover:bg-rose-500/10 transition-all"
                      >
                        <span className="material-icons-round text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">Chưa có giao dịch nào trong tháng này.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/20 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedTransaction ? 'Chỉnh sửa giao dịch' : 'Giao dịch mới'}</h3>
              <button onClick={() => { setShowModal(false); setSelectedTransaction(null); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateTransaction} className="p-6 md:p-8 space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <button 
                  type="button"
                  onClick={() => {
                    const firstValid = categories.find(c => c.type === 'EXPENSE');
                    setNewTransaction({
                      ...newTransaction, 
                      type: 'EXPENSE',
                      categoryId: firstValid ? firstValid.id : ''
                    });
                  }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >Chi tiêu</button>
                <button 
                  type="button"
                  onClick={() => {
                    const firstValid = categories.find(c => c.type === 'INCOME');
                    setNewTransaction({
                      ...newTransaction, 
                      type: 'INCOME',
                      categoryId: firstValid ? firstValid.id : ''
                    });
                  }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >Thu nhập</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Số tiền</label>
                  <input 
                    type="number" required
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Ngày</label>
                  <input 
                    type="date" required
                    value={newTransaction.transactionDate}
                    onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Danh mục</label>
                <div className="relative">
                  <select 
                    value={newTransaction.categoryId}
                    onChange={(e) => setNewTransaction({...newTransaction, categoryId: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-white dark:bg-slate-800">Chọn danh mục</option>
                    {categories.filter(c => c.type === newTransaction.type).map(c => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <span className="material-icons-round">expand_more</span>
                  </div>
                </div>
                {categories.filter(c => c.type === newTransaction.type).length === 0 && (
                  <p className="text-[10px] text-rose-400 mt-2 ml-1 flex items-center gap-1">
                    <span className="material-icons-round text-xs">error_outline</span>
                    Không có danh mục nào. 
                    <button type="button" onClick={fetchCategories} className="underline hover:text-slate-800 dark:hover:text-white">Thử tải lại</button>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Ghi chú</label>
                <textarea 
                  rows="2"
                  value={newTransaction.note}
                  onChange={(e) => setNewTransaction({...newTransaction, note: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Hóa đơn tiền điện, Ăn trưa..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-violet-600 transition-all font-bold">Lưu giao dịch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default FinancePage;
