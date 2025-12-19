// src/pages/HistoryPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { gameService } from '../services/gameService'

const HistoryPage = () => {
  const navigate = useNavigate()
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalGames: 0, playerGames: 0, hostGames: 0 })

  // Fetch history data from backend
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await gameService.getUserHistory()
      // Filter only player games for History Page
      const playerGames = response.data.history.filter(game => game.role === 'player')
      setHistoryData(playerGames)
      setStats({
        totalGames: playerGames.length,
        playerGames: playerGames.length,
        hostGames: 0
      })
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format date to relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Kemarin'
    if (diffDays < 7) return `${diffDays} hari lalu`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`
    return `${Math.floor(diffDays / 365)} tahun lalu`
  }

  // Format date to full date
  const formatFullDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get gradient color based on category or index
  const getGradientColor = (category, index) => {
    const colors = [
      'from-green-200 to-green-300',
      'from-blue-200 to-blue-300',
      'from-purple-200 to-purple-300',
      'from-pink-200 to-pink-300',
      'from-yellow-200 to-orange-300',
      'from-red-200 to-red-300',
      'from-indigo-200 to-indigo-300'
    ]
    return colors[index % colors.length]
  }

  // Get default image based on category
  const getDefaultImage = (category) => {
    const images = {
      'Sejarah': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=250&fit=crop',
      'Matematika': 'https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Sains': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=250&fit=crop',
      'Bahasa': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop',
      'General': 'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=400&h=250&fit=crop'
    }
    return images[category] || images['General']
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        {/* Header Brain Rush dan Profile dihapus */}
        
        <main className="flex-1 bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 mx-8 rounded-2xl p-8 mb-8 mt-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-block bg-sky-400 text-white font-bold px-4 py-1 rounded-full text-sm">
              {stats.totalGames} Quiz Dimainkan sebagai Player
            </div>
          </div>

          {loading ? (
            <div className="text-center text-white mt-32">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-xl font-bold">Memuat riwayat...</p>
            </div>
          ) : (
            <>
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
                    <div className={`h-36 bg-gradient-to-r ${getGradientColor(item.category, idx)} flex items-center justify-center overflow-hidden relative`}>
                      <img 
                        src={item.coverImage || getDefaultImage(item.category)} 
                        alt={item.quizTitle} 
                        className="h-full w-full object-cover" 
                      />
                      {item.yourRank && (
                        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1">
                          <span className="text-xs font-bold text-gray-700">#{item.yourRank}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">{item.quizTitle}</h3>
                        <p className="text-sm text-gray-600 mb-1">{formatDate(item.date)}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-blue-600 font-bold">{item.players} pemain</p>
                          {item.yourRank && (
                            <span className="text-xs bg-green-200 text-green-800 rounded-full px-3 py-1 font-bold">
                              Rank #{item.yourRank}
                            </span>
                          )}
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
            </>
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
                <h2 className="text-3xl font-bold text-gray-800">{selectedHistory.quizTitle}</h2>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Simple Participation Info */}
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-6 mb-6 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-white text-lg font-semibold mb-2">Telah Mengikuti Kuis Ini</p>
                <p className="text-white/90 text-sm">
                  {formatFullDate(selectedHistory.date)}
                </p>
              </div>

              {/* Info Tambahan */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-semibold text-gray-800">{selectedHistory.category}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">PIN Kuis:</span>
                  <span className="font-semibold text-gray-800">{selectedHistory.PIN}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Soal:</span>
                  <span className="font-semibold text-gray-800">{selectedHistory.totalQuestions || '-'} soal</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setSelectedHistory(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default HistoryPage
