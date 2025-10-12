// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import JoinGamePage from './pages/JoinGamePage'
import MyQuizzesPage from './pages/MyQuizzesPage'
import CreateQuizPage from './pages/CreateQuizPage'


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/join" element={<JoinGamePage />} />
        
        {/* Quiz Management Routes */}
        <Route path="/my-quizzes" element={<MyQuizzesPage />} />
        <Route path="/create-quiz" element={<CreateQuizPage />} />
        <Route path="/edit-quiz/:id" element={<CreateQuizPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
