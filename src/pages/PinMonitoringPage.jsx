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
      title: '⚠️ Akhiri Kuis Sekarang?',
      message: 'Semua player yang sudah mengerjakan akan tercatat di history. Apakah Anda yakin?',
      confirmText: 'Ya, Akhiri',
      cancelText: 'Batal',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await gameService.endGame(gameId)
          navigate('/my-quizzes')
        } catch (error) {
          console.error('Error ending game:', error)
          showError('Gagal mengakhiri kuis')
        }
      }
    })
  }

  const isExpiringSoon = timeLeft <= 300 // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4"
        >
          {/* Title & Info Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{quizTitle}</h1>
              <p className="text-sm text-gray-500">{totalQuestions} Soal</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm">
                {players.length} Player
              </div>
            </div>
          </div>

          {/* PIN & Timer in one row */}
          <div className="grid grid-cols-2 gap-4">
            {/* PIN */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4">
              <p className="text-white/70 text-xs mb-1">Kode PIN</p>
              <div className="flex items-center justify-between">
                <p className="text-white text-3xl font-bold tracking-wider">{PIN}</p>
                <button
                  onClick={handleCopyPIN}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition text-sm"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Timer */}
            <div className={`rounded-xl p-4 ${
              timeLeft <= 0 
                ? 'bg-red-100' 
                : isExpiringSoon 
                ? 'bg-yellow-100' 
                : 'bg-green-100'
            }`}>
              <p className={`text-xs mb-1 ${
                timeLeft <= 0 
                  ? 'text-red-600' 
                  : isExpiringSoon 
                  ? 'text-yellow-700' 
                  : 'text-green-700'
              }`}>
                {timeLeft <= 0 ? 'Berakhir' : 'Sisa Waktu'}
              </p>
              <p className={`text-3xl font-bold ${
                timeLeft <= 0 
                  ? 'text-red-600' 
                  : isExpiringSoon 
                  ? 'text-yellow-700 animate-pulse' 
                  : 'text-green-700'
              }`}>
                {formatTimeLeft(timeLeft)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Compact Players List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Daftar Player
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p className="text-gray-500 text-sm">Memuat...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-500 text-sm">Belum ada player</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {players.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition"
                >
                  <div className="text-2xl">
                    {typeof player.avatar === 'object' && player.avatar?.emoji 
                      ? player.avatar.emoji 
                      : player.avatar || '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{player.playerName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(player.joinedAt).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                  {player.hasFinished && (
                    <div className="text-green-500 text-lg">✅</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Compact Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate('/my-quizzes')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            ← Kembali
          </button>
          {timeLeft > 0 && (
            <button
              onClick={handleEndEarly}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              ❌ Akhiri Kuis
            </button>
          )}
        </div>
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
