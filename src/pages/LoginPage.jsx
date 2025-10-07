// src/pages/LoginPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: panggil API login
    navigate('/dashboard') // Arahkan ke dashboard setelah login
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Masuk</h1>
            <p className="text-white/70">Masuk ke akun Brain Rush Anda</p>
          </div>

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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Masuk
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Belum punya akun?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default LoginPage
