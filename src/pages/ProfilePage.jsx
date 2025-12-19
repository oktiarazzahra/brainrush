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
    email: '',
    age: '',
    phone: '',
    bio: '',
    school: ''
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
        email: user.email || '',
        age: user.age || '',
        phone: user.phone || '',
        bio: user.bio || '',
        school: user.school || ''
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
        avatar: `avatar-${selectedAvatar}`,
        age: formData.age,
        phone: formData.phone,
        bio: formData.bio,
        school: formData.school
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
            <span>Kembali</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Profil Saya
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
              Ke Halaman Login
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
            <div className="text-center mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Avatar</h2>
              <AvatarSelector
                selectedAvatar={selectedAvatar}
                onAvatarSelect={setSelectedAvatar}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1.5">Email tidak dapat diubah</p>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition"
                />
              </div>

              {/* Age Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Umur
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Masukkan umur"
                  min="1"
                  max="150"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition"
                />
              </div>

              {/* School Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sekolah / Universitas
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Masukkan nama sekolah atau universitas"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition"
                />
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio / Tentang Saya
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Ceritakan tentang diri Anda..."
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition shadow-md"
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
