// src/pages/RegisterPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const RegisterPage = () => {
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Panggil API register di sini
    navigate('/dashboard')
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
      <Header />

      <div className="flex-1 flex items-center justify-center px-2">
        <div className="max-w-sm w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20">
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-white mb-1">Daftar</h1>
            <p className="text-white/70 text-sm">Buat akun Brain Rush baru</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nama" className="block text-white/80 font-medium mb-1 text-sm">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-white/80 font-medium mb-1 text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-white/80 font-medium mb-1 text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat password"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label htmlFor="konfirmasi" className="block text-white/80 font-medium mb-1 text-sm">
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="konfirmasi"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                placeholder="Ulangi password"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-bold py-2 rounded-lg shadow-lg text-sm transform hover:scale-105 transition-all duration-300"
            >
              Daftar
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-white/70 text-sm">
              Sudah punya akun?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              >
                Login di sini
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default RegisterPage
