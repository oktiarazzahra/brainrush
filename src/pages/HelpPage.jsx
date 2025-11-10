// src/pages/HelpPage.jsx
import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'

const HelpPage = () => {
  const [activeCard, setActiveCard] = useState(null)

  const helpCategories = [
    {
      id: 1,
      icon: '🎯',
      title: 'Membuat Quiz',
      description: 'Pelajari cara membuat quiz interaktif',
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-green-500 to-emerald-500',
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
      color: 'from-purple-500 to-pink-500',
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
      color: 'from-orange-500 to-red-500',
      details: [
        'Pilih menu "Belajar Mandiri"',
        'Browse quiz yang tersedia',
        'Kerjakan tanpa tekanan waktu',
        'Lihat pembahasan setiap soal',
        'Track progress belajar kamu'
      ]
    }
  ]

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        
        <main className="flex-1 bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 mx-8 rounded-2xl p-8 mb-8 mt-10 overflow-y-auto">
          
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
                          <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="text-2xl mb-2">🚀</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Quiz Lebih Seru</h4>
                <p className="text-xs text-gray-600">Tambahkan gambar dan timer</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Skor Maksimal</h4>
                <p className="text-xs text-gray-600">Jawab cepat untuk bonus poin</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Main Dimana Saja</h4>
                <p className="text-xs text-gray-600">Akses dari HP, tablet, atau PC</p>
              </div>
            </div>
          </div>

          {/* Contact Support - Compact, Email Only */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-4xl mb-3 inline-block"
            >
              📧
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Butuh Bantuan Lebih?</h2>
            <p className="text-white/90 mb-4 text-sm">
              Hubungi tim support kami melalui email
            </p>
            <a
              href="mailto:support@brainrush.com"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>support@brainrush.com</span>
            </a>
          </div>

        </main>
      </div>
    </DashboardLayout>
  )
}

export default HelpPage
