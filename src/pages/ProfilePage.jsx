// src/pages/ProfilePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AvatarUpload from '../components/AvatarUpload'

const user = {
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sunflower99',
  username: 'tiiara_dina10',
  name: 'sunflower99',
  kelas: '3 SMA',
  bahasa: 'English'
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: user.username,
    name: user.name,
    kelas: user.kelas,
    bahasa: user.bahasa
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Profile updated:', formData)
  }

  const handleLogout = () => {
    navigate('/')
  }

  const handleAvatarChange = () => {
    console.log('Avatar change requested')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600">
      <div className="bg-gradient-to-r from-sky-600 to-blue-800 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-sky-100 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl font-bold">{'<'}</span>
            <span>Back</span>
          </motion.button>
          <motion.h1
            className="text-2xl font-bold text-white"
            variants={itemVariants}
          >
            Profile
          </motion.h1>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-6">
        <motion.div
          className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="flex flex-col items-center mb-6"
            variants={itemVariants}
          >
            <AvatarUpload
              avatar={formData.avatar || user.avatar}
              onChange={handleAvatarChange}
            />
            <h2 className="text-lg font-semibold text-blue-700 mt-2">{formData.username}</h2>
          </motion.div>
          <form onSubmit={handleSubmit}>
            <motion.div
              className="grid grid-cols-1 gap-y-4"
              variants={itemVariants}
            >
              <div>
                <label className="block font-medium text-blue-800">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block font-medium text-blue-800">Kelas</label>
                <input
                  type="text"
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block font-medium text-blue-800">Bahasa</label>
                <input
                  type="text"
                  name="bahasa"
                  value={formData.bahasa}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </motion.div>
            <motion.div
              className="mt-6 flex gap-4 justify-end"
              variants={itemVariants}
            >
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
              >
                Simpan
              </button>
              <button
                type="button"
                className="bg-gray-200 text-blue-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </motion.div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
