import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/project/ProjectsPage';
import ProjectDetailPage from './pages/project/ProjectDetailPage';
import TasksPage from './pages/task/TasksPage';
import HabitsPage from './pages/habit/HabitsPage';
import FinancePage from './pages/finance/FinancePage';
import NotesPage from './pages/note/NotesPage';
import PomodoroPage from './pages/pomodoro/PomodoroPage';
import GoalsPage from './pages/goal/GoalsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/landing/LandingPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="goals" element={<GoalsPage />} />
            {/* Fallback for other routes as placeholders */}
            <Route path="*" element={<div className="flex items-center justify-center h-full text-slate-500">Trang này đang được phát triển...</div>} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
