import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { authService } from '../services/authService'

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { token } = useParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      const response = await authService.resetPassword(token, password)
      setMessage(response.message || 'Password berhasil direset!')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Gagal reset password. Link mungkin sudah expired.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-white/70">Masukkan password baru Anda</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-white text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password Baru
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password baru"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Mereset...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ResetPasswordPage
