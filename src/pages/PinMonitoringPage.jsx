import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameService } from '../services/gameService'
import useConfirm from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

const PinMonitoringPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, PIN, pinExpiresAt, quizTitle, totalQuestions } = location.state || {}
  const { confirmDialog, showConfirm, hideConfirm } = useConfirm()
  const { toast, showSuccess, showError, hideToast } = useToast()

  const [timeLeft, setTimeLeft] = useState(0)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId || !PIN || !pinExpiresAt) {
      navigate('/my-quizzes')
      return
    }

    // Calculate initial time left
    updateTimeLeft()

    // Update time every second
    const interval = setInterval(() => {
      updateTimeLeft()
    }, 1000)

    // Fetch players periodically
    fetchPlayers()
    const playersInterval = setInterval(fetchPlayers, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(playersInterval)
    }
  }, [])

  const updateTimeLeft = () => {
    const now = new Date()
    const expiryDate = new Date(pinExpiresAt)
    const diffMs = expiryDate - now

    if (diffMs <= 0) {
      setTimeLeft(0)
      // PIN expired, navigate to history
      setTimeout(() => {
        navigate('/my-quizzes')
      }, 2000)
    } else {
      setTimeLeft(Math.floor(diffMs / 1000))
    }
  }

  const fetchPlayers = async () => {
    try {
      const response = await gameService.getGame(gameId)
      setPlayers(response.data.game.players || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching players:', error)
      setLoading(false)
    }
  }

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return '00:00:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyPIN = () => {
    navigator.clipboard.writeText(PIN)
    showSuccess('PIN berhasil disalin!')
  }

  const handleEndEarly = () => {
    showConfirm({
      title: 'Akhiri Kuis Sekarang?',
      message: 'Semua player yang sudah mengerjakan akan tercatat di history. Apakah Anda yakin?',
      confirmText: 'Ya, Akhiri',
      cancelText: 'Batal',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await gameService.endGame(gameId)
          showSuccess('Kuis berhasil diakhiri! Hasil telah disimpan ke history.')
          // Wait a bit for backend to complete saving, then navigate to history tab
          setTimeout(() => {
            navigate('/my-quizzes', { state: { activeTab: 'History' } })
          }, 1500)
        } catch (error) {
          console.error('Error ending game:', error)
          showError('Gagal mengakhiri kuis')
        }
      }
    })
  }

  const isExpiringSoon = timeLeft <= 300 // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-blue-900 mb-2 drop-shadow-lg">
            🎮 Live Monitoring
          </h1>
          <p className="text-blue-800 text-lg font-semibold">{quizTitle}</p>
        </motion.div>

        {/* PIN Display - Large & Eye-catching */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-6 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl px-6 py-3 mb-4">
            <p className="text-white/90 text-sm font-bold mb-1">KODE PIN KUIS</p>
            <div className="flex items-center gap-4">
              <p className="text-white text-6xl sm:text-7xl font-black tracking-widest drop-shadow-xl">
                {PIN}
              </p>
              <button
                onClick={handleCopyPIN}
                className="bg-white/30 hover:bg-white/50 backdrop-blur text-white px-4 py-3 rounded-xl transition text-sm font-bold shadow-lg"
              >
                📋 Salin
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Bagikan kode ini kepada peserta</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl p-6 text-center shadow-xl ${
              timeLeft <= 0 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : isExpiringSoon 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse' 
                : 'bg-gradient-to-br from-green-400 to-emerald-500'
            }`}
          >
            <p className="text-white/90 text-xs font-bold mb-2">
              ⏱️ {timeLeft <= 0 ? 'BERAKHIR' : 'SISA WAKTU'}
            </p>
            <p className="text-white text-3xl font-black drop-shadow-lg">
              {formatTimeLeft(timeLeft)}
            </p>
          </motion.div>

          {/* Total Players */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-center shadow-xl"
          >
            <p className="text-white/90 text-xs font-bold mb-2">👥 TOTAL PLAYER</p>
            <p className="text-white text-3xl font-black drop-shadow-lg">{players.length}</p>
          </motion.div>

          {/* Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-center shadow-xl"
          >
            <p className="text-white/90 text-xs font-bold mb-2">📝 SOAL</p>
            <p className="text-white text-3xl font-black drop-shadow-lg">{totalQuestions}</p>
          </motion.div>
        </div>

        {/* Players List - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl shadow-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <span className="text-3xl">👥</span>
              Daftar Peserta
            </h2>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
              {players.length} Online
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 font-semibold">Memuat data...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 font-bold text-lg mb-2">Belum ada peserta</p>
              <p className="text-gray-400">Player yang join akan muncul di sini</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {players.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-300"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
                    {typeof player.avatar === 'object' && player.avatar?.emoji 
                      ? player.avatar.emoji 
                      : player.avatar || '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{player.playerName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span>🕐</span>
                      {new Date(player.joinedAt).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className="text-2xl font-black text-blue-600">{index + 1}</p>
                    </div>
                    {player.hasFinished && (
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                        ✓ Selesai
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <button
            onClick={() => navigate('/my-quizzes')}
            className="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl transition shadow-xl text-lg"
          >
            ← Kembali
          </button>
          {timeLeft > 0 && (
            <button
              onClick={handleEndEarly}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition shadow-xl text-lg"
            >
              🏁 Akhiri Kuis
            </button>
          )}
        </motion.div>
      </div>
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={hideConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmColor={confirmDialog.confirmColor}
      />
      <Toast {...toast} onClose={hideToast} />
    </div>
  )
}

export default PinMonitoringPage
