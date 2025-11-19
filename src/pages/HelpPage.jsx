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
      description: 'Pelajari cara membuat quiz interaktif',
      color: 'from-slate-400 to-slate-500',
      details: [
        'Klik menu "Buat" di sidebar',
        'Pilih "Buat Kuis Baru"',
        'Isi judul dan deskripsi quiz',
        'Tambahkan pertanyaan dan jawaban',
        'Simpan sebagai draft atau publish langsung'
      ]
    },
    {
      id: 2,
      icon: '🎮',
      title: 'Main Quiz Live',
      description: 'Bergabung dan ikuti quiz secara real-time',
      color: 'from-teal-400 to-cyan-500',
      details: [
        'Masukkan PIN quiz di halaman utama',
        'Klik tombol "JOIN"',
        'Pilih avatar dan masukkan nama',
        'Tunggu host memulai quiz',
        'Jawab pertanyaan dengan cepat untuk skor tinggi'
      ]
    },
    {
      id: 3,
      icon: '📊',
      title: 'Lihat Statistik',
      description: 'Cek performa dan history kamu',
      color: 'from-violet-400 to-purple-500',
      details: [
        'Buka menu "History" untuk melihat quiz lama',
        'Klik quiz untuk detail hasil',
        'Lihat ranking dan skor kamu',
        'Bandingkan dengan pemain lain',
        'Download hasil dalam format PDF'
      ]
    },
    {
      id: 4,
      icon: '📚',
      title: 'Belajar Mandiri',
      description: 'Latihan soal tanpa batasan waktu',
      color: 'from-amber-400 to-orange-400',
      details: [
        'Pilih menu "Belajar Mandiri"',
        'Browse quiz yang tersedia',
        'Kerjakan tanpa tekanan waktu',
        'Lihat pembahasan setiap soal',
        'Track progress belajar kamu'
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
        
        <main className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 mx-8 rounded-2xl p-8 mb-8 mt-10 overflow-y-auto">
          
          {/* Hero Section - Compact */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-block bg-white rounded-full p-4 shadow-lg mb-4"
            >
              <span className="text-5xl">💡</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pusat Bantuan</h1>
            <p className="text-gray-600">Temukan jawaban untuk pertanyaan kamu</p>
          </div>

          {/* Help Cards Grid - Compact */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => setActiveCard(activeCard === category.id ? null : category.id)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              >
                {/* Header dengan gradient - Compact */}
                <div className={`bg-gradient-to-br ${category.color} p-5 text-white`}>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      <p className="text-white/90 text-sm">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                <div className={`transition-all duration-300 ${
                  activeCard === category.id ? 'max-h-80' : 'max-h-0 overflow-hidden'
                }`}>
                  <div className="p-5">
                    <ul className="space-y-2">
                      {category.details.map((detail, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: activeCard === category.id ? 1 : 0, 
                            x: activeCard === category.id ? 0 : -10 
                          }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 pt-0.5">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expand Button - Compact */}
                <div className="px-5 pb-4">
                  <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 text-sm transition flex items-center justify-center gap-2">
                    {activeCard === category.id ? (
                      <>
                        <span>Tutup</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Selengkapnya</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Tips Section - Compact */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Tips & Trik
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Cari Quiz Favorit</h4>
                <p className="text-xs text-gray-600">Filter berdasarkan kategori di dashboard</p>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl p-4">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Kelola Quiz Kamu</h4>
                <p className="text-xs text-gray-600">Edit atau hapus quiz di menu "Buat"</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Lihat Progres</h4>
                <p className="text-xs text-gray-600">Cek history untuk review hasil quiz</p>
              </div>
            </div>
          </div>

          {/* Contact Support - Compact, Email Only */}
          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-lg p-6 text-white text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-4xl mb-3 inline-block"
            >
              📧
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Butuh Bantuan Lebih?</h2>
            <p className="text-white/90 mb-4 text-sm">
              Hubungi tim support kami atau laporkan masalah
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="mailto:support@brainrush.com"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-3 px-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email Langsung</span>
              </a>
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-amber-100 text-slate-800 font-bold py-3 px-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Laporkan Masalah</span>
              </button>
            </div>
          </div>

        </main>
      </div>

      {/* Report Problem Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">🚨</span>
                    Laporkan Masalah
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Bantu kami meningkatkan Brain Rush dengan melaporkan bug atau masalah yang Anda temui
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori Masalah *
                  </label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    required
                  >
                    <option value="bug">🐛 Bug / Error</option>
                    <option value="feature">💡 Permintaan Fitur</option>
                    <option value="ui">🎨 Masalah Tampilan (UI/UX)</option>
                    <option value="performance">⚡ Performa Lambat</option>
                    <option value="security">🔒 Masalah Keamanan</option>
                    <option value="other">❓ Lainnya</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Masalah *
                  </label>
                  <input
                    type="text"
                    value={reportForm.subject}
                    onChange={(e) => setReportForm({ ...reportForm, subject: e.target.value })}
                    placeholder="Contoh: Quiz tidak bisa disimpan"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Anda *
                  </label>
                  <input
                    type="email"
                    value={reportForm.email}
                    onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kami akan menghubungi Anda melalui email ini
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi Detail *
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Jelaskan masalah secara detail:&#10;- Apa yang terjadi?&#10;- Kapan masalah muncul?&#10;- Langkah-langkah untuk reproduce masalah&#10;- Screenshot (jika ada)"
                    rows="6"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Semakin detail penjelasan Anda, semakin cepat kami bisa membantu
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 mb-1">
                        Informasi Penting
                      </p>
                      <p className="text-xs text-slate-700">
                        Laporan Anda akan disimpan di sistem kami dan tim support akan segera meninjau. 
                        Anda akan menerima konfirmasi via email di <span className="font-bold">{reportForm.email || 'email Anda'}</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition shadow-lg hover:shadow-xl"
                  >
                    {sending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Kirim Laporan
                      </span>
                    )}
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
