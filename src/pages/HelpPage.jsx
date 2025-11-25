// src/pages/HelpPage.jsx
import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { supportService } from '../services/supportService'

const HelpPage = () => {
  const [activeCard, setActiveCard] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportForm, setReportForm] = useState({
    subject: '',
    category: 'bug',
    description: '',
    email: ''
  })
  const [sending, setSending] = useState(false)

  const helpCategories = [
    {
      id: 1,
      icon: '🎯',
      title: 'Membuat Quiz',
      description: 'Cara membuat dan kelola quiz',
      color: 'from-blue-400 to-blue-500',
      details: [
        'Klik menu "Buat" di sidebar',
        'Klik tombol "Tambah Kuis"',
        'Isi judul, kategori, dan deskripsi quiz',
        'Pilih tipe quiz (Live/Jadwal) dan mode timer',
        'Tambahkan soal dengan berbagai tipe (Pilihan Ganda/Isian/Benar-Salah)',
        'Simpan sebagai draft atau publish langsung'
      ]
    },
    {
      id: 2,
      icon: '🎮',
      title: 'Bermain Quiz Live',
      description: 'Bergabung ke live game dengan PIN',
      color: 'from-purple-400 to-purple-500',
      details: [
        'Dapatkan PIN dari host yang membuat live game',
        'Masukkan PIN di dashboard atau halaman utama',
        'Klik tombol "JOIN"',
        'Pilih avatar dan masukkan nama unik kamu',
        'Tunggu di waiting room sampai host memulai',
        'Jawab pertanyaan dengan cepat dan tepat!'
      ]
    },
    {
      id: 3,
      icon: '📚',
      title: 'Belajar Mandiri',
      description: 'Latihan quiz sendiri tanpa tekanan',
      color: 'from-green-400 to-green-500',
      details: [
        'Pilih menu "Belajar Mandiri" di sidebar',
        'Pilih quiz yang ingin dikerjakan',
        'Kerjakan quiz sesuai mode timer yang dipilih',
        'Quiz akan tersimpan otomatis saat dikerjakan',
        'Lihat pembahasan dan review jawaban setelah selesai',
        'Cek statistik dan progress belajar kamu'
      ]
    },
    {
      id: 4,
      icon: '📊',
      title: 'Lihat Riwayat',
      description: 'Cek history bermain dan hosting',
      color: 'from-orange-400 to-orange-500',
      details: [
        'Menu "Riwayat Bermain" untuk history sebagai player',
        'Tab "Riwayat Host" di menu "Buat" untuk history hosting',
        'Klik quiz untuk lihat detail skor dan ranking',
        'Review jawaban benar dan salah di setiap soal',
        'Lihat statistik performa kamu'
      ]
    }
  ]

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    
    if (!reportForm.subject || !reportForm.description || !reportForm.email) {
      alert('Mohon lengkapi semua field!')
      return
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reportForm.email)) {
      alert('Format email tidak valid!')
      return
    }

    setSending(true)
    
    try {
      // Kirim ke backend API
      const response = await supportService.submitTicket(reportForm)
      
      // Tampilkan success message dengan ticket ID
      alert(
        `✅ Laporan berhasil dikirim!\n\n` +
        `Ticket ID: ${response.data.ticketId}\n\n` +
        `Tim kami akan segera meninjau laporan Anda dan menghubungi melalui email jika diperlukan.\n\n` +
        `Terima kasih telah membantu meningkatkan Brain Rush!`
      )
      
      // Reset form dan tutup modal
      setReportForm({ subject: '', category: 'bug', description: '', email: '' })
      setShowReportModal(false)
      
    } catch (error) {
      console.error('Submit ticket error:', error)
      alert(
        `❌ Gagal mengirim laporan\n\n` +
        `${error.message || 'Terjadi kesalahan. Silakan coba lagi.'}`
      )
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setReportForm({ subject: '', category: 'bug', description: '', email: '' })
    setShowReportModal(false)
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        
        <main className="flex-1 bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 mx-8 rounded-2xl p-8 mb-8 mt-10 overflow-y-auto">
          
          {/* Hero Section - Simple */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 Panduan Brain Rush</h1>
            <p className="text-gray-700">Pelajari cara menggunakan fitur-fitur utama</p>
          </div>

          {/* Help Cards Grid - Simple */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${category.color} p-4 text-white`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold">{category.title}</h3>
                      <p className="text-white/90 text-xs">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Content - Always visible */}
                <div className="p-4">
                  <ul className="space-y-2">
                    {category.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Tips Section - Simple */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">⚡ Tips Cepat</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🔍</div>
                <p className="text-xs font-semibold text-gray-800">Cari quiz dengan filter kategori</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🎮</div>
                <p className="text-xs font-semibold text-gray-800">Host quiz tipe "Live" untuk dapat PIN</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📝</div>
                <p className="text-xs font-semibold text-gray-800">Upload cover quiz agar menarik</p>
              </div>
            </div>
          </div>

          {/* Contact Support - Simple */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md p-5 text-white text-center">
            <div className="text-3xl mb-2">🚨</div>
            <h2 className="text-xl font-bold mb-2">Ada Masalah?</h2>
            <p className="text-white/90 mb-4 text-sm">Laporkan bug atau masalah ke admin</p>
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-white text-blue-700 font-bold py-2 px-6 rounded-lg hover:bg-blue-50 transition-all"
            >
              📝 Laporkan Sekarang
            </button>
          </div>

        </main>
      </div>

      {/* Report Problem Modal - Simple */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">🚨 Laporkan Masalah</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori *</label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="bug">🐛 Bug / Error</option>
                    <option value="feature">💡 Permintaan Fitur</option>
                    <option value="ui">🎨 Masalah Tampilan</option>
                    <option value="performance">⚡ Performa Lambat</option>
                    <option value="other">❓ Lainnya</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Judul *</label>
                  <input
                    type="text"
                    value={reportForm.subject}
                    onChange={(e) => setReportForm({ ...reportForm, subject: e.target.value })}
                    placeholder="Contoh: Quiz tidak bisa disimpan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={reportForm.email}
                    onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi *</label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Jelaskan masalah secara detail..."
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    ℹ️ Laporan akan dikirim ke admin dan kamu akan dapat konfirmasi via email
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
                  >
                    {sending ? 'Mengirim...' : 'Kirim'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default HelpPage
