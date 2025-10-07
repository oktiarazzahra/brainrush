import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import JoinGamePage from './pages/JoinGamePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/join" element={<JoinGamePage />} />
          
          {/* Dashboard routes - TAMBAHAN BARU */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-quiz" element={<DashboardPage />} />
          <Route path="/library" element={<DashboardPage />} />
          <Route path="/history" element={<DashboardPage />} />
          <Route path="/questions" element={<DashboardPage />} />
          
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
