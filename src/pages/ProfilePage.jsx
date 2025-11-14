// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'
import AvatarSelector from '../components/AvatarSelector'
import { authService } from '../services/authService'

const ProfilePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userData, setUserData] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await authService.getProfile()
      const user = response.data.user
      setUserData(user)
      setFormData({
        name: user.name || '',
        email: user.email || ''
      })
      // Extract avatar index from stored avatar or default to 0
      if (user.avatar && user.avatar.includes('avatar-')) {
        const avatarIndex = parseInt(user.avatar.split('avatar-')[1]) || 0
        setSelectedAvatar(avatarIndex)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat profile')
      if (err.response?.status === 401) {
        authService.logout()
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Nama tidak boleh kosong')
      return
    }

    try {
      setSaving(true)
      const response = await authService.updateProfile({
        name: formData.name,
        avatar: `avatar-${selectedAvatar}`
      })
      setSuccess('Profile berhasil diupdate!')
      setUserData(response.data.user)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-5 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2 font-semibold"
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">←</span>
            <span className="text-lg">Back</span>
          </motion.button>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            👤 My Profile
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {loading ? (
          <motion.div
            className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
            <p className="text-xl font-semibold text-purple-600">Loading your profile...</p>
          </motion.div>
        ) : error && !userData ? (
          <motion.div
            className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-12 text-center max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl mb-4">😢</div>
            <p className="text-xl font-semibold text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              Go to Login
            </button>
          </motion.div>
        ) : userData ? (
          <motion.div
            className="w-full max-w-2xl bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Success/Error Messages */}
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl font-semibold text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ❌ {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                className="mb-6 p-4 bg-green-100 border-2 border-green-400 text-green-700 rounded-xl font-semibold text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✅ {success}
              </motion.div>
            )}

            {/* Avatar Selection */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Choose Your Avatar</h2>
              <AvatarSelector
                selectedAvatar={selectedAvatar}
                onAvatarSelect={setSelectedAvatar}
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-2">🎮</div>
                <div className="text-3xl font-bold">{userData.totalGamesPlayed || 0}</div>
                <div className="text-sm opacity-90">Games Played</div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white text-center shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-3xl font-bold">{userData.totalScore || 0}</div>
                <div className="text-sm opacity-90">Total Score</div>
              </motion.div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-purple-700 mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-600 cursor-not-allowed font-medium"
                />
                <p className="text-xs text-gray-500 mt-1 italic">Email cannot be changed</p>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-bold text-purple-700 mb-2">
                  ✏️ Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 disabled:opacity-50 font-medium transition-all"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? '💾 Saving...' : '💾 Save Changes'}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🚪 Logout
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
