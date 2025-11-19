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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            My Profile
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center border border-blue-100">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-3 border-solid border-blue-600 border-r-transparent mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error && !userData ? (
          <div className="bg-white rounded-lg shadow p-12 text-center max-w-md border border-blue-100">
            <p className="text-lg text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Go to Login
            </button>
          </div>
        ) : userData ? (
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-blue-100 p-6 md:p-8">
            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Avatar Selection */}
            <div className="mb-6 pb-6 border-b border-blue-100">
              <h2 className="text-base font-semibold text-blue-900 mb-4">Avatar</h2>
              <AvatarSelector
                selectedAvatar={selectedAvatar}
                onAvatarSelect={setSelectedAvatar}
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-blue-100">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-600 mb-1">Games Played</div>
                <div className="text-2xl font-semibold text-blue-900">{userData.totalGamesPlayed || 0}</div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-600 mb-1">Total Score</div>
                <div className="text-2xl font-semibold text-blue-900">{userData.totalScore || 0}</div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:opacity-50 text-sm transition"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium text-sm transition shadow-sm"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
