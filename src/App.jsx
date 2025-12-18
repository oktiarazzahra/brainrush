import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import JoinGamePage from './pages/JoinGamePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyOTPPage from './pages/VerifyOTPPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import MyQuizzesPage from './pages/MyQuizzesPage'
import CreateQuizPage from './pages/CreateQuizPage'
import BelajarMandiriPage from './pages/BelajarMandiriPage'
import HistoryPage from './pages/HistoryPage'
import HelpPage from './pages/HelpPage'
import QuizReviewPage from './pages/QuizReviewPage'
import QuizResultsPage from './pages/QuizResultsPage'
import EditQuizPage from './pages/EditQuizPage'
import TakeQuizPage from './pages/TakeQuizPage'
import AdminSupportPage from './pages/AdminSupportPage'
import AdminUsersPage from './pages/AdminUsersPage'
import PlayerGameplayPage from './pages/PlayerGameplayPage'
import PinMonitoringPage from './pages/PinMonitoringPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePageWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Join Routes */}
        <Route path="/join" element={<JoinGamePageWrapper />} />

        {/* Quiz Management Routes */}
        <Route path="/my-quizzes" element={<MyQuizzesPage />} />
        <Route path="/create-quiz" element={<CreateQuizPage />} />
        <Route path="/edit-quiz/:id" element={<EditQuizPage />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuizPage />} />

        {/* Live Game Routes */}
        <Route path="/playergameplay" element={<PlayerGameplayPage />} />
        <Route path="/pin-monitoring" element={<PinMonitoringPage />} />

        {/* Quiz Results Route */}
        <Route path="/quiz-results/:quizId" element={<QuizResultsPage />} />

        {/* Additional Routes */}
        <Route path="/belajar-mandiri" element={<BelajarMandiriPage />} />
        <Route path="/schedule" element={<BelajarMandiriPage />} /> {/* Legacy route - redirect ke yang sama */}
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/quiz-review/:quizId" element={<QuizReviewPage />} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/support" element={<AdminSupportPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

const HomePageWrapper = () => {
  const navigate = useNavigate()
  const handleJoin = (pin) => {
    navigate('/join', { state: { pin } })
  }
  return <HomePage onJoin={handleJoin} />
}

const JoinGamePageWrapper = () => {
  return <JoinGamePage />
}

export default App
