// src/pages/HistoryPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

const HistoryPage = () => {
  const navigate = useNavigate()
  const [selectedHistory, setSelectedHistory] = useState(null)

  const historyData = [
    { 
      id: 1, 
      title: 'Quiz Sejarah Indonesia', 
      date: '2 hari lalu',
      fullDate: '11 Oktober 2025, 14:30',
      players: 45,
      image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=250&fit=crop',
      bgColor: 'from-green-200 to-green-300',
      topScore: 95,
      avgScore: 78,
      yourRank: 5,
      duration: '25 menit',
      category: 'Sejarah'
    },
    { 
      id: 2, 
      title: 'Matematika Kelas 10', 
      date: '5 hari lalu',
      fullDate: '8 Oktober 2025, 10:15',
      players: 32,
      image: 'https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=400',
      bgColor: 'from-blue-200 to-blue-300',
      topScore: 100,
      avgScore: 82,
      yourRank: 3,
      duration: '30 menit',
      category: 'Matematika'
    },
    { 
      id: 3, 
      title: 'Fisika Kuantum', 
      date: '1 minggu lalu',
      fullDate: '6 Oktober 2025, 16:45',
      players: 28,
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=250&fit=crop',
      bgColor: 'from-purple-200 to-purple-300',
      topScore: 98,
      avgScore: 75,
      yourRank: 8,
      duration: '35 menit',
      category: 'Sains'
    },
    { 
      id: 4, 
      title: 'Bahasa Inggris Grammar', 
      date: '2 minggu lalu',
      fullDate: '29 September 2025, 09:20',
      players: 50,
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop',
      bgColor: 'from-pink-200 to-pink-300',
      topScore: 97,
      avgScore: 80,
      yourRank: 12,
      duration: '28 menit',
      category: 'Bahasa'
    },
    { 
      id: 5, 
      title: 'Biologi Sel', 
      date: '3 minggu lalu',
      fullDate: '22 September 2025, 13:00',
      players: 38,
      image: 'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=400&h=250&fit=crop',
      bgColor: 'from-yellow-200 to-orange-300',
      topScore: 94,
      avgScore: 77,
      yourRank: 6,
      duration: '32 menit',
      category: 'Sains'
    }
  ]

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        {/* Header Brain Rush dan Profile dihapus */}
        
        <main className="flex-1 bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 mx-8 rounded-2xl p-8 mb-8 mt-10 overflow-y-auto">
          <div className="mb-6 inline-block bg-sky-400 text-white font-bold px-4 py-1 rounded-full text-sm">
            {historyData.length} Quiz Dimainkan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyData.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedHistory(item)}
              >
                <div className={`h-36 bg-gradient-to-r ${item.bgColor} flex items-center justify-center overflow-hidden relative`}>
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1">
                    <span className="text-xs font-bold text-gray-700">#{item.yourRank}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{item.date}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-600 font-bold">{item.players} pemain</p>
                    <span className="text-xs bg-green-200 text-green-800 rounded-full px-3 py-1 font-bold">
                      Rank #{item.yourRank}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {historyData.length === 0 && (
            <div className="text-center text-white mt-32">
              <div className="mb-4">
                <svg className="w-24 h-24 mx-auto text-blue-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path>
                </svg>
              </div>
              <p className="text-2xl font-bold mb-2">Belum ada history quiz</p>
              <p className="text-lg text-blue-200 mb-6">
                History quiz yang pernah dimainkan akan muncul di sini
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Detail History */}
      <AnimatePresence>
        {selectedHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedHistory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{selectedHistory.title}</h2>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ranking Highlight */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6 text-center">
                <p className="text-white text-sm mb-2">Peringkat Kamu</p>
                <p className="text-white text-6xl font-bold">#{selectedHistory.yourRank}</p>
                <p className="text-white/80 text-sm mt-2">dari {selectedHistory.players} pemain</p>
              </div>

              {/* Statistik Detail */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-green-600 font-bold text-3xl">{selectedHistory.topScore}</p>
                  <p className="text-gray-600 text-sm">Skor Tertinggi</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-blue-600 font-bold text-3xl">{selectedHistory.avgScore}</p>
                  <p className="text-gray-600 text-sm">Rata-rata</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-purple-600 font-bold text-2xl">{selectedHistory.players}</p>
                  <p className="text-gray-600 text-sm">Total Pemain</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-orange-600 font-bold text-2xl">{selectedHistory.duration}</p>
                  <p className="text-gray-600 text-sm">Durasi</p>
                </div>
              </div>

              {/* Info Tambahan */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-semibold text-gray-800">{selectedHistory.category}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Waktu Main:</span>
                  <span className="font-semibold text-gray-800">{selectedHistory.fullDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                  Main Lagi
                </button>
                <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition">
                  Bagikan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default HistoryPage
