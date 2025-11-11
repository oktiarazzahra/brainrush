import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { authService } from '../services/authService'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await authService.forgotPassword(email)
      setMessage(response.message || 'Link reset password telah dikirim ke email Anda')
      setEmail('')
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Gagal mengirim link reset password. Coba lagi.'
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
            <h1 className="text-4xl font-bold text-white mb-2">Lupa Password</h1>
            <p className="text-white/70">Masukkan email Anda untuk reset password</p>
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
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
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
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Ingat password Anda?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ForgotPasswordPage
