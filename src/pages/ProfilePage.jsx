// src/pages/ProfilePage.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const user = {
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sunflower99', // Avatar DiceBear, bisa diganti dari state/global
  username: 'tiiara_dina10',
  name: 'sunflower99',
  kelas: '3 SMA',
  bahasa: 'English'
}

const ProfilePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 to-blue-300">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-xl rounded-3xl bg-white bg-opacity-10 backdrop-blur-lg p-8 border-2 border-blue-300 mt-8">
          <div className="flex justify-between mb-8">
            <button
              className="text-white font-bold"
              onClick={() => navigate(-1)}
            >Back</button>
            <div className="text-white font-bold text-xl">Dasboard saya</div>
          </div>
          <div className="flex flex-col items-center mb-6">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full bg-white p-2 shadow-lg mb-2"
            />
            <div className="text-white text-2xl font-bold mb-2">{user.name}</div>
          </div>
          <div className="space-y-4">
            <div className="rounded-full bg-white/30 p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Nama Pengguna</div>
                <div className="text-white text-sm">{user.username}</div>
              </div>
              <span className="text-white opacity-60 text-2xl">&gt;</span>
            </div>
            <div className="rounded-full bg-white/30 p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Nama</div>
                <div className="text-white text-sm">{user.name}</div>
              </div>
              <span className="text-white opacity-60 text-2xl">&gt;</span>
            </div>
            <div className="rounded-full bg-white/30 p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Kelas</div>
                <div className="text-white text-sm">{user.kelas}</div>
              </div>
              <span className="text-white opacity-60 text-2xl">&gt;</span>
            </div>
            <div className="rounded-full bg-white/30 p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Bahasa</div>
                <div className="text-white text-sm">{user.bahasa}</div>
              </div>
              <span className="text-white opacity-60 text-2xl">&gt;</span>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-bold shadow-lg"
              onClick={() => navigate('/login')}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
      <Footer />
      <div className="bg-blue-900 py-2 px-6 text-blue-100 flex justify-between items-center text-xs">
        <div className="flex space-x-8">
          <span>About</span>
          <span>Terms & Condition</span>
          <span>Contact Us</span>
          <span>Help Center</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Follow us on</span>
          <span className="text-lg">🌐</span>
          <span className="text-lg">🔵</span>
          <span className="text-lg">🟠</span>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
