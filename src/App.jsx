import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import JoinGamePage from './pages/JoinGamePage'
import PlayerWaitingRoomPage from './pages/PlayerWaitingRoomPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'  // ✅ TAMBAHAN BARU
import ResetPasswordPage from './pages/ResetPasswordPage'      // ✅ TAMBAHAN BARU
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import MyQuizzesPage from './pages/MyQuizzesPage'
import CreateQuizPage from './pages/CreateQuizPage'
import BelajarMandiriPage from './pages/BelajarMandiriPage'
import HistoryPage from './pages/HistoryPage'
import HelpPage from './pages/HelpPage'
import LeaderboardPage from './pages/LeaderboardPage'
import QuizReviewPage from './pages/QuizReviewPage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import QuizResultsPage from './pages/QuizResultsPage'
import EditQuizPage from './pages/EditQuizPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePageWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />        {/* ✅ BARU */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />  {/* ✅ BARU */}

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Join Routes */}
        <Route path="/join" element={<JoinGamePageWrapper />} />
        <Route path="/playerwaitingroom" element={<PlayerWaitingRoomPageWrapper />} />

        {/* Quiz Management Routes */}
        <Route path="/my-quizzes" element={<MyQuizzesPage />} />
        <Route path="/create-quiz" element={<CreateQuizPage />} />
        <Route path="/edit-quiz/:id" element={<EditQuizPage />} />

        {/* Waiting Room Route */}
        <Route path="/waiting-room" element={<WaitingRoomPage />} />

        {/* Quiz Results Route */}
        <Route path="/quiz-results/:quizId" element={<QuizResultsPage />} />

        {/* Additional Routes */}
        <Route path="/schedule" element={<BelajarMandiriPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/leaderboard/:quizId" element={<LeaderboardPage />} />
        <Route path="/quiz-review/:quizId" element={<QuizReviewPage />} />

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
  const navigate = useNavigate()
  const location = useLocation()
  const pin = location.state?.pin || ''
  
  const handleBack = () => {
    navigate('/dashboard')
  }
  
  const handleJoinNow = ({ avatar, name }) => {
    navigate('/playerwaitingroom', {
      state: {
        pin,
        playerName: name,
        avatar,
        fromDashboard: true
      }
    })
  }
  
  return <JoinGamePage onBack={handleBack} onJoinNow={handleJoinNow} />
}

const PlayerWaitingRoomPageWrapper = () => {
  return <PlayerWaitingRoomPage />
}

export default App
