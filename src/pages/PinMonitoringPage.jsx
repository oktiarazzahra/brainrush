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
      <div className="max-w-4xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
            Live Monitoring
          </h1>
          <p className="text-blue-800 text-base">{quizTitle}</p>
        </motion.div>

        {/* PIN Display - Compact */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-4 py-2 mb-2">
            <p className="text-white text-xs font-semibold mb-1">KODE PIN KUIS</p>
            <div className="flex items-center gap-3">
              <p className="text-white text-4xl font-bold tracking-wider">
                {PIN}
              </p>
              <button
                onClick={handleCopyPIN}
                className="bg-white/30 hover:bg-white/50 text-white px-3 py-2 rounded-lg transition text-xs font-semibold"
              >
                Salin
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs">Bagikan kode ini kepada peserta</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-4 text-center shadow-lg ${
              timeLeft <= 0 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : isExpiringSoon 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse' 
                : 'bg-gradient-to-br from-green-400 to-emerald-500'
            }`}
          >
            <p className="text-white text-xs font-semibold mb-1">
              {timeLeft <= 0 ? 'BERAKHIR' : 'SISA WAKTU'}
            </p>
            <p className="text-white text-xl font-bold">
              {formatTimeLeft(timeLeft)}
            </p>
          </motion.div>

          {/* Total Players */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg"
          >
            <p className="text-white text-xs font-semibold mb-1">TOTAL PLAYER</p>
            <p className="text-white text-xl font-bold">{players.length}</p>
          </motion.div>

          {/* Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl p-4 text-center shadow-lg"
          >
            <p className="text-white text-xs font-semibold mb-1">SOAL</p>
            <p className="text-white text-xl font-bold">{totalQuestions}</p>
          </motion.div>
        </div>

        {/* Players List - Clean */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              Daftar Peserta
            </h2>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
              {players.length} Online
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Memuat data...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 font-semibold mb-1">Belum ada peserta</p>
              <p className="text-gray-400 text-sm">Player yang join akan muncul di sini</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {players.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 hover:shadow-md transition-all border border-blue-100"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl">
                    {typeof player.avatar === 'object' && player.avatar?.emoji 
                      ? player.avatar.emoji 
                      : player.avatar || '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{player.playerName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(player.joinedAt).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{index + 1}</p>
                    </div>
                    {player.hasFinished && (
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                        Selesai
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <button
            onClick={() => navigate('/my-quizzes')}
            className="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition shadow-lg"
          >
            Kembali
          </button>
          {timeLeft > 0 && (
            <button
              onClick={handleEndEarly}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition shadow-lg"
            >
              Akhiri Kuis
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
