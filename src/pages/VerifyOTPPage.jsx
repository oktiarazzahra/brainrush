import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { authService } from '../services/authService'

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) {
      navigate('/register')
    }
  }, [email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (otp.length !== 6) {
      setError('Kode OTP harus 6 digit')
      return
    }

    setLoading(true)

    try {
      const response = await authService.verifyOTP({ email, otp })
      setSuccess('Email berhasil diverifikasi!')
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setResending(true)

    try {
      await authService.resendOTP({ email })
      setSuccess('Kode OTP baru telah dikirim ke email Anda')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
      <Header />

      <div className="flex-1 flex items-center justify-center px-2">
        <div className="max-w-sm w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifikasi Email</h1>
            <p className="text-white/80 text-sm">
              Kode OTP telah dikirim ke<br />
              <span className="font-semibold">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-center text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-white text-center text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-white/80 font-medium mb-2 text-sm text-center">
                Masukkan Kode OTP (6 Digit)
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm mb-2">
              Tidak menerima kode?
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-yellow-400 hover:text-yellow-300 font-medium underline disabled:opacity-50"
            >
              {resending ? 'Mengirim...' : 'Kirim ulang OTP'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default VerifyOTPPage
